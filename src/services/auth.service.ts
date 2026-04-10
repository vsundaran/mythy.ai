import axios from 'axios';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const API_URL = 'http://172.20.10.12:5001/api/v1/auth'; // Update for production

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
    const response = await axios.post(`${API_URL}/google`, { idToken });
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
