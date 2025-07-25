import React from 'react';
import { useOnboardingStore } from '../stores/onboardingStore';
import { useLiveKitStore } from '../stores/liveKitStore';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Play, Square, Loader2, CheckCircle, XCircle } from 'lucide-react';

export const OnboardingPanel: React.FC = () => {
  const { room } = useLiveKitStore();
  const {
    isOnboardingActive,
    currentScreen,
    isLoading,
    error,
    onboardingService,
    startOnboarding,
    stopOnboarding,
    clearError,
    initializeWithRoom,
    sendLocationAllowClick,
    sendLocationLaterClick,
    sendPlaceContinueClick,
    sendSuccessfulPurchase,
    sendPurchaseSkip,
    sendPushAllowClick,
    sendPushLaterClick,
    sendMusicInfoPassed,
    sendCallsInfoPassed,
    sendDefaultAssistantOpenClick,
    sendDefaultAssistantSetupComplete,
    sendDefaultAssistantLaterClick,
  } = useOnboardingStore();

  // Инициализируем с room при изменении
  React.useEffect(() => {
    if (room) {
      initializeWithRoom(room);
    }
  }, [room, initializeWithRoom]);

  const handleStartOnboarding = async () => {
    if (!room) {
      alert('Сначала подключитесь к LiveKit комнате');
      return;
    }
    
    try {
      await startOnboarding();
    } catch (error) {
      console.error('Failed to start onboarding:', error);
    }
  };

  const renderCurrentScreen = () => {
    if (!currentScreen) return null;

    const { screen_type, data, use_microphone } = currentScreen;

    switch (screen_type) {
      case 'bot_with_text':
        return (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">R</span>
              </div>
              <div className="flex-1">
                <p className="text-blue-900">{data?.text}</p>
                {use_microphone && (
                  <div className="mt-2 text-xs text-blue-600">
                    🎤 Микрофон активен
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'bot_with_text_and_buttons':
        return (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">R</span>
              </div>
              <div className="flex-1">
                <p className="text-blue-900">{data?.text}</p>
              </div>
            </div>
            {data?.buttons && (
              <div className="space-y-2">
                {data.buttons.map((button: any, index: number) => (
                  <Button
                    key={index}
                    onClick={() => handleButtonClick(button.rpc_on_click)}
                    className="w-full"
                    variant="primary"
                  >
                    {button.text}
                  </Button>
                ))}
              </div>
            )}
          </div>
        );

      case 'onboarding_feature':
        return (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-3 mb-4">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">✓</span>
              </div>
              <div className="flex-1">
                <p className="text-green-900">{data?.bot_text}</p>
                {data?.card_image_url && (
                  <div className="mt-2 text-xs text-green-600">
                    🖼️ Показано изображение: {data.card_image_url}
                  </div>
                )}
              </div>
            </div>
            {data?.buttons && (
              <div className="space-y-2">
                {data.buttons.map((button: any, index: number) => (
                  <Button
                    key={index}
                    onClick={() => handleButtonClick(button.rpc_on_click)}
                    className="w-full"
                    variant="primary"
                  >
                    {button.text}
                  </Button>
                ))}
              </div>
            )}
          </div>
        );

      case 'paywall':
        return (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-purple-900 mb-4">
                💎 Премиум функции
              </h3>
              <p className="text-purple-700 mb-4">
                Получите доступ ко всем возможностям ассистента
              </p>
              <div className="space-y-2">
                <Button
                  onClick={sendSuccessfulPurchase}
                  className="w-full"
                  variant="primary"
                >
                  Купить премиум
                </Button>
                <Button
                  onClick={sendPurchaseSkip}
                  className="w-full"
                  variant="secondary"
                >
                  Пропустить
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-gray-600">
              Неизвестный тип экрана: {screen_type}
            </p>
            <pre className="mt-2 text-xs text-gray-500">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        );
    }
  };

  const handleButtonClick = async (rpcMethod: string) => {
    try {
      switch (rpcMethod) {
        case 'location-allow-click':
          await sendLocationAllowClick();
          break;
        case 'location-later-click':
          await sendLocationLaterClick();
          break;
        case 'place-continue-click':
          await sendPlaceContinueClick();
          break;
        case 'push_allow_click':
          await sendPushAllowClick();
          break;
        case 'push_later_click':
          await sendPushLaterClick();
          break;
        case 'music-info-passed':
          await sendMusicInfoPassed();
          break;
        case 'calls-info-passed':
          await sendCallsInfoPassed();
          break;
        case 'default-assistant-open-click':
          await sendDefaultAssistantOpenClick();
          break;
        case 'default-assistant-later-click':
          await sendDefaultAssistantLaterClick();
          break;
        default:
          console.warn(`Unknown RPC method: ${rpcMethod}`);
      }
    } catch (error) {
      console.error(`Failed to execute RPC method ${rpcMethod}:`, error);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center space-x-3 mb-4">
        {isOnboardingActive ? (
          <CheckCircle className="h-6 w-6 text-green-600" />
        ) : (
          <Play className="h-6 w-6 text-gray-400" />
        )}
        <h2 className="text-xl font-semibold">
          Процесс онбординга
        </h2>
      </div>

      <div className="space-y-4">
        {/* Статус */}
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            isOnboardingActive ? 'bg-green-500' : 'bg-gray-300'
          }`} />
          <span className="text-sm text-gray-600">
            {isOnboardingActive ? 'Онбординг активен' : 'Онбординг неактивен'}
          </span>
        </div>

        {/* Сообщение об ошибке */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <XCircle className="h-4 w-4 text-red-600" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
            <Button
              onClick={clearError}
              className="mt-2"
              variant="secondary"
              size="sm"
            >
              Закрыть
            </Button>
          </div>
        )}

        {/* Текущий экран */}
        {currentScreen && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Текущий экран: {currentScreen.screen_type}
            </h3>
            {renderCurrentScreen()}
            
            {/* Отладочная информация */}
            <details className="mt-3">
              <summary className="text-xs text-gray-500 cursor-pointer">
                Показать данные от агента (отладка)
              </summary>
              <pre className="mt-2 text-xs text-gray-400 bg-gray-100 p-2 rounded overflow-auto max-h-32">
                {JSON.stringify(currentScreen, null, 2)}
              </pre>
            </details>
          </div>
        )}

        {/* Управление - только остановка онбординга, запуск через ConnectionPanel */}
        {isOnboardingActive && (
          <div className="flex space-x-3">
            <Button
              onClick={stopOnboarding}
              variant="danger"
              className="flex-1"
            >
              <Square className="h-4 w-4 mr-2" />
              Остановить онбординг
            </Button>
          </div>
        )}

        {/* Информация */}
        <div className="bg-gray-50 rounded-lg p-3 text-sm">
          <p className="font-medium mb-1">Как запустить онбординг:</p>
          <ol className="list-decimal list-inside space-y-1 text-gray-600">
            <li>В панели подключения отметьте "Запустить с онбордингом"</li>
            <li>Подключитесь к LiveKit комнате</li>
            <li>Агент автоматически начнет процесс онбординга</li>
            <li>Следуйте инструкциям на экране</li>
          </ol>
          
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="font-medium mb-1 text-gray-700">Статус RPC:</p>
            <p className="text-xs text-gray-600">
              RPC метод "show-screen" {room ? 'зарегистрирован' : 'не готов (нет подключения)'}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}; 