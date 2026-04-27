import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import ChatLandingScreen from '../screens/ChatLandingScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ChatInterfaceScreen from '../screens/ChatInterfaceScreen';
import SubscriptionScreen from '../screens/SubscriptionScreen';
import ProofScreen from '../screens/ProofScreen';
import BottomNavBar from '../components/BottomNavBar';
import { useAuthStore } from '../store/useAuthStore';

export type RootStackParamList = {
  Home: undefined;
  MainTabs: undefined;
  ChatInterface: { chatId?: string };
  Subscription: undefined;
  Proof: { url: string, title?: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const MainTabs = () => (
  <Tab.Navigator
    tabBar={(props) => <BottomNavBar {...props} />}
    screenOptions={{ headerShown: false }}
  >
    <Tab.Screen name="ChatLanding" component={ChatLandingScreen} />
    <Tab.Screen name="Settings" component={SettingsScreen} />
  </Tab.Navigator>
);

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
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="ChatInterface" component={ChatInterfaceScreen} />
          <Stack.Screen name="Subscription" component={SubscriptionScreen} />
          <Stack.Screen name="Proof" component={ProofScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
