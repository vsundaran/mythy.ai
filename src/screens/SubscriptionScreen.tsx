import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  DeviceEventEmitter,
} from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { Box, HStack, VStack, Text } from '@gluestack-ui/themed';
import { useNavigation } from '@react-navigation/native';
import RazorpayCheckout from 'react-native-razorpay';
import { subscriptionService } from '../services/subscription.service';
import { ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import { useCustomAlert } from '../context/AlertContext';
import { useQueryClient } from '@tanstack/react-query';

const { width } = Dimensions.get('window');

// SUBSCRIPTION_PLANS are now fetched from the database

const COLORS = {
  primaryYellow: '#FFD54F',
  selectedBg: '#FFF9E6',
  unselectedBorder: '#E0E0E0',
  textDark: '#000000',
  textGray: '#757575',
};

interface PlanCardProps {
  plan: any; // Using dynamic plan from DB
  isSelected: boolean;
  onPress: () => void;
}

const PlanCard = ({ plan, isSelected, onPress }: PlanCardProps) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.card,
        isSelected ? styles.selectedCard : styles.unselectedCard,
      ]}
    >
      <HStack justifyContent="space-between" alignItems="flex-start">
        <VStack flex={1}>
          <HStack alignItems="center" space="xs">
            <Text style={[styles.planTitle, isSelected && styles.selectedText]}>
              {plan.title}
            </Text>
            {plan.saveTag && (
              <View style={styles.saveTagBadge}>
                <Text style={styles.saveTagText}>{plan.saveTag}</Text>
              </View>
            )}
          </HStack>
          
          <Box mt={4} mb={4}>
            <Text style={styles.creditText}>
              {(plan.credits || 0).toLocaleString()} Credits
            </Text>
          </Box>
          
          <Text style={styles.planDescription}>{plan.description}</Text>
          
          <Text style={[styles.planPrice, isSelected && styles.selectedPriceText]}>
            {plan.priceDisplay}
          </Text>
        </VStack>

        <View style={styles.radioContainer}>
          <View 
            style={[
              styles.radioOuter, 
              isSelected ? styles.radioOuterSelected : styles.radioOuterUnselected
            ]}
          >
            {isSelected && <View style={styles.radioInner} />}
          </View>
        </View>
      </HStack>
    </TouchableOpacity>
  );
};

const SubscriptionScreen = () => {
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();
  const navigation = useNavigation<any>();
  const { showAlert } = useCustomAlert();
  const [selectedPlanId, setSelectedPlanId] = useState('6months');
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const fetchedPlans = await subscriptionService.getPlans();
      setPlans(fetchedPlans);
      
      // Select the recommended plan by default if it exists
      const recommendedPlan = fetchedPlans.find(p => p.isRecommended);
      if (recommendedPlan) {
        setSelectedPlanId(recommendedPlan.planId);
      } else if (fetchedPlans.length > 0) {
        setSelectedPlanId(fetchedPlans[0].planId);
      }
    } catch (error) {
      console.error('Failed to fetch plans', error);
      showAlert({ 
        title: 'Error', 
        message: 'Failed to load subscription plans. Please try again later.' 
      });
    }
  };

  const handleBack = () => {
    if(navigation.canGoBack()) {
      navigation.goBack();
    }else{
      navigation.navigate('Home');
    }
  };

  const processedRef = React.useRef(false);

  useEffect(() => {
    // Listen for Razorpay success/error events manually since the Promise hangs on some Android versions
    const successSub = DeviceEventEmitter.addListener('Razorpay::PAYMENT_SUCCESS', (data) => {
      console.log('[Subscription] Native Event Success:', data);
      handlePaymentResponse(data, true);
    });

    const errorSub = DeviceEventEmitter.addListener('Razorpay::PAYMENT_ERROR', (data) => {
      console.log('[Subscription] Native Event Error:', data);
      handlePaymentResponse(data, false);
    });

    return () => {
      successSub.remove();
      errorSub.remove();
    };
  }, []);

  const handlePaymentResponse = async (data: any, isSuccess: boolean) => {
    if (processedRef.current) return;
    processedRef.current = true;
    
    if (isSuccess) {
      try {
        console.log('[Subscription] Verifying payment after native success event...');
        await subscriptionService.verifyPayment({
          razorpayOrderId: data.razorpay_order_id || data.order_id,
          razorpayPaymentId: data.razorpay_payment_id || data.payment_id,
          razorpaySignature: data.razorpay_signature || data.signature,
        });
        
        setIsLoading(false);
        queryClient.invalidateQueries({ queryKey: ['userProfile'] });
        
        showAlert({ 
          title: 'Success', 
          message: 'Subscription activated successfully!',
          buttons: [{ 
            text: 'Great!', 
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'MainTabs' }],
              });
            } 
          }]
        });
      } catch (err: any) {
        setIsLoading(false);
        processedRef.current = false;
        console.error('[Subscription] Verification Error:', err);
        showAlert({ title: 'Error', message: 'Payment verification failed.' });
      }
    } else {
      setIsLoading(false);
      processedRef.current = false;
      if (data.code !== 2) {
        showAlert({ 
          title: 'Payment Failed', 
          message: data.description || 'Something went wrong.' 
        });
      }
    }
  };

  const handlePayment = async () => {
    if (isLoading) return;
    setIsLoading(true);
    processedRef.current = false;

    try {
      console.log('[Subscription] Creating order for:', selectedPlanId);
      const orderData = await subscriptionService.createOrder(selectedPlanId);
      
      const options = {
        description: `Subscription for ${selectedPlanId}`,
        image: 'https://i.imgur.com/3g7nmJC.png',
        currency: orderData.currency,
        key: orderData.key,
        amount: orderData.amount,
        name: 'Mythy App',
        order_id: orderData.id,
        prefill: {
          email: user?.email || '',
          contact: '',
          name: user?.name || '',
        },
        theme: { color: COLORS.primaryYellow },
      };

      console.log('[Subscription] Calling RazorpayCheckout.open');
      // We don't await the promise here because it hangs on Android.
      // The useEffect listeners above will catch the response.
      RazorpayCheckout.open(options).catch(err => {
        console.log('[Subscription] Promise Catch (expected on cancel/error):', err);
        handlePaymentResponse(err, false);
      });
      
    } catch (error: any) {
      setIsLoading(false);
      console.error('[Subscription] Order Creation Error:', error);
      showAlert({ 
        title: 'Error', 
        message: 'Failed to initiate payment. Please try again.' 
      });
    }
  };

  return (
    <Box flex={1} backgroundColor="#FFFFFF">
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <Box paddingHorizontal={24} paddingTop={insets.top + 10} paddingBottom={20}>
        <TouchableOpacity 
          onPress={handleBack}
          style={styles.backButton}
        >
          <ArrowLeft color="#000" size={28} />
        </TouchableOpacity>

        <Box mt={20}>
          <HStack alignItems="center" space="xs" flexWrap="wrap">
            <Text style={styles.headerTitle}>Join</Text>
            <Box style={styles.premiumChip}>
              <Text style={styles.premiumChipText}>Premium</Text>
            </Box>
            <Text style={styles.headerTitle}>now!</Text>
          </HStack>
          <Text style={styles.headerSubtitle}>
            Start saving big by choosing the subscription package that fits your needs
          </Text>
        </Box>
      </Box>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        <VStack space="md" px={24}>
          {plans.map((plan) => (
            <PlanCard
              key={plan._id}
              plan={plan}
              isSelected={selectedPlanId === plan.planId}
              onPress={() => setSelectedPlanId(plan.planId)}
            />
          ))}
          {plans.length === 0 && !isLoading && (
             <ActivityIndicator color={COLORS.primaryYellow} size="large" style={{ marginTop: 50 }} />
          )}
        </VStack>
      </ScrollView>

      {/* Bottom Button */}
      <Box px={24} pb={insets.bottom + 20} pt={10}>
        <TouchableOpacity 
          style={[styles.payButton, isLoading && styles.disabledButton]} 
          onPress={handlePayment}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.payButtonText}>Pay now</Text>
          )}
        </TouchableOpacity>
      </Box>
    </Box>
  );
};

const styles = StyleSheet.create((theme) => ({
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textDark,
    fontFamily: theme.typography.fontFamily.primary,
    lineHeight: 34,
  },
  highlightText: {
    color: COLORS.primaryYellow,
    fontSize: 28,
    fontWeight: '700',
  },
  premiumChip: {
    backgroundColor: COLORS.primaryYellow,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    marginHorizontal: 2,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '-2deg' }], // Subtle tilt for a premium, dynamic look
    shadowColor: COLORS.primaryYellow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  premiumChipText: {
    color: '#000000',
    fontSize: 20,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontFamily: theme.typography.fontFamily.primary,
  },
  headerSubtitle: {
    fontSize: 15,
    color: COLORS.textGray,
    fontFamily: theme.typography.fontFamily.primary,
    marginTop: 12,
    lineHeight: 22,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  card: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 1.5,
    marginBottom: 8,
  },
  unselectedCard: {
    backgroundColor: '#FFFFFF',
    borderColor: COLORS.unselectedBorder,
  },
  selectedCard: {
    backgroundColor: COLORS.selectedBg,
    borderColor: COLORS.primaryYellow,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textDark,
    fontFamily: theme.typography.fontFamily.primary,
  },
  selectedText: {
    color: COLORS.textDark,
  },
  saveTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#000000ff',
    fontFamily: theme.typography.fontFamily.primary,
  },
  saveTagBadge: {
    backgroundColor: COLORS.primaryYellow,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginLeft: 10,
  },
  creditText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textGray,
    fontFamily: theme.typography.fontFamily.primary,
  },
  planDescription: {
    fontSize: 13,
    color: COLORS.textGray,
    fontFamily: theme.typography.fontFamily.primary,
    marginTop: 12,
    lineHeight: 18,
  },
  planPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textGray,
    fontFamily: theme.typography.fontFamily.primary,
    marginTop: 12,
  },
  selectedPriceText: {
    color: '#000000ff',
  },
  radioContainer: {
    paddingTop: 4,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterUnselected: {
    borderColor: COLORS.unselectedBorder,
  },
  radioOuterSelected: {
    borderColor: COLORS.primaryYellow,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primaryYellow,
  },
  payButton: {
    backgroundColor: COLORS.primaryYellow,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primaryYellow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  payButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000ff',
    fontFamily: theme.typography.fontFamily.primary,
  },
  disabledButton: {
    opacity: 0.7,
  },
}));

export default SubscriptionScreen;
