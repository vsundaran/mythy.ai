import React from 'react';
import {
  ImageBackground,
  Dimensions,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Box, Text, HStack, VStack, Pressable, Image } from '@gluestack-ui/themed';
import { useNavigation } from '@react-navigation/native';
import { 
  MessageCircle, 
  Phone, 
  Search, 
  User, 
  CheckCheck,
  Plus,
  Trash2,
  X,
  MoreVertical
} from 'lucide-react-native';
import { IChat } from '../services/chat.service';
import { ICategory } from '../services/category.service';
import { useCategories } from '../hooks/useCategories';
import { useUserChats, useDeleteChats } from '../hooks/useChats';
import { useUserProfile } from '../hooks/useAuth';
import { HugeiconsIcon } from '@hugeicons/react-native';
import * as Icons from '@hugeicons/core-free-icons';
import IconPlaceHolder from '../assets/icon_place_holder.svg';



import IconsBackground from '../assets/icons_background.png';

const { width } = Dimensions.get('window');


const ChatLandingScreen = () => {
  const { data: categories = [] } = useCategories();
  const { data: chats = [], isLoading, refetch, isRefetching } = useUserChats();
  const { mutateAsync: deleteChatsMutate, isPending: isDeleting } = useDeleteChats();
  const { data: userProfileData } = useUserProfile();
  
  const userProfile = userProfileData;
  const [selectedChats, setSelectedChats] = React.useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);

  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();
  const navigation = useNavigation<any>();

  const handleLongPressChat = (chatId: string) => {
    if (selectedChats.length === 0) {
      setSelectedChats([chatId]);
    }
  };

  const handlePressChat = (chatId: string) => {
    if (selectedChats.length > 0) {
      if (selectedChats.includes(chatId)) {
        setSelectedChats(prev => prev.filter(id => id !== chatId));
      } else {
        setSelectedChats(prev => [...prev, chatId]);
      }
    } else {
      navigation.navigate('ChatInterface', { chatId });
    }
  };

  const handleDeleteConfirmed = async () => {
    try {
      await deleteChatsMutate(selectedChats);
      setSelectedChats([]);
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Failed to delete chats:', error);
    }
  };

  const renderCategory = ({ item }: { item: ICategory }) => {
    if (!item) return null;
    const IconComponent = (Icons as any)[item.iconName] || Icons.AiBrain04Icon;

    return (
      
      <Pressable style={styles.storyContainer} onPress={() => navigation.navigate('Subscription')}>
        <Box style={styles.storyRing}>
          <Box style={styles.iconWrapper}>
            {/* <IconPlaceHolder width={64} height={64} style={{ position: 'absolute' }} /> */}
            <HugeiconsIcon icon={IconComponent} size={32} color="#000000ff" />
          </Box>
        </Box>
        <Text style={styles.storyTitle}>{item.title}</Text>
      </Pressable>
    );
  };
  const renderChat = ({ item }: { item: IChat }) => {
    const lastMessage = item.messages[item.messages.length - 1];
    const timeString = new Date(item.updatedAt).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const ChatIconComponent = (Icons as any)[item.categoryIcon || 'AiBrain04Icon'] || Icons.AiBrain04Icon;
    const isSelected = selectedChats.includes(item.chatId);

    return (
      <Pressable 
        onLongPress={() => handleLongPressChat(item.chatId)}
        onPress={() => handlePressChat(item.chatId)}
        delayLongPress={300}
      >
        <HStack style={[styles.chatContainer, isSelected && { backgroundColor: 'rgba(255, 213, 79, 0.15)' }]}>
          <Box style={styles.chatAvatarWrapper}>
            {/* <IconPlaceHolder width={60} height={60} style={{ position: 'absolute' }} /> */}
            <HugeiconsIcon icon={ChatIconComponent} size={30} color={"#000000ff"} />
          </Box>
          <VStack style={styles.chatContent}>
            <HStack style={styles.chatHeader}>
              <Text style={styles.chatTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.chatTime}>{timeString}</Text>
            </HStack>
            <HStack style={styles.chatSubtitleRow}>
              <Text style={styles.chatSubtitle} numberOfLines={1}>
                {lastMessage?.content || 'No messages yet'}
              </Text>
            </HStack>
          </VStack>
        </HStack>
      </Pressable>
    );
  };

  return (
    <Box style={styles.container}>
      {/* Top Banner & Background */}
      <ImageBackground
        source={IconsBackground}
        style={styles.topBackground}
        imageStyle={{ opacity: 1, resizeMode: 'cover' }} // Soft opacity for background doodle
      >
        <Box style={{ paddingTop: insets.top + 20, paddingHorizontal: 24, zIndex: 10 }}>
          {selectedChats.length > 0 ? (
            <HStack justifyContent="space-between" alignItems="center" marginBottom={24}>
              <HStack alignItems="center" space="md">
                <TouchableOpacity onPress={() => setSelectedChats([])}>
                  <X color="#FFF" size={24} />
                </TouchableOpacity>
                <Text style={styles.greetingName}>{selectedChats.length} Selected</Text>
              </HStack>
              <TouchableOpacity onPress={() => setShowDeleteModal(true)}>
                <Trash2 color="#EF4444" size={24} />
              </TouchableOpacity>
            </HStack>
          ) : (
            <Text style={styles.greetingText}>
              Welcome back, <Text style={styles.greetingName}>{userProfile?.name || 'User'}</Text> 👋
            </Text>
          )}

          <Box style={styles.storiesWrapper}>
            <FlashList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={categories}
              // keyExtractor={(item) => item?._id || Math.random().toString()}
              renderItem={renderCategory}
              contentContainerStyle={styles.storiesListContent}
            />
          </Box>
        </Box>
      </ImageBackground>

      {/* Main Bottom Sheet Area */}
      <Box style={styles.bottomSheetContainer}>
        <Box style={styles.handleBar} />
        
        <FlashList
          data={chats}
          keyExtractor={(item) => item.chatId}
          renderItem={renderChat}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
          onRefresh={refetch}
          refreshing={isRefetching || isLoading}
          ListEmptyComponent={
            <Box style={{ padding: 40, alignItems: 'center' }}>
              <Text style={{ color: '#9CA3AF' }}>No conversations yet. Ask Mr Mythy!</Text>
            </Box>
          }
        />
      </Box>

      {/* Floating Action Button (New Chat) */}
      <Pressable 
        style={styles.newChatFab}
        onPress={() => navigation.navigate('ChatInterface')}
      >
        <Plus color="#000000" size={28} strokeWidth={3} />
      </Pressable>

      {/* Custom Theme Delete Modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <Box flex={1} backgroundColor="rgba(0,0,0,0.6)" justifyContent="center" alignItems="center" paddingHorizontal={24}>
          <Box backgroundColor="#1E1E1E" width="100%" borderRadius={24} padding={24} borderWidth={1} borderColor="#333">
            <HStack alignItems="center" marginBottom={16} space="md">
              <Box backgroundColor="rgba(239, 68, 68, 0.15)" padding={10} borderRadius={20}>
                <Trash2 color="#EF4444" size={24} />
              </Box>
              <Text fontSize={20} fontWeight="700" color="#FFF" fontFamily={theme.typography.fontFamily.primary}>
                Delete Chats?
              </Text>
            </HStack>
            <Text color="#D1D5DB" fontSize={14} marginBottom={32} fontFamily={theme.typography.fontFamily.primary}>
              Are you sure you want to delete {selectedChats.length} conversation{selectedChats.length > 1 ? 's' : ''}? This action cannot be undone.
            </Text>
            <HStack space="md" justifyContent="flex-end">
              <TouchableOpacity 
                onPress={() => setShowDeleteModal(false)}
                style={{ paddingVertical: 12, paddingHorizontal: 24, borderRadius: 24, backgroundColor: '#333' }}
              >
                <Text color="#FFF" fontWeight="600" fontFamily={theme.typography.fontFamily.primary}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleDeleteConfirmed}
                disabled={isDeleting}
                style={{ paddingVertical: 12, paddingHorizontal: 24, borderRadius: 24, backgroundColor: '#EF4444', opacity: isDeleting ? 0.6 : 1 }}
              >
                <Text color="#FFF" fontWeight="600" fontFamily={theme.typography.fontFamily.primary}>
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Text>
              </TouchableOpacity>
            </HStack>
          </Box>
        </Box>
      </Modal>

    </Box>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1C', // Dark background for the very top area
  },
  topBackground: {
    width: '100%',
    height: 380, // Approximate height before sheet overlap
    position: 'absolute',
    top: 0,
  },
  greetingText: {
    fontSize: 22,
    color: '#FFF',
    fontFamily: theme.typography.fontFamily.primary,
    marginBottom: 24,
  },
  greetingName: {
    fontWeight: '800',
    fontSize: 24,
    color: '#FFFFFF'
  },
  storiesWrapper: {
    marginBottom: 40,
    minHeight: 120, // Required for FlashList
    width: '100%',
  },
  storiesListContent: {
    paddingRight: 24, // allows scrolling smoothly to end
  },
  storyContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  storyRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: '#FFD54F',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  addStoryContent: {
    width: '100%',
    height: '100%',
    borderRadius: 36,
    backgroundColor: '#FFD54F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addStoryInnerCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: '#FFD54F'
  },
  storyTitle: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
    fontFamily: theme.typography.fontFamily.primary,
  },
  bottomSheetContainer: {
    flex: 1,
    marginTop: 240, // overlap on top backgronud
    backgroundColor: '#FFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 12,
  },
  handleBar: {
    width: 50,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  chatContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    alignItems: 'center',
  },
  chatAvatarWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    overflow: 'hidden',
    backgroundColor:'#FFD54F'
  },
  chatContent: {
    flex: 1,
    justifyContent: 'center',
  },
  chatHeader: {
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  chatTitle: {
    // flex: 1,
    // marginRight: 8,
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    maxWidth:'80%',
    fontFamily: theme.typography.fontFamily.primary,
  },
  chatTime: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: theme.typography.fontFamily.primary,
    // marginLeft:7
  },
  chatSubtitleRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatSubtitle: {
    flex: 1,
    marginRight: 8,
    fontSize: 14,
    color: '#9CA3AF',
    fontFamily: theme.typography.fontFamily.primary,
  },
  newChatFab: {
    position: 'absolute',
    bottom: 120,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFD54F',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
}));

export default ChatLandingScreen;
