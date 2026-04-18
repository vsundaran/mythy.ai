import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import ChatLandingScreen from '../screens/ChatLandingScreen';
import ChatInterfaceScreen from '../screens/ChatInterfaceScreen';
import SubscriptionScreen from '../screens/SubscriptionScreen';
import ProofScreen from '../screens/ProofScreen';
import { useAuthStore } from '../store/useAuthStore';

export type RootStackParamList = {
  Home: undefined;
  ChatLanding: undefined;
  ChatInterface: { chatId?: string };
  Subscription: undefined;
  Proof: { url: string, title?: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const authToken = useAuthStore(state => state.authToken);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      {!authToken ? (
        // Guest Stack
        <Stack.Screen name="Home" component={HomeScreen} />
      ) : (
        // Auth Stack
        <>
          <Stack.Screen name="ChatLanding" component={ChatLandingScreen} />
          <Stack.Screen name="ChatInterface" component={ChatInterfaceScreen} />
          <Stack.Screen name="Subscription" component={SubscriptionScreen} />
          <Stack.Screen name="Proof" component={ProofScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
