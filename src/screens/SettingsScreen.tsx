import React, { useState, useCallback } from 'react';
import { View, Modal, TouchableOpacity, TextInput, ActivityIndicator, ImageBackground, Image, ScrollView, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';
import { Box, Text, HStack, VStack, Pressable } from '@gluestack-ui/themed';
import { User, LogOut, Trash2, Edit2, Check, X, ShieldAlert, ArrowLeftIcon, Settings, Coins, CreditCard, History, ChevronRight, AlertCircle } from 'lucide-react-native';
import { useAuthStore } from '../store/useAuthStore';
import { useUserProfile, useUpdateUserName, useRequestDeletion, useConfirmDeletion, useCancelDeletion } from '../hooks/useAuth';
import { useDeleteAllChats } from '../hooks/useChats';
import { useSubscriptionHistory, useCreditHistory } from '../hooks/useBilling';
import { useNavigation } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';

// Reuse the background from ChatLanding for a premium cohesive look
import IconsBackground from '../assets/icons_background.png';
import { useCustomAlert } from '../context/AlertContext';

const SettingsScreen = () => {
  // Global Auth Context State
  const clearAuth = useAuthStore(state => state.clearAuth);

  // Tanstack Queries & Mutations
  const { data: userProfileData, isLoading: isProfileLoading } = useUserProfile();
  const { mutateAsync: updateNameMutate, isPending: isUpdatingName } = useUpdateUserName();
  const { mutateAsync: deleteAllChatsMutate, isPending: isDeletingChats } = useDeleteAllChats();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const userProfile = userProfileData;

  // Local State
  const [isEditMode, setIsEditMode] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showCreditHistory, setShowCreditHistory] = useState(false);
  const [showBillingHistory, setShowBillingHistory] = useState(false);
  const [showDeletionDrawer, setShowDeletionDrawer] = useState(false);

  const queryClient = useQueryClient();

  // Deletion Hooks
  const { mutateAsync: requestDeletionMutate, isPending: isRequestingDeletion } = useRequestDeletion();
  const { mutateAsync: confirmDeletionMutate, isPending: isConfirmingDeletion } = useConfirmDeletion();
  const { mutateAsync: cancelDeletionMutate, isPending: isCancellingDeletion } = useCancelDeletion();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    await queryClient.invalidateQueries({ queryKey: ['subscriptionHistory'] });
    await queryClient.invalidateQueries({ queryKey: ['creditHistory'] });
    setRefreshing(false);
  }, [queryClient]);

  const getRemainingDays = (date?: string) => {
    if (!date) return 7;
    const scheduled = new Date(date);
    const now = new Date();
    const diff = scheduled.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };
  
  const { showAlert, isVisible, config } = useCustomAlert();
  console.log(isVisible, "isVisible")
  console.log(config, "config")

  const handleEditInit = () => {
    setEditNameValue(userProfile?.name || '');
    setIsEditMode(true);
  };

  const handleSaveName = async () => {
    if (!editNameValue.trim() || editNameValue.trim() === userProfile?.name) {
      setIsEditMode(false);
      return;
    }
    try {
      await updateNameMutate(editNameValue);
      setIsEditMode(false);
    } catch (error) {
      console.error('Failed to update name', error);
    }
  };

  const handleLogout = () => {
    showAlert({
      title: 'Log Out?',
      message: 'Are you sure you want to log out of Mythy? You will need to sign in again to access your chats.',
      icon: <LogOut color="#4B5563" size={32} />,
      iconColor: 'rgba(75, 85, 99, 0.1)',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes, Log Out', style: 'default', onPress: () => clearAuth() }
      ]
    });
  };

  const handleDeleteAllHistory = async () => {
    showAlert({
      title: 'Clear History?',
      message: 'This will permanently delete ALL your conversations. This action cannot be undone. Are you absolutely certain?',
      icon: <ShieldAlert color="#EF4444" size={32} />,
      iconColor: 'rgba(239, 68, 68, 0.15)',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await deleteAllChatsMutate();
            } catch (error) {
              console.error('Failed to clear history', error);
            }
          } 
        }
      ]
    });
  };

  const renderAvatar = (name: string, avatarUrl?: string) => {
    if (avatarUrl) {
      return (
        <Box style={styles.avatarPlaceholder}>
          <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
        </Box>
      );
    }
    const initial = name ? name.charAt(0).toUpperCase() : '';
    return (
      <Box style={styles.avatarPlaceholder}>
        <Text style={styles.avatarInitial}>{initial}</Text>
      </Box>
    );
  };

  return (
    <Box flex={1} backgroundColor="#F9FAFB">
      {/* Dynamic Background Match */}
      <ImageBackground
        source={IconsBackground}
        style={styles.topBackground}
        imageStyle={{ opacity: 1, resizeMode: 'cover' }}
      >
        <Box style={[styles.headerContainer]}>
          <HStack alignItems="center" space="sm">
             <Settings size={28} color="#FFF" />
            <Text style={styles.headerTitle}>Settings</Text>
          </HStack>
        </Box>
      </ImageBackground>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFD54F" />
        }
      >
        {/* Profile Section */}
        <Box style={styles.card}>
          <HStack alignItems="center" space="md">
            {isProfileLoading ? (
               <Box style={styles.avatarPlaceholder}>
                 <ActivityIndicator color="#FFD54F" />
               </Box>
            ) : (
               renderAvatar(userProfile?.name || '', userProfile?.avatar)
            )}

            <VStack flex={1}>
              {isEditMode ? (
                <View style={styles.editRow}>
                  <TextInput
                    style={styles.nameInput}
                    value={editNameValue}
                    onChangeText={setEditNameValue}
                    autoFocus
                    placeholder="Enter your name"
                    placeholderTextColor="#9CA3AF"
                  />
                  <TouchableOpacity onPress={handleSaveName} disabled={isUpdatingName} style={styles.iconButton}>
                    {isUpdatingName ? <ActivityIndicator size="small" color="#10B981" /> : <Check color="#10B981" size={20} />}
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setIsEditMode(false)} style={styles.iconButton}>
                    <X color="#EF4444" size={20} />
                  </TouchableOpacity>
                </View>
              ) : (
                <HStack alignItems="center" justifyContent="space-between">
                  <Text style={styles.userName} numberOfLines={1}>{userProfile?.name || '...'}</Text>
                  <TouchableOpacity onPress={handleEditInit} style={styles.editButton}>
                    <Edit2 color="#9CA3AF" size={18} />
                  </TouchableOpacity>
                </HStack>
              )}
              <Text style={styles.userEmail} numberOfLines={1}>{userProfile?.email || ''}</Text>
            </VStack>
          </HStack>
        </Box>

        {/* Credit & Billing Section */}
        <Box style={styles.card}>
          <Text style={styles.sectionTitle}>Credit & Billing</Text>
          
          <Box style={styles.balanceContainer}>
            <VStack>
              <Text style={styles.balanceLabel}>Available Credits</Text>
              <HStack alignItems="center" space="xs">
                <Coins size={20} color="#F59E0B" />
                <Text style={styles.balanceValue}>{userProfile?.credits?.toLocaleString() || '0'}</Text>
              </HStack>
            </VStack>
            <TouchableOpacity 
              style={styles.buyButton} 
              onPress={() => navigation.navigate('Subscription')}
            >
              <Text style={styles.buyButtonText}>Get More</Text>
            </TouchableOpacity>
          </Box>

          <View style={[styles.divider, { marginLeft: 0, marginVertical: 16 }]} />

          <TouchableOpacity style={styles.actionRow} onPress={() => setShowCreditHistory(true)}>
            <Box style={[styles.actionIconWrapper, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
              <History color="#F59E0B" size={20} />
            </Box>
            <Text style={styles.actionText}>Credit Usage History</Text>
            <Box flex={1} />
            <ChevronRight color="#D1D5DB" size={20} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.actionRow} onPress={() => setShowBillingHistory(true)}>
            <Box style={[styles.actionIconWrapper, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
              <CreditCard color="#3B82F6" size={20} />
            </Box>
            <Text style={styles.actionText}>Billing History</Text>
            <Box flex={1} />
            <ChevronRight color="#D1D5DB" size={20} />
          </TouchableOpacity>
        </Box>

        {/* Actions Section */}
        <Box style={styles.card}>
          <Text style={styles.sectionTitle}>Account Actions</Text>
          
          <TouchableOpacity style={styles.actionRow} onPress={handleDeleteAllHistory}>
            <Box style={[styles.actionIconWrapper, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
              <Trash2 color="#EF4444" size={20} />
            </Box>
            <Text style={[styles.actionText, { color: '#EF4444' }]}>Clear All Chat History</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.actionRow} onPress={handleLogout}>
            <Box style={[styles.actionIconWrapper, { backgroundColor: 'rgba(75, 85, 99, 0.1)' }]}>
              <LogOut color="#4B5563" size={20} />
            </Box>
            <Text style={styles.actionText}>Log Out</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.actionRow} onPress={() => setShowDeletionDrawer(true)}>
            <Box style={[styles.actionIconWrapper, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
              <ShieldAlert color="#EF4444" size={20} />
            </Box>
            <Text style={[styles.actionText, { color: '#EF4444' }]}>
              {userProfile?.isDeletionScheduled ? 'Manage Account Deletion' : 'Delete Account'}
            </Text>
            {userProfile?.isDeletionScheduled && (
              <Box bg="#EF4444" px={8} py={2} borderRadius={12} ml={8}>
                <Text color="white" fontSize={10} fontWeight="700">Scheduled</Text>
              </Box>
            )}
          </TouchableOpacity>
        </Box>

        {/* App Info */}
        <VStack alignItems="center" marginTop={20} marginBottom={90}>
          <Text style={styles.appVersion}>Mythy App v1.0.0 (Beta)</Text>
          <Text style={styles.appCredits}>Crafted with Love</Text>
        </VStack>
      </ScrollView>

      {/* History Modals */}
      <HistoryModal 
        visible={showCreditHistory} 
        onClose={() => setShowCreditHistory(false)} 
        title="Credit Usage"
        type="credits"
      />
      <HistoryModal 
        visible={showBillingHistory} 
        onClose={() => setShowBillingHistory(false)} 
        title="Billing History"
        type="billing"
      />

      <AccountDeletionDrawer
        visible={showDeletionDrawer}
        onClose={() => setShowDeletionDrawer(false)}
        userProfile={userProfile}
        requestDeletionMutate={requestDeletionMutate}
        confirmDeletionMutate={confirmDeletionMutate}
        cancelDeletionMutate={cancelDeletionMutate}
        isRequestingDeletion={isRequestingDeletion}
        isConfirmingDeletion={isConfirmingDeletion}
        isCancellingDeletion={isCancellingDeletion}
        getRemainingDays={getRemainingDays}
        showAlert={showAlert}
        insets={insets}
      />
    </Box>
  );
};

const HistoryModal = ({ visible, onClose, title, type }: { visible: boolean, onClose: () => void, title: string, type: 'credits' | 'billing' }) => {
  const { data: creditHistory, isLoading: isLoadingCredits } = useCreditHistory();
  const { data: billingHistory, isLoading: isLoadingBilling } = useSubscriptionHistory();

  const isLoading = type === 'credits' ? isLoadingCredits : isLoadingBilling;
  const historyData = type === 'credits' ? creditHistory : billingHistory;

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <Box style={styles.modalOverlay}>
        <Box style={styles.modalContent}>
          <HStack style={styles.modalHeader} justifyContent="space-between" alignItems="center">
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X color="#4B5563" size={24} />
            </TouchableOpacity>
          </HStack>

          {isLoading ? (
            <Box flex={1} justifyContent="center" alignItems="center">
              <ActivityIndicator size="large" color="#FFD54F" />
            </Box>
          ) : (
            <ScrollView style={styles.historyList} showsVerticalScrollIndicator={false}>
              {historyData && historyData.length > 0 ? (
                historyData.map((item: any, index: number) => (
                  <Box key={item._id || index} style={styles.historyItem}>
                    <VStack flex={1}>
                      <Text style={styles.historyDesc}>{item.description || (type === 'billing' ? `Plan: ${item.planId}` : 'Transaction')}</Text>
                      <Text style={styles.historyDate}>{new Date(item.createdAt).toLocaleDateString()} • {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                    </VStack>
                    <Text style={[styles.historyAmount, { color: type === 'credits' ? (item.amount > 0 ? '#10B981' : '#4B5563') : '#111827' }]}>
                      {type === 'credits' ? (item.amount > 0 ? `+${item.amount}` : item.amount) : `₹${item.amount}`}
                    </Text>
                  </Box>
                ))
              ) : (
                <Box style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No history found</Text>
                </Box>
              )}
            </ScrollView>
          )}
        </Box>
      </Box>
    </Modal>
  );
};

const AccountDeletionDrawer = ({ visible, onClose, userProfile, requestDeletionMutate, confirmDeletionMutate, cancelDeletionMutate, isRequestingDeletion, isConfirmingDeletion, isCancellingDeletion, getRemainingDays, showAlert, insets }: any) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity 
          style={styles.modalDismissArea} 
          activeOpacity={1} 
          onPress={onClose} 
        />
        <View style={styles.deletionDrawer}>
          <View style={styles.drawerHandle} />
          
          <HStack justifyContent="space-between" alignItems="center" mb={20}>
            <Text style={styles.drawerTitle}>Account Deletion</Text>
            <TouchableOpacity onPress={onClose}>
              <X color="#6B7280" size={24} />
            </TouchableOpacity>
          </HStack>

          {!userProfile?.isDeletionScheduled ? (
            <VStack space="md">
              <Box bg="rgba(239, 68, 68, 0.05)" p={16} borderRadius={12}>
                <HStack space="sm" alignItems="flex-start">
                  <AlertCircle color="#EF4444" size={20} style={{ marginTop: 2 }} />
                  <VStack flex={1}>
                    <Text color="#EF4444" fontWeight="700" fontSize={16}>Important Information</Text>
                    <Text color="#4B5563" fontSize={14} mt={4}>
                      Deleting your account will permanently remove all your data, including chat history, remaining credits, and premium status. This action cannot be undone after the 7-day grace period.
                    </Text>
                  </VStack>
                </HStack>
              </Box>

              {!userProfile?.deletionRequestedAt ? (
                <VStack space="sm">
                  <Text color="#1F2937" fontWeight="600" fontSize={15}>Step 1: Request Deletion</Text>
                  <Text color="#6B7280" fontSize={13}>
                    You can request deletion here or via our web portal. This marks your account for the next step.
                  </Text>
                  <TouchableOpacity 
                    style={styles.deletionRequestButton}
                    disabled={isRequestingDeletion}
                    onPress={async () => {
                      await requestDeletionMutate();
                      showAlert({ title: 'Request Sent', message: 'Account deletion request has been registered.' });
                    }}
                  >
                    {isRequestingDeletion ? <ActivityIndicator color="white" /> : <Text style={styles.deletionButtonText}>Request Account Deletion</Text>}
                  </TouchableOpacity>
                </VStack>
              ) : (
                <VStack space="sm">
                  <HStack space="xs" alignItems="center" bg="rgba(16, 185, 129, 0.1)" p={8} borderRadius={8}>
                    <Check color="#10B981" size={16} />
                    <Text color="#10B981" fontWeight="600" fontSize={13}>Deletion Request Active</Text>
                  </HStack>
                  
                  <Text color="#1F2937" fontWeight="600" fontSize={15} mt={8}>Step 2: Confirm Deletion</Text>
                  <Text color="#6B7280" fontSize={13}>
                    Final confirmation is required to schedule the 7-day deletion countdown.
                  </Text>
                  <TouchableOpacity 
                    style={[styles.deletionRequestButton, { backgroundColor: '#111827' }]}
                    disabled={isConfirmingDeletion}
                    onPress={async () => {
                      await confirmDeletionMutate();
                      showAlert({ 
                        title: 'Deletion Scheduled', 
                        message: 'Your account is now scheduled for deletion in 7 days.' 
                      });
                    }}
                  >
                    {isConfirmingDeletion ? <ActivityIndicator color="white" /> : <Text style={styles.deletionButtonText}>Confirm Deletion Request</Text>}
                  </TouchableOpacity>
                </VStack>
              )}
            </VStack>
          ) : (
            <VStack space="lg">
              <Box bg="#FEF2F2" p={20} borderRadius={16} alignItems="center">
                <Text color="#EF4444" fontSize={14} fontWeight="600" textTransform="uppercase">Deletion In Progress</Text>
                <Text color="#111827" fontSize={48} fontWeight="900" mt={8}>
                  {getRemainingDays(userProfile?.deletionScheduledFor)}
                </Text>
                <Text color="#4B5563" fontSize={14} fontWeight="600">Days Remaining</Text>
              </Box>

              <VStack space="xs">
                <Text color="#1F2937" fontWeight="600" fontSize={15}>Want to keep your account?</Text>
                <Text color="#6B7280" fontSize={13}>
                  You can cancel this process at any time within the grace period.
                </Text>
              </VStack>

              <TouchableOpacity 
                style={styles.cancelDeletionButton}
                disabled={isCancellingDeletion}
                onPress={() => {
                  showAlert({
                    title: 'Cancel Account Deletion?',
                    message: 'This will terminate the account deletion and the process will start from scratch if you decide to delete again later.',
                    buttons: [
                      { text: 'No, Keep Scheduled', style: 'cancel' },
                      { 
                        text: 'Yes, Terminate Deletion', 
                        onPress: async () => {
                          await cancelDeletionMutate();
                          showAlert({ title: 'Cancelled', message: 'Your account deletion has been terminated.' });
                        }
                      }
                    ]
                  });
                }}
              >
                {isCancellingDeletion ? <ActivityIndicator color="#111827" /> : <Text style={styles.cancelDeletionButtonText}>Cancel Account Deletion</Text>}
              </TouchableOpacity>
            </VStack>
          )}

          <Box mt={20} mb={insets.bottom} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create((theme) => ({
  topBackground: {
    width: '100%',
    height: 180,
    position: 'absolute',
    top: 0,
    backgroundColor: '#1c1c1cff', // Solid yellow header base
  },
  headerContainer: {
    paddingHorizontal: 16,
    justifyContent: 'center',
    flex: 1,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: theme.typography.fontFamily.primary,
  },
  scrollView: {
    flex: 1,
    marginTop: 140,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  balanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 16,
  },
  balanceLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 4,
    fontFamily: theme.typography.fontFamily.primary,
  },
  balanceValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    fontFamily: theme.typography.fontFamily.primary,
  },
  buyButton: {
    backgroundColor: '#111827',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  buyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: theme.typography.fontFamily.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: '80%',
    padding: 24,
  },
  modalHeader: {
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    fontFamily: theme.typography.fontFamily.primary,
  },
  closeButton: {
    padding: 4,
  },
  historyList: {
    flex: 1,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  historyDesc: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    fontFamily: theme.typography.fontFamily.primary,
  },
  historyDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
    fontFamily: theme.typography.fontFamily.primary,
  },
  historyAmount: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: theme.typography.fontFamily.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    fontFamily: theme.typography.fontFamily.primary,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3F4F6',
    // borderWidth: 2,
    // borderColor: '#FFD54F',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
  },
  avatarInitial: {
    fontSize: 28,
    fontWeight: '700',
    color: '#4B5563',
    fontFamily: theme.typography.fontFamily.primary,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    fontFamily: theme.typography.fontFamily.primary,
    flex: 1,
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    fontFamily: theme.typography.fontFamily.primary,
  },
  editButton: {
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 4,
    marginBottom: 4,
  },
  nameInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    padding: 0,
    marginRight: 8,
  },
  iconButton: {
    padding: 6,
    marginLeft: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
    fontFamily: theme.typography.fontFamily.primary,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  actionIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
    fontFamily: theme.typography.fontFamily.primary,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 4,
    marginLeft: 56, // Align with text
  },
  appVersion: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
    fontFamily: theme.typography.fontFamily.primary,
    marginBottom: 4,
  },
  appCredits: {
    fontSize: 12,
    color: '#D1D5DB',
  },
  modalDismissArea: {
    flex: 1,
  },
  deletionDrawer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    minHeight: 450,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  drawerHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  drawerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  deletionRequestButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  deletionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelDeletionButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  cancelDeletionButtonText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '700',
  },
}));

export default SettingsScreen;
