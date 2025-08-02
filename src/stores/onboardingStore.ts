import { create } from 'zustand';
import { Room } from 'livekit-client';
import { OnboardingService, OnboardingScreenData } from '../services/onboardingService';

interface OnboardingStore {
  isOnboardingActive: boolean;
  currentScreen: OnboardingScreenData | null;
  isLoading: boolean;
  error: string | null;
  onboardingService: OnboardingService;

  // Actions
  initializeWithRoom: (room: Room) => void;
  handleRpcMethod: (method: string, data?: any) => Promise<void>;
  setCurrentScreen: (screen: OnboardingScreenData | null) => void;
  setError: (error: string | null) => void;
}

export const useOnboardingStore = create<OnboardingStore>((set, get) => ({
    isOnboardingActive: false,
    currentScreen: null,
    isLoading: false,
    error: null,
  onboardingService: new OnboardingService(),

  initializeWithRoom: (room: Room) => {
    const { onboardingService } = get();
    onboardingService.setRoom(room);
    onboardingService.setOnScreenUpdate((screen) => {
      set({ currentScreen: screen });
      });
    },

  handleRpcMethod: async (method: string, data?: any) => {
    const { onboardingService } = get();
    try {
      await onboardingService.sendRpcMethod(method, data);
      } catch (error) {
      set({ error: (error as Error).message });
      }
    },

  setCurrentScreen: (screen: OnboardingScreenData | null) => {
    set({ currentScreen: screen });
  },

  setError: (error: string | null) => {
    set({ error });
    },
}));
