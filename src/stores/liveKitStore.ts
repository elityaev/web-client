import { create } from 'zustand';
import { RemoteParticipant, RemoteTrack, RemoteTrackPublication } from 'livekit-client';
import { LiveKitService } from '../services/liveKitService';
import { ApiService } from '../services/apiService';
import { ConnectionState } from '../types';
import { useOnboardingStore } from './onboardingStore';

interface LiveKitState {
  liveKitService: LiveKitService;
  room: any;
  isConnected: boolean;
  isConnecting: boolean;
  connectionState: ConnectionState;
  localAudioEnabled: boolean;
  localVideoEnabled: boolean;
  remoteParticipants: Map<string, any>;
  messages: any[];

  connect: (roomName?: string, withOnboarding?: boolean) => Promise<void>;
  disconnect: () => Promise<void>;
  setMicrophoneEnabled: (enabled: boolean) => Promise<void>;
  setVideoEnabled: (enabled: boolean) => Promise<void>;
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
    console.log('🎵 Track subscribed:', track.kind, 'from', participant.identity);

    if (track.kind === 'video') {
      // Автоматически прикрепляем видео к элементу
      const videoElement = document.getElementById('remote-video') as HTMLVideoElement;
      if (videoElement) {
        track.attach(videoElement);
        console.log('📹 Video track attached to element');
      } else {
        console.warn('⚠️ Video element not found');
      }
    } else if (track.kind === 'audio') {
      // Автоматически прикрепляем аудио к элементу
      const audioElement = document.getElementById('remote-audio') as HTMLAudioElement;
      if (audioElement) {
        track.attach(audioElement);
        console.log('🔊 Audio track attached to element');

        // Убеждаемся что аудио не заглушено
        audioElement.muted = false;
        audioElement.volume = 1.0;

        // Пытаемся запустить воспроизведение
        audioElement.play().catch(e => {
          console.warn('⚠️ Autoplay blocked, user interaction required:', e);
        });
      } else {
        console.warn('⚠️ Audio element not found');
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
    room: currentRoom,
    isConnected: false,
    isConnecting: false,
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
        console.log('🔄 Starting connection process with onboarding:', withOnboarding);
        set({ isConnecting: true });

        // Получаем platform из onboardingStore
        const onboardingStore = useOnboardingStore.getState();
        const tokenRequest = {
          r: "WRvDNvFSNrVOn0wGskCma9ydJ0CYGGt8",
          language: "en-US",
          app_version: "0.0.30",
          platform: onboardingStore.platform
        };

        console.log('🔧 Using platform for token request:', onboardingStore.platform);

        console.log('🎫 Requesting LiveKit token...');
        const token = await ApiService.getLiveKitToken(tokenRequest);
        console.log('✅ LiveKit token received');

        console.log('🔌 Connecting to LiveKit...');
        await liveKitService.connect(token);
        currentRoom = liveKitService.currentRoom;
        console.log('✅ Connected to LiveKit room:', currentRoom);

        // Инициализируем OnboardingStore с room
        if (withOnboarding) {
          console.log('🎯 Initializing OnboardingStore with room');
          const onboardingStore = useOnboardingStore.getState();
          onboardingStore.initializeWithRoom(currentRoom);
          console.log('✅ OnboardingStore initialized');
        }

        set({
          room: currentRoom,
          isConnected: true,
          isConnecting: false
        });

        console.log('🎤 Enabling microphone...');
        await liveKitService.setMicrophoneEnabled(true);
        set({ localAudioEnabled: true });
        console.log('✅ Microphone enabled');
      } catch (error) {
        console.error('❌ Connection failed:', error);
        set((state) => ({
          isConnecting: false,
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
        console.log('🔄 Starting disconnect process...');
        await liveKitService.disconnect();
        currentRoom = null;
        set({
          room: null,
          isConnected: false,
          isConnecting: false,
          connectionState: {
            status: 'disconnected',
            participantCount: 0,
          },
        });
        console.log('✅ Disconnected successfully');
      } catch (error) {
        console.error('❌ Failed to disconnect:', error);
      }
    },

    setMicrophoneEnabled: async (enabled: boolean) => {
      try {
        await liveKitService.setMicrophoneEnabled(enabled);
        set({ localAudioEnabled: enabled });
      } catch (error) {
        console.error('Failed to set microphone state:', error);
      }
    },

    setVideoEnabled: async (enabled: boolean) => {
      try {
        await liveKitService.setCameraEnabled(enabled);
        set({ localVideoEnabled: enabled });
      } catch (error) {
        console.error('Failed to set video state:', error);
      }
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
