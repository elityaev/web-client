import { TokenRequest, TokenResponse } from '../types';
import { FirebaseService } from './firebaseService';

const ASSISTANT_SERVER_URL = import.meta.env.VITE_ASSISTANT_SERVER_URL || 'http://localhost:8000';

export class ApiService {
  private static firebaseService = FirebaseService.getInstance();

  static async getLiveKitToken(request: TokenRequest): Promise<string> {
    try {
      // Получаем Firebase ID токен
      const firebaseIdToken = await this.firebaseService.getCurrentIdToken();

      const response = await fetch(`${ASSISTANT_SERVER_URL}/livekit-token/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=UTF8',
          'Authorization': `Bearer ${firebaseIdToken}`, // Используем Firebase ID токен
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        // Если токен истек (401), пробуем получить новый
        if (response.status === 401) {
          console.log('Firebase token expired, getting new one...');
          this.firebaseService.clearToken();
          const newFirebaseIdToken = await this.firebaseService.getIdToken();

          const retryResponse = await fetch(`${ASSISTANT_SERVER_URL}/livekit-token/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${newFirebaseIdToken}`,
            },
            body: JSON.stringify(request),
          });

          if (!retryResponse.ok) {
            const errorText = await retryResponse.text();
            throw new Error(`Failed to get LiveKit token: ${retryResponse.status} ${retryResponse.statusText} - ${errorText}`);
          }

          const data: TokenResponse = await retryResponse.json();
          return data.token;
        }

        const errorText = await response.text();
        throw new Error(`Failed to get LiveKit token: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data: TokenResponse = await response.json();
      return data.token;
    } catch (error) {
      console.error('Failed to get LiveKit token:', error);
      throw error;
    }
  }
}
