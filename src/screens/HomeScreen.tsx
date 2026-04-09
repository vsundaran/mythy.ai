import React from 'react';
import {
  ImageBackground,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Image as SvgImage } from 'react-native-svg';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Box, Text, Pressable, HStack } from '@gluestack-ui/themed';

import IconsBackground from '../../assets/icons_background.png';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();

  return (
    <Box style={styles.container}>
      {/* Background Pattern */}
      <ImageBackground
        source={IconsBackground}
        style={styles.backgroundImage}
        imageStyle={styles.backgroundImageStyle}
      >
        
        <Box style={[styles.content, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
          {/* Top Graphics */}
          <Box style={styles.bannerContainer}>
            <Svg width={width * 0.85} height={width * 0.85}>
              <SvgImage
                href={require('../../assets/Home_Banner.png')}
                width="100%"
                height="100%"
                preserveAspectRatio="xMidYMid meet"
              />
            </Svg>
          </Box>


          {/* Text Content */}
          <Box style={styles.textContainer}>
            <Text style={styles.title}>
              Unmask the fiction.{'\n'}Unlock the facts.
            </Text>

            <HStack style={styles.badgeContainer}>
              <Box style={styles.checkIconContainer}>
                <Svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                  <Path
                    d="M16.6667 5L7.50004 14.1667L3.33337 10"
                    stroke={theme.colors.primary}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </Box>
              <Text style={styles.badgeText}>Truth, verified. Fast.</Text>
            </HStack>
          </Box>

          {/* Bottom Button */}
          <Pressable 
            style={styles.button}
            onPress={() => navigation.navigate('ChatLanding')}
          >
            <Box style={styles.googleIconContainer}>
              <Svg width="24" height="24" viewBox="0 0 48 48">
                <Path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.7 17.74 9.5 24 9.5z" />
                <Path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <Path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <Path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </Svg>
            </Box>
            <Text style={styles.buttonText}>Continue with Google</Text>
          </Pressable>
        </Box>
      </ImageBackground>
    </Box>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  backgroundImageStyle: {
    opacity: 1, // Let user adjust this
    resizeMode: 'cover',
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg, // 24
    justifyContent: 'space-between',
  },
  bannerContainer: {
    flex: 1.2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 0.8,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: theme.typography.fontSize.xxl, // 44
    fontWeight: '700',
    color: theme.colors.textPrimary,
    lineHeight: 52,
    marginBottom: theme.spacing.md + 4, // 20
    fontFamily: theme.typography.fontFamily.primary, // 'Poppins'
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  badgeText: {
    fontSize: theme.typography.fontSize.lg, // 18
    color: theme.colors.textPrimary,
    fontWeight: '600',
    fontFamily: theme.typography.fontFamily.primary,
  },
  button: {
    backgroundColor: theme.colors.buttonBackground,
    flexDirection: 'row',
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  googleIconContainer: {
    marginRight: 12,
  },
  buttonText: {
    fontSize: theme.typography.fontSize.lg, // 18
    fontWeight: '700',
    color: theme.colors.buttonText,
    fontFamily: theme.typography.fontFamily.primary,
  },
}));

export default HomeScreen;
