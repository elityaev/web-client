import { Room } from 'livekit-client';

interface PermissionButton {
  text: string;
  rpc_on_click: string;
}

interface PermissionRequestData {
  text: string;
  buttons: PermissionButton[];
  rpc_on_deny: string;
}

export interface OnboardingScreenData {
  screen_type: string;
  use_microphone: boolean;
  data?: PermissionRequestData;
  analytics?: any;
}

export interface RpcCommand {
  method: string;
  command_data?: any;
}

export class OnboardingService {
  private room: Room | null = null;
  private onScreenUpdate?: (screenData: OnboardingScreenData) => void;
  private onRpcCommand?: (command: RpcCommand) => void;

  setRoom(room: Room) {
    console.log('🔄 Setting room in OnboardingService:', room);
    this.room = room;
    this.setupEventHandlers();
  }

  setOnScreenUpdate(callback: (screenData: OnboardingScreenData) => void) {
    console.log('🎯 Setting onScreenUpdate callback');
    this.onScreenUpdate = callback;
  }

  setOnRpcCommand(callback: (command: RpcCommand) => void) {
    console.log('🎯 Setting onRpcCommand callback');
    this.onRpcCommand = callback;
  }

  private setupEventHandlers() {
    if (!this.room) {
      console.error('❌ Cannot setup event handlers: room is null');
      return;
    }

    console.log('🔧 Setting up event handlers for room:', this.room);

    // Регистрируем RPC метод show-screen для получения экранов от агента
    this.room.localParticipant.registerRpcMethod('show-screen', async (data) => {
      try {
        console.log('🎯 Received show-screen RPC from agent:', data);

        // Парсим данные от агента
        let screenData;
        if (typeof data.payload === 'string') {
          screenData = JSON.parse(data.payload);
        } else {
          screenData = data.payload;
        }

        console.log('📱 Parsed screen data:', screenData);

        // Передаем данные экрана в колбэк
        if (this.onScreenUpdate) {
          console.log('✅ Calling onScreenUpdate callback with data:', screenData);
          this.onScreenUpdate(screenData);
        } else {
          console.warn('⚠️ onScreenUpdate callback is not set');
        }

        // Возвращаем успешный ответ агенту
        return JSON.stringify({ success: true });
      } catch (error) {
        console.error('❌ Error handling show-screen RPC:', error);
        return JSON.stringify({ success: false, error: (error as Error).message });
      }
    });

    // Новый RPC метод request_permissions
    this.room.localParticipant.registerRpcMethod('request-permissions', async (data) => {
      try {
        let payload;
        if (typeof data.payload === 'string') {
          payload = JSON.parse(data.payload);
        } else {
          payload = data.payload;
        }
        // Передаём в onScreenUpdate экран с типом 'request_permissions'
        this.onScreenUpdate?.({
          screen_type: 'request-permissions',
          use_microphone: false,
          data: payload,
        });
        return JSON.stringify({ success: true });
      } catch (error) {
        return JSON.stringify({ success: false, error: (error as Error).message });
      }
    });

    console.log('🔧 RPC method "show-screen" registered successfully');

    // Обработка входящих данных от агента (для совместимости)
    this.room.on('dataReceived', (payload: Uint8Array) => {
      try {
        const decoder = new TextDecoder();
        const text = decoder.decode(payload);
        const data = JSON.parse(text);

        console.log('📡 Received data from agent:', data);

        // Обработка различных типов сообщений от агента
        if (data.type === 'show_screen') {
          this.onScreenUpdate?.(data);
        } else if (data.type === 'rpc_command') {
          this.onRpcCommand?.(data);
        }
      } catch (error) {
        console.error('❌ Error parsing received data:', error);
      }
    });
  }

  // Метод для запуска онбординга
  async startOnboarding(): Promise<void> {
    if (!this.room?.localParticipant) {
      throw new Error('Room not connected');
    }

    try {
      console.log('Starting onboarding...');

      // Вызываем RPC метод start_onboarding у агента
      await this.room.localParticipant.performRpc({
        destinationIdentity: '', // пустая строка означает, что RPC идет к агенту
        method: 'start_onboarding',
        payload: JSON.stringify({}),
      });

      console.log('Onboarding started successfully');
    } catch (error) {
      console.error('Failed to start onboarding:', error);
      throw error;
    }
  }

  // Отправка результата разрешений
  async sendPermissionResult(permissionType: string, granted: boolean): Promise<void> {
    return this.sendRpcMethod('permission-result', {
      permission_type: permissionType,
      granted: granted
    });
  }

  // Клик "Разрешить доступ к локации"
  async sendLocationAllowClick(): Promise<void> {
    return this.sendRpcMethod('location-allow-click', {});
  }

  // Клик "Настроить позже"
  async sendLocationLaterClick(): Promise<void> {
    return this.sendRpcMethod('location-later-click', {});
  }

  // Клик "Продолжить" с местом
  async sendPlaceContinueClick(): Promise<void> {
    return this.sendRpcMethod('place-continue-click', {});
  }

  // Успешная покупка
  async sendSuccessfulPurchase(): Promise<void> {
    return this.sendRpcMethod('successful-purchase', {});
  }

  // Пропуск покупки
  async sendPurchaseSkip(): Promise<void> {
    return this.sendRpcMethod('purchase-skip', {});
  }

  // Разрешение push уведомлений
  async sendPushAllowClick(): Promise<void> {
    return this.sendRpcMethod('push_allow_click', {});
  }

  // Настроить push позже
  async sendPushLaterClick(): Promise<void> {
    return this.sendRpcMethod('push_later_click', {});
  }

  // Информация о музыке передана
  async sendMusicInfoPassed(): Promise<void> {
    return this.sendRpcMethod('music-info-passed', {});
  }

  // Информация о звонках передана
  async sendCallsInfoPassed(): Promise<void> {
    return this.sendRpcMethod('calls-info-passed', {});
  }

  // Открыть настройки ассистента по умолчанию
  async sendDefaultAssistantOpenClick(): Promise<void> {
    return this.sendRpcMethod('default-assistant-open-click', {});
  }

  // Настройка ассистента по умолчанию завершена
  async sendDefaultAssistantSetupComplete(): Promise<void> {
    return this.sendRpcMethod('default-assistant-setup-complete', {});
  }

  // Настроить ассистента позже
  async sendDefaultAssistantLaterClick(): Promise<void> {
    return this.sendRpcMethod('default-assistant-later-click', {});
  }

  // Новый метод для отправки permission-result с нужным payload
  async sendRequestPermissionsResult(): Promise<void> {
    return this.sendRpcMethod('permission-result', {
      permissions: ["microphone", "location"]
    });
  }

  // Базовый метод для отправки RPC команд
  async sendRpcMethod(method: string, data: any): Promise<void> {
    if (!this.room?.localParticipant) {
      throw new Error('Room not connected');
    }

    try {
      console.log(`Sending RPC method: ${method}`, data);

      await this.room.localParticipant.performRpc({
        destinationIdentity: '', // пустая строка означает, что RPC идет к агенту
        method: method,
        payload: JSON.stringify(data),
      });

      console.log(`RPC method ${method} sent successfully`);
    } catch (error) {
      console.error(`Failed to send RPC method ${method}:`, error);
      throw error;
    }
  }
}
