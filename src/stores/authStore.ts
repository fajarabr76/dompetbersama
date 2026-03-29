import { create } from 'zustand';
import type { User as FirebaseUser } from 'firebase/auth';
import type { User } from '../types';

interface AuthState {
  currentUser: User | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  partnerInitialBalance: number;
  setUser: (user: User | null, fbUser: FirebaseUser | null) => void;
  setPartnerInitialBalance: (balance: number) => void;
  setLoading: (loading: boolean) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: null,
  firebaseUser: null,
  isAuthenticated: false,
  isLoading: true,
  partnerInitialBalance: 0,
  setUser: (user, fbUser) => set({
    currentUser: user,
    firebaseUser: fbUser,
    isAuthenticated: !!fbUser,
    isLoading: false
  }),
  setPartnerInitialBalance: (balance) => set({ partnerInitialBalance: balance }),
  setLoading: (loading) => set({ isLoading: loading }),
  clearUser: () => set({
    currentUser: null,
    firebaseUser: null,
    isAuthenticated: false,
    isLoading: false
  }),
}));
