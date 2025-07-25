import React from 'react';
import { useLiveKitStore } from '../stores/liveKitStore';
import { Mic, MicOff, Video, VideoOff } from 'lucide-react';

export const AudioVideoControls: React.FC = () => {
  const { 
    localAudioEnabled, 
    localVideoEnabled, 
    toggleAudio, 
    toggleVideo,
    connectionState 
  } = useLiveKitStore();

  const isConnected = connectionState.status === 'connected';

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Управление</h2>
      
      <div className="space-y-4">
        {/* Медиа элементы */}
        <div className="space-y-3">
          <div className="bg-gray-100 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Входящее аудио от агента</h3>
            <audio
              id="remote-audio"
              autoPlay
              playsInline
              className="hidden"
            />
            <div className="text-xs text-gray-500">
              Автоматически воспроизводится при подключении
            </div>
          </div>

          <div className="bg-gray-100 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Входящее видео от агента</h3>
            <video
              id="remote-video"
              autoPlay
              playsInline
              muted
              className="w-full h-32 bg-gray-200 rounded object-cover"
            />
          </div>
        </div>

        {/* Кнопки управления */}
        <div className="flex space-x-3">
          <button
            onClick={toggleAudio}
            disabled={!isConnected}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-semibold transition-colors ${
              localAudioEnabled
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {localAudioEnabled ? (
              <Mic className="h-5 w-5" />
            ) : (
              <MicOff className="h-5 w-5" />
            )}
            <span>{localAudioEnabled ? 'Вкл' : 'Выкл'}</span>
          </button>

          <button
            onClick={toggleVideo}
            disabled={!isConnected}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-semibold transition-colors ${
              localVideoEnabled
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {localVideoEnabled ? (
              <Video className="h-5 w-5" />
            ) : (
              <VideoOff className="h-5 w-5" />
            )}
            <span>{localVideoEnabled ? 'Вкл' : 'Выкл'}</span>
          </button>
        </div>

        {/* Подсказки */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Микрофон автоматически включается при подключении</p>
          <p>• Говорите четко для лучшего распознавания речи</p>
          <p>• Видео опционально для голосового взаимодействия</p>
        </div>
      </div>
    </div>
  );
}; 