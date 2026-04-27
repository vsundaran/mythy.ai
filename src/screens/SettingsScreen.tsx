import React, { useState } from 'react';
import { View, Modal, TouchableOpacity, TextInput, ActivityIndicator, ImageBackground, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Box, Text, HStack, VStack, Pressable } from '@gluestack-ui/themed';
import { User, LogOut, Trash2, Edit2, Check, X, ShieldAlert, ArrowLeftIcon, Settings } from 'lucide-react-native';
import { useAuthStore } from '../store/useAuthStore';
import { useUserProfile, useUpdateUserName } from '../hooks/useAuth';
import { useDeleteAllChats } from '../hooks/useChats';
import { useNavigation } from '@react-navigation/native';

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

  const userProfile = userProfileData;

  // Local State
  const [isEditMode, setIsEditMode] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');
  
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

      <Box style={styles.contentContainer}>
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
        </Box>

        {/* App Info */}
        <VStack alignItems="center" marginTop={40}>
          <Text style={styles.appVersion}>Mythy App v1.0.0 (Beta)</Text>
          <Text style={styles.appCredits}>Crafted with Love</Text>
        </VStack>
      </Box>

      {/* Global AlertModal will be handled by the context provider at root */}

    </Box>
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
  contentContainer: {
    flex: 1,
    marginTop: 140,
    paddingHorizontal: 20,
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
  // appCredits: {
  //   fontSize: 12,
  //   color: '#D1D5DB',
  // },
}));

export default SettingsScreen;
