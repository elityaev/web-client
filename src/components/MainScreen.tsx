import React from 'react';
import { RpcAction } from '../services/onboardingService';
import { TracingToggle } from './TracingToggle';

interface MainButton {
    text: string;
    icon_url?: string;
    rpc_on_click: {
        name: string;
        payload?: any;
    };
}

interface MainScreenData {
    text: string;
    buttons: MainButton[];
}

interface MainScreenProps {
    data: MainScreenData;
    onRpcAction: (action: RpcAction) => void;
}

export const MainScreen: React.FC<MainScreenProps> = ({ data, onRpcAction }) => {
    const handleButtonClick = (button: MainButton) => {
        console.log('🎯 MainScreen button clicked:', button);
        onRpcAction({
            name: button.rpc_on_click.name,
            payload: button.rpc_on_click.payload
        });
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">🤖 Virtual Assistant</h2>

            {/* Tracing Toggle */}
            <div className="mb-6">
                <TracingToggle />
            </div>

            {/* Main Text */}
            <div className="text-center mb-8">
                <p className="text-xl text-gray-700 font-medium">{data.text}</p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.buttons.map((button, index) => (
                    <button
                        key={index}
                        onClick={() => handleButtonClick(button)}
                        className="group bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 
                     text-white p-6 rounded-xl font-medium text-lg transition-all duration-300 
                     transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                        <div className="flex flex-col items-center space-y-3">
                            {/* Icon */}
                            {button.icon_url ? (
                                <img
                                    src={button.icon_url}
                                    alt={button.text}
                                    className="w-12 h-12 object-contain"
                                    onError={(e) => {
                                        // Fallback to emoji if image fails to load
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        const emoji = document.createElement('div');
                                        emoji.className = 'text-4xl';
                                        emoji.textContent = button.text.toLowerCase().includes('navigate') ? '🧭' : '🎵';
                                        target.parentNode?.appendChild(emoji);
                                    }}
                                />
                            ) : (
                                <div className="text-4xl">
                                    {button.text.toLowerCase().includes('navigate') ? '🧭' :
                                        button.text.toLowerCase().includes('music') ? '🎵' : '🔘'}
                                </div>
                            )}

                            {/* Button Text */}
                            <span className="group-hover:text-yellow-200 transition-colors">
                                {button.text}
                            </span>
                        </div>
                    </button>
                ))}
            </div>

            {/* Additional Info */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-sm text-gray-600">
                    Choose an action to get started with your virtual assistant
                </p>
            </div>
        </div>
    );
};