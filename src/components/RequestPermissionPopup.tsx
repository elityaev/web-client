import React from 'react';
import { RequestPermissionData, RpcAction } from '../services/onboardingService';
import { Button } from './ui/Button';

interface RequestPermissionPopupProps {
    data: RequestPermissionData;
    onRpcAction: (action: RpcAction) => void;
    onClose: () => void;
}

export const RequestPermissionPopup: React.FC<RequestPermissionPopupProps> = ({ data, onRpcAction, onClose }) => {
    console.log('🔐 RequestPermissionPopup render with data:', data);

    const handleAllowClick = () => {
        if (data.rpc_on_allow) {
            onRpcAction(data.rpc_on_allow);
        }
    };

    const handleDenyClick = () => {
        if (data.rpc_on_deny) {
            onRpcAction(data.rpc_on_deny);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4">
                <div className="text-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                        Запрос разрешения
                    </h2>
                    <p className="text-gray-600">
                        Запрашивается разрешение типа: <span className="font-semibold">{data.type}</span>
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    {/* Кнопки RPC действий, если они есть */}
                    {data.rpc_on_allow && (
                        <Button
                            onClick={handleAllowClick}
                            variant="primary"
                            className="w-full"
                        >
                            Разрешить
                        </Button>
                    )}

                    {data.rpc_on_deny && (
                        <Button
                            onClick={handleDenyClick}
                            variant="secondary"
                            className="w-full"
                        >
                            Отклонить
                        </Button>
                    )}

                    {/* Если нет RPC кнопок, показываем базовые кнопки */}
                    {!data.rpc_on_allow && !data.rpc_on_deny && (
                        <>
                            <Button
                                onClick={onClose}
                                variant="primary"
                                className="w-full"
                            >
                                Разрешить
                            </Button>
                            <Button
                                onClick={onClose}
                                variant="secondary"
                                className="w-full"
                            >
                                Отклонить
                            </Button>
                        </>
                    )}

                    {/* Кнопка закрытия всегда присутствует */}
                    <Button
                        onClick={onClose}
                        variant="outline"
                        className="w-full"
                    >
                        Закрыть
                    </Button>
                </div>
            </div>
        </div>
    );
};
