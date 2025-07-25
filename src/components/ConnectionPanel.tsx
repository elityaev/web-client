import React, { useState } from 'react';
import { useLiveKitStore } from '../stores/liveKitStore';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';

interface ConnectionPanelProps {
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export const ConnectionPanel: React.FC<ConnectionPanelProps> = ({ onConnect, onDisconnect }) => {
  const { 
    isConnected, 
    isConnecting, 
    error, 
    roomName, 
    setRoomName, 
    connect, 
    disconnect 
  } = useLiveKitStore();
  
  const [localRoomName, setLocalRoomName] = useState(roomName || 'assistant-room');
  const [withOnboarding, setWithOnboarding] = useState(false);

  const handleConnect = async () => {
    try {
      await connect(localRoomName, withOnboarding);
      onConnect?.();
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      onDisconnect?.();
      console.log('Successfully disconnected from agent');
    } catch (error) {
      console.error('Error during disconnect:', error);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center space-x-3 mb-4">
        {isConnected ? (
          <Wifi className="h-6 w-6 text-green-600" />
        ) : (
          <WifiOff className="h-6 w-6 text-gray-400" />
        )}
        <h2 className="text-xl font-semibold">
          Подключение к LiveKit
        </h2>
      </div>

      <div className="space-y-4">
        {/* Room Name Input */}
        <div>
          <label htmlFor="roomName" className="block text-sm font-medium text-gray-700 mb-1">
            Название комнаты
          </label>
          <input
            id="roomName"
            type="text"
            value={localRoomName}
            onChange={(e) => setLocalRoomName(e.target.value)}
            disabled={isConnected || isConnecting}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            placeholder="Введите название комнаты"
          />
        </div>

        {/* Onboarding Option */}
        <div className="flex items-center space-x-3">
          <input
            id="withOnboarding"
            type="checkbox"
            checked={withOnboarding}
            onChange={(e) => setWithOnboarding(e.target.checked)}
            disabled={isConnected || isConnecting}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="withOnboarding" className="text-sm font-medium text-gray-700">
            Запустить с онбордингом
          </label>
        </div>

        {withOnboarding && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
            <p className="text-blue-800">
              <strong>Режим онбординга:</strong> Агент проведет через процесс настройки приложения
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Connection Status */}
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-gray-300'
          }`} />
          <span className="text-sm text-gray-600">
            {isConnected ? `Подключено к ${roomName}` : 'Не подключено'}
          </span>
        </div>

        {/* Connection Button */}
        <div className="flex space-x-3">
          {!isConnected ? (
            <Button
              onClick={handleConnect}
              disabled={isConnecting || !localRoomName.trim()}
              className="flex-1"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Подключение...
                </>
              ) : (
                'Подключиться'
              )}
            </Button>
          ) : (
            <div className="space-y-2">
              <Button
                onClick={handleDisconnect}
                variant="danger"
                className="w-full"
              >
                <WifiOff className="h-4 w-4 mr-2" />
                Отключиться от агента
              </Button>
              <div className="text-xs text-gray-500 text-center">
                Прервет общение с агентом и закроет соединение
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}; 