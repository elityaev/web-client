import React from 'react';
import { OnboardingPanel } from './OnboardingPanel';
import { AvatarStateIndicator } from './AvatarStateIndicator';
import { PremiumControls } from './PremiumControls';
import { useOnboardingStore } from '../stores/onboardingStore';

export const MainDashboard: React.FC = () => {
  const { currentScreen, handleRpcMethod } = useOnboardingStore();

  return (
    <div className="container mx-auto p-4">
      <AvatarStateIndicator />
      <PremiumControls />
      {currentScreen && (
        <OnboardingPanel
          screenData={currentScreen}
          onRpcMethod={handleRpcMethod}
        />
      )}
    </div>
  );
};
