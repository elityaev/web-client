import { TokenRequest, TokenResponse } from '../types';
import { FirebaseService } from './firebaseService';
import { getEnv } from '../utils/env';
import * as CryptoJS from 'crypto-js';

const ASSISTANT_SERVER_URL = getEnv('VITE_ASSISTANT_SERVER_URL') || 'http://localhost:8000';
const API_KEY = getEnv('VITE_API_KEY') || '';

// Функция для генерации случайного значения r (до 32 символов)
function generateRandomR(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Функция для создания HMAC-MD5 подписи
function createHmacMd5(message: string, key: string): string {
  const hmac = CryptoJS.HmacMD5(message, key);
  return hmac.toString(CryptoJS.enc.Hex);
}

export class ApiService {
  private static firebaseService = FirebaseService.getInstance();

  static async getLiveKitToken(request: TokenRequest): Promise<string> {
    try {
      // Получаем Firebase ID токен
      const firebaseIdToken = await this.firebaseService.getCurrentIdToken();

      // Генерируем случайное значение r
      const randomR = generateRandomR();

      // Добавляем r в запрос
      const requestWithR = { ...request, r: randomR };
      const requestBody = JSON.stringify(requestWithR);

      // Создаем HMAC-MD5 подпись
      const xAuthHeader = createHmacMd5(requestBody, API_KEY);

      console.log('🔐 Request body:', requestBody);
      console.log('🔐 API Key length:', API_KEY.length);
      console.log('🔐 X-Auth header:', xAuthHeader);
      console.log('🔐 X-Auth length:', xAuthHeader.length);

      const response = await fetch(`${ASSISTANT_SERVER_URL}/livekit-token/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=UTF8',
          'Authorization': `Bearer ${firebaseIdToken}`,
          'X-Auth': xAuthHeader,
        },
        body: requestBody,
      });

      if (!response.ok) {
        // Если токен истек (401), пробуем получить новый
        if (response.status === 401) {
          console.log('Firebase token expired, getting new one...');
          this.firebaseService.clearToken();
          const newFirebaseIdToken = await this.firebaseService.getIdToken();

          // Генерируем новое случайное значение r для повторного запроса
          const newRandomR = generateRandomR();
          const retryRequestWithR = { ...request, r: newRandomR };
          const retryRequestBody = JSON.stringify(retryRequestWithR);

          // Создаем новую HMAC-MD5 подпись
          const retryXAuthHeader = createHmacMd5(retryRequestBody, API_KEY);

          const retryResponse = await fetch(`${ASSISTANT_SERVER_URL}/livekit-token/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json; charset=UTF8',
              'Authorization': `Bearer ${newFirebaseIdToken}`,
              'X-Auth': retryXAuthHeader,
            },
            body: retryRequestBody,
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
