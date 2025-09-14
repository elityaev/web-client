import { create } from 'zustand';
import { Room } from 'livekit-client';
import { OnboardingService, OnboardingScreenData, RequestPermissionData } from '../services/onboardingService';

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
    apple_music: boolean;
  };

  // Platform setting for token request
  platform: 'ios' | 'android';

  // Apple Music subscription state
  appleMusicSubscriptionActive: boolean;

  // Current playing track state
  currentTrack: {
    song: string | null;
    album: string | null;
    artist: string | null;
  };

  // Avatar state
  avatarState: {
    isListening: boolean;
    currentState: string | null;
  };

  // Music control state
  lastMusicCommand: {
    command: string | null;
    app: string | null;
    timestamp: Date | null;
  };

  // RPC error simulation
  simulateLocationTimeout: boolean;
  isLocationTimeoutActive: boolean;

  // Permission popup state
  permissionPopupData: RequestPermissionData | null;

  // Actions
  initializeWithRoom: (room: Room) => void;
  handleRpcMethod: (method: string, data?: any) => Promise<void>;
  setCurrentScreen: (screen: OnboardingScreenData | null) => void;
  setError: (error: string | null) => void;
  addReceivedRpcCommand: (method: string, data: any) => void;
  addSentRpcCommand: (method: string, data: any, success: boolean, error?: string) => void;
  setPermission: (permission: 'microphone' | 'location' | 'push' | 'apple_music', value: boolean) => void;
  sendPermissionsResponse: () => Promise<void>;
  setPlatform: (platform: 'ios' | 'android') => void;
  setAppleMusicSubscriptionActive: (active: boolean) => void;
  setCurrentTrack: (track: { song: string | null; album: string | null; artist: string | null }) => void;
  setAvatarState: (state: string) => void;
  clearAvatarState: () => void;
  setLastMusicCommand: (command: string, app?: string) => void;
  setSimulateLocationTimeout: (value: boolean) => void;
  setLocationTimeoutActive: (value: boolean) => void;
  setPermissionPopupData: (data: RequestPermissionData | null) => void;
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
    microphone: true,
    location: true,
    push: true,
    apple_music: true,
  },

  platform: 'ios',

  appleMusicSubscriptionActive: true,

  currentTrack: {
    song: "Enter Sandman",
    album: "Metallica",
    artist: "Metallica"
  },

  avatarState: {
    isListening: false,
    currentState: null,
  },

  lastMusicCommand: {
    command: null,
    app: null,
    timestamp: null,
  },

  simulateLocationTimeout: false,
  isLocationTimeoutActive: false,

  permissionPopupData: null,

  initializeWithRoom: (room: Room) => {
    const { onboardingService, permissions, simulateLocationTimeout } = get();
    onboardingService.setRoom(room);
    onboardingService.setPermissions(permissions); // Устанавливаем текущие permissions
    onboardingService.setSimulateLocationTimeout(simulateLocationTimeout); // Устанавливаем настройку симуляции timeout
    onboardingService.setLocationTimeoutActiveCallback((value) => {
      set({ isLocationTimeoutActive: value });
    });
    onboardingService.setOnScreenUpdate((screen) => {
      set({ currentScreen: screen });
    });
    onboardingService.setOnRpcCommand((command) => {
      get().addReceivedRpcCommand(command.method, command.command_data);
    });
    onboardingService.setOnRequestPermissionPopup((data) => {
      console.log('🔐 Store received permission popup data:', data);
      set({ permissionPopupData: data });
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
    set((state) => {
      const newCommand = {
        method,
        data,
        timestamp: new Date()
      };
      // Оставляем только последнюю команду
      const updatedCommands = [...state.receivedRpcCommands, newCommand].slice(-1);
      return {
        receivedRpcCommands: updatedCommands
      };
    });

    // Обработка специальных RPC команд
    if (method === 'set-avatar-state' && data?.input) {
      get().setAvatarState(data.input);
    }
  },

  addSentRpcCommand: (method: string, data: any, success: boolean, error?: string) => {
    set((state) => {
      const newCommand = {
        method,
        data,
        success,
        error,
        timestamp: new Date()
      };
      // Оставляем только последнюю команду
      const updatedCommands = [...state.sentRpcCommands, newCommand].slice(-1);
      return {
        sentRpcCommands: updatedCommands
      };
    });
  },

  setPermission: (permission: 'microphone' | 'location' | 'push' | 'apple_music', value: boolean) => {
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

  setPlatform: (platform: 'ios' | 'android') => {
    console.log('🔧 Setting platform:', platform);
    set({ platform });
  },

  setAppleMusicSubscriptionActive: (active: boolean) => {
    console.log('🎵 Setting Apple Music subscription active:', active);
    set({ appleMusicSubscriptionActive: active });
  },

  setCurrentTrack: (track: { song: string | null; album: string | null; artist: string | null }) => {
    console.log('🎵 Setting current track:', track);
    set({ currentTrack: track });
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

  setLastMusicCommand: (command: string, app?: string) => {
    console.log('🎵 Setting last music command:', command, app ? `(app: ${app})` : '');
    set({
      lastMusicCommand: {
        command,
        app: app || null,
        timestamp: new Date(),
      },
    });
  },

  setSimulateLocationTimeout: (value: boolean) => {
    console.log('📍 Setting simulate location timeout:', value);
    const { onboardingService } = get();
    onboardingService.setSimulateLocationTimeout(value);
    set({ simulateLocationTimeout: value });
  },

  setLocationTimeoutActive: (value: boolean) => {
    console.log('📍 Setting location timeout active:', value);
    set({ isLocationTimeoutActive: value });
  },

  setPermissionPopupData: (data: RequestPermissionData | null) => {
    console.log('🔐 Setting permission popup data:', data);
    set({ permissionPopupData: data });
  },
}));
