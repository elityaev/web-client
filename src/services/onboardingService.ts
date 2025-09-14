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
  avatar_state?: {
    input: string;
  };
  data?: PermissionRequestData | RequestPermissionsData | AddWaypointData | PaywallData | MainScreenData | NavigatorData | MapRouteConfirmData | ChooseMusicAppData | MusicAppStateData | UniversalScreenData | ChooseContactData | RequestPermissionData;
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

interface MusicApp {
  icon_url: string;
  name: string;
  rpc_on_click: {
    name: string;
    payload: any;
  };
}

export interface ChooseMusicAppData {
  text: string;
  apps: MusicApp[];
}

export interface MusicAppStateData {
  text: string;
  buttons: Array<{
    name: string;
    icon_url?: string;
    rpc_on_click: {
      name: string;
      payload: any;
    };
  }>;
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

export interface UniversalScreenData {
  title: string;
  subtitle?: string;
  image_url: string;
  buttons?: Array<{
    text: string;
    primary: boolean;
    rpc_on_click: RpcAction;
  }>;
}

export interface Contact {
  title: string;
  subtitle: string;
  label: string;
  rpc_on_call_click: {
    name: string;
    payload: string;
  } | null;
}

export interface ChooseContactData {
  text: string;
  contacts: Contact[];
}

// Export new types
// Интерфейс для request-permission payload
interface RequestPermissionData {
  type: string;
  rpc_on_allow?: RpcAction;
  rpc_on_deny?: RpcAction;
}

export type { RpcAction, Permission, Button, RequestPermissionsData, WaypointResult, AddWaypointData, LocationInfo, Location, NavigatorData, RequestPermissionData };

export class OnboardingService {
  private room: Room | null = null;
  private onScreenUpdate?: (screenData: OnboardingScreenData) => void;
  private onRpcCommand?: (command: RpcCommand) => void;
  private onRequestPermissionPopup?: (data: RequestPermissionData) => void;
  private permissions: { microphone: boolean; location: boolean; push: boolean; apple_music: boolean } = {
    microphone: false,
    location: false,
    push: false,
    apple_music: false
  };

  private simulateLocationTimeout = false;

  setRoom(room: Room) {
    console.log('🔄 Setting room in OnboardingService:', room);
    this.room = room;
    this.setupEventHandlers();
  }

  private async createFilteredCurrentItem() {
    // Получаем текущий трек из store
    const { useOnboardingStore } = await import('../stores/onboardingStore');
    const currentTrack = useOnboardingStore.getState().currentTrack;

    // Формируем ответ - включаем только поля с значениями
    const current_item: { [key: string]: string } = {};

    if (currentTrack.song && currentTrack.song.trim() !== '') {
      current_item.song = currentTrack.song;
    }
    if (currentTrack.album && currentTrack.album.trim() !== '') {
      current_item.album = currentTrack.album;
    }
    if (currentTrack.artist && currentTrack.artist.trim() !== '') {
      current_item.artist = currentTrack.artist;
    }

    return current_item;
  }

  setOnScreenUpdate(callback: (screenData: OnboardingScreenData) => void) {
    console.log('🎯 Setting onScreenUpdate callback');
    this.onScreenUpdate = callback;
  }

  setOnRpcCommand(callback: (command: RpcCommand) => void) {
    console.log('🎯 Setting onRpcCommand callback');
    this.onRpcCommand = callback;
  }

  setOnRequestPermissionPopup(callback: (data: RequestPermissionData) => void) {
    console.log('🎯 Setting onRequestPermissionPopup callback');
    this.onRequestPermissionPopup = callback;
  }

  setPermissions(permissions: { microphone: boolean; location: boolean; push: boolean; apple_music: boolean }) {
    console.log('🔧 Setting permissions:', permissions);
    console.log('🔧 Previous permissions:', this.permissions);
    this.permissions = permissions;
    console.log('🔧 New permissions set:', this.permissions);
  }

  setSimulateLocationTimeout(value: boolean) {
    console.log('🔧 Setting simulate location timeout:', value);
    this.simulateLocationTimeout = value;
  }

  private onLocationTimeoutActiveChange?: (value: boolean) => void;

  setLocationTimeoutActiveCallback(callback: (value: boolean) => void) {
    this.onLocationTimeoutActiveChange = callback;
  }

  private setLocationTimeoutActive(value: boolean) {
    if (this.onLocationTimeoutActiveChange) {
      this.onLocationTimeoutActiveChange(value);
    }
  }

  private setupEventHandlers() {
    if (!this.room) {
      console.error('❌ Cannot setup event handlers: room is null');
      return;
    }

    console.log('🔧 Setting up event handlers for room:', this.room);

    // Регистрируем RPC метод show-screen для получения экранов от агента
    const showScreenHandler = async (data: any) => {
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

        // Специальная обработка для choose_music_app - парсим payload в rpc_on_click
        if (screenData.screen_type === 'choose_music_app' && screenData.data?.apps) {
          screenData.data.apps.forEach((app: any) => {
            if (app.rpc_on_click?.payload && typeof app.rpc_on_click.payload === 'string') {
              try {
                app.rpc_on_click.payload = JSON.parse(app.rpc_on_click.payload);
                console.log('🔧 Parsed app payload:', app.rpc_on_click.payload);
              } catch (e) {
                console.warn('⚠️ Could not parse app payload:', app.rpc_on_click.payload);
              }
            }
          });
        }

        // Специальная обработка для music_app_state - парсим payload в rpc_on_click
        if (screenData.screen_type === 'music_app_state' && screenData.data?.buttons) {
          screenData.data.buttons.forEach((button: any) => {
            if (button.rpc_on_click?.payload && typeof button.rpc_on_click.payload === 'string') {
              try {
                button.rpc_on_click.payload = JSON.parse(button.rpc_on_click.payload);
                console.log('🔧 Parsed music_app_state button payload:', button.rpc_on_click.payload);
              } catch (e) {
                console.warn('⚠️ Could not parse music_app_state button payload:', button.rpc_on_click.payload);
              }
            }
          });
        }

        // Специальная обработка для choose_contact - парсим payload в rpc_on_call_click
        if (screenData.screen_type === 'choose_contact' && screenData.data?.contacts) {
          screenData.data.contacts.forEach((contact: any) => {
            if (contact.rpc_on_call_click?.payload && typeof contact.rpc_on_call_click.payload === 'string') {
              try {
                contact.rpc_on_call_click.payload = JSON.parse(contact.rpc_on_call_click.payload);
                console.log('🔧 Parsed contact payload:', contact.rpc_on_call_click.payload);
              } catch (e) {
                console.warn('⚠️ Could not parse contact payload:', contact.rpc_on_call_click.payload);
                // Если парсинг не удался, оставляем payload как есть
              }
            }
          });
        }

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
    };

    // Регистрируем RPC метод show-screen
    this.room.localParticipant.registerRpcMethod('show-screen', showScreenHandler);

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

    // Регистрируем RPC метод get-apple-music-subscription
    this.room.localParticipant.registerRpcMethod('get-apple-music-subscription', async (data) => {
      try {
        console.log('🎯 Received get-apple-music-subscription RPC from agent:', data);

        // Показываем уведомление о получении запроса
        if (this.onRpcCommand) {
          this.onRpcCommand({
            method: 'get-apple-music-subscription',
            command_data: data
          });
        }

        // Получаем текущее состояние Apple Music subscription из store
        const { useOnboardingStore } = await import('../stores/onboardingStore');
        const currentState = useOnboardingStore.getState().appleMusicSubscriptionActive;
        console.log('🔍 Current Apple Music subscription state:', currentState);

        // Возвращаем payload с текущим статусом
        const response = { active: currentState };
        console.log('📤 Sending Apple Music subscription response:', response);

        return JSON.stringify(response);
      } catch (error) {
        console.error('❌ Error handling get-apple-music-subscription RPC:', error);
        return JSON.stringify({ active: false, error: (error as Error).message });
      }
    });

    // Регистрируем RPC метод play-music-with-search
    this.room.localParticipant.registerRpcMethod('play-music-with-search', async (data) => {
      try {
        console.log('🎯 Received play-music-with-search RPC from agent:', data);

        // Парсим payload
        let payload;
        if (typeof data.payload === 'string') {
          payload = JSON.parse(data.payload);
        } else {
          payload = data.payload;
        }

        console.log('🔍 Parsed music search payload:', payload);

        // Валидация - хотя бы одно поле должно быть не null
        const { app, song, album, artist } = payload;
        const hasValidField = app !== null || song !== null || album !== null || artist !== null;

        if (!hasValidField) {
          console.error('❌ Invalid payload: at least one field (app, song, album, artist) must be non-null');
          return JSON.stringify({
            error: "At least one field (app, song, album, artist) must be non-null"
          });
        }

        // Показываем уведомление о получении запроса
        if (this.onRpcCommand) {
          this.onRpcCommand({
            method: 'play-music-with-search',
            command_data: data
          });
        }

        // Получаем отфильтрованную информацию о текущем треке
        const current_item = await this.createFilteredCurrentItem();
        const response = {
          current_item
        };

        console.log('📤 Sending play-music response:', response);
        return JSON.stringify(response);
      } catch (error) {
        console.error('❌ Error handling play-music-with-search RPC:', error);
        return JSON.stringify({
          error: (error as Error).message,
          current_item: {}
        });
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

        // Проверяем, нужно ли симулировать ошибку RESPONSE_TIMEOUT
        if (this.simulateLocationTimeout) {
          console.log('⏰ Simulating RESPONSE_TIMEOUT by delaying response for 15 seconds');
          console.log('⏰ LiveKit should timeout this RPC call before we respond');

          // Устанавливаем флаг активности таймаута
          this.setLocationTimeoutActive(true);

          // Задерживаем ответ на 15 секунд, чтобы LiveKit выдал реальную ошибку таймаута
          const timeoutPromise = new Promise(resolve => setTimeout(resolve, 15000));

          // Показываем прогресс каждые 3 секунды
          const progressInterval = setInterval(() => {
            console.log('⏰ Still waiting for LiveKit timeout...');
          }, 3000);

          try {
            await timeoutPromise;
            clearInterval(progressInterval);
            console.log('⏰ 15 seconds elapsed - this should not be reached due to LiveKit timeout');
          } finally {
            // Снимаем флаг активности таймаута
            this.setLocationTimeoutActive(false);
          }
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

    // Регистрируем RPC методы для управления музыкой
    this.room.localParticipant.registerRpcMethod('next-track', async (data) => {
      try {
        console.log('🎯 Received next-track RPC from agent:', data);

        // Показываем уведомление о получении запроса
        if (this.onRpcCommand) {
          this.onRpcCommand({
            method: 'next-track',
            command_data: data
          });
        }

        // Обновляем состояние последней музыкальной команды
        const { useOnboardingStore } = await import('../stores/onboardingStore');
        useOnboardingStore.getState().setLastMusicCommand('next-track');

        // Получаем отфильтрованную информацию о текущем треке
        const current_item = await this.createFilteredCurrentItem();

        console.log('⏭️ Next track command processed');
        return JSON.stringify({
          success: true,
          message: 'Next track command received',
          current_item
        });
      } catch (error) {
        console.error('❌ Error handling next-track RPC:', error);
        return JSON.stringify({
          success: false,
          error: (error as Error).message,
          current_item: {}
        });
      }
    });

    this.room.localParticipant.registerRpcMethod('previous-track', async (data) => {
      try {
        console.log('🎯 Received previous-track RPC from agent:', data);

        // Показываем уведомление о получении запроса
        if (this.onRpcCommand) {
          this.onRpcCommand({
            method: 'previous-track',
            command_data: data
          });
        }

        // Обновляем состояние последней музыкальной команды
        const { useOnboardingStore } = await import('../stores/onboardingStore');
        useOnboardingStore.getState().setLastMusicCommand('previous-track');

        // Получаем отфильтрованную информацию о текущем треке
        const current_item = await this.createFilteredCurrentItem();

        console.log('⏮️ Previous track command processed');
        return JSON.stringify({
          success: true,
          message: 'Previous track command received',
          current_item
        });
      } catch (error) {
        console.error('❌ Error handling previous-track RPC:', error);
        return JSON.stringify({
          success: false,
          error: (error as Error).message,
          current_item: {}
        });
      }
    });

    this.room.localParticipant.registerRpcMethod('pause-track', async (data) => {
      try {
        console.log('🎯 Received pause-track RPC from agent:', data);

        // Показываем уведомление о получении запроса
        if (this.onRpcCommand) {
          this.onRpcCommand({
            method: 'pause-track',
            command_data: data
          });
        }

        // Обновляем состояние последней музыкальной команды
        const { useOnboardingStore } = await import('../stores/onboardingStore');
        useOnboardingStore.getState().setLastMusicCommand('pause-track');

        // Получаем отфильтрованную информацию о текущем треке
        const current_item = await this.createFilteredCurrentItem();

        console.log('⏸️ Pause track command processed');
        return JSON.stringify({
          success: true,
          message: 'Pause track command received',
          current_item
        });
      } catch (error) {
        console.error('❌ Error handling pause-track RPC:', error);
        return JSON.stringify({
          success: false,
          error: (error as Error).message,
          current_item: {}
        });
      }
    });

    this.room.localParticipant.registerRpcMethod('resume-track', async (data) => {
      try {
        console.log('🎯 Received resume-track RPC from agent:', data);

        // Показываем уведомление о получении запроса
        if (this.onRpcCommand) {
          this.onRpcCommand({
            method: 'resume-track',
            command_data: data
          });
        }

        // Обновляем состояние последней музыкальной команды
        const { useOnboardingStore } = await import('../stores/onboardingStore');
        useOnboardingStore.getState().setLastMusicCommand('resume-track');

        // Получаем отфильтрованную информацию о текущем треке
        const current_item = await this.createFilteredCurrentItem();

        console.log('▶️ Resume track command processed');
        return JSON.stringify({
          success: true,
          message: 'Resume track command received',
          current_item
        });
      } catch (error) {
        console.error('❌ Error handling resume-track RPC:', error);
        return JSON.stringify({
          success: false,
          error: (error as Error).message,
          current_item: {}
        });
      }
    });

    this.room.localParticipant.registerRpcMethod('play-music', async (data) => {
      try {
        console.log('🎯 Received play-music RPC from agent:', data);

        // Показываем уведомление о получении запроса
        if (this.onRpcCommand) {
          this.onRpcCommand({
            method: 'play-music',
            command_data: data
          });
        }

        // Обновляем состояние последней музыкальной команды
        const { useOnboardingStore } = await import('../stores/onboardingStore');
        useOnboardingStore.getState().setLastMusicCommand('play-music');

        // Получаем отфильтрованную информацию о текущем треке
        const current_item = await this.createFilteredCurrentItem();

        console.log('🎵 Play music command processed');
        return JSON.stringify({
          success: true,
          message: 'Play music command received',
          current_item
        });
      } catch (error) {
        console.error('❌ Error handling play-music RPC:', error);
        return JSON.stringify({
          success: false,
          error: (error as Error).message,
          current_item: {}
        });
      }
    });

    this.room.localParticipant.registerRpcMethod('open-music-app', async (data) => {
      try {
        console.log('🎯 Received open-music-app RPC from agent:', data);

        // Парсим payload если он в виде строки
        let payload;
        if (typeof data.payload === 'string') {
          payload = JSON.parse(data.payload);
        } else {
          payload = data.payload || data;
        }

        console.log('🎵 Parsed open-music-app payload:', payload);

        // Показываем уведомление о получении запроса
        if (this.onRpcCommand) {
          this.onRpcCommand({
            method: 'open-music-app',
            command_data: payload
          });
        }

        // Обновляем состояние последней музыкальной команды с названием приложения
        const { useOnboardingStore } = await import('../stores/onboardingStore');
        const appName = payload?.app || 'unknown app';
        useOnboardingStore.getState().setLastMusicCommand('open-music-app', appName);

        console.log('📱 Open music app command processed:', appName);
        return JSON.stringify({ success: true, message: `Open ${appName} command received` });
      } catch (error) {
        console.error('❌ Error handling open-music-app RPC:', error);
        return JSON.stringify({ success: false, error: (error as Error).message });
      }
    });

    // Регистрируем RPC метод request-permission
    this.room.localParticipant.registerRpcMethod('request-permission', async (data) => {
      try {
        console.log('🎯 Received request-permission RPC from agent:', data);

        // Парсим payload
        let payload;
        if (typeof data.payload === 'string') {
          payload = JSON.parse(data.payload);
        } else {
          payload = data.payload;
        }

        console.log('🔍 Parsed request-permission payload:', payload);

        // Показываем уведомление о получении запроса
        if (this.onRpcCommand) {
          this.onRpcCommand({
            method: 'request-permission',
            command_data: payload
          });
        }

        // Показываем попап с запросом разрешения через специальный колбэк
        if (this.onRequestPermissionPopup) {
          console.log('🔐 Calling onRequestPermissionPopup with payload:', payload);
          this.onRequestPermissionPopup(payload);
        } else {
          console.warn('⚠️ onRequestPermissionPopup callback is not set');
        }

        console.log('🔐 Permission request popup shown');
        return JSON.stringify({ success: true });
      } catch (error) {
        console.error('❌ Error handling request-permission RPC:', error);
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
      console.log(`🚀 Data type:`, typeof data);
      console.log(`🚀 Data stringified:`, JSON.stringify(data));
      console.log(`📡 Room participants:`, Array.from(this.room.remoteParticipants.keys()));

      // Найдем агента среди участников
      const agentParticipant = Array.from(this.room.remoteParticipants.values())
        .find(p => p.identity.includes('agent') || p.identity.includes('assistant'));

      const destinationIdentity = agentParticipant?.identity || '';

      console.log(`🎯 Sending to destination: "${destinationIdentity}"`);

      // Если data уже строка JSON, используем её как есть, иначе сериализуем
      const payload = typeof data === 'string' ? data : JSON.stringify(data);
      console.log(`📤 Final payload being sent:`, payload);
      console.log(`📤 Final payload type:`, typeof payload);
      console.log(`📤 Final payload length:`, payload.length);

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
