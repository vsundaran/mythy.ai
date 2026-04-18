import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import ReactNativeModal from 'react-native-modal';
import { useCustomAlert } from '../../context/AlertContext';
import { StyleSheet } from 'react-native-unistyles';

const { width } = Dimensions.get('window');

const AlertModal: React.FC = () => {
  const { isVisible, hideAlert, config } = useCustomAlert();

  if (!config) return null;

  const { title, message, buttons } = config;

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
      backdropOpacity={0.7}
      animationIn="zoomIn"
      animationOut="zoomOut"
      useNativeDriver
      hideModalContentWhileAnimating
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          {message && <Text style={styles.message}>{message}</Text>}
          {renderButtons()}
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
    backgroundColor: theme.colors.background === '#000000' ? '#1A1A1A' : '#F8F9FA',
    borderRadius: 24,
    padding: 24,
    width: width * 0.85,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFD54F', // App's primary yellow
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: theme.typography.fontFamily.primary,
  },
  message: {
    fontSize: 16,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
    fontFamily: theme.typography.fontFamily.primary,
    opacity: 0.9,
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    backgroundColor: '#FFD54F',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    width: '100%',
  },
  buttonMargin: {
    marginTop: 10,
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
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  buttonCancelText: {
    color: theme.colors.textPrimary,
    opacity: 0.7,
  },
  buttonDestructive: {
    backgroundColor: '#FF4B4B',
  },
  buttonDestructiveText: {
    color: '#FFFFFF',
  },
  buttonMain: {
    backgroundColor: '#FFD54F',
    paddingVertical: 14,
    borderRadius: 16,
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
