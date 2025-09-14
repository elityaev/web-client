import React from 'react';
import { UniversalScreenData, RpcAction } from '../services/onboardingService';
import { MicrophoneIndicator } from './MicrophoneIndicator';
import { Button } from './ui/Button';

interface UniversalScreenProps {
    data: UniversalScreenData;
    useMicrophone: boolean;
    onRpcAction?: (action: RpcAction) => void;
}

export const UniversalScreen: React.FC<UniversalScreenProps> = ({ data, useMicrophone, onRpcAction }) => {
    const handleButtonClick = (rpcAction: RpcAction) => {
        console.log('🎯 Universal screen button clicked:', rpcAction);
        if (onRpcAction) {
            onRpcAction(rpcAction);
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
            <MicrophoneIndicator useMicrophone={useMicrophone} />

            <div className="text-center">
                <h1 className="text-xl font-semibold text-gray-800 mb-2">
                    {data.title}
                </h1>

                {data.subtitle && (
                    <p className="text-sm text-gray-600 mb-6">
                        {data.subtitle}
                    </p>
                )}

                {data.image_url && (
                    <div className="mb-6">
                        <img
                            src={data.image_url}
                            alt="Universal screen image"
                            className="w-full max-w-sm mx-auto rounded-lg shadow-md"
                            onError={(e) => {
                                // Fallback if image fails to load
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    </div>
                )}

                {/* Buttons */}
                {data.buttons && data.buttons.length > 0 && (
                    <div className="flex flex-col gap-3 mt-6">
                        {data.buttons.map((button, index) => (
                            <Button
                                key={index}
                                onClick={() => handleButtonClick(button.rpc_on_click)}
                                variant={button.primary ? "primary" : "secondary"}
                                className="w-full"
                            >
                                {button.text}
                            </Button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};