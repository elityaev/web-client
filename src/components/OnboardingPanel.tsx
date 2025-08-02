import React from 'react';
import { OnboardingScreenData } from '../services/onboardingService';
import { useOnboardingStore } from '../stores/onboardingStore';
import { Button } from './ui/Button';

interface OnboardingPanelProps {
  screenData: OnboardingScreenData;
  onRpcMethod: (method: string, data?: any) => void;
}

export const OnboardingPanel: React.FC<OnboardingPanelProps> = ({ screenData, onRpcMethod }) => {
  if (screenData.screen_type === 'request-permissions' && screenData.data) {
    const { text, buttons, rpc_on_deny } = screenData.data;

    return (
      <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-lg">
        <p className="text-lg text-center mb-6">{text}</p>
        <div className="flex gap-4">
          {buttons.map((button, index) => (
            <Button
              key={index}
              onClick={() => onRpcMethod(button.rpc_on_click)}
              variant="primary"
            >
              {button.text}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return null; // Для других типов экранов
};
