import React from 'react';
import { AddWaypointData, RpcAction, WaypointResult } from '../services/onboardingService';

interface AddWaypointScreenProps {
    data: AddWaypointData;
    onRpcAction: (action: RpcAction) => void;
}

interface WaypointCardProps {
    waypoint: WaypointResult;
    onRpcAction: (action: RpcAction) => void;
    type: 'result' | 'final';
}

const WaypointCard: React.FC<WaypointCardProps> = ({ waypoint, onRpcAction, type }) => {
    // Debug: посмотрим что именно в waypoint
    React.useEffect(() => {
        console.log('🔍 DEBUG waypoint RPC actions:', {
            rpc_on_card_click: waypoint.rpc_on_card_click,
            rpc_on_pin_click: waypoint.rpc_on_pin_click,
            rpc_on_go_click: waypoint.rpc_on_go_click
        });
    }, [waypoint]);

    const handleRpcAction = (action: RpcAction) => {
        console.log('🎯 Sending waypoint RPC action:', action);
        onRpcAction(action);
    };

    return (
        <div className={`border rounded-lg p-4 transition-all duration-200 ${waypoint.selected
            ? 'border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-200'
            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
            }`}>
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${waypoint.selected
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-200 text-gray-700'
                        }`}>
                        {waypoint.label}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h3 className={`font-semibold ${waypoint.selected ? 'text-blue-900' : 'text-gray-900'
                                }`}>
                                {waypoint.title}
                            </h3>
                            {waypoint.selected && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    Selected
                                </span>
                            )}
                            {waypoint.extended && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Extended
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-600">{waypoint.subtitle}</p>
                    </div>
                </div>
                <div className="text-xs text-gray-500">
                    {type === 'result' ? 'Result' : 'Final'} #{waypoint.number}
                </div>
            </div>

            {/* Basic info - always show when not extended */}
            {!waypoint.extended && waypoint.info && waypoint.info.length > 0 && (
                <div className="mb-3">
                    <div className="text-xs text-gray-500 mb-1">Basic Info:</div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                        {waypoint.info.slice(0, 1).map((info, index) => (
                            <div key={index} className="flex items-center space-x-1">
                                <span>📍</span>
                                <span className="truncate">{info.text}</span>
                            </div>
                        ))}
                        {waypoint.info.length > 1 && (
                            <span className="text-xs text-blue-600 cursor-pointer">+{waypoint.info.length - 1} more</span>
                        )}
                    </div>
                </div>
            )}

            {/* Extended info - show when extended=true */}
            {waypoint.extended && waypoint.info && waypoint.info.length > 0 && (
                <div className="mb-3 bg-gray-50 rounded-lg p-3 border-l-4 border-green-400">
                    <div className="text-xs font-medium text-green-700 mb-2 flex items-center gap-1">
                        📋 Extended Information
                    </div>
                    <div className="space-y-2">
                        {waypoint.info.map((info, index) => {
                            // Определяем тип информации по icon_url
                            const isTimeInfo = info.icon_url?.includes('clock');
                            const isLocationInfo = info.icon_url?.includes('pin');

                            return (
                                <div key={index} className="flex items-start space-x-2 text-sm">
                                    <span className="flex-shrink-0">
                                        {isTimeInfo ? '🕒' : isLocationInfo ? '📍' : '📋'}
                                    </span>
                                    <div className="flex-1">
                                        <div className={`${isTimeInfo ? 'text-orange-700 font-medium' :
                                            isLocationInfo ? 'text-blue-700' : 'text-gray-700'
                                            }`}>
                                            {isTimeInfo && <span className="text-xs text-orange-600 block">Working Hours:</span>}
                                            {isLocationInfo && <span className="text-xs text-blue-600 block">Address:</span>}
                                            {info.text}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Phone - show when extended */}
            {waypoint.extended && waypoint.phone && (
                <div className="flex items-center space-x-2 text-sm text-gray-700 mb-3 bg-gray-50 rounded p-2">
                    <span>📞</span>
                    <span className="font-medium">Phone:</span>
                    <a href={`tel:${waypoint.phone}`} className="text-blue-600 hover:text-blue-800">
                        {waypoint.phone}
                    </a>
                </div>
            )}

            {/* Location */}
            <div className="text-xs text-gray-500 mb-3">
                📍 {waypoint.location.lat.toFixed(6)}, {waypoint.location.lng.toFixed(6)}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 flex-wrap">
                {waypoint.rpc_on_card_click && (
                    <button
                        onClick={() => handleRpcAction(waypoint.rpc_on_card_click!)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium"
                    >
                        📋 Card
                    </button>
                )}

                {waypoint.rpc_on_pin_click && (
                    <button
                        onClick={() => handleRpcAction(waypoint.rpc_on_pin_click!)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium"
                    >
                        📍 Pin
                    </button>
                )}

                {waypoint.rpc_on_go_click && (
                    <button
                        onClick={() => handleRpcAction(waypoint.rpc_on_go_click!)}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-sm font-medium"
                    >
                        🚗 Go
                    </button>
                )}
            </div>
        </div>
    );
};

export const AddWaypointScreen: React.FC<AddWaypointScreenProps> = ({ data, onRpcAction }) => {
    const handleRpcAction = (action: RpcAction) => {
        console.log('🎯 Processing RPC action:', action);
        onRpcAction(action);
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
            <h2 className="text-xl font-semibold mb-4 text-center">Add Waypoint to Route</h2>

            {/* User Location */}
            <div className="bg-gray-50 rounded-lg p-3 mb-6">
                <h3 className="text-sm font-semibold mb-2">👤 Your Location:</h3>
                <div className="text-sm text-gray-700">
                    📍 {data.user_location.lat.toFixed(6)}, {data.user_location.lng.toFixed(6)}
                </div>
            </div>

            {/* Map Interaction */}
            {data.rpc_on_map_interaction && (
                <div className="mb-6 text-center">
                    <button
                        onClick={() => handleRpcAction(data.rpc_on_map_interaction!)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium"
                    >
                        🗺️ Map Interaction
                    </button>
                </div>
            )}

            {/* Results */}
            {data.results && data.results.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">🔍 Search Results ({data.results.length})</h3>
                    <div className="space-y-4">
                        {data.results.map((result, index) => (
                            <WaypointCard
                                key={`result-${index}`}
                                waypoint={result}
                                onRpcAction={handleRpcAction}
                                type="result"
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Final Points */}
            {data.final_points && data.final_points.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold mb-3">🎯 Final Points ({data.final_points.length})</h3>
                    <div className="space-y-4">
                        {data.final_points.map((point, index) => (
                            <WaypointCard
                                key={`final-${index}`}
                                waypoint={point}
                                onRpcAction={handleRpcAction}
                                type="final"
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};