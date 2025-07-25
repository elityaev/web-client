import { create } from 'zustand';
import { RemoteParticipant, RemoteTrack, RemoteTrackPublication } from 'livekit-client';
import { LiveKitService } from '../services/liveKitService';
import { ApiService } from '../services/apiService';
import { ConnectionState } from '../types';

interface LiveKitState {
  liveKitService: LiveKitService;
  connectionState: ConnectionState;
  room: any; // Добавляем room для доступа извне
  isConnected: boolean; // Добавляем простой флаг подключения
  localAudioEnabled: boolean;
  localVideoEnabled: boolean;
  remoteParticipants: Map<string, RemoteParticipant>;
  messages: Array<{ id: string; text: string; sender: string; timestamp: Date; isLocal: boolean }>;
  
  // Actions
  connect: (roomName?: string, withOnboarding?: boolean) => Promise<void>;
  disconnect: () => Promise<void>;
  toggleAudio: () => Promise<void>;
  toggleVideo: () => Promise<void>;
  sendMessage: (message: string) => Promise<void>;
  attachTrackToElement: (track: RemoteTrack, elementId: string) => void;
  detachTrackFromElement: (track: RemoteTrack) => void;
}

export const useLiveKitStore = create<LiveKitState>((set, get) => {
  const liveKitService = new LiveKitService();
  
  // Переменная для хранения текущего room
  let currentRoom: any = null;

  // Настройка колбэков
  liveKitService.setOnConnectionStateChanged((state) => {
    set((prev) => ({
      connectionState: {
        ...prev.connectionState,
        status: state,
        participantCount: liveKitService.participantCount,
        roomName: liveKitService.roomName,
      },
    }));
  });

  liveKitService.setOnTrackSubscribed((track, publication, participant) => {
    console.log('Track subscribed:', track.kind, participant.identity);
    
    if (track.kind === 'video') {
      // Автоматически прикрепляем видео к элементу
      const videoElement = document.getElementById('remote-video') as HTMLVideoElement;
      if (videoElement) {
        track.attach(videoElement);
      }
    } else if (track.kind === 'audio') {
      // Автоматически прикрепляем аудио к элементу
      const audioElement = document.getElementById('remote-audio') as HTMLAudioElement;
      if (audioElement) {
        track.attach(audioElement);
      }
    }
  });

  liveKitService.setOnTrackUnsubscribed((track, publication, participant) => {
    console.log('Track unsubscribed:', track.kind, participant.identity);
    track.detach();
  });

  liveKitService.setOnParticipantConnected((participant) => {
    console.log('Participant connected:', participant.identity);
    set((state) => ({
      connectionState: {
        ...state.connectionState,
        participantCount: liveKitService.participantCount,
      },
    }));
  });

  liveKitService.setOnParticipantDisconnected((participant) => {
    console.log('Participant disconnected:', participant.identity);
    set((state) => ({
      connectionState: {
        ...state.connectionState,
        participantCount: liveKitService.participantCount,
      },
    }));
  });

  liveKitService.setOnDataReceived((payload, participant) => {
    const decoder = new TextDecoder();
    const text = decoder.decode(payload);
    
    try {
      const data = JSON.parse(text);
      if (data.type === 'message') {
        set((state) => ({
          messages: [
            ...state.messages,
            {
              id: Date.now().toString(),
              text: data.content,
              sender: participant?.identity || 'Agent',
              timestamp: new Date(),
              isLocal: false,
            },
          ],
        }));
      }
    } catch (error) {
      // Если не JSON, считаем обычным текстом
      set((state) => ({
        messages: [
          ...state.messages,
          {
            id: Date.now().toString(),
            text,
            sender: participant?.identity || 'Agent',
            timestamp: new Date(),
            isLocal: false,
          },
        ],
      }));
    }
  });

  return {
    liveKitService,
    room: currentRoom, // Предоставляем доступ к room
    isConnected: false, // Инициализируем как отключенный
    connectionState: {
      status: 'disconnected',
      participantCount: 0,
    },
    localAudioEnabled: false,
    localVideoEnabled: false,
    remoteParticipants: new Map(),
    messages: [],

    connect: async (roomName: string = 'assistant-room', withOnboarding: boolean = false) => {
      try {
        // Получаем токен через API сервис
        const tokenRequest = {
          language: 'ru-RU',
          platform: 'android',
          app_version: '1.0.0',
          onboarding_done: !withOnboarding, // Если нужен онбординг, то onboarding_done = false
        };

        const token = await ApiService.getLiveKitToken(tokenRequest);
        
        await liveKitService.connect(token);
        // Сохраняем room для доступа извне  
        currentRoom = liveKitService.currentRoom;
        set({ 
          room: currentRoom,
          isConnected: true // Обновляем статус подключения
        });
        
        // Включаем микрофон после подключения
        await liveKitService.setMicrophoneEnabled(true);
        set({ localAudioEnabled: true });
      } catch (error) {
        console.error('Failed to connect:', error);
        set((state) => ({
          connectionState: {
            ...state.connectionState,
            status: 'error',
            error: (error as Error).message,
          },
        }));
      }
    },

    disconnect: async () => {
      try {
        await liveKitService.disconnect();
        currentRoom = null;
        set({
          room: null,
          isConnected: false, // Обновляем статус подключения
          localAudioEnabled: false,
          localVideoEnabled: false,
          messages: [],
        });
        console.log('Successfully disconnected from LiveKit room');
      } catch (error) {
        console.error('Error during disconnect:', error);
        // Все равно сбрасываем состояние при ошибке
        currentRoom = null;
        set({
          room: null,
          isConnected: false,
          localAudioEnabled: false,
          localVideoEnabled: false,
          messages: [],
        });
      }
    },

    toggleAudio: async () => {
      const { localAudioEnabled } = get();
      const newState = !localAudioEnabled;
      await liveKitService.setMicrophoneEnabled(newState);
      set({ localAudioEnabled: newState });
    },

    toggleVideo: async () => {
      const { localVideoEnabled } = get();
      const newState = !localVideoEnabled;
      await liveKitService.setCameraEnabled(newState);
      set({ localVideoEnabled: newState });
    },

    sendMessage: async (message: string) => {
      try {
        const messageData = {
          type: 'message',
          content: message,
          timestamp: new Date().toISOString(),
        };
        
        await liveKitService.sendData(JSON.stringify(messageData));
        
        // Добавляем сообщение в локальный список
        set((state) => ({
          messages: [
            ...state.messages,
            {
              id: Date.now().toString(),
              text: message,
              sender: 'You',
              timestamp: new Date(),
              isLocal: true,
            },
          ],
        }));
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    },

    attachTrackToElement: (track: RemoteTrack, elementId: string) => {
      const element = document.getElementById(elementId) as HTMLMediaElement;
      if (element) {
        track.attach(element);
      }
    },

    detachTrackFromElement: (track: RemoteTrack) => {
      track.detach();
    },
  };
}); 