import React from 'react';
import { useTracingStore } from '../stores/tracingStore';

export const TracingToggle: React.FC = () => {
    const { isEnabled, toggle } = useTracingStore();

    return (
        <div className="flex items-center space-x-2 p-4 bg-gray-100 rounded-lg">
            <label className="flex items-center space-x-2 cursor-pointer">
                <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={toggle}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                    Включить трейсинг (traceparent)
                </span>
            </label>
            {isEnabled && (
                <span className="text-xs text-green-600">
                    ✓ Трейсинг активен
                </span>
            )}
        </div>
    );
};


