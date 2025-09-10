import React from 'react';
import { ChooseMusicAppData, RpcAction } from '../services/onboardingService';

interface ChooseMusicAppScreenProps {
    data: ChooseMusicAppData;
    onRpcAction: (action: RpcAction) => void;
}

export const ChooseMusicAppScreen: React.FC<ChooseMusicAppScreenProps> = ({ data, onRpcAction }) => {
    const handleAppClick = (app: { icon_url: string; name: string; rpc_on_click: { name: string; payload: any; }; }) => {
        console.log('🎵 Music app clicked:', app);
        console.log('🎵 Original payload type:', typeof app.rpc_on_click.payload);
        console.log('🎵 Original payload value:', app.rpc_on_click.payload);

        const jsonPayload = JSON.stringify(app.rpc_on_click.payload);
        console.log('🎵 JSON.stringify result:', jsonPayload);
        console.log('🎵 JSON.stringify result length:', jsonPayload.length);

        onRpcAction({
            name: app.rpc_on_click.name,
            payload: jsonPayload
        });
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">🎵 Choose Music App</h2>

            {/* Main Text */}
            <div className="text-center mb-8">
                <p className="text-xl text-gray-700 font-medium">{data.text}</p>
            </div>

            {/* Music Apps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.apps.map((app, index) => (
                    <button
                        key={index}
                        onClick={() => handleAppClick(app)}
                        className="group bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 
                     text-white p-6 rounded-xl font-medium text-lg transition-all duration-300 
                     transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                        <div className="flex flex-col items-center space-y-4">
                            {/* App Icon */}
                            {app.icon_url ? (
                                <img
                                    src={app.icon_url}
                                    alt={app.name}
                                    className="w-16 h-16 object-contain rounded-lg"
                                    onError={(e) => {
                                        // Fallback to music emoji if image fails to load
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        const emoji = document.createElement('div');
                                        emoji.className = 'text-5xl';
                                        emoji.textContent = '🎵';
                                        target.parentNode?.appendChild(emoji);
                                    }}
                                />
                            ) : (
                                <div className="text-5xl">🎵</div>
                            )}

                            {/* App Name */}
                            <span className="group-hover:text-yellow-200 transition-colors font-semibold">
                                {app.name}
                            </span>
                        </div>
                    </button>
                ))}
            </div>

            {/* Additional Info */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-sm text-gray-600">
                    Select a music app to continue
                </p>
            </div>
        </div>
    );
};
