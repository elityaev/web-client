import React, { useState } from 'react';
import { NavigatorData } from '../services/onboardingService';

interface NavigatorScreenProps {
    data?: NavigatorData;
}

interface MapPoint {
    lat: number;
    lng: number;
    name: string;
    index: number;
}

export const NavigatorScreen: React.FC<NavigatorScreenProps> = ({ data }) => {
    const [showDebugInfo, setShowDebugInfo] = useState(true);

    // Подготавливаем точки маршрута
    const routePoints: MapPoint[] = data?.waypoints?.map((waypoint, index) => ({
        lat: waypoint.location.lat,
        lng: waypoint.location.lng,
        name: waypoint.name,
        index: index + 1
    })) || [];

    // Добавляем текущую локацию если from_current_location = true
    const currentLocation: MapPoint = {
        lat: 34.0522, // Примерная текущая локация (Лос-Анджелес)
        lng: -118.2437,
        name: "Current Location",
        index: 0
    };

    const allPoints = data?.from_current_location
        ? [currentLocation, ...routePoints]
        : routePoints;

    // Вычисляем общую дистанцию и время (примерно)
    const totalDistance = routePoints.length * 2.3; // Примерно 2.3 мили между точками
    const estimatedTime = Math.round(totalDistance * 3); // 3 минуты на милю

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-6">🧭 Navigation Mode</h2>

            {/* Debug Information Panel */}
            {showDebugInfo && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-semibold text-gray-800">🔧 Debug: RPC Payload Data</h3>
                        <button
                            onClick={() => setShowDebugInfo(false)}
                            className="text-gray-500 hover:text-gray-700 text-sm"
                        >
                            ✕ Скрыть
                        </button>
                    </div>
                    <div className="bg-gray-800 text-green-400 p-3 rounded font-mono text-sm overflow-auto">
                        <pre>{JSON.stringify(data, null, 2) || 'No payload data received'}</pre>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                        <strong>Получено waypoints:</strong> {data?.waypoints?.length || 0} |
                        <strong> From current location:</strong> {data?.from_current_location ? 'Да' : 'Нет'}
                    </div>
                </div>
            )}

            {!showDebugInfo && (
                <button
                    onClick={() => setShowDebugInfo(true)}
                    className="mb-4 text-sm text-blue-600 hover:text-blue-800"
                >
                    📊 Показать debug информацию
                </button>
            )}

            {/* Navigation Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-semibold mb-2">Активная навигация</h3>
                        <p className="text-blue-100">
                            Маршрут через {routePoints.length} точек{data?.from_current_location ? ' от текущего местоположения' : ''}
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold">{estimatedTime} мин</div>
                        <div className="text-sm text-blue-100">ETA</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Map Simulation */}
                <div className="bg-gray-100 rounded-lg p-4 h-96">
                    <h4 className="font-semibold text-gray-800 mb-4">🗺️ Симуляция карты</h4>
                    <div className="relative h-full bg-gradient-to-br from-green-100 to-blue-100 rounded-lg overflow-hidden">
                        {/* Симуляция карты с точками */}
                        {allPoints.map((point, index) => {
                            // Рассчитываем позицию на "карте" (в пределах контейнера)
                            const x = 10 + (index * 15) % 70; // Распределяем по X
                            const y = 15 + ((index * 23) % 60); // Распределяем по Y

                            return (
                                <div key={index} className="absolute group">
                                    <div
                                        className="absolute transform -translate-x-1/2 -translate-y-1/2"
                                        style={{ left: `${x}%`, top: `${y}%` }}
                                    >
                                        {/* Маркер точки */}
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg ${
                                            point.index === 0 ? 'bg-green-500' : 'bg-red-500'
                                        }`}>
                                            {point.index === 0 ? '📍' : point.index}
                                        </div>

                                        {/* Tooltip с информацией */}
                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                            <div className="font-semibold">{point.name}</div>
                                            <div className="text-gray-300">
                                                {point.lat.toFixed(4)}, {point.lng.toFixed(4)}
                                            </div>
                                        </div>

                                        {/* Линия к следующей точке */}
                                        {index < allPoints.length - 1 && (
                                            <div className="absolute top-4 left-4 w-12 h-0.5 bg-blue-500 transform rotate-45"></div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Симуляция дорог */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none">
                            <defs>
                                <pattern id="road" patternUnits="userSpaceOnUse" width="20" height="20">
                                    <rect width="20" height="20" fill="#e5e7eb"/>
                                    <rect x="8" y="0" width="4" height="20" fill="#9ca3af"/>
                                </pattern>
                            </defs>
                            <path
                                d="M 10,50 Q 200,30 350,80 Q 400,150 300,200"
                                fill="none"
                                stroke="url(#road)"
                                strokeWidth="8"
                                opacity="0.7"
                            />
                        </svg>

                        {/* Легенда */}
                        <div className="absolute top-2 right-2 bg-white p-2 rounded shadow text-xs">
                            <div className="flex items-center mb-1">
                                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                                <span>Старт</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                                <span>Waypoint</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Route Information */}
                <div className="space-y-4">
                    {/* Route Stats */}
                    <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3">📊 Информация о маршруте</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Общая дистанция:</span>
                                <span className="font-medium">{totalDistance.toFixed(1)} км</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Время в пути:</span>
                                <span className="font-medium">{estimatedTime} минут</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Количество точек:</span>
                                <span className="font-medium">{routePoints.length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Трафик:</span>
                                <span className="text-green-600 font-medium">Лёгкий</span>
                            </div>
                        </div>
                    </div>

                    {/* Waypoints List */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3">📍 Список точек маршрута</h4>
                        <div className="space-y-3 max-h-48 overflow-y-auto">
                            {data?.from_current_location && (
                                <div className="flex items-center p-2 bg-green-50 rounded">
                                    <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">
                                        🏠
                                    </div>
                                    <div>
                                        <div className="font-medium text-sm">Текущее местоположение</div>
                                        <div className="text-xs text-gray-500">
                                            {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {routePoints.map((point, index) => (
                                <div key={index} className="flex items-center p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                                    <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">
                                        {point.index}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium text-sm">{point.name}</div>
                                        <div className="text-xs text-gray-500">
                                            {point.lat.toFixed(6)}, {point.lng.toFixed(6)}
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        ~{((index + 1) * 2.3).toFixed(1)} км
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Controls */}
            <div className="mt-6 grid grid-cols-4 gap-4">
                <button className="bg-gray-100 hover:bg-gray-200 p-4 rounded-lg text-center transition-colors">
                    <div className="text-2xl mb-2">🔊</div>
                    <div className="text-sm font-medium">Голос</div>
                </button>
                <button className="bg-gray-100 hover:bg-gray-200 p-4 rounded-lg text-center transition-colors">
                    <div className="text-2xl mb-2">📍</div>
                    <div className="text-sm font-medium">Местоположение</div>
                </button>
                <button className="bg-gray-100 hover:bg-gray-200 p-4 rounded-lg text-center transition-colors">
                    <div className="text-2xl mb-2">🚗</div>
                    <div className="text-sm font-medium">Режим</div>
                </button>
                <button className="bg-gray-100 hover:bg-gray-200 p-4 rounded-lg text-center transition-colors">
                    <div className="text-2xl mb-2">⚙️</div>
                    <div className="text-sm font-medium">Настройки</div>
                </button>
            </div>

            {/* Status Bar */}
            <div className="mt-6 p-3 bg-green-100 rounded-lg text-center">
                <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-800 font-medium">
                        Навигация активна • {allPoints.length} точек в маршруте
                    </span>
                </div>
            </div>
        </div>
    );
};
