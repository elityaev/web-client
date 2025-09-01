import React from 'react';
import { OnboardingScreenData, RpcAction, RequestPermissionsData, AddWaypointData, PaywallData, MainScreenData, MapRouteConfirmData } from '../services/onboardingService';
import { Button } from './ui/Button';
import { RequestPermissionsScreen } from './RequestPermissionsScreen';
import { AddWaypointScreen } from './AddWaypointScreen';
import { PaywallScreen } from './PaywallScreen';
import { NavigatorScreen } from './NavigatorScreen';
import { MainScreen } from './MainScreen';
import { MapRouteConfirmScreen } from './MapRouteConfirmScreen';

interface OnboardingPanelProps {
    screenData: OnboardingScreenData;
    onRpcMethod: (method: string, data?: any) => void;
}

export const OnboardingPanel: React.FC<OnboardingPanelProps> = ({ screenData, onRpcMethod }) => {
    const handleRpcAction = (action: RpcAction) => {
        console.log('🎯 OnboardingPanel handleRpcAction:', action);
        console.log('🎯 Method name from action.name:', action.name);
        console.log('🎯 Raw payload from action.payload:', action.payload);

        // Передаем payload как есть, без парсинга JSON
        const payload = action.payload || undefined;

        console.log('🎯 Final payload to send:', payload);
        console.log('🎯 Calling onRpcMethod with:', action.name, payload);
        onRpcMethod(action.name, payload);
    };

    // Handle add_waypoint_to_route format
    if (screenData.screen_type === 'add_waypoint_to_route' && screenData.data) {
        const data = screenData.data as AddWaypointData;
        if ('results' in data || 'final_points' in data) {
            return <AddWaypointScreen data={data} onRpcAction={handleRpcAction} />;
        }
    }

    // Handle paywall format
    if (screenData.screen_type === 'paywall' && screenData.data) {
        const data = screenData.data as PaywallData;
        if ('placement' in data) {
            return <PaywallScreen data={data} onRpcAction={handleRpcAction} />;
        }
    }

    // Handle navigator format
    if (screenData.screen_type === 'navigator') {
        return <NavigatorScreen data={screenData.data} />;
    }

    // Handle main format
    if (screenData.screen_type === 'main' && screenData.data) {
        const data = screenData.data as MainScreenData;
        if ('text' in data && 'buttons' in data) {
            return <MainScreen data={data} onRpcAction={handleRpcAction} />;
        }
    }

    // Handle map_route_confirm format
    if (screenData.screen_type === 'map_route_confirm' && screenData.data) {
        const data = screenData.data as MapRouteConfirmData;
        if ('waypoints' in data && 'user_location' in data && 'rpc_on_change_click' in data && 'rpc_on_go_click' in data) {
            return <MapRouteConfirmScreen data={data} onRpcAction={handleRpcAction} />;
        }
    }

    // Handle new request_permissions format
    if (screenData.screen_type === 'request_permissions' && screenData.data) {
        // Check if it's the new format with permissions array
        const data = screenData.data as RequestPermissionsData;
        if ('permissions' in data && Array.isArray(data.permissions)) {
            return <RequestPermissionsScreen data={data} onRpcAction={handleRpcAction} />;
        }
    }

    // Handle legacy request-permissions format
    if (screenData.screen_type === 'request-permissions' && screenData.data) {
        const data = screenData.data as any;
        const { text, buttons } = data;

        return (
            <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-lg">
                <p className="text-lg text-center mb-6">{text}</p>
                <div className="flex gap-4">
                    {buttons.map((button: any, index: number) => (
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
