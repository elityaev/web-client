import {
  Room,
  RoomEvent,
  Track,
  RemoteTrack,
  RemoteTrackPublication,
  RemoteParticipant,
  LocalTrackPublication,
  LocalParticipant,
  createLocalTracks
} from 'livekit-client';

const LIVEKIT_WS_URL = import.meta.env.VITE_LIVEKIT_WS_URL || 'ws://localhost:7880';

export class LiveKitService {
  private room: Room | null = null;
  private onTrackSubscribed?: (track: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) => void;
  private onTrackUnsubscribed?: (track: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) => void;
  private onParticipantConnected?: (participant: RemoteParticipant) => void;
  private onParticipantDisconnected?: (participant: RemoteParticipant) => void;
  private onConnectionStateChanged?: (state: 'connecting' | 'connected' | 'disconnected' | 'reconnecting') => void;
  private onDataReceived?: (payload: Uint8Array, participant?: RemoteParticipant) => void;

  constructor() {
    this.setupRoom();
  }

  private setupRoom() {
    this.room = new Room({
      adaptiveStream: true,
      dynacast: true,
      videoCaptureDefaults: {
        resolution: { width: 1280, height: 720 }
      },
      audioCaptureDefaults: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    if (!this.room) return;

    this.room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
      this.onTrackSubscribed?.(track, publication, participant);
    });

    this.room.on(RoomEvent.TrackUnsubscribed, (track, publication, participant) => {
      this.onTrackUnsubscribed?.(track, publication, participant);
    });

    this.room.on(RoomEvent.ParticipantConnected, (participant) => {
      this.onParticipantConnected?.(participant);
    });

    this.room.on(RoomEvent.ParticipantDisconnected, (participant) => {
      this.onParticipantDisconnected?.(participant);
    });

    this.room.on(RoomEvent.Connected, () => {
      this.onConnectionStateChanged?.('connected');
    });

    this.room.on(RoomEvent.Disconnected, () => {
      this.onConnectionStateChanged?.('disconnected');
    });

    this.room.on(RoomEvent.Reconnecting, () => {
      this.onConnectionStateChanged?.('reconnecting');
    });

    this.room.on(RoomEvent.Reconnected, () => {
      this.onConnectionStateChanged?.('connected');
    });

    this.room.on(RoomEvent.DataReceived, (payload, participant) => {
      this.onDataReceived?.(payload, participant);
    });
  }

  async connect(token: string): Promise<void> {
    if (!this.room) throw new Error('Room not initialized');

    this.onConnectionStateChanged?.('connecting');
    await this.room.connect(LIVEKIT_WS_URL, token);
  }

  async disconnect(): Promise<void> {
    if (this.room) {
      await this.room.disconnect();
    }
  }

  async enableCameraAndMicrophone(): Promise<void> {
    if (!this.room) throw new Error('Room not connected');
    await this.room.localParticipant.enableCameraAndMicrophone();
  }

  async setCameraEnabled(enabled: boolean): Promise<void> {
    if (!this.room) throw new Error('Room not connected');
    await this.room.localParticipant.setCameraEnabled(enabled);
  }

  async setMicrophoneEnabled(enabled: boolean): Promise<void> {
    if (!this.room) throw new Error('Room not connected');
    await this.room.localParticipant.setMicrophoneEnabled(enabled);
  }

  async sendData(data: string): Promise<void> {
    if (!this.room) throw new Error('Room not connected');
    const encoder = new TextEncoder();
    await this.room.localParticipant.publishData(encoder.encode(data));
  }

  // Геттеры
  get isConnected(): boolean {
    return this.room?.state === 'connected';
  }

  get roomName(): string | undefined {
    return this.room?.name;
  }

  get participantCount(): number {
    return this.room ? this.room.numParticipants : 0;
  }

  get localParticipant(): LocalParticipant | undefined {
    return this.room?.localParticipant;
  }

  get remoteParticipants(): Map<string, RemoteParticipant> {
    return this.room?.remoteParticipants || new Map();
  }

  get currentRoom(): Room | null {
    return this.room;
  }

  // Сеттеры для колбэков
  setOnTrackSubscribed(callback: (track: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) => void) {
    this.onTrackSubscribed = callback;
  }

  setOnTrackUnsubscribed(callback: (track: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) => void) {
    this.onTrackUnsubscribed = callback;
  }

  setOnParticipantConnected(callback: (participant: RemoteParticipant) => void) {
    this.onParticipantConnected = callback;
  }

  setOnParticipantDisconnected(callback: (participant: RemoteParticipant) => void) {
    this.onParticipantDisconnected = callback;
  }

  setOnConnectionStateChanged(callback: (state: 'connecting' | 'connected' | 'disconnected' | 'reconnecting') => void) {
    this.onConnectionStateChanged = callback;
  }

  setOnDataReceived(callback: (payload: Uint8Array, participant?: RemoteParticipant) => void) {
    this.onDataReceived = callback;
  }
} 