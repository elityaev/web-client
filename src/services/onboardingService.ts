import { Room } from 'livekit-client';
import { useAuthStore } from '../stores/authStore';

interface RpcAction {
  name: string;
  payload?: string;
}

interface Permission {
  type: string;
  title: string;
  subtitle: string;
  icon_url: string;
  rpc_on_allow?: RpcAction;
  rpc_on_deny?: RpcAction;
}

interface Button {
  text: string;
  rpc_on_click?: RpcAction;
}

interface RequestPermissionsData {
  text: string;
  permissions: Permission[];
  buttons: Button[];
}

// Legacy interface for backward compatibility
interface PermissionButton {
  text: string;
  rpc_on_click: string;
}

interface PermissionRequestData {
  text: string;
  buttons: PermissionButton[];
  rpc_on_deny: string;
}

interface NavigatorData {
  waypoints: Array<{
    name: string;
    location: {
      lat: number;
      lng: number;
    };
  }>;
  from_current_location: boolean;
}

export interface OnboardingScreenData {
  screen_type: string;
  use_microphone: boolean;
  data?: PermissionRequestData | RequestPermissionsData | AddWaypointData | PaywallData | MainScreenData | NavigatorData | MapRouteConfirmData;
  analytics?: any;
}

export interface RpcCommand {
  method: string;
  command_data?: any;
}

interface LocationInfo {
  icon_url: string;
  text: string;
}

interface Location {
  lat: number;
  lng: number;
}

interface WaypointResult {
  id: string;
  number: number;
  label: string;
  title: string;
  subtitle: string;
  info: LocationInfo[];
  phone: string;
  waypoint_number: number;
  location: Location;
  selected: boolean;
  extended: boolean;
  rpc_on_card_click?: RpcAction;
  rpc_on_pin_click?: RpcAction;
  rpc_on_go_click?: RpcAction;
}

interface AddWaypointData {
  results: WaypointResult[];
  final_points: WaypointResult[];
  user_location: Location;
  rpc_on_map_interaction?: RpcAction;
}

export interface PaywallData {
  placement: string;
  rpc_on_purchase?: RpcAction;
  rpc_on_skip?: RpcAction;
}

export interface MainScreenData {
  text: string;
  buttons: Array<{
    text: string;
    icon_url?: string;
    rpc_on_click: {
      name: string;
      payload?: any;
    };
  }>;
}

export interface MapRouteConfirmData {
  waypoints: Array<{
    label: string;
    name: string;
    location: {
      lat: number;
      lng: number;
    };
  }>;
  user_location: {
    lat: number;
    lng: number;
  };
  rpc_on_change_click: {
    name: string;
    payload?: any;
  };
  rpc_on_go_click: {
    name: string;
    payload?: any;
  };
}

// Export new types
export type { RpcAction, Permission, Button, RequestPermissionsData, WaypointResult, AddWaypointData, LocationInfo, Location, NavigatorData };

export class OnboardingService {
  private room: Room | null = null;
  private onScreenUpdate?: (screenData: OnboardingScreenData) => void;
  private onRpcCommand?: (command: RpcCommand) => void;
  private permissions: { microphone: boolean; location: boolean; push: boolean } = {
    microphone: false,
    location: false,
    push: false
  };

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

  setPermissions(permissions: { microphone: boolean; location: boolean; push: boolean }) {
    console.log('🔧 Setting permissions:', permissions);
    console.log('🔧 Previous permissions:', this.permissions);
    this.permissions = permissions;
    console.log('🔧 New permissions set:', this.permissions);
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

    // RPC метод get-premium
    this.room.localParticipant.registerRpcMethod('get-premium', async (data) => {
      try {
        console.log('🎯 Received get-premium RPC from agent:', data);

        // Получаем текущее состояние premium из authStore
        const currentPremium = useAuthStore.getState().premium;
        console.log('🔍 Current premium status:', currentPremium);

        // Показываем уведомление о получении запроса
        if (this.onRpcCommand) {
          this.onRpcCommand({
            method: 'get-premium',
            command_data: data
          });
        }

        // Возвращаем payload с текущим статусом premium
        const response = { premium: currentPremium };
        console.log('📤 Sending premium response:', response);

        return JSON.stringify(response);
      } catch (error) {
        console.error('❌ Error handling get-premium RPC:', error);
        return JSON.stringify({ premium: false, error: (error as Error).message });
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

    // Регистрируем RPC метод get-permissions для тестирования
    this.room.localParticipant.registerRpcMethod('get-permissions', async (data) => {
      try {
        console.log('🎯 Received get-permissions RPC from agent:', data);
        console.log('🔍 Current permissions state:', this.permissions);

        // Показываем уведомление о получении запроса
        if (this.onRpcCommand) {
          this.onRpcCommand({
            method: 'get-permissions',
            command_data: data
          });
        }

        // Проверяем есть ли хотя бы одно разрешение
        const hasAnyPermission = Object.values(this.permissions).some(p => p === true);
        console.log('🔍 Has any permission granted:', hasAnyPermission);

        // Создаем несколько форматов ответа для тестирования
        const defaultFormat = this.permissions;
        const arrayFormat = Object.entries(this.permissions)
          .filter(([_, granted]) => granted)
          .map(([permission, _]) => permission);
        const compactFormat = hasAnyPermission ? this.permissions : null;

        console.log('📤 Default format:', defaultFormat);
        console.log('📤 Array format (only granted):', arrayFormat);
        console.log('📤 Compact format (null if no permissions):', compactFormat);

        // Возвращаем основной формат
        const response = JSON.stringify(defaultFormat);
        console.log('📤 Sending permissions response:', response);
        console.log('📤 Response type:', typeof response);
        console.log('📤 Response length:', response.length);

        // Если нет разрешений, возможно агент ожидает null или другой формат
        if (!hasAnyPermission) {
          console.log('⚠️ No permissions granted, agent might interpret this as None');
          console.log('💡 Alternative formats to try:');
          console.log('   - Array format:', JSON.stringify(arrayFormat));
          console.log('   - Null format:', JSON.stringify(compactFormat));
          console.log('   - Empty object:', JSON.stringify({}));
        }

        return response;
      } catch (error) {
        console.error('❌ Error handling get-permissions RPC:', error);
        const errorResponse = JSON.stringify({ success: false, error: (error as Error).message });
        console.log('📤 Sending error response:', errorResponse);
        return errorResponse;
      }
    });

    // Регистрируем RPC метод get-location
    this.room.localParticipant.registerRpcMethod('get-location', async (data) => {
      try {
        console.log('🎯 Received get-location RPC from agent:', data);

        // Показываем уведомление о получении запроса
        if (this.onRpcCommand) {
          this.onRpcCommand({
            method: 'get-location',
            command_data: data
          });
        }

        // Возвращаем фиксированные координаты
        // const locationResponse = {
        //   lat: 40.77784899,
        //   lng: -74.146540831
        // };

        const locationResponse = {
          lat: 34.07044502254812,
          lng: -118.40208915222966
        };

        console.log('📍 Sending location response:', locationResponse);
        return JSON.stringify(locationResponse);
      } catch (error) {
        console.error('❌ Error handling get-location RPC:', error);
        return JSON.stringify({ success: false, error: (error as Error).message });
      }
    });

    // Регистрируем RPC метод open-navigator
    this.room.localParticipant.registerRpcMethod('open-navigator', async (data) => {
      try {
        console.log('🎯 Received open-navigator RPC from agent:', data);

        // Парсим payload если он в виде строки
        let payload;
        if (typeof data.payload === 'string') {
          payload = JSON.parse(data.payload);
        } else {
          payload = data.payload || data;
        }

        console.log('🧭 Parsed navigator payload:', payload);

        // Показываем уведомление о получении запроса
        if (this.onRpcCommand) {
          this.onRpcCommand({
            method: 'open-navigator',
            command_data: payload
          });
        }

        // Показываем экран навигатора с данными маршрута
        if (this.onScreenUpdate) {
          this.onScreenUpdate({
            screen_type: 'navigator',
            use_microphone: false,
            data: payload
          });
        }

        console.log('🧭 Opening navigation screen with route data');
        return JSON.stringify({ success: true, message: 'Navigation opened' });
      } catch (error) {
        console.error('❌ Error handling open-navigator RPC:', error);
        return JSON.stringify({ success: false, error: (error as Error).message });
      }
    });

    // Регистрируем RPC метод set-avatar-state для управления состоянием аватара
    this.room.localParticipant.registerRpcMethod('set-avatar-state', async (data) => {
      try {
        console.log('🎯 Received set-avatar-state RPC from agent:', data);

        // Парсим payload если он в виде строки
        let payload;
        if (typeof data.payload === 'string') {
          payload = JSON.parse(data.payload);
        } else {
          payload = data.payload || data;
        }

        console.log('👤 Parsed avatar state payload:', payload);

        // Показываем уведомление о получении запроса
        if (this.onRpcCommand) {
          this.onRpcCommand({
            method: 'set-avatar-state',
            command_data: payload
          });
        }

        console.log('👤 Avatar state updated:', payload);
        return JSON.stringify({ success: true, message: 'Avatar state updated' });
      } catch (error) {
        console.error('❌ Error handling set-avatar-state RPC:', error);
        return JSON.stringify({ success: false, error: (error as Error).message });
      }
    });

    console.log('🔧 RPC methods registered successfully');

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
          console.log('🎯 Processing RPC command:', data);
          this.onRpcCommand?.({
            method: data.method,
            command_data: data.payload
          });
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
      console.log(`🚀 Sending RPC method: ${method}`, data);
      console.log(`📡 Room participants:`, Array.from(this.room.remoteParticipants.keys()));

      // Найдем агента среди участников
      const agentParticipant = Array.from(this.room.remoteParticipants.values())
        .find(p => p.identity.includes('agent') || p.identity.includes('assistant'));

      const destinationIdentity = agentParticipant?.identity || '';

      console.log(`🎯 Sending to destination: "${destinationIdentity}"`);

      // Если data уже строка JSON, используем её как есть, иначе сериализуем
      const payload = typeof data === 'string' ? data : JSON.stringify(data);
      console.log(`📤 Final payload being sent:`, payload);

      const result = await this.room.localParticipant.performRpc({
        destinationIdentity: destinationIdentity,
        method: method,
        payload: payload,
      });

      console.log(`✅ RPC method ${method} sent successfully, response:`, result);
    } catch (error) {
      console.error(`❌ Failed to send RPC method ${method}:`, error);

      // Попробуем отправить через DataChannel как fallback
      console.log(`🔄 Trying to send via DataChannel as fallback...`);
      try {
        const encoder = new TextEncoder();
        // Аналогично для DataChannel
        const rpcPayload = typeof data === 'string' ? data : JSON.stringify(data);
        const fallbackData = encoder.encode(JSON.stringify({
          type: 'rpc_request',
          method: method,
          data: rpcPayload
        }));

        await this.room.localParticipant.publishData(fallbackData, { reliable: true });
        console.log(`✅ Sent via DataChannel successfully`);
      } catch (fallbackError) {
        console.error(`❌ DataChannel fallback also failed:`, fallbackError);
        throw error;
      }
    }
  }
}
