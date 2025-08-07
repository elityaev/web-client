// Хелпер для получения переменных окружения
// В режиме разработки используем import.meta.env
// В продакшене (Docker) используем window._env_

declare global {
    interface Window {
        _env_?: {
            VITE_ASSISTANT_SERVER_URL?: string;
            VITE_LIVEKIT_WS_URL?: string;
            VITE_USERNAME?: string;
            VITE_PASSWORD?: string;
            VITE_API_KEY?: string;
            VITE_FIREBASE_API_KEY?: string;
            VITE_FIREBASE_AUTH_DOMAIN?: string;
            VITE_FIREBASE_PROJECT_ID?: string;
            VITE_FIREBASE_STORAGE_BUCKET?: string;
            VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
            VITE_FIREBASE_APP_ID?: string;
            VITE_FIREBASE_REFRESH_TOKEN?: string;
        };
    }
}

export const getEnv = (key: keyof ImportMetaEnv): string => {
    // В Docker используем window._env_, в dev - import.meta.env
    if (typeof window !== 'undefined' && window._env_) {
        return window._env_[key] || '';
    }

    return import.meta.env[key] || '';
};