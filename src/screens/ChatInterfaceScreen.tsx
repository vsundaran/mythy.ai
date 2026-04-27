import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  TouchableOpacity,
  ImageBackground,
  TextInput,
  StatusBar,
  Platform,
  Keyboard,
} from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { GiftedChat, Bubble, IMessage } from 'react-native-gifted-chat';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { MoreVertical, Plus, Mic, Play, Send as SendIcon, ExternalLink } from 'lucide-react-native';
import { Box, HStack, Image, Text, Spinner, Pressable } from '@gluestack-ui/themed';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ISource } from '../services/chat.service';
import { useChatDetails, useSendChatMessage } from '../hooks/useChats';
import { useCustomAlert } from '../context/AlertContext';
import ReactNativeModal from 'react-native-modal';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { AiBrain04Icon } from '@hugeicons/core-free-icons';

// ─── Waveform component for audio bubbles ─────────────────────────────────────
const Waveform = () => (
  <HStack alignItems="center" height={24} style={{ gap: 2, paddingHorizontal: 8 }}>
    {[4, 8, 12, 16, 20, 16, 12, 8, 4, 6, 10, 14, 18, 14, 10, 8, 6, 4, 4, 4, 3, 3].map((h, i) => (
      <Box
        key={i}
        width={3}
        height={h}
        backgroundColor={i < 10 ? '#000' : 'rgba(0,0,0,0.2)'}
        borderRadius={2}
      />
    ))}
  </HStack>
);

// ─── ChatInterfaceScreen ──────────────────────────────────────────────────────
const ChatInterfaceScreen = () => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [currentChatId, setCurrentChatId] = useState<string | undefined>(undefined);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [isSourceModalVisible, setIsSourceModalVisible] = useState(false);
  const [modalSources, setModalSources] = useState<ISource[]>([]);

  const { data: chatDetails, isLoading: isChatLoading } = useChatDetails(currentChatId || '');
  const { mutateAsync: sendMessage, isPending: isSending } = useSendChatMessage();

  const isLoading = isChatLoading || isSending;

  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();
  const { showAlert } = useCustomAlert();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const inputRef = useRef<TextInput>(null);

  // ── Keyboard visibility tracking ──────────────────────────────────────────
  useEffect(() => {
    // Use keyboardWillShow/Hide on iOS for sync with animation;
    // keyboardDidShow/Hide on Android (only "Did" events are reliable there).
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // ── Load Chat History ─────────────────────────────────────────────────────
  useEffect(() => {
    if (route.params?.chatId) {
      setCurrentChatId(route.params.chatId);
    }
  }, [route.params?.chatId]);

  useEffect(() => {
    if (chatDetails) {
      const giftedMessages = chatDetails.messages.map((msg: any) => ({
        _id: msg._id,
        text: msg.content,
        createdAt: new Date(msg.createdAt),
        user: msg.role === 'user' ? { _id: 1 } : { _id: 2, name: 'Mr Mythy' },
        aiResponse: msg.metadata || {},
      }));

      setMessages(giftedMessages.reverse());
    }
  }, [chatDetails]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const onSend = useCallback(async (newMessages: IMessage[] = []) => {
    const userMsg = newMessages[0];
    setMessages(prev => GiftedChat.append(prev, [userMsg]));
    
    try {
      const apiResponse = await sendMessage({ question: userMsg.text, chatId: currentChatId });
      
      // ... same logic ...
      const lastMessage = apiResponse.messages[apiResponse.messages.length - 1];
      
      const aiMsg: any = {
        _id: lastMessage._id || Math.random().toString(),
        text: lastMessage.content,
        createdAt: new Date(lastMessage.createdAt),
        user: { _id: 2, name: 'Mr Mythy' },
        aiResponse: lastMessage.metadata || {},
      };

      if (!currentChatId) {
        setCurrentChatId(apiResponse.chatId);
      }

      setMessages(prev => GiftedChat.append(prev, [aiMsg]));
    } catch (error: any) {
      console.error('Chat error:', error);
      
      // Check for insufficient credits
      if (error.message === 'INSUFFICIENT_CREDITS' || error?.response?.data?.message === 'INSUFFICIENT_CREDITS') {
        showAlert({
          title: 'Out of Credits',
          message: 'You have exhausted your credits for this month. Please upgrade your plan to continue myth-busting!',
          buttons: [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Upgrade Now', 
              onPress: () => navigation.navigate('Subscription'),
              style: 'default'
            }
          ]
        });
      } else {
        showAlert({ 
          title: 'Error', 
          message: 'Failed to get a response from Mr Mythy' 
        });
      }
      
      // Remove the user's message if it failed
      setMessages(prev => prev.filter(m => m._id !== userMsg._id));
    }
  }, [currentChatId, sendMessage]);

  const handleSend = () => {
    if (inputText.trim().length === 0 || isLoading) return;
    const userMsg: any = {
      _id: Math.random().toString(),
      text: inputText.trim(),
      createdAt: new Date(),
      user: { _id: 1 },
    };
    onSend([userMsg]);
    setInputText('');
  };

  // ── Render: Day Chip ──────────────────────────────────────────────────────
  const renderDay = (props: any) => {
    const { currentMessage } = props;
    if (!currentMessage || !currentMessage.createdAt) return null;

    const date = new Date(currentMessage.createdAt);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    let dateString = '';
    if (date.toDateString() === today.toDateString()) {
      dateString = 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      dateString = 'Yesterday';
    } else {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      dateString = `${day}, ${month}, ${year}`;
    }

    return (
      <Box alignItems="center" marginVertical={12}>
        <Box 
          backgroundColor="#F3F4F6" 
          paddingHorizontal={12} 
          paddingVertical={4} 
          borderRadius={16}
        >
          <Text 
            fontSize={12} 
            color="#6B7280" 
            fontWeight="600" 
            fontFamily={theme.typography.fontFamily.primary}
          >
            {dateString}
          </Text>
        </Box>
      </Box>
    );
  };

  // ── Render: Bubble ────────────────────────────────────────────────────────
  const renderBubble = (props: any) => {
    const { currentMessage } = props;
    const isAi = currentMessage.user?._id === 2;
    const aiResponse = currentMessage.aiResponse;

    const getChipStyles = (result: string) => {
      switch (result) {
        case 'True': 
          return { 
            bg: '#DAF7E1', 
            primary: '#14603B', 
            label: 'TRUE' 
          };
        case 'False': 
          return { 
            bg: '#FEE2E2', 
            primary: '#B91C1C', 
            label: 'FALSE' 
          };
        case 'Misleading': 
          return { 
            bg: '#FEF3C7', 
            primary: '#B45309', 
            label: 'MISLEADING' 
          };
        default: 
          return { 
            bg: '#F3F4F6', 
            primary: '#4B5563', 
            label: result.toUpperCase() 
          };
      }
    };

    const handleSourcePress = (sources: ISource[]) => {
      if (sources.length === 1) {
        navigation.navigate('Proof', { url: sources[0].url, title: sources[0].title });
      } else {
        setModalSources(sources);
        setIsSourceModalVisible(true);
      }
    };

    return (
      <Box style={{ marginBottom: 8 }}>
        {isAi && aiResponse && aiResponse.result && (
          <Box paddingHorizontal={12} marginBottom={8}>
            <HStack space="md" alignItems="center">
              <HStack 
                backgroundColor={getChipStyles(aiResponse.result).bg} 
                paddingHorizontal={12} 
                paddingVertical={6} 
                borderRadius={20}
                borderWidth={1}
                borderColor={getChipStyles(aiResponse.result).primary}
                alignItems="center"
                style={{ gap: 8 }}
              >
                {/* Status Dot */}
                <Box 
                  width={8} 
                  height={8} 
                  borderRadius={4} 
                  backgroundColor={getChipStyles(aiResponse.result).primary} 
                />
                <Text 
                  color={getChipStyles(aiResponse.result).primary} 
                  fontWeight="700" 
                  fontSize={12} 
                  style={{ letterSpacing: 0.5 }}
                >
                  {getChipStyles(aiResponse.result).label}
                </Text>
              </HStack>
              {aiResponse.sources?.length > 0 && (
                <TouchableOpacity onPress={() => handleSourcePress(aiResponse.sources)}>
                  <HStack 
                    space="xs" 
                    alignItems="center" 
                    backgroundColor="#F3F4F6" 
                    paddingHorizontal={10} 
                    paddingVertical={4} 
                    borderRadius={16}
                  >
                    <ExternalLink size={12} color="#6B7280" />
                    <Text color="#6B7280" fontSize={12}>Sources</Text>
                  </HStack>
                </TouchableOpacity>
              )}
            </HStack>
          </Box>
        )}
        <Bubble
          {...props}
          renderTime={() => null}
          wrapperStyle={{
            left: {
              backgroundColor: '#FFF2C8',
              borderRadius: 24,
              paddingVertical: 4,
              paddingHorizontal: 8,
            },
            right: {
              backgroundColor: '#FDE1D2',
              borderRadius: 24,
              paddingVertical: 4,
              paddingHorizontal: 8,
            },
          }}
          textStyle={{
            left: {
              color: '#111827',
              fontSize: 16,
              fontFamily: theme.typography.fontFamily.primary,
            },
            right: {
              color: '#111827',
              fontSize: 16,
              fontFamily: theme.typography.fontFamily.primary,
            },
          }}
        />
      </Box>
    );
  };

  // ── Render: Audio bubble ──────────────────────────────────────────────────
  const renderCustomView = (props: any) => {
    if (props.currentMessage.audio) {
      return (
        <HStack alignItems="center" padding={6} style={{ minWidth: 160 }}>
          <Box
            backgroundColor="#000"
            borderRadius={24}
            width={40}
            height={40}
            alignItems="center"
            justifyContent="center">
            <Play fill="#FCFCFC" color="#FCFCFC" size={20} style={{ marginLeft: 3 }} />
          </Box>
          <Waveform />
        </HStack>
      );
    }
    return null;
  };

  // ── Render: Custom input toolbar ──────────────────────────────────────────
  const renderInputToolbar = (_props: any) => {
    /**
     * When keyboard is visible → use a small fixed padding (8px).
     *   The KAV already pushed the view above the keyboard; adding the
     *   full safe-area inset would create an ugly gap above the keyboard.
     *
     * When keyboard is hidden → restore the safe-area inset so the bar
     *   clears the home indicator / bottom gesture area.
     */
    const bottomPadding = keyboardVisible ? 8 : Math.max(insets.bottom, 16);

    return (
      <Box
        backgroundColor="#FFFFFF"
        paddingHorizontal={16}
        paddingTop={12}
        // Dynamic bottom padding — avoids gap above keyboard AND respects home indicator
        style={{ paddingBottom: bottomPadding }}>
        <HStack
          borderRadius={30}
          borderWidth={1}
          borderColor="#E5E7EB"
          backgroundColor="#FFFFFF"
          alignItems="center"
          paddingHorizontal={4}
          paddingVertical={4}>
          <TouchableOpacity style={styles.plusButton}>
            <Plus color="#000" size={24} />
          </TouchableOpacity>

          <TextInput
            ref={inputRef}
            style={styles.textInput}
            placeholder="Type Message"
            placeholderTextColor="#6B7280"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            blurOnSubmit={false}
          />

          <Box width={1} height={24} backgroundColor="#E5E7EB" marginHorizontal={8} />

          <TouchableOpacity style={styles.micButton} onPress={handleSend} disabled={isLoading}>
            {isLoading ? (
              <Spinner color="#000" size="small" />
            ) : inputText.trim().length > 0 ? (
              <SendIcon color="#000" size={20} />
            ) : (
              <Mic color="#000" size={20} />
            )}
          </TouchableOpacity>
        </HStack>
      </Box>
    );
  };

  // ── Root render ───────────────────────────────────────────────────────────
  return (
    <ImageBackground
      source={require('../assets/icons_background.png')}
      style={styles.container}
      imageStyle={{ opacity: 1 }}>
      {/* Dark overlay */}
      <Box style={StyleSheet.absoluteFillObject} backgroundColor="#1B1B1B" opacity={0.9} />

      <StatusBar barStyle="light-content" />

      {/* ── Header ────────────────────────────────────────────────────────────
          Lives OUTSIDE the KeyboardAvoidingView so it stays perfectly
          anchored at the top and is never shifted by the keyboard.
      ──────────────────────────────────────────────────────────────────────── */}
      <Box paddingTop={insets.top + 16} paddingBottom={20} paddingHorizontal={16}>
        <HStack alignItems="center" justifyContent="space-between">
          <HStack alignItems="center">
            <Box
              width={48}
              height={48}
              borderRadius={24}
              backgroundColor="#FFD54F"
              alignItems="center"
              justifyContent="center">
              <HugeiconsIcon icon={AiBrain04Icon} size={32} color="#000000ff" />
              {/* <Image
                source={require('../assets/logo.png')}
                alt="Avatar"
                style={{ width: 48, height: 48, borderRadius: 24 }}
                resizeMode="cover"
              /> */}
            </Box>

            <Box marginLeft={12}>
              <Text style={styles.headerTitle}>Mr Mythy</Text>
              <Text style={styles.headerSubtitle}>Online</Text>
            </Box>
          </HStack>
        </HStack>
      </Box>

      {/* ── Chat area + KeyboardAvoidingView ──────────────────────────────────
          KeyboardAvoidingView from react-native-keyboard-controller is used
          here instead of core RN's version because it syncs with the native
          keyboard animation frame-perfectly (no layout jump/juggle).

          Critically, it wraps ONLY the chat area — not the header above —
          so only the message list + input bar shift when the keyboard appears.

          GiftedChat's internal keyboard handling is DISABLED via
          `isKeyboardInternallyHandled={false}` so there is exactly ONE
          keyboard handler active: this KAV. Without that flag, GiftedChat
          runs its own KeyboardAvoidingFlatList that conflicts with the outer
          KAV and produces the "juggling" effect.
      ──────────────────────────────────────────────────────────────────────── */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        /**
         * 'padding' on iOS: KAV adds keyboard height as bottom padding,
         *   pushing the content up in sync with the keyboard slide.
         * 'height' on Android: shrinks the view height instead (more
         *   reliable than 'padding' on Android).
         */
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Box style={styles.chatAreaContainer}>
          {isLoading && messages.length === 0 ? (
            <Box flex={1} alignItems="center" justifyContent="center">
              <Spinner color="#FFD54F" size="large" />
              <Text marginTop={12} color="#6B7280">Loading conversation...</Text>
            </Box>
          ) : (
            <GiftedChat
              messages={messages}
              onSend={(newMessages) => onSend(newMessages)}
              user={{ _id: 1 }}
              renderAvatar={() => null}
              renderDay={renderDay}
              renderBubble={renderBubble}
              renderInputToolbar={renderInputToolbar}
              renderCustomView={renderCustomView}
              // Use 'listProps' as verified in the GiftedChat v3.x source
              listProps={{
                // keyboardShouldPersistTaps: 'handled',
                contentContainerStyle: {
                  flexGrow: 1,
                  justifyContent: 'flex-end',
                },
                // keyboardDismissMode: 'interactive',
              }}
              messagesContainerStyle={{
                backgroundColor: '#FFFFFF',
                paddingBottom: 20,
                paddingTop: 16,
              }}
            />
          )}
        </Box>
      </KeyboardAvoidingView>

      {/* Sources Selection Modal */}
      <ReactNativeModal
        isVisible={isSourceModalVisible}
        onBackdropPress={() => setIsSourceModalVisible(false)}
        onSwipeComplete={() => setIsSourceModalVisible(false)}
        swipeDirection={['down']}
        style={{ justifyContent: 'flex-end', margin: 0 }}
      >
        <Box backgroundColor="#1C1C1C" borderTopLeftRadius={24} borderTopRightRadius={24} padding={24}>
          <Box width={40} height={4} backgroundColor="#333" borderRadius={2} alignSelf="center" marginBottom={24} />
          <Text fontSize={20} fontWeight="700" color="#FFF" fontFamily={theme.typography.fontFamily.primary} marginBottom={16}>
            Select Source
          </Text>
          {modalSources.map((source, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                setIsSourceModalVisible(false);
                setTimeout(() => {
                  navigation.navigate('Proof', { url: source.url, title: source.title });
                }, 300);
              }}
              style={{
                paddingVertical: 16,
                borderBottomWidth: index === modalSources.length - 1 ? 0 : 1,
                borderBottomColor: '#333'
              }}
            >
              <HStack alignItems="center" justifyContent="space-between">
                <Text color="#D1D5DB" fontSize={16} fontFamily={theme.typography.fontFamily.primary}>
                  {source.title}
                </Text>
                <ExternalLink size={16} color="#FFD54F" />
              </HStack>
            </TouchableOpacity>
          ))}
          <Box height={insets.bottom + 16} />
        </Box>
      </ReactNativeModal>

    </ImageBackground>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: theme.typography.fontFamily.primary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#D1D5DB',
    fontFamily: theme.typography.fontFamily.primary,
    marginTop: 2,
  },
  chatAreaContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#111827',
    // Explicit height prevents Android text input from collapsing
    minHeight: 44,
  },
  plusButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFD54F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  micButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFD54F',
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

export default ChatInterfaceScreen;
