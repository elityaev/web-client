import { create } from 'zustand';
import { FirebaseService } from '../services/firebaseService';

interface AuthState {
  isAuthenticated: boolean;
  firebaseIdToken: string | null;
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  firebaseIdToken: null,
  isReady: false,
  isLoading: false,
  error: null,

  initialize: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const firebaseService = FirebaseService.getInstance();
      const idToken = await firebaseService.getIdToken();
      
      set({
        isAuthenticated: true,
        firebaseIdToken: idToken,
        isReady: true,
        isLoading: false,
        error: null,
      });
      
      console.log('Authentication initialized with Firebase ID token');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown authentication error';
      
      set({
        isAuthenticated: false,
        firebaseIdToken: null,
        isReady: true,
        isLoading: false,
        error: errorMessage,
      });
      
      console.error('Failed to initialize authentication:', error);
    }
  },

  clearError: () => {
    set({ error: null });
  },
})); 