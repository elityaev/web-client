import React from 'react';
import { OnboardingPanel } from './OnboardingPanel';
import { AvatarStateIndicator } from './AvatarStateIndicator';
import { PremiumControls } from './PremiumControls';
import { InstallIdControls } from './InstallIdControls';
import { RequestPermissionPopup } from './RequestPermissionPopup';
import { PhoneCallSimulation } from './PhoneCallSimulation';
import { AnalyticsWindow } from './AnalyticsWindow';
import { AnalyticsNotification } from './AnalyticsNotification';
import { useOnboardingStore } from '../stores/onboardingStore';

export const MainDashboard: React.FC = () => {
  const {
    currentScreen,
    handleRpcMethod,
    permissionPopupData,
    setPermissionPopupData,
    phoneCallData,
    setPhoneCallData,
    analyticsEvents,
    isAnalyticsWindowOpen,
    showAnalyticsNotification,
    addAnalyticsEvent,
    clearAnalyticsEvents,
    setAnalyticsWindowOpen,
    setShowAnalyticsNotification
  } = useOnboardingStore();

  console.log('🔐 MainDashboard render - permissionPopupData:', permissionPopupData);
  console.log('📞 MainDashboard render - phoneCallData:', phoneCallData);
  console.log('📊 MainDashboard render - analyticsEvents:', analyticsEvents);
  console.log('📊 MainDashboard render - isAnalyticsWindowOpen:', isAnalyticsWindowOpen);

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

  const handleCloseAnalytics = () => {
    console.log('📊 handleCloseAnalytics called - closing analytics window');
    setAnalyticsWindowOpen(false);
  };

  const handleClearAnalytics = () => {
    console.log('📊 handleClearAnalytics called - clearing all analytics events');
    clearAnalyticsEvents();
  };

  const handleCloseAnalyticsNotification = () => {
    console.log('📊 handleCloseAnalyticsNotification called');
    setShowAnalyticsNotification(false);
  };

  const handleOpenAnalyticsFromNotification = () => {
    console.log('📊 handleOpenAnalyticsFromNotification called');
    setAnalyticsWindowOpen(true);
    setShowAnalyticsNotification(false);
  };

  return (
    <div className="container mx-auto p-4">
      <AvatarStateIndicator />
      <PremiumControls />
      <InstallIdControls />

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
        <button
          onClick={() => {
            console.log('📊 Test analytics button clicked');
            const mockAnalyticsData = {
              event: 'user_action',
              action: 'button_click',
              screen: 'main_dashboard',
              timestamp: new Date().toISOString(),
              user_id: 'user_123',
              session_id: 'session_456',
              metadata: {
                button_name: 'test_analytics',
                location: 'main_dashboard'
              }
            };
            addAnalyticsEvent(mockAnalyticsData);
          }}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm"
        >
          📊 Тест Analytics
        </button>
        <button
          onClick={() => {
            console.log('📊 Open analytics window button clicked');
            setAnalyticsWindowOpen(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm"
        >
          📊 Открыть Analytics
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

      {/* Отображение analytics данных */}
      <AnalyticsWindow
        events={analyticsEvents}
        isOpen={isAnalyticsWindowOpen}
        onClose={handleCloseAnalytics}
        onClear={handleClearAnalytics}
      />

      {/* Временный индикатор количества analytics событий */}
      {analyticsEvents.length > 0 && (
        <div className="fixed top-4 left-4 bg-blue-500 text-white p-2 rounded z-40">
          <p>📊 Analytics: {analyticsEvents.length} событий</p>
        </div>
      )}

      {/* Уведомление о новом analytics событии */}
      <AnalyticsNotification
        isVisible={showAnalyticsNotification}
        onClose={handleCloseAnalyticsNotification}
        onOpenWindow={handleOpenAnalyticsFromNotification}
      />
    </div>
  );
};
