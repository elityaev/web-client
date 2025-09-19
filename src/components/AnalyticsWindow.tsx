import React from 'react';

interface AnalyticsEvent {
    payload: any;
    timestamp: Date;
    id: string;
}

interface AnalyticsWindowProps {
    events: AnalyticsEvent[];
    isOpen: boolean;
    onClose: () => void;
    onClear: () => void;
}

export const AnalyticsWindow: React.FC<AnalyticsWindowProps> = ({ events, isOpen, onClose, onClear }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">📊 Analytics Events</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={onClear}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                        >
                            Очистить
                        </button>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 text-2xl"
                        >
                            ×
                        </button>
                    </div>
                </div>

                <div className="mb-4">
                    <p className="text-sm text-gray-600">
                        <strong>Всего событий:</strong> {events.length}
                    </p>
                </div>

                {events.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p>Нет analytics событий</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {events.map((event, index) => (
                            <div key={event.id} className="border rounded-lg p-4 bg-gray-50">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-sm font-semibold text-gray-700">
                                        Событие #{index + 1}
                                    </h3>
                                    <span className="text-xs text-gray-500">
                                        {event.timestamp.toLocaleString()}
                                    </span>
                                </div>

                                <div className="bg-white rounded p-3">
                                    <h4 className="text-xs font-semibold text-gray-600 mb-2">Payload:</h4>
                                    <pre className="text-xs text-gray-800 overflow-x-auto whitespace-pre-wrap">
                                        {JSON.stringify(event.payload, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-4 flex justify-end">
                    <button
                        onClick={onClose}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium"
                    >
                        Закрыть
                    </button>
                </div>
            </div>
        </div>
    );
};

