import { create } from 'zustand';
import { Room } from 'livekit-client';
import { OnboardingService, OnboardingScreenData } from '../services/onboardingService';

interface OnboardingStore {
  isOnboardingActive: boolean;
  currentScreen: OnboardingScreenData | null;
  isLoading: boolean;
  error: string | null;
  onboardingService: OnboardingService;
  receivedRpcCommands: Array<{ method: string; data: any; timestamp: Date }>;
  sentRpcCommands: Array<{ method: string; data: any; timestamp: Date; success: boolean; error?: string }>;

  // Permissions state
  permissions: {
    microphone: boolean;
    location: boolean;
    push: boolean;
  };

  // Avatar state
  avatarState: {
    isListening: boolean;
    currentState: string | null;
  };

  // Actions
  initializeWithRoom: (room: Room) => void;
  handleRpcMethod: (method: string, data?: any) => Promise<void>;
  setCurrentScreen: (screen: OnboardingScreenData | null) => void;
  setError: (error: string | null) => void;
  addReceivedRpcCommand: (method: string, data: any) => void;
  addSentRpcCommand: (method: string, data: any, success: boolean, error?: string) => void;
  setPermission: (permission: 'microphone' | 'location' | 'push', value: boolean) => void;
  sendPermissionsResponse: () => Promise<void>;
  setAvatarState: (state: string) => void;
  clearAvatarState: () => void;
}

export const useOnboardingStore = create<OnboardingStore>((set, get) => ({
  isOnboardingActive: false,
  currentScreen: null,
  isLoading: false,
  error: null,
  onboardingService: new OnboardingService(),
  receivedRpcCommands: [],
  sentRpcCommands: [],

  permissions: {
    microphone: false,
    location: false,
    push: false,
  },

  avatarState: {
    isListening: false,
    currentState: null,
  },

  initializeWithRoom: (room: Room) => {
    const { onboardingService, permissions } = get();
    onboardingService.setRoom(room);
    onboardingService.setPermissions(permissions); // Устанавливаем текущие permissions
    onboardingService.setOnScreenUpdate((screen) => {
      set({ currentScreen: screen });
    });
    onboardingService.setOnRpcCommand((command) => {
      get().addReceivedRpcCommand(command.method, command.command_data);
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

  addReceivedRpcCommand: (method: string, data: any) => {
    set((state) => ({
      receivedRpcCommands: [...state.receivedRpcCommands, {
        method,
        data,
        timestamp: new Date()
      }]
    }));

    // Обработка специальных RPC команд
    if (method === 'set-avatar-state' && data?.input) {
      get().setAvatarState(data.input);
    }
  },

  addSentRpcCommand: (method: string, data: any, success: boolean, error?: string) => {
    set((state) => ({
      sentRpcCommands: [...state.sentRpcCommands, {
        method,
        data,
        success,
        error,
        timestamp: new Date()
      }]
    }));
  },

  setPermission: (permission: 'microphone' | 'location' | 'push', value: boolean) => {
    set((state) => {
      const newPermissions = {
        ...state.permissions,
        [permission]: value
      };

      // Обновляем permissions в onboardingService
      state.onboardingService.setPermissions(newPermissions);

      return {
        permissions: newPermissions
      };
    });
  },

  sendPermissionsResponse: async () => {
    const { onboardingService, permissions } = get();
    try {
      await onboardingService.sendRpcMethod('permission-result', permissions);
      console.log('✅ Permissions response sent:', permissions);
    } catch (error) {
      console.error('❌ Failed to send permissions response:', error);
      set({ error: (error as Error).message });
    }
  },

  setAvatarState: (state: string) => {
    console.log('👤 Setting avatar state:', state);
    set((prev) => ({
      avatarState: {
        isListening: state === 'Listen',
        currentState: state,
      },
    }));
  },

  clearAvatarState: () => {
    console.log('👤 Clearing avatar state');
    set((prev) => ({
      avatarState: {
        isListening: false,
        currentState: null,
      },
    }));
  },
}));
