import React, { createContext, useContext, useState, useCallback } from 'react';

export type AlertButton = {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
};

export type AlertConfig = {
  title: string;
  message?: string;
  buttons?: AlertButton[];
  type?: 'success' | 'error' | 'warning' | 'info';
};

interface AlertContextData {
  showAlert: (config: AlertConfig) => void;
  hideAlert: () => void;
  config: AlertConfig | null;
  isVisible: boolean;
}

const AlertContext = createContext<AlertContextData>({} as AlertContextData);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [config, setConfig] = useState<AlertConfig | null>(null);

  const showAlert = useCallback((newConfig: AlertConfig) => {
    setConfig(newConfig);
    setIsVisible(true);
  }, []);

  const hideAlert = useCallback(() => {
    setIsVisible(false);
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert, config, isVisible }}>
      {children}
    </AlertContext.Provider>
  );
};

export const useCustomAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useCustomAlert must be used within an AlertProvider');
  }
  return context;
};
