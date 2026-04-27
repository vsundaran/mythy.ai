import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MessageCircle, Settings, User } from 'lucide-react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

const BottomNavBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 16) }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        let Icon = MessageCircle;
        let label = 'Chat';
        
        if (route.name === 'Settings') {
          Icon = Settings;
          label = 'Settings';
        }

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={(options as any).tabBarButtonTestID || (options as any).tabBarTestID}
            onPress={onPress}
            style={styles.tabItem}
            activeOpacity={0.8}
          >
            <View style={[styles.iconContainer, isFocused && styles.iconContainerFocused]}>
              <Icon 
                color={isFocused ? '#111827' : '#9CA3AF'} 
                size={24} 
                strokeWidth={isFocused ? 2.5 : 2} 
              />
            </View>
            <Text style={[styles.tabLabel, isFocused && styles.tabLabelFocused]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    padding: 8,
    borderRadius: 20,
    marginBottom: 4,
  },
  iconContainerFocused: {
    backgroundColor: '#FFD54F', // App's Yellow accent
    borderRadius: 20,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
    fontFamily: theme.typography.fontFamily.primary,
  },
  tabLabelFocused: {
    color: '#111827',
    fontWeight: '700',
  },
}));

export default BottomNavBar;
