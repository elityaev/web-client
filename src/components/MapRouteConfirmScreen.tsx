import React from 'react';
import { RpcAction } from '../services/onboardingService';

interface Waypoint {
    label: string;
    name: string;
    location: {
        lat: number;
        lng: number;
    };
}

interface Location {
    lat: number;
    lng: number;
}

interface MapRouteConfirmData {
    waypoints: Waypoint[];
    user_location: Location;
    rpc_on_change_click: {
        name: string;
        payload?: any;
    };
    rpc_on_go_click: {
        name: string;
        payload?: any;
    };
}

interface MapRouteConfirmScreenProps {
    data: MapRouteConfirmData;
    onRpcAction: (action: RpcAction) => void;
}

export const MapRouteConfirmScreen: React.FC<MapRouteConfirmScreenProps> = ({ data, onRpcAction }) => {
    console.log('🎯 MapRouteConfirmScreen data:', data);
    console.log('🎯 rpc_on_go_click:', data.rpc_on_go_click);

    const handleChangeClick = () => {
        console.log('🎯 MapRouteConfirmScreen change route clicked');
        onRpcAction({
            name: data.rpc_on_change_click.name,
            payload: data.rpc_on_change_click.payload ? JSON.stringify(data.rpc_on_change_click.payload) : undefined
        });
    };

    const handleGoClick = () => {
        console.log('🎯 MapRouteConfirmScreen go clicked');
        console.log('🎯 Using RPC name:', data.rpc_on_go_click.name);

        // Исправляем неправильное имя RPC метода если нужно
        let rpcName = data.rpc_on_go_click.name;
        if (rpcName === 'rpc-on-go-click') {
            rpcName = 'go-click';
            console.log('🎯 Fixed RPC name from rpc-on-go-click to go-click');
        }

        onRpcAction({
            name: rpcName,
            payload: data.rpc_on_go_click.payload ? JSON.stringify(data.rpc_on_go_click.payload) : undefined
        });
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">🗺️ Route Confirmation</h2>

            {/* Route Display */}
            <div className="mb-6">
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h3 className="text-lg font-semibold mb-3 text-gray-800">Route Overview</h3>
                    <div className="space-y-3">
                        {data.waypoints.map((waypoint, index) => (
                            <div key={index} className="flex items-center space-x-3 p-3 bg-white rounded border">
                                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
                                    {waypoint.label}
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium text-gray-900">{waypoint.name}</div>
                                    <div className="text-sm text-gray-500">
                                        {waypoint.location.lat.toFixed(6)}, {waypoint.location.lng.toFixed(6)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* User Location */}
                <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-blue-800 mb-2">Your Location</h4>
                    <div className="text-sm text-blue-600">
                        {data.user_location.lat.toFixed(6)}, {data.user_location.lng.toFixed(6)}
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
                <button
                    onClick={handleChangeClick}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200"
                >
                    🔄 Change Route
                </button>
                <button
                    onClick={handleGoClick}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200"
                >
                    🚀 Go
                </button>
            </div>

            {/* Additional Info */}
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg text-center">
                <p className="text-sm text-yellow-700">
                    Review your route before starting navigation
                </p>
            </div>
        </div>
    );
};
