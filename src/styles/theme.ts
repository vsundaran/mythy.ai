export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Assuming the user prefers Poppins as primary, let's setup font families:
export const typography = {
  fontFamily: {
    primary: 'Poppins',
    secondary: 'Product Sans',
    fallback: 'System', // use System if others not installed
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 44, // For large titles like "Unmask the fiction"
  },
};

export const lightTheme = {
  colors: {
    background: '#FFFFFF',
    backgroundOverlay: 'rgba(255, 255, 255, 0.7)',
    primary: '#00F0A0',
    primaryLight: 'rgba(0, 240, 160, 0.15)',
    textPrimary: '#000000',
    textSecondary: '#666666',
    buttonBackground: '#000000',
    buttonText: '#FFFFFF',
  },
  spacing,
  typography,
};

export const darkTheme = {
  colors: {
    background: '#000000',
    backgroundOverlay: 'rgba(0, 0, 0, 0.7)',
    primary: '#00F0A0',
    primaryLight: 'rgba(0, 240, 160, 0.15)',
    textPrimary: '#FFFFFF',
    textSecondary: '#A0A0A0',
    buttonBackground: '#FFFFFF',
    buttonText: '#000000',
  },
  spacing,
  typography,
};
