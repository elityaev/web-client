import React, { useEffect } from 'react';

interface PhoneCallSimulationProps {
    phoneNumber: string;
    onEndCall: () => void;
}

export const PhoneCallSimulation: React.FC<PhoneCallSimulationProps> = ({ phoneNumber, onEndCall }) => {
    console.log('📞 PhoneCallSimulation rendered with phoneNumber:', phoneNumber);

    useEffect(() => {
        console.log('📞 PhoneCallSimulation useEffect - setting 5 second timer');
        // Автоматически завершаем звонок через 5 секунд
        const timer = setTimeout(() => {
            console.log('📞 PhoneCallSimulation timer expired - calling onEndCall');
            onEndCall();
        }, 5000);

        return () => {
            console.log('📞 PhoneCallSimulation cleanup - clearing timer');
            clearTimeout(timer);
        };
    }, [onEndCall]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-sm w-full mx-4 text-center">
                <div className="mb-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">📞</span>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Звонок</h2>
                    <p className="text-lg text-gray-700 font-mono">{phoneNumber}</p>
                </div>

                <div className="mb-6">
                    <div className="flex justify-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Симуляция звонка...</p>
                </div>

                <button
                    onClick={onEndCall}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-medium"
                >
                    Завершить звонок
                </button>
            </div>
        </div>
    );
};
