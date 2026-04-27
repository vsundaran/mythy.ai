import axios from 'axios';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import api from './api';

interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      avatar?: string;
    };
    accessToken: string;
    refreshToken: string;
  };
  error: any;
}

export const signinWithGoogle = async (idToken: string): Promise<AuthResponse> => {
  try {
    const response = await api.post(`/auth/google`, { idToken });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      return error.response.data;
    }
    return {
      success: false,
      message: 'Network error',
      data: null as any,
      error: { reason: 'Could not connect to server' },
    };
  }
};

export const configureGoogleSignin = (webClientId: string) => {
  GoogleSignin.configure({
    webClientId,
    offlineAccess: true,
  });
};

export const getMe = async () => {
  try {
    const response = await api.get(`/auth/me`);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      return error.response.data;
    }
    return {
      success: false,
      message: 'Network error',
      data: null,
      error: { reason: 'Could not connect to server' },
    };
  }
};

export const updateUserName = async (name: string) => {
  try {
    const response = await api.patch('/auth/update-name', { name });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      return error.response.data;
    }
    return {
      success: false,
      message: 'Network error',
      data: null,
      error: { reason: 'Could not connect to server' },
    };
  }
};
