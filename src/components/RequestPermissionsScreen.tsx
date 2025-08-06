import React from 'react';
import { RequestPermissionsData, RpcAction } from '../services/onboardingService';

interface RequestPermissionsScreenProps {
    data: RequestPermissionsData;
    onRpcAction: (action: RpcAction) => void;
}

export const RequestPermissionsScreen: React.FC<RequestPermissionsScreenProps> = ({
    data,
    onRpcAction
}) => {
    const handleRpcAction = (action: RpcAction) => {
        console.log('🎯 Sending RPC action:', action);
        onRpcAction(action);
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
            <h2 className="text-xl font-semibold mb-4 text-center">Request Permissions</h2>

            {/* Main text */}
            <p className="text-gray-700 text-center mb-6">{data.text}</p>

            {/* Permissions list */}
            <div className="space-y-4 mb-6">
                {data.permissions.map((permission, index) => (
                    <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                            {/* Icon */}
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                {permission.type === 'microphone' && '🎤'}
                                {permission.type === 'location' && '📍'}
                                {permission.type === 'camera' && '📷'}
                                {permission.type === 'notifications' && '🔔'}
                            </div>

                            {/* Permission info */}
                            <div className="flex-1">
                                <h3 className="font-medium text-gray-900">{permission.title}</h3>
                                <p className="text-sm text-gray-600">{permission.subtitle}</p>

                                {/* Action buttons */}
                                <div className="flex gap-2 mt-3">
                                    {permission.rpc_on_allow && (
                                        <button
                                            onClick={() => handleRpcAction(permission.rpc_on_allow!)}
                                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium"
                                        >
                                            Allow
                                        </button>
                                    )}

                                    {permission.rpc_on_deny && (
                                        <button
                                            onClick={() => handleRpcAction(permission.rpc_on_deny!)}
                                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium"
                                        >
                                            Deny
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom buttons */}
            {data.buttons && data.buttons.length > 0 && (
                <div className="flex gap-3 justify-center">
                    {data.buttons.map((button, index) => (
                        <button
                            key={index}
                            onClick={() => button.rpc_on_click && handleRpcAction(button.rpc_on_click)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
                        >
                            {button.text}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};