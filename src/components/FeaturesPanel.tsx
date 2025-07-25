import React from 'react';
import { useLiveKitStore } from '../stores/liveKitStore';
import { 
  Music, 
  CloudRain, 
  MapPin, 
  Navigation, 
  Phone, 
  Settings, 
  User,
  Bot
} from 'lucide-react';

export const FeaturesPanel: React.FC = () => {
  const { connectionState, sendMessage } = useLiveKitStore();
  const isConnected = connectionState.status === 'connected';

  const features = [
    {
      id: 'music',
      name: 'Музыка',
      description: 'Поиск и управление музыкой',
      icon: Music,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      command: 'Включи музыку'
    },
    {
      id: 'weather',
      name: 'Погода',
      description: 'Прогноз погоды',
      icon: CloudRain,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      command: 'Какая погода?'
    },
    {
      id: 'poi_search',
      name: 'Поиск мест',
      description: 'Поиск точек интереса',
      icon: MapPin,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      command: 'Найди ресторан рядом'
    },
    {
      id: 'routing',
      name: 'Навигация',
      description: 'Построение маршрутов',
      icon: Navigation,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      command: 'Проложи маршрут до дома'
    },
    {
      id: 'phone_call',
      name: 'Звонки',
      description: 'Управление звонками',
      icon: Phone,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      command: 'Позвони маме'
    },
    {
      id: 'user_attrs',
      name: 'Профиль',
      description: 'Управление профилем',
      icon: User,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      command: 'Покажи мой профиль'
    }
  ];

  const handleFeatureClick = async (command: string) => {
    if (!isConnected) return;
    await sendMessage(command);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Bot className="h-5 w-5 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-800">Возможности агента</h2>
      </div>

      {!isConnected && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-yellow-700 text-sm">
          Подключитесь к агенту, чтобы использовать эти функции
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {features.map((feature) => {
          const IconComponent = feature.icon;
          return (
            <button
              key={feature.id}
              onClick={() => handleFeatureClick(feature.command)}
              disabled={!isConnected}
              className={`p-4 rounded-lg border text-left transition-all hover:shadow-md ${
                isConnected
                  ? 'hover:border-blue-300 cursor-pointer'
                  : 'opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${feature.bgColor}`}>
                  <IconComponent className={`h-5 w-5 ${feature.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 text-sm">
                    {feature.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {feature.description}
                  </p>
                  {isConnected && (
                    <p className="text-xs text-blue-600 mt-1 font-medium">
                      "{feature.command}"
                    </p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 text-xs text-gray-500 space-y-1">
        <p>• Нажмите на карточку для быстрого вызова функции</p>
        <p>• Или просто скажите голосом, что вам нужно</p>
        <p>• Агент понимает естественную речь на русском языке</p>
      </div>
    </div>
  );
}; 