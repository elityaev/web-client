import React from 'react';
import { useAuthStore } from '../stores/authStore';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

export const PremiumControls: React.FC = () => {
    const { premium, setPremium } = useAuthStore();

    const handleTogglePremium = () => {
        setPremium(!premium);
        console.log('🎯 Premium status changed to:', !premium);
    };

    return (
        <Card className="p-4 mb-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${premium ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <span className="font-medium text-gray-700">
                        Premium статус: {premium ? 'Активен' : 'Неактивен'}
                    </span>
                </div>
                <Button
                    variant={premium ? 'danger' : 'primary'}
                    size="sm"
                    onClick={handleTogglePremium}
                >
                    {premium ? 'Отключить Premium' : 'Включить Premium'}
                </Button>
            </div>
            <div className="mt-2 text-sm text-gray-500">
                Для тестирования RPC метода get-premium
            </div>
        </Card>
    );
};


