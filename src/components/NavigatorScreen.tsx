import React from 'react';

export const NavigatorScreen: React.FC = () => {
    return (
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-6">🧭 Navigation Mode</h2>

            {/* Navigation Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-semibold mb-2">Active Navigation</h3>
                        <p className="text-blue-100">Route to destination in progress</p>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold">12:34</div>
                        <div className="text-sm text-blue-100">ETA</div>
                    </div>
                </div>
            </div>

            {/* Map Container */}
            <div className="bg-gray-100 rounded-lg p-4 mb-6 h-64 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">🗺️</div>
                    <p className="text-gray-600 font-medium">Interactive Map</p>
                    <p className="text-sm text-gray-500">Real-time navigation view</p>
                </div>
            </div>

            {/* Navigation Controls */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <button className="bg-gray-100 hover:bg-gray-200 p-4 rounded-lg text-center transition-colors">
                    <div className="text-2xl mb-2">🔊</div>
                    <div className="text-sm font-medium">Voice</div>
                </button>
                <button className="bg-gray-100 hover:bg-gray-200 p-4 rounded-lg text-center transition-colors">
                    <div className="text-2xl mb-2">📍</div>
                    <div className="text-sm font-medium">Location</div>
                </button>
                <button className="bg-gray-100 hover:bg-gray-200 p-4 rounded-lg text-center transition-colors">
                    <div className="text-2xl mb-2">⚙️</div>
                    <div className="text-sm font-medium">Settings</div>
                </button>
            </div>

            {/* Route Info */}
            <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Current Route</h4>
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Distance:</span>
                        <span className="font-medium">2.3 miles</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Time:</span>
                        <span className="font-medium">8 minutes</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Traffic:</span>
                        <span className="text-green-600 font-medium">Light</span>
                    </div>
                </div>
            </div>

            {/* Status Bar */}
            <div className="mt-6 p-3 bg-green-100 rounded-lg text-center">
                <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-800 font-medium">Navigation Active</span>
                </div>
            </div>
        </div>
    );
}; 