import React from 'react';
import { OnboardingPanel } from './OnboardingPanel';
import { AvatarStateIndicator } from './AvatarStateIndicator';
import { PremiumControls } from './PremiumControls';
import { RequestPermissionPopup } from './RequestPermissionPopup';
import { useOnboardingStore } from '../stores/onboardingStore';

export const MainDashboard: React.FC = () => {
  const { currentScreen, handleRpcMethod, permissionPopupData, setPermissionPopupData } = useOnboardingStore();

  console.log('🔐 MainDashboard render - permissionPopupData:', permissionPopupData);

  const handleRpcAction = (action: any) => {
    console.log('🎯 MainDashboard handleRpcAction:', action);
    handleRpcMethod(action.name, action.payload);
  };

  const handleClosePermissionPopup = () => {
    setPermissionPopupData(null);
  };

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

      {/* Попап для запроса разрешений - показывается поверх любого контента */}
      {permissionPopupData && (
        <RequestPermissionPopup
          data={permissionPopupData}
          onRpcAction={handleRpcAction}
          onClose={handleClosePermissionPopup}
        />
      )}
    </div>
  );
};
