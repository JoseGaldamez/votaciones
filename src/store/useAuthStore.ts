import { create } from 'zustand';
import { type User, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

interface AuthState {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  loginWithGoogle: async () => {
    set({ loading: true });
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      set({ loading: false });
      throw error;
    }
  },
  logout: async () => {
    set({ loading: true });
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error logging out:', error);
      set({ loading: false });
      throw error;
    }
  },
}));

// Listen to auth state changes to keep the store synchronized in real-time
auth.onAuthStateChanged((user) => {
  useAuthStore.getState().setUser(user);
  useAuthStore.getState().setLoading(false);
});
