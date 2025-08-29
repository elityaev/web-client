import React from 'react';
import { OnboardingPanel } from './OnboardingPanel';
import { AvatarStateIndicator } from './AvatarStateIndicator';
import { useOnboardingStore } from '../stores/onboardingStore';

export const MainDashboard: React.FC = () => {
  const { currentScreen, handleRpcMethod } = useOnboardingStore();

  return (
    <div className="container mx-auto p-4">
      <AvatarStateIndicator />
      {currentScreen && (
        <OnboardingPanel
          screenData={currentScreen}
          onRpcMethod={handleRpcMethod}
        />
      )}
    </div>
  );
};
