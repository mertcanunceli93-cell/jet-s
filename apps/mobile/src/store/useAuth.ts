import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { connectSocket, disconnectSocket } from '../lib/socket';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'COURIER' | 'ADMIN';
  phone?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  token: null,
  setAuth: async (user, token) => {
    await SecureStore.setItemAsync('user', JSON.stringify(user));
    await SecureStore.setItemAsync('token', token);
    set({ user, token });
    connectSocket(user.id);
  },
  logout: async () => {
    await SecureStore.deleteItemAsync('user');
    await SecureStore.deleteItemAsync('token');
    set({ user: null, token: null });
    disconnectSocket();
  },
  loadStoredAuth: async () => {
    try {
      const userStr = await SecureStore.getItemAsync('user');
      const token = await SecureStore.getItemAsync('token');
      if (userStr && token) {
        const parsedUser = JSON.parse(userStr);
        set({ user: parsedUser, token });
        connectSocket(parsedUser.id);
      }
    } catch (e) {
      console.error('Failed to load stored auth', e);
    }
  },
}));
