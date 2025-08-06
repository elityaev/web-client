import React from 'react';
import { useLiveKitStore } from '../stores/liveKitStore';
import { useOnboardingStore } from '../stores/onboardingStore';
import { OnboardingPanel } from './OnboardingPanel';
import { Loader2, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export const TestPage: React.FC = () => {
    const {
        isConnected,
        isConnecting,
        connect,
        disconnect,
        connectionState
    } = useLiveKitStore();

    const {
        receivedRpcCommands,
        sentRpcCommands,
        currentScreen,
        permissions,
        setPermission,
        sendPermissionsResponse,
        setCurrentScreen,
        addSentRpcCommand
    } = useOnboardingStore();

    const handleConnect = async () => {
        try {
            await connect('assistant-room', true); // включаем онбординг
        } catch (error) {
            console.error('Connection failed:', error);
        }
    };

    const handleDisconnect = async () => {
        try {
            await disconnect();
        } catch (error) {
            console.error('Disconnect failed:', error);
        }
    };

    const handleRpcMethod = async (method: string, data?: any) => {
        try {
            const { onboardingService } = useOnboardingStore.getState();
            console.log('🚀 Sending RPC method:', method, 'with data:', data);
            await onboardingService.sendRpcMethod(method, data || {});
            console.log('✅ RPC method sent successfully:', method, data);

            // Записываем успешную отправку
            addSentRpcCommand(method, data || {}, true);
        } catch (error: any) {
            console.error('❌ Failed to send RPC method:', method, error);

            // Записываем неудачную отправку  
            const errorMessage = error.message || 'Unknown error';
            addSentRpcCommand(method, data || {}, false, errorMessage);

            // Показываем пользователю что RPC был отправлен, но агент не поддерживает его
            if (errorMessage.includes('Method not supported')) {
                console.warn('⚠️ Agent does not support this RPC method. This is normal for testing.');
            }
        }
    };

    const simulateRequestPermissions = () => {
        const mockScreenData = {
            screen_type: "request_permissions",
            use_microphone: false,
            data: {
                text: "Let me hear you ...",
                permissions: [
                    {
                        type: "microphone",
                        title: "Allow microphone",
                        subtitle: "Ray will listen to you",
                        icon_url: "https://static.ray.app/image",
                        rpc_on_allow: {
                            name: "permission-allow",
                            payload: JSON.stringify({ type: "microphone" })
                        },
                        rpc_on_deny: {
                            name: "permission-deny",
                            payload: JSON.stringify({ type: "microphone" })
                        }
                    },
                    {
                        type: "location",
                        title: "Allow location",
                        subtitle: "Ray will guide you",
                        icon_url: "https://static.ray.app/image",
                        rpc_on_allow: {
                            name: "permission-allow",
                            payload: JSON.stringify({ type: "location" })
                        },
                        rpc_on_deny: {
                            name: "permission-deny",
                            payload: JSON.stringify({ type: "location" })
                        }
                    }
                ],
                buttons: [
                    {
                        text: "Continue",
                        rpc_on_click: {
                            name: "permissions-granted"
                        }
                    }
                ]
            }
        };

        setCurrentScreen(mockScreenData);
    };

    const simulateGetLocation = () => {
        // Симулируем получение RPC get-location
        const { addReceivedRpcCommand } = useOnboardingStore.getState();
        addReceivedRpcCommand('get-location', { timestamp: new Date().toISOString() });
    };

    const simulateAddWaypoint = () => {
        const mockScreenData = {
            screen_type: "add_waypoint_to_route",
            use_microphone: true,
            data: {
                results: [
                    {
                        id: "osdijvokanseo2ij3d09j",
                        number: 1,
                        label: "1",
                        title: "Shell",
                        subtitle: "1.3 mi",
                        info: [
                            {
                                icon_url: "https://ray.app/clock.png",
                                text: "Until 10 P.M."
                            },
                            {
                                icon_url: "https://ray.app/pin.png",
                                text: "2458 El Camino Real, Palo Alto, CA"
                            }
                        ],
                        phone: "+1111111",
                        waypoint_number: 0,
                        location: {
                            lat: 0.3842272948,
                            lng: 95.8302357943
                        },
                        selected: true,
                        extended: true,
                        rpc_on_card_click: {
                            name: "rpc-on-card-click",
                            payload: JSON.stringify({ id: "osdijvokanseo2ij3d09j" })
                        },
                        rpc_on_pin_click: {
                            name: "rpc-on-pin-click",
                            payload: JSON.stringify({ id: "osdijvokanseo2ij3d09j" })
                        },
                        rpc_on_go_click: {
                            name: "rpc-on-go-click",
                            payload: JSON.stringify({ id: "osdijvokanseo2ij3d09j" })
                        }
                    },
                    {
                        id: "osdijvokanseo2ij3d09j2",
                        number: 2,
                        label: "2",
                        title: "Exxon",
                        subtitle: "4 mi",
                        info: [
                            {
                                icon_url: "https://ray.app/clock.png",
                                text: "Open 24/7"
                            },
                            {
                                icon_url: "https://ray.app/pin.png",
                                text: "1234 Main Street, San Francisco, CA"
                            },
                            {
                                icon_url: "https://ray.app/info.png",
                                text: "Self-service gas station"
                            }
                        ],
                        phone: "+1222222",
                        waypoint_number: 0,
                        location: {
                            lat: 0.3842272948,
                            lng: 95.8302357943
                        },
                        selected: false,
                        extended: false,
                        rpc_on_card_click: {
                            name: "rpc-on-card-click",
                            payload: JSON.stringify({ id: "osdijvokanseo2ij3d09j2" })
                        },
                        rpc_on_pin_click: {
                            name: "rpc-on-pin-click",
                            payload: JSON.stringify({ id: "osdijvokanseo2ij3d09j2" })
                        },
                        rpc_on_go_click: {
                            name: "rpc-on-go-click",
                            payload: JSON.stringify({ id: "osdijvokanseo2ij3d09j2" })
                        }
                    }
                ],
                final_points: [
                    {
                        id: "osdijvokanseo2ij3d09j3",
                        number: 1,
                        label: "1",
                        title: "Starbucks",
                        subtitle: "5 mi",
                        info: [
                            {
                                icon_url: "https://ray.app/clock.png",
                                text: "6:00 AM - 11:00 PM"
                            },
                            {
                                icon_url: "https://ray.app/pin.png",
                                text: "456 Coffee Street, Berkeley, CA"
                            },
                            {
                                icon_url: "https://ray.app/wifi.png",
                                text: "Free WiFi available"
                            }
                        ],
                        phone: "+1333333",
                        waypoint_number: 1,
                        location: {
                            lat: 0.3842272948,
                            lng: 95.8302357943
                        },
                        selected: false,
                        extended: true,
                        rpc_on_card_click: {
                            name: "rpc-on-card-click",
                            payload: JSON.stringify({ id: "osdijvokanseo2ij3d09j3" })
                        },
                        rpc_on_pin_click: {
                            name: "rpc-on-pin-click",
                            payload: JSON.stringify({ id: "osdijvokanseo2ij3d09j3" })
                        },
                        rpc_on_go_click: {
                            name: "rpc-on-go-click",
                            payload: JSON.stringify({ id: "osdijvokanseo2ij3d09j3" })
                        }
                    }
                ],
                user_location: {
                    lat: 0.3842272948,
                    lng: 95.8302357943
                },
                rpc_on_map_interaction: {
                    name: "rpc-on-map-interaction"
                }
            }
        };

        setCurrentScreen(mockScreenData);
    };

    const simulatePaywall = () => {
        // Симулируем получение RPC show_screen с paywall
        const { addReceivedRpcCommand } = useOnboardingStore.getState();
        addReceivedRpcCommand('show_screen', {
            screen_type: "paywall",
            use_microphone: false,
            data: {
                placement: "onboarding",
                rpc_on_purchase: {
                    name: "successful-purchase"
                },
                rpc_on_skip: {
                    name: "purchase-skip"
                }
            }
        });

        const mockScreenData = {
            screen_type: "paywall",
            use_microphone: false,
            data: {
                placement: "onboarding",
                rpc_on_purchase: {
                    name: "successful-purchase"
                },
                rpc_on_skip: {
                    name: "purchase-skip"
                }
            }
        };

        setCurrentScreen(mockScreenData);
    };

    const simulateNavigator = () => {
        // Симулируем получение RPC show_screen с navigator
        const { addReceivedRpcCommand } = useOnboardingStore.getState();
        addReceivedRpcCommand('show_screen', {
            screen_type: "navigator",
            use_microphone: false
        });

        const mockScreenData = {
            screen_type: "navigator",
            use_microphone: false
        };

        setCurrentScreen(mockScreenData);
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-center mb-8">Тест приложения с агентом</h1>

                {/* Скрытые элементы для воспроизведения аудио/видео от агента */}
                <audio
                    id="remote-audio"
                    autoPlay
                    playsInline
                    style={{ display: 'none' }}
                />
                <video
                    id="remote-video"
                    autoPlay
                    playsInline
                    muted
                    style={{ display: 'none' }}
                />

                {/* Панель настройки разрешений */}
                {!isConnected && (
                    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                        <h2 className="text-xl font-semibold mb-4">Настройка разрешений</h2>
                        <p className="text-gray-600 mb-4">Выберите разрешения которые будут отправлены в ответе на get-permissions:</p>

                        <div className="space-y-3">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="microphone"
                                    checked={permissions.microphone}
                                    onChange={(e) => setPermission('microphone', e.target.checked)}
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="microphone" className="ml-2 text-sm font-medium text-gray-900">
                                    🎤 Microphone access
                                </label>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="location"
                                    checked={permissions.location}
                                    onChange={(e) => setPermission('location', e.target.checked)}
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="location" className="ml-2 text-sm font-medium text-gray-900">
                                    📍 Location access
                                </label>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="push"
                                    checked={permissions.push}
                                    onChange={(e) => setPermission('push', e.target.checked)}
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                    disabled
                                />
                                <label htmlFor="push" className="ml-2 text-sm text-gray-500">
                                    🔔 Push notifications (always false)
                                </label>
                            </div>
                        </div>

                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <h3 className="text-sm font-semibold mb-2">Payload для ответа:</h3>
                            <pre className="text-xs text-gray-700 overflow-x-auto">
                                {JSON.stringify(permissions, null, 2)}
                            </pre>
                        </div>
                    </div>
                )}

                {/* Панель подключения */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Подключение к агенту</h2>

                    <div className="flex items-center gap-4 mb-4">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${connectionState.status === 'connected'
                            ? 'bg-green-100 text-green-800'
                            : connectionState.status === 'connecting'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                            {connectionState.status === 'connected' && <CheckCircle className="inline w-4 h-4 mr-1" />}
                            {connectionState.status === 'connecting' && <Loader2 className="inline w-4 h-4 mr-1 animate-spin" />}
                            {connectionState.status === 'disconnected' && <AlertCircle className="inline w-4 h-4 mr-1" />}
                            {connectionState.status}
                        </div>

                        {connectionState.roomName && (
                            <span className="text-sm text-gray-600">
                                Комната: {connectionState.roomName}
                            </span>
                        )}

                        {connectionState.participantCount > 0 && (
                            <span className="text-sm text-gray-600">
                                Участники: {connectionState.participantCount}
                            </span>
                        )}

                        {isConnected && (
                            <span className="text-sm text-blue-600 flex items-center gap-1">
                                🔊 Аудио от агента готов
                            </span>
                        )}
                    </div>

                    <div className="flex gap-4">
                        {!isConnected ? (
                            <button
                                onClick={handleConnect}
                                disabled={isConnecting}
                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2"
                            >
                                {isConnecting && <Loader2 className="w-4 h-4 animate-spin" />}
                                {isConnecting ? 'Подключение...' : 'Подключиться к агенту'}
                            </button>
                        ) : (
                            <button
                                onClick={handleDisconnect}
                                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium"
                            >
                                Отключиться
                            </button>
                        )}

                        <button
                            onClick={simulateRequestPermissions}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium"
                        >
                            🧪 Тест Request Permissions
                        </button>

                        <button
                            onClick={simulateGetLocation}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium"
                        >
                            📍 Тест Get Location
                        </button>

                        <button
                            onClick={() => handleRpcMethod('open-navigator')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
                        >
                            🧭 Тест Open Navigator
                        </button>

                        <button
                            onClick={simulateAddWaypoint}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium"
                        >
                            🗺️ Тест Add Waypoint
                        </button>

                        <button
                            onClick={simulatePaywall}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium"
                        >
                            💳 Тест Paywall
                        </button>

                        <button
                            onClick={simulateNavigator}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
                        >
                            🧭 Тест Navigator
                        </button>
                    </div>

                    {/* Информация о JSON теле запроса */}
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <h3 className="text-sm font-semibold mb-2">JSON тело запроса:</h3>
                        <pre className="text-xs text-gray-700 overflow-x-auto">
                            {JSON.stringify({
                                "r": "WRvDNvFSNrVOn0wGskCma9ydJ0CYGGt8",
                                "language": "en-US",
                                "app_version": "0.0.30",
                                "platform": "ios"
                            }, null, 2)}
                        </pre>
                        <div className="mt-2 text-xs text-green-600">
                            ✅ Реальное подключение к серверу
                        </div>
                    </div>
                </div>

                {/* Панель отправленных RPC команд */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Отправленные RPC запросы</h2>

                    {sentRpcCommands.length === 0 ? (
                        <div className="text-center py-4 text-gray-500">
                            <p>Пока не отправлено RPC запросов</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {sentRpcCommands.slice(-5).map((command, index) => (
                                <div
                                    key={index}
                                    className={`p-3 rounded-lg border-l-4 ${command.success
                                        ? 'bg-green-50 border-green-500'
                                        : 'bg-red-50 border-red-500'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-semibold text-sm">
                                            {command.success ? '✅' : '❌'} {command.method}
                                        </h3>
                                        <span className="text-xs text-gray-500">
                                            {command.timestamp.toLocaleTimeString()}
                                        </span>
                                    </div>

                                    {command.error && (
                                        <div className="text-xs text-red-600 mb-1">
                                            {command.error.includes('Method not supported')
                                                ? '⚠️ Агент не поддерживает этот метод (нормально для теста)'
                                                : command.error
                                            }
                                        </div>
                                    )}

                                    {Object.keys(command.data).length > 0 && (
                                        <div className="text-xs text-gray-600">
                                            Data: {JSON.stringify(command.data)}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Панель полученных RPC команд */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Полученные RPC запросы</h2>

                    {receivedRpcCommands.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                            <p>Ожидание RPC запросов от агента...</p>
                            <p className="text-sm mt-2">При получении запроса "get-permissions" он будет отображен здесь</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {receivedRpcCommands.map((command, index) => (
                                <div
                                    key={index}
                                    className={`p-4 rounded-lg border-l-4 ${command.method === 'get-permissions'
                                        ? 'bg-green-50 border-green-500'
                                        : 'bg-blue-50 border-blue-500'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-semibold text-lg">
                                            {command.method === 'get-permissions' ? '✅ get-permissions' :
                                                command.method === 'get-location' ? '📍 get-location' : command.method}
                                        </h3>
                                        <span className="text-sm text-gray-500">
                                            {command.timestamp.toLocaleTimeString()}
                                        </span>
                                    </div>

                                    {command.data && (
                                        <div className="bg-white p-2 rounded border">
                                            <h4 className="text-xs font-medium text-gray-600 mb-1">Данные:</h4>
                                            <pre className="text-xs text-gray-700 overflow-x-auto">
                                                {JSON.stringify(command.data, null, 2)}
                                            </pre>
                                        </div>
                                    )}

                                    {command.method === 'get-permissions' && (
                                        <div className="mt-3">
                                            <div className="bg-green-50 border border-green-200 rounded p-3">
                                                <div className="text-sm text-green-800 font-medium mb-1">
                                                    ✅ Ответ автоматически отправлен:
                                                </div>
                                                <pre className="text-xs text-green-700">
                                                    {JSON.stringify(permissions, null, 2)}
                                                </pre>
                                            </div>
                                            <button
                                                onClick={sendPermissionsResponse}
                                                className="mt-2 bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-xs"
                                            >
                                                🔄 Отправить повторно
                                            </button>
                                        </div>
                                    )}

                                    {command.method === 'get-location' && (
                                        <div className="mt-3">
                                            <div className="bg-blue-50 border border-blue-200 rounded p-3">
                                                <div className="text-sm text-blue-800 font-medium mb-1">
                                                    📍 Локация автоматически отправлена:
                                                </div>
                                                <pre className="text-xs text-blue-700">
                                                    {JSON.stringify({
                                                        lat: 40.77784899,
                                                        lng: -74.146540831
                                                    }, null, 2)}
                                                </pre>
                                                <div className="text-xs text-blue-600 mt-1">
                                                    🗽 New York, NY (фиксированные координаты)
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Отображение экрана онбординга */}
                {currentScreen && (
                    <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
                        <h2 className="text-xl font-semibold mb-4">Экран онбординга</h2>
                        <OnboardingPanel
                            screenData={currentScreen}
                            onRpcMethod={handleRpcMethod}
                        />
                    </div>
                )}

                {/* Отладочная информация */}
                {currentScreen && (
                    <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
                        <h2 className="text-xl font-semibold mb-4">Отладочная информация</h2>
                        <pre className="text-xs text-gray-700 overflow-x-auto bg-gray-50 p-3 rounded">
                            {JSON.stringify(currentScreen, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
};