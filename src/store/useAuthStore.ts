import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createMMKV } from 'react-native-mmkv';

const storage = createMMKV();

const zustandStorage = {
  setItem: (name: string, value: string) => {
    return storage.set(name, value);
  },
  getItem: (name: string) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  removeItem: (name: string) => {
    return storage.remove(name);
  },
};

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthState {
  authToken: string | null;
  refreshToken: string | null;
  user: User | null;
  setAuth: (tokens: { accessToken: string; refreshToken: string }, user: User) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      authToken: null,
      refreshToken: null,
      user: null,
      setAuth: (tokens, user) => set({ 
        authToken: tokens.accessToken, 
        refreshToken: tokens.refreshToken, 
        user 
      }),
      clearAuth: () => set({ authToken: null, refreshToken: null, user: null }),
    }),
    {
      name: 'mythy-auth-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
