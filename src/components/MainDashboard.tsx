import React from 'react';
import { OnboardingPanel } from './OnboardingPanel';
import { useOnboardingStore } from '../stores/onboardingStore';

export const MainDashboard: React.FC = () => {
  const { currentScreen, handleRpcMethod } = useOnboardingStore();

  return (
    <div className="container mx-auto p-4">
      {currentScreen && (
        <OnboardingPanel
          screenData={currentScreen}
          onRpcMethod={handleRpcMethod}
        />
      )}
    </div>
  );
};
