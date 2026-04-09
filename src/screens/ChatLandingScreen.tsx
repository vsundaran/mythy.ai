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

import IconsBackground from '../assets/icons_background.png';

const { width } = Dimensions.get('window');

const stories = [
  { id: '2', title: 'Fitness', image: require('../assets/Fitness.png') },
  { id: '3', title: 'Music', image: require('../assets/Music.png') },
  { id: '4', title: 'Health', image: require('../assets/Health.png') },
  { id: '5', title: 'Baby', image: require('../assets/Baby.png') },
];

const chats = [
  { id: '1', title: 'Baby Care', subtitle: 'okay sure!!', time: '12:25 PM', image: require('../assets/Baby.png') },
  { id: '2', title: 'Fitness', subtitle: 'okay sure!!', time: '12:25 PM', image: require('../assets/Fitness.png') },
  { id: '3', title: 'Health', subtitle: 'okay sure!!', time: '12:25 PM', image: require('../assets/Health.png') },
  { id: '4', title: 'Music', subtitle: 'okay sure!!', time: '12:25 PM', image: require('../assets/Music.png') },
  { id: '5', title: 'Fitness', subtitle: 'okay sure!!', time: '12:25 PM', image: require('../assets/Fitness.png') },
  { id: '6', title: 'Baby Care', subtitle: 'okay sure!!', time: '12:25 PM', image: require('../assets/Baby.png') },
  { id: '7', title: 'Baby Care', subtitle: 'okay sure!!', time: '12:25 PM', image: require('../assets/Baby.png') },
  { id: '8', title: 'Baby Care', subtitle: 'okay sure!!', time: '12:25 PM', image: require('../assets/Baby.png') },
  { id: '9', title: 'Fitness', subtitle: 'okay sure!!', time: '12:25 PM', image: require('../assets/Fitness.png') },
  { id: '10', title: 'Health', subtitle: 'okay sure!!', time: '12:25 PM', image: require('../assets/Health.png') },
  { id: '11', title: 'Music', subtitle: 'okay sure!!', time: '12:25 PM', image: require('../assets/Music.png') },
  { id: '12', title: 'Fitness', subtitle: 'okay sure!!', time: '12:25 PM', image: require('../assets/Fitness.png') },
  { id: '13', title: 'Baby Care', subtitle: 'okay sure!!', time: '12:25 PM', image: require('../assets/Baby.png') },
  { id: '14', title: 'Baby Care', subtitle: 'okay sure!!', time: '12:25 PM', image: require('../assets/Baby.png') },
];

const ChatLandingScreen = () => {
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();
  const navigation = useNavigation<any>();

  const renderStory = ({ item }: { item: typeof stories[0] }) => (
    <Pressable style={styles.storyContainer}  onPress={() => navigation.navigate('Subscription')}>
      <Box style={styles.storyRing}>
        
          <Image 
            source={item.image} 
            alt={item.title}
            style={styles.storyImage} 
            resizeMode="cover"
          />
      
      </Box>
      <Text style={styles.storyTitle}>{item.title}</Text>
    </Pressable>
  );

  const renderChat = ({ item }: { item: typeof chats[0] }) => (
     <Pressable onPress={() => navigation.navigate('ChatInterface')}>
    <HStack style={styles.chatContainer}>
      
      <Image 
        source={item.image} 
        alt={item.title}
        style={styles.chatAvatar}
      />
      <VStack style={styles.chatContent}>
        <HStack style={styles.chatHeader}>
          <Text style={styles.chatTitle}>{item.title}</Text>
          <Text style={styles.chatTime}>{item.time}</Text>
        </HStack>
        <HStack style={styles.chatSubtitleRow}>
          <Text style={styles.chatSubtitle}>{item.subtitle}</Text>
          <CheckCheck color={theme.colors.textSecondary} size={16} />
        </HStack>
      </VStack>
    </HStack>
    </Pressable>
  );

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
              data={stories}
              keyExtractor={(item) => item.id}
              renderItem={renderStory}
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
          keyExtractor={(item) => item.id}
          renderItem={renderChat}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }} // Space for absolute bottom nav
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
  storyImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
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
  chatAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
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
