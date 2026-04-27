import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import ReactNativeModal from 'react-native-modal';
import { useCustomAlert } from '../../context/AlertContext';
import { StyleSheet } from 'react-native-unistyles';

const { width } = Dimensions.get('window');

const AlertModal: React.FC = () => {
  const { isVisible, hideAlert, config } = useCustomAlert();

  if (!config) return null;

  const { title, message, buttons, icon, iconColor } = config;
  console.log(config, "config on Alert modal")
  const handleButtonPress = (onPress?: () => void) => {
    hideAlert();
    if (onPress) {
      setTimeout(() => {
        onPress();
      }, 300); // Wait for modal to close
    }
  };

  const renderButtons = () => {
    if (!buttons || buttons.length === 0) {
      return (
        <TouchableOpacity 
          style={styles.buttonMain} 
          activeOpacity={0.8}
          onPress={() => hideAlert()}
        >
          <Text style={styles.buttonMainText}>OK</Text>
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.buttonContainer}>
        {buttons.map((btn, index) => {
          const isCancel = btn.style === 'cancel';
          const isDestructive = btn.style === 'destructive';
          
          return (
            <TouchableOpacity 
              key={index}
              activeOpacity={0.7}
              style={[
                styles.button,
                index > 0 && styles.buttonMargin,
                isCancel && styles.buttonCancel,
                isDestructive && styles.buttonDestructive
              ]}
              onPress={() => handleButtonPress(btn.onPress)}
            >
              <Text style={[
                styles.buttonText,
                isCancel && styles.buttonCancelText,
                isDestructive && styles.buttonDestructiveText
              ]}>
                {btn.text}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };
  return (
    <ReactNativeModal
      isVisible={isVisible}
      onBackdropPress={hideAlert}
      onBackButtonPress={hideAlert}
      backdropOpacity={0.5}
      backdropColor="#000"
      animationIn="fadeIn"
      animationOut="fadeOut"
      animationInTiming={200}
      animationOutTiming={200}
      useNativeDriver
      hideModalContentWhileAnimating
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            {icon && (
              <View style={[styles.iconWrapper, { backgroundColor: iconColor || 'rgba(255, 213, 79, 0.15)' }]}>
                {icon}
              </View>
            )}
            <Text style={styles.title}>{title}</Text>
          </View>
          
          {message && <Text style={styles.message}>{message}</Text>}
          
          <View style={styles.footer}>
            {renderButtons()}
          </View>
        </View>
      </View>
    </ReactNativeModal>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: theme.colors.background === '#000000' ? '#1A1A1A' : '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    width: width * 0.88,
    borderWidth: 1,
    borderColor: theme.colors.background === '#000000' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    textAlign: 'center',
    fontFamily: theme.typography.fontFamily.primary,
    letterSpacing: -0.5,
  },
  message: {
    fontSize: 16,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    fontFamily: theme.typography.fontFamily.primary,
    opacity: 0.7,
  },
  footer: {
    width: '100%',
  },
  buttonContainer: {
    width: '100%',
    flexDirection: 'column',
  },
  button: {
    backgroundColor: '#FFD54F',
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
    width: '100%',
  },
  buttonMargin: {
    marginTop: 12,
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: theme.typography.fontFamily.primary,
  },
  buttonCancel: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.background === '#000000' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
  },
  buttonCancelText: {
    color: theme.colors.textPrimary,
    opacity: 0.8,
  },
  buttonDestructive: {
    backgroundColor: '#FF4B4B',
  },
  buttonDestructiveText: {
    color: '#FFFFFF',
  },
  buttonMain: {
    backgroundColor: '#FFD54F',
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
    width: '100%',
  },
  buttonMainText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: theme.typography.fontFamily.primary,
  },
}));

export default AlertModal;
