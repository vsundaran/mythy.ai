import { StyleSheet } from 'react-native-unistyles';
import { lightTheme, darkTheme } from './theme';

type AppThemes = {
  light: typeof lightTheme;
  dark: typeof darkTheme;
};

declare module 'react-native-unistyles' {
  export interface UnistylesThemes extends AppThemes {}
}

StyleSheet.configure({
  settings: {
    initialTheme: 'dark',
  },
  themes: {
    light: lightTheme,
    dark: darkTheme,
  },
});
