import React from 'react';
import { ConnectionPanel } from './ConnectionPanel';
import { AudioVideoControls } from './AudioVideoControls';
import { ChatPanel } from './ChatPanel';
import { FeaturesPanel } from './FeaturesPanel';
import { OnboardingPanel } from './OnboardingPanel';
import { useLiveKitStore } from '../stores/liveKitStore';
import { useOnboardingStore } from '../stores/onboardingStore';
import { Button } from './ui/Button';
import { WifiOff, AlertTriangle } from 'lucide-react';

export const MainDashboard: React.FC = () => {
  const { isConnected, disconnect } = useLiveKitStore();
  const { isOnboardingActive, stopOnboarding } = useOnboardingStore();

  const handleEmergencyDisconnect = async () => {
    if (window.confirm('Вы уверены, что хотите прервать связь с агентом?')) {
      try {
        if (isOnboardingActive) {
          stopOnboarding();
        }
        await disconnect();
        console.log('Emergency disconnect completed');
      } catch (error) {
        console.error('Error during emergency disconnect:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-2">
            <div></div> {/* Пустой div для центрирования */}
            <h1 className="text-3xl font-bold text-gray-900">AI Assistant</h1>
            {isConnected && (
              <Button
                onClick={handleEmergencyDisconnect}
                variant="danger"
                size="sm"
                className="flex items-center"
              >
                <AlertTriangle className="h-4 w-4 mr-1" />
                Экстренное отключение
              </Button>
            )}
          </div>
          <p className="text-gray-600">Голосовой помощник с искусственным интеллектом</p>
          
          {isConnected && (
            <div className="mt-2 inline-flex items-center space-x-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Подключен к агенту</span>
            </div>
          )}
        </div>

        {/* Основная сетка */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Левая колонка */}
          <div className="space-y-6">
            <ConnectionPanel />
            <AudioVideoControls />
          </div>

          {/* Центральная колонка */}
          <div className="space-y-6">
            <ChatPanel />
          </div>

          {/* Правая колонка */}
          <div className="space-y-6">
            <FeaturesPanel />
          </div>
        </div>

        {/* Панель онбординга */}
        <div className="mt-6">
          <OnboardingPanel />
        </div>

        {/* Подвал */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Создано для демонстрации интеграции с LiveKit и AI агентом
          </p>
        </div>
      </div>
    </div>
  );
}; 