import React from 'react';
import { useInstallIdStore } from '../stores/installIdStore';
import { Card } from './ui/Card';

export const InstallIdControls: React.FC = () => {
    const { enabled, value, setEnabled, setValue } = useInstallIdStore();

    return (
        <Card className="p-4">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Install ID</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={enabled}
                            onChange={(e) => setEnabled(e.target.checked)}
                            className="sr-only"
                        />
                        <div className={`w-11 h-6 rounded-full transition-colors ${enabled ? 'bg-blue-600' : 'bg-gray-200'
                            }`}>
                            <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0'
                                } mt-0.5 ml-0.5`} />
                        </div>
                    </label>
                </div>

                <div className="text-sm text-gray-600">
                    Включить передачу install_id в запросе на получение LiveKit токена
                </div>

                {enabled && (
                    <div className="space-y-2">
                        <label htmlFor="install-id-input" className="block text-sm font-medium text-gray-700">
                            Значение Install ID
                        </label>
                        <input
                            id="install-id-input"
                            type="text"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder="Введите install_id..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        {value.trim() && (
                            <div className="text-xs text-green-600">
                                ✓ Install ID будет передан в запросе: "{value.trim()}"
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
};
