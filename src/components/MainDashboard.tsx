import React from 'react';
import { OnboardingPanel } from './OnboardingPanel';
import { AvatarStateIndicator } from './AvatarStateIndicator';
import { PremiumControls } from './PremiumControls';
import { RequestPermissionPopup } from './RequestPermissionPopup';
import { PhoneCallSimulation } from './PhoneCallSimulation';
import { useOnboardingStore } from '../stores/onboardingStore';

export const MainDashboard: React.FC = () => {
  const { currentScreen, handleRpcMethod, permissionPopupData, setPermissionPopupData, phoneCallData, setPhoneCallData } = useOnboardingStore();

  console.log('🔐 MainDashboard render - permissionPopupData:', permissionPopupData);
  console.log('📞 MainDashboard render - phoneCallData:', phoneCallData);

  const handleRpcAction = (action: any) => {
    console.log('🎯 MainDashboard handleRpcAction:', action);
    handleRpcMethod(action.name, action.payload);
  };

  const handleClosePermissionPopup = () => {
    setPermissionPopupData(null);
  };

  const handleEndPhoneCall = () => {
    console.log('📞 handleEndPhoneCall called - clearing phone call data');
    setPhoneCallData(null);
  };

  return (
    <div className="container mx-auto p-4">
      <AvatarStateIndicator />
      <PremiumControls />

      {/* Временная кнопка для тестирования звонка */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => {
            console.log('📞 Test button clicked');
            setPhoneCallData({ phoneNumber: '+1 212-736-3100', isActive: true });
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
        >
          📞 Тест звонка
        </button>
        <button
          onClick={() => {
            console.log('📞 Clear button clicked');
            setPhoneCallData(null);
          }}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
        >
          ❌ Очистить
        </button>
        <div className="text-sm text-gray-600 flex items-center">
          Состояние: {phoneCallData ? `Активен (${phoneCallData.phoneNumber})` : 'Неактивен'}
        </div>
      </div>
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

      {/* Симуляция звонка - показывается поверх любого контента */}
      {phoneCallData && (
        <PhoneCallSimulation
          phoneNumber={phoneCallData.phoneNumber || '+1 212-736-3100'}
          onEndCall={handleEndPhoneCall}
        />
      )}

      {/* Временный тест для проверки рендеринга */}
      {phoneCallData && (
        <div className="fixed top-4 right-4 bg-red-500 text-white p-4 rounded z-50">
          <p>DEBUG: phoneCallData exists!</p>
          <p>Phone: {phoneCallData.phoneNumber}</p>
          <p>Active: {phoneCallData.isActive ? 'Yes' : 'No'}</p>
        </div>
      )}
    </div>
  );
};
