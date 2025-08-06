export interface TokenRequest {
  r: string;
  language: string;
  platform: string;
  app_version: string;
}

export interface TokenResponse {
  token: string;
}

export interface User {
  id: string;
  email?: string;
  name?: string;
  is_anonymous: boolean;
}

export interface AssistantFeature {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export interface ConnectionState {
  status: 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';
  error?: string;
  roomName?: string;
  participantCount: number;
} 