import axios from 'axios';
import { Platform } from 'react-native';
import api from './api';

const API_URL =  api.defaults.baseURL;

export interface ICategory {
  _id: string;
  title: string;
  iconName: string;
  isActive: boolean;
}

export const fetchCategories = async (): Promise<ICategory[]> => {
  try {
    const response = await api.get(`/categories`);
    if (response.data && response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data?.message || 'Failed to fetch categories');
  } catch (error) {
    console.error('API Error (fetchCategories):', error);
    throw error;
  }
};
