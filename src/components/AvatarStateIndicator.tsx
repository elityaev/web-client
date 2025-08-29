import React from 'react';
import { useOnboardingStore } from '../stores/onboardingStore';

export const AvatarStateIndicator: React.FC = () => {
  const { avatarState } = useOnboardingStore();

  if (!avatarState.isListening) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 animate-pulse">
        <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
        <span className="text-sm font-medium">Агент слушает...</span>
      </div>
    </div>
  );
};
