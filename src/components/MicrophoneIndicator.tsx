import React from 'react';
import { Mic, MicOff } from 'lucide-react';

interface MicrophoneIndicatorProps {
    useMicrophone: boolean;
}

export const MicrophoneIndicator: React.FC<MicrophoneIndicatorProps> = ({ useMicrophone }) => {
    return (
        <div className="flex items-center justify-center mb-4">
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${useMicrophone
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                {useMicrophone ? (
                    <Mic className="h-5 w-5" />
                ) : (
                    <MicOff className="h-5 w-5" />
                )}
                <span className="text-sm font-medium">
                    {useMicrophone ? 'Микрофон включен' : 'Микрофон выключен'}
                </span>
            </div>
        </div>
    );
};

