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

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    const init = async () => {
      // Add any initialization logic here (e.g., fetching data, checking auth)
    };

    init().finally(async () => {
      setTimeout(() => {
        BootSplash.hide({ fade: true });
      }, 2000);
    });
  }, []);

  return (
    <SafeAreaProvider>
      <GluestackUIProvider config={config}>
        <KeyboardProvider>
          <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </KeyboardProvider>
      </GluestackUIProvider>
    </SafeAreaProvider>
  );
}

export default App;
