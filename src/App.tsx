import React, { useEffect } from 'react';
import { useAuthStore } from './stores/authStore';
import { TestPage } from './components/TestPage';
import { Loader2, AlertCircle } from 'lucide-react';

function App() {
  const { isReady, isAuthenticated, isLoading, error, initialize, clearError } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Получение Firebase токена...</p>
        </div>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Инициализация...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-3 text-red-600 mb-4">
            <AlertCircle className="h-6 w-6" />
            <h1 className="text-lg font-semibold">Ошибка аутентификации</h1>
          </div>
          <p className="text-gray-700 mb-4">{error}</p>
          <div className="bg-gray-50 rounded-lg p-3 text-sm mb-4">
            <p className="font-medium mb-2">Что нужно проверить:</p>
            <ol className="list-decimal list-inside space-y-1 text-gray-600">
              <li>Firebase API ключ в .env файле</li>
              <li>Firebase refresh token в .env файле</li>
              <li>Подключение к интернету</li>
            </ol>
          </div>
          <button
            onClick={() => {
              clearError();
              initialize();
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-red-400 text-xl">Authentication failed. Please check your environment configuration.</div>
      </div>
    );
  }

  return <TestPage />;
}

export default App; 