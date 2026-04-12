import axios from 'axios';
import { Platform } from 'react-native';

const API_URL = Platform.OS === 'android' ? 'http://192.168.1.33:5001/api/v1' : 'http://localhost:3000/api/v1';

export interface ICategory {
  _id: string;
  title: string;
  iconName: string;
  isActive: boolean;
}

export const fetchCategories = async (): Promise<ICategory[]> => {
  try {
    const response = await axios.get(`${API_URL}/categories`);
    if (response.data && response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data?.message || 'Failed to fetch categories');
  } catch (error) {
    console.error('API Error (fetchCategories):', error);
    throw error;
  }
};
