import { create } from 'zustand';

interface AuthState {
  user: { id: string; email: string } | null;
  setUser: (u: AuthState['user']) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (u) => set({ user: u }),
  logout: () => set({ user: null }),
}));
