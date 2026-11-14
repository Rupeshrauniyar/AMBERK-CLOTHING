import { create } from 'zustand';
import { fetchApi } from '../services/api';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  isLoading: true,

  setUser: (user) => {
    set({
      user,
      isAuthenticated: !!user,
      isAdmin: user ? ['admin', 'owner', 'staff'].includes(user.role) : false,
      isLoading: false,
    });
  },

  checkAuth: async () => {
    try {
      set({ isLoading: true });
      const user = await fetchApi('/auth/me');
      set({
        user,
        isAuthenticated: true,
        isAdmin: ['admin', 'owner', 'staff'].includes(user.role),
        isLoading: false,
      });
    } catch {
      set({ user: null, isAuthenticated: false, isAdmin: false, isLoading: false });
    }
  },

  logout: async () => {
    try {
      await fetchApi('/auth/logout', { method: 'POST' });
    } catch {
      // Ignored
    }
    set({ user: null, isAuthenticated: false, isAdmin: false });
  },
}));

