import React, { useEffect, useState } from 'react';

interface AnalyticsNotificationProps {
    isVisible: boolean;
    onClose: () => void;
    onOpenWindow: () => void;
}

export const AnalyticsNotification: React.FC<AnalyticsNotificationProps> = ({
    isVisible,
    onClose,
    onOpenWindow
}) => {
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (isVisible) {
            setIsAnimating(true);
            // Автоматически скрываем уведомление через 5 секунд
            const timer = setTimeout(() => {
                onClose();
            }, 5000);

            return () => clearTimeout(timer);
        } else {
            setIsAnimating(false);
        }
    }, [isVisible, onClose]);

    if (!isVisible) return null;

    return (
        <div className={`fixed top-4 right-4 bg-purple-600 text-white p-4 rounded-lg shadow-lg z-50 transition-all duration-300 ${isAnimating ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
            }`}>
            <div className="flex items-center space-x-3">
                <div className="text-2xl">📊</div>
                <div>
                    <p className="font-semibold">Новое analytics событие</p>
                    <p className="text-sm opacity-90">Получены новые данные аналитики</p>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={onOpenWindow}
                        className="bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded text-sm font-medium"
                    >
                        Открыть
                    </button>
                    <button
                        onClick={onClose}
                        className="text-white hover:text-gray-200 text-lg"
                    >
                        ×
                    </button>
                </div>
            </div>
        </div>
    );
};

