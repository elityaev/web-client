import { create } from 'zustand';
import { OnboardingService, OnboardingScreenData, RpcCommand } from '../services/onboardingService';

interface OnboardingState {
  // Состояние
  isOnboardingActive: boolean;
  currentScreen: OnboardingScreenData | null;
  isLoading: boolean;
  error: string | null;
  
  // Сервис
  onboardingService: OnboardingService;
  
  // Действия
  startOnboarding: () => Promise<void>;
  stopOnboarding: () => void;
  handleScreenUpdate: (screenData: OnboardingScreenData) => void;
  handleRpcCommand: (command: RpcCommand) => void;
  clearError: () => void;
  initializeWithRoom: (room: any) => void;
  
  // RPC методы для взаимодействия с агентом
  sendPermissionResult: (permissionType: string, granted: boolean) => Promise<void>;
  sendLocationAllowClick: () => Promise<void>;
  sendLocationLaterClick: () => Promise<void>;
  sendPlaceContinueClick: () => Promise<void>;
  sendSuccessfulPurchase: () => Promise<void>;
  sendPurchaseSkip: () => Promise<void>;
  sendPushAllowClick: () => Promise<void>;
  sendPushLaterClick: () => Promise<void>;
  sendMusicInfoPassed: () => Promise<void>;
  sendCallsInfoPassed: () => Promise<void>;
  sendDefaultAssistantOpenClick: () => Promise<void>;
  sendDefaultAssistantSetupComplete: () => Promise<void>;
  sendDefaultAssistantLaterClick: () => Promise<void>;
}

export const useOnboardingStore = create<OnboardingState>((set, get) => {
  const onboardingService = new OnboardingService();
  
  // Настраиваем колбэки сервиса
  onboardingService.setOnScreenUpdate((screenData) => {
    get().handleScreenUpdate(screenData);
  });
  
  onboardingService.setOnRpcCommand((command) => {
    get().handleRpcCommand(command);
  });

  return {
    // Начальное состояние
    isOnboardingActive: false,
    currentScreen: null,
    isLoading: false,
    error: null,
    onboardingService,

    // Действия
    startOnboarding: async () => {
      set({ isLoading: true, error: null });
      
      try {
        await onboardingService.startOnboarding();
        set({ 
          isOnboardingActive: true, 
          isLoading: false 
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to start onboarding';
        set({ 
          isLoading: false, 
          error: errorMessage,
          isOnboardingActive: false 
        });
      }
    },

    stopOnboarding: () => {
      set({ 
        isOnboardingActive: false, 
        currentScreen: null,
        error: null 
      });
    },

    handleScreenUpdate: (screenData: OnboardingScreenData) => {
      console.log('🔄 Screen update received in store:', screenData);
      
      // Формируем правильную структуру данных экрана
      const processedScreenData: OnboardingScreenData = {
        screen_type: screenData.screen_type || 'bot_with_text',
        use_microphone: screenData.use_microphone || false,
        data: screenData.data || screenData, // Если data отсутствует, используем весь объект
        analytics: screenData.analytics
      };
      
      console.log('✨ Processed screen data:', processedScreenData);
      
      set({ 
        currentScreen: processedScreenData,
        isOnboardingActive: true // Активируем онбординг при получении экрана
      });
      
      console.log('💾 Screen data saved to store, onboarding activated');
    },

    handleRpcCommand: (command: RpcCommand) => {
      console.log('RPC command:', command);
      
      // Здесь можно обрабатывать команды от агента
      // Например, запросы разрешений, показ UI элементов и т.д.
      if (command.method === 'request-permission') {
        // Имитируем запрос разрешений
        const permissionType = command.command_data?.permission_type;
        console.log(`Request permission: ${permissionType}`);
        
        // В реальном приложении здесь был бы реальный запрос разрешений
        // Для демо-целей просто автоматически даем разрешение через 1 секунду
        setTimeout(() => {
          get().sendPermissionResult(permissionType, true);
        }, 1000);
      }
    },

    clearError: () => {
      set({ error: null });
    },

    // Новый метод для инициализации с room
    initializeWithRoom: (room: any) => {
      if (room) {
        onboardingService.setRoom(room);
        // Онбординг будет запускаться агентом автоматически при подключении с onboarding_done: false
        console.log('Onboarding service initialized with room, waiting for agent to start onboarding...');
      }
    },

    // RPC методы
    sendPermissionResult: async (permissionType: string, granted: boolean) => {
      try {
        await onboardingService.sendPermissionResult(permissionType, granted);
      } catch (error) {
        console.error('Failed to send permission result:', error);
      }
    },

    sendLocationAllowClick: async () => {
      try {
        await onboardingService.sendLocationAllowClick();
      } catch (error) {
        console.error('Failed to send location allow click:', error);
      }
    },

    sendLocationLaterClick: async () => {
      try {
        await onboardingService.sendLocationLaterClick();
      } catch (error) {
        console.error('Failed to send location later click:', error);
      }
    },

    sendPlaceContinueClick: async () => {
      try {
        await onboardingService.sendPlaceContinueClick();
      } catch (error) {
        console.error('Failed to send place continue click:', error);
      }
    },

    sendSuccessfulPurchase: async () => {
      try {
        await onboardingService.sendSuccessfulPurchase();
      } catch (error) {
        console.error('Failed to send successful purchase:', error);
      }
    },

    sendPurchaseSkip: async () => {
      try {
        await onboardingService.sendPurchaseSkip();
      } catch (error) {
        console.error('Failed to send purchase skip:', error);
      }
    },

    sendPushAllowClick: async () => {
      try {
        await onboardingService.sendPushAllowClick();
      } catch (error) {
        console.error('Failed to send push allow click:', error);
      }
    },

    sendPushLaterClick: async () => {
      try {
        await onboardingService.sendPushLaterClick();
      } catch (error) {
        console.error('Failed to send push later click:', error);
      }
    },

    sendMusicInfoPassed: async () => {
      try {
        await onboardingService.sendMusicInfoPassed();
      } catch (error) {
        console.error('Failed to send music info passed:', error);
      }
    },

    sendCallsInfoPassed: async () => {
      try {
        await onboardingService.sendCallsInfoPassed();
      } catch (error) {
        console.error('Failed to send calls info passed:', error);
      }
    },

    sendDefaultAssistantOpenClick: async () => {
      try {
        await onboardingService.sendDefaultAssistantOpenClick();
      } catch (error) {
        console.error('Failed to send default assistant open click:', error);
      }
    },

    sendDefaultAssistantSetupComplete: async () => {
      try {
        await onboardingService.sendDefaultAssistantSetupComplete();
      } catch (error) {
        console.error('Failed to send default assistant setup complete:', error);
      }
    },

    sendDefaultAssistantLaterClick: async () => {
      try {
        await onboardingService.sendDefaultAssistantLaterClick();
      } catch (error) {
        console.error('Failed to send default assistant later click:', error);
      }
    },
  };
}); 