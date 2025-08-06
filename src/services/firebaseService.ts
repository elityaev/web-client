// Firebase API Service для получения ID токена
interface FirebaseTokenResponse {
  access_token: string;
  expires_in: string;
  token_type: string;
  refresh_token: string;
  id_token: string;
  user_id: string;
  project_id: string;
}

export class FirebaseService {
  private static instance: FirebaseService;
  private apiKey: string;
  private refreshToken: string;
  private currentIdToken: string | null = null;

  private constructor() {
    this.apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
    this.refreshToken = import.meta.env.VITE_FIREBASE_REFRESH_TOKEN;

    if (!this.apiKey || !this.refreshToken) {
      throw new Error('Firebase API key or refresh token not found in environment variables');
    }
  }

  public static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  // Получить Firebase ID токен через API
  public async getIdToken(): Promise<string> {
    try {
      const response = await fetch(
        `https://securetoken.googleapis.com/v1/token?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            grant_type: 'refresh_token',
            refresh_token: this.refreshToken,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Firebase API error: ${response.status} ${response.statusText}`);
      }

      const data: FirebaseTokenResponse = await response.json();
      this.currentIdToken = data.id_token;

      console.log('Firebase ID token obtained successfully');
      return data.id_token;
    } catch (error) {
      console.error('Failed to get Firebase ID token:', error);
      throw error;
    }
  }

  // Получить текущий ID токен (если есть) или получить новый
  public async getCurrentIdToken(): Promise<string> {
    if (this.currentIdToken) {
      return this.currentIdToken;
    }
    return this.getIdToken();
  }

  // Очистить текущий токен (например, при ошибках аутентификации)
  public clearToken(): void {
    this.currentIdToken = null;
  }
} 