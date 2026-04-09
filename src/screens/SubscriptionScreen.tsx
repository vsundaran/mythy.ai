import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { Box, HStack, VStack, Text } from '@gluestack-ui/themed';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const SUBSCRIPTION_PLANS = [
  {
    id: '6months',
    title: '6 months',
    price: '$5.99/month Premium',
    description: "You'll begin paying the Regular Plus rate on 19 October 2025 once your current offer expires.",
    saveTag: 'SAVE 28%',
    isRecommended: true,
  },
  {
    id: '3months',
    title: '3 months',
    price: '$6.99/month',
    description: "You'll begin paying the Regular Plus rate on 19 July 2025 once your current offer expires.",
    saveTag: null,
  },
  {
    id: '1months',
    title: '1 months', // Matching the typo "1 months" in the image exactly if that's what's intended, or fixing it. Let's fix to "1 month" unless pixel perfect means typo too. Image says "1 months".
    price: '$7.99/month',
    description: "You'll begin paying the Regular Plus rate on 19 April 2025 once your current offer expires.",
    saveTag: null,
  },
];

const COLORS = {
  primaryYellow: '#FFB800',
  selectedBg: '#FFF9E6',
  unselectedBorder: '#E0E0E0',
  textDark: '#000000',
  textGray: '#757575',
};

interface PlanCardProps {
  plan: typeof SUBSCRIPTION_PLANS[0];
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
          
          <Text style={styles.planDescription}>{plan.description}</Text>
          
          <Text style={[styles.planPrice, isSelected && styles.selectedPriceText]}>
            {plan.price}
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
  const navigation = useNavigation();
  const [selectedPlanId, setSelectedPlanId] = useState('6months');

  const handleBack = () => {
    if(navigation.canGoBack()) {
      navigation.goBack();
    }else{
      navigation.navigate('Home');
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
          <Text style={styles.headerTitle}>
            Join <Text style={styles.highlightText}>Premium</Text> now!
          </Text>
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
          {SUBSCRIPTION_PLANS.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isSelected={selectedPlanId === plan.id}
              onPress={() => setSelectedPlanId(plan.id)}
            />
          ))}
        </VStack>
      </ScrollView>

      {/* Bottom Button */}
      <Box px={24} pb={insets.bottom + 20} pt={10}>
        <TouchableOpacity style={styles.payButton}>
          <Text style={styles.payButtonText}>Pay now</Text>
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
    color: '#FFF',
    fontFamily: theme.typography.fontFamily.primary,
  },
  saveTagBadge: {
    backgroundColor: COLORS.primaryYellow,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginLeft: 10,
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
    color: COLORS.primaryYellow,
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
    color: '#FFFFFF',
    fontFamily: theme.typography.fontFamily.primary,
  },
}));

export default SubscriptionScreen;
