import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { Box, HStack, Text } from '@gluestack-ui/themed';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeft, Share2 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ProofScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const { url, title } = route.params;

  return (
    <Box style={styles.container}>
      {/* Custom Header */}
      <Box 
        style={[
          styles.header, 
          { paddingTop: insets.top + 10, paddingBottom: 15 }
        ]}
      >
        <HStack alignItems="center" justifyContent="space-between" paddingHorizontal={16}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
            <ChevronLeft color="#000" size={28} />
          </TouchableOpacity>
          
          <Box flex={1} marginHorizontal={10}>
            <Text numberOfLines={1} style={styles.headerTitle}>{title || 'Source Proof'}</Text>
            <Text numberOfLines={1} style={styles.headerUrl}>{url}</Text>
          </Box>

          <TouchableOpacity style={styles.iconButton}>
            <Share2 color="#000" size={24} />
          </TouchableOpacity>
        </HStack>
      </Box>

      {/* WebView */}
      <WebView 
        source={{ uri: url }} 
        style={styles.webview} 
        startInLoadingState={true}
      />
    </Box>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  headerUrl: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webview: {
    flex: 1,
  },
});

export default ProofScreen;
