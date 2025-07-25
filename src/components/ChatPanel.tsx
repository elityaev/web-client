import React, { useState, useRef, useEffect } from 'react';
import { useLiveKitStore } from '../stores/liveKitStore';
import { Send, MessageCircle } from 'lucide-react';

export const ChatPanel: React.FC = () => {
  const { messages, sendMessage, connectionState } = useLiveKitStore();
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isConnected = connectionState.status === 'connected';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !isConnected) return;

    await sendMessage(inputMessage);
    setInputMessage('');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col h-96">
      <div className="flex items-center space-x-2 mb-4">
        <MessageCircle className="h-5 w-5 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-800">Чат с агентом</h2>
      </div>

      {/* Сообщения */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 border rounded-lg p-3 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-8">
            <p>Сообщений пока нет</p>
            <p className="text-xs mt-1">
              {isConnected 
                ? 'Начните разговор или отправьте сообщение'
                : 'Подключитесь к агенту для начала чата'
              }
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isLocal ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                  message.isLocal
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border text-gray-800'
                }`}
              >
                <div className="text-sm">{message.text}</div>
                <div
                  className={`text-xs mt-1 ${
                    message.isLocal ? 'text-blue-200' : 'text-gray-500'
                  }`}
                >
                  {message.sender} • {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Форма отправки */}
      <form onSubmit={handleSendMessage} className="flex space-x-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={isConnected ? "Введите сообщение..." : "Подключитесь для отправки сообщений"}
          disabled={!isConnected}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={!isConnected || !inputMessage.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}; 