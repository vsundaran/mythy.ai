import React from 'react';
import {
  ImageBackground,
  Dimensions,
  FlatList,
} from 'react-native';
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
  Plus
} from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { fetchUserChats, IChat } from '../services/chat.service';
import { fetchCategories, ICategory } from '../services/category.service';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { 
  Dumbbell01Icon,
  MusicNote01Icon,
  HealthIcon,
  Baby01Icon,
  SquareIcon,
  BookOpen01Icon,
  GlobalIcon,
  MessageProgrammingIcon
} from '@hugeicons/core-free-icons';
import IconPlaceHolder from '../assets/icon_place_holder.svg';

const IconMap: Record<string, any> = {
  Dumbbell01Icon,
  MusicNote01Icon,
  HeartBeatIcon: HealthIcon,
  BabyBoyIcon: Baby01Icon,
  HealthIcon,
  Baby01Icon,
  BookOpen01Icon,
  GlobalIcon,
  MessageProgrammingIcon,
  SquareIcon
};

import IconsBackground from '../assets/icons_background.png';

const { width } = Dimensions.get('window');


const ChatLandingScreen = () => {
  const [chats, setChats] = React.useState<IChat[]>([]);
  const [categories, setCategories] = React.useState<ICategory[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();
  const navigation = useNavigation<any>();

  useFocusEffect(
    React.useCallback(() => {
      loadChats();
      loadCategories();
    }, [])
  );

  const loadCategories = async () => {
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadChats = async () => {
    try {
      setIsLoading(true);
      const data = await fetchUserChats();
      setChats(data);
    } catch (error) {
      console.error('Failed to load chats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderCategory = ({ item }: { item: ICategory }) => {
    const IconComponent = IconMap[item.iconName] || SquareIcon;

    return (
      <Pressable style={styles.storyContainer} onPress={() => navigation.navigate('Subscription')}>
        <Box style={styles.storyRing}>
          <Box style={styles.iconWrapper}>
            <IconPlaceHolder width={64} height={64} style={{ position: 'absolute' }} />
            <HugeiconsIcon icon={IconComponent} size={32} color="#414141ff" />
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

    const ChatIconComponent = IconMap[item.categoryIcon || 'SquareIcon'] || SquareIcon;

    return (
      <Pressable onPress={() => navigation.navigate('ChatInterface', { chatId: item.chatId })}>
        <HStack style={styles.chatContainer}>
          <Box style={styles.chatAvatarWrapper}>
            <IconPlaceHolder width={60} height={60} style={{ position: 'absolute' }} />
            <HugeiconsIcon icon={ChatIconComponent} size={30} color="#414141ff" />
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
              <CheckCheck color={theme.colors.textSecondary} size={16} />
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
          <Text style={styles.greetingText}>
            Welcome back, <Text style={styles.greetingName}>V Sundaran</Text> 👋
          </Text>

          <Box style={styles.storiesWrapper}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={categories}
              keyExtractor={(item) => item._id}
              renderItem={renderCategory}
              contentContainerStyle={styles.storiesListContent}
             
            />
          </Box>
        </Box>
      </ImageBackground>

      {/* Main Bottom Sheet Area */}
      <Box style={styles.bottomSheetContainer}>
        <Box style={styles.handleBar} />
        
        <FlatList
          data={chats}
          keyExtractor={(item) => item.chatId}
          renderItem={renderChat}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          onRefresh={loadChats}
          refreshing={isLoading}
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
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    fontFamily: theme.typography.fontFamily.primary,
  },
  chatTime: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: theme.typography.fontFamily.primary,
  },
  chatSubtitleRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    fontFamily: theme.typography.fontFamily.primary,
  },
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  bottomNavInner: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navItemSpace: {
    flex: 1,
  },
  navText: {
    fontSize: 10,
    marginTop: 4,
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.primary,
  },
  fab: {
    position: 'absolute',
    top: -24,
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFD54F',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4.65,
    elevation: 8,
  },
  newChatFab: {
    position: 'absolute',
    bottom: 102,
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
