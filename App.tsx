/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import './src/styles/unistyles';
import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import BootSplash from 'react-native-bootsplash';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { NavigationContainer } from '@react-navigation/native';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { config } from '@gluestack-ui/config';
import AppNavigator from './src/navigation/AppNavigator';
import api from './src/services/api';
import { useAuthStore } from './src/store/useAuthStore';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AlertProvider } from './src/context/AlertContext';
import AlertModal from './src/components/ui/AlertModal';
import { Text } from 'react-native-gesture-handler';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
    },
  },
});

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    const init = async () => {
      const { authToken, clearAuth } = useAuthStore.getState();
      
      if (authToken) {
        try {
          // Validate token and fetch user data
          await api.get('/auth/me');
          console.log('[App] Session validated successfully');
        } catch (error) {
          console.log('[App] Session validation failed, checking if still logged in');
          // If 401 occurred, interceptor might have already tried refreshing.
          // If we still have no token in store, it means refresh failed.
          const currentToken = useAuthStore.getState().authToken;
          if (!currentToken) {
            console.log('[App] Refresh also failed or no token left, clearing auth');
            clearAuth();
          }
        }
      }
    };

    init().finally(() => {
        BootSplash.hide({ fade: true });
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <GluestackUIProvider config={config}>
          <AlertProvider>
            <KeyboardProvider>
              <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
              <NavigationContainer>
                <AppNavigator />
              </NavigationContainer>
              <AlertModal />
              {/* <Text>Hello</Text> */}
            </KeyboardProvider>
          </AlertProvider>
        </GluestackUIProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

export default App;
