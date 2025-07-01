import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      role: null,
      isLoggedIn: false,
      newUser: true,
      isCollector: false,
      isClient: false,

      setUser: (user, role) => set({ user, isLoggedIn: true, role }),
      clearAuth: () => set({
        user: null,
        role: null,
        isLoggedIn: false,
        isCollector: false,
        notificationToken: null,
        isClient: false,
        newUser: false
      }),
      setNotificationToken: (token) => set({ notificationToken: token }),
      clearRole: () => set({ role: null }),
      finishOnBoard: () => set({ newUser: false})
    }),
    {
      name: 'auth-storage', // storage key
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
