/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_FIREBASE_API_KEY: string
    readonly VITE_FIREBASE_AUTH_DOMAIN: string
    readonly VITE_FIREBASE_PROJECT_ID: string
    readonly VITE_FIREBASE_STORAGE_BUCKET: string
    readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
    readonly VITE_FIREBASE_APP_ID: string
    readonly VITE_FIREBASE_REFRESH_TOKEN: string
    readonly VITE_ASSISTANT_SERVER_URL: string
    readonly VITE_LIVEKIT_WS_URL: string
    readonly VITE_API_KEY: string
    readonly VITE_USERNAME: string
    readonly VITE_PASSWORD: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}