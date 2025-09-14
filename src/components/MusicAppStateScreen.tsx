import React from 'react';
import { MusicAppStateData, RpcAction } from '../services/onboardingService';

interface MusicAppStateScreenProps {
    data: MusicAppStateData;
    onRpcAction: (action: RpcAction) => void;
}

export const MusicAppStateScreen: React.FC<MusicAppStateScreenProps> = ({ data, onRpcAction }) => {
    const handleButtonClick = (button: any) => {
        console.log('🎵 Music app state button clicked:', button);
        console.log('🎵 RPC action:', button.rpc_on_click);

        const jsonPayload = JSON.stringify(button.rpc_on_click.payload);
        console.log('🎵 JSON payload to send:', jsonPayload);

        onRpcAction({
            name: button.rpc_on_click.name,
            payload: jsonPayload
        });
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">🎵 Music App State</h2>

            {/* Main Text */}
            <div className="text-center mb-8">
                <p className="text-xl text-gray-700 font-medium">{data.text}</p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-4 items-center">
                {data.buttons.map((button, index) => (
                    <button
                        key={index}
                        onClick={() => handleButtonClick(button)}
                        className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105 focus:ring-4 focus:ring-blue-300"
                    >
                        {button.icon_url && (
                            <img
                                src={button.icon_url}
                                alt="App icon"
                                className="w-8 h-8 rounded-lg"
                            />
                        )}
                        <span className="text-lg">{button.name}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};
