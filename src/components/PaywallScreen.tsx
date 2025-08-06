import React from 'react';
import { RpcAction } from '../services/onboardingService';

interface PaywallData {
    placement: string;
    rpc_on_purchase?: RpcAction;
    rpc_on_skip?: RpcAction;
}

interface PaywallScreenProps {
    data: PaywallData;
    onRpcAction: (action: RpcAction) => void;
}

export const PaywallScreen: React.FC<PaywallScreenProps> = ({ data, onRpcAction }) => {
    const handleRpcAction = (action: RpcAction) => {
        console.log('🎯 Processing paywall RPC action:', action);
        onRpcAction(action);
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-6">Premium Features</h2>

            {/* Paywall Content */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 mb-6">
                <div className="text-center mb-6">
                    <div className="text-4xl mb-4">🚀</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Unlock Premium Features
                    </h3>
                    <p className="text-gray-600 mb-4">
                        Get access to advanced navigation, voice commands, and exclusive features
                    </p>
                </div>

                {/* Features List */}
                <div className="space-y-3 mb-6">
                    <div className="flex items-center space-x-3">
                        <span className="text-green-500 text-lg">✅</span>
                        <span className="text-gray-700">Advanced voice navigation</span>
                    </div>
                    <div className="flex items-center space-x-3">
                        <span className="text-green-500 text-lg">✅</span>
                        <span className="text-gray-700">Offline maps & directions</span>
                    </div>
                    <div className="flex items-center space-x-3">
                        <span className="text-green-500 text-lg">✅</span>
                        <span className="text-gray-700">Premium route optimization</span>
                    </div>
                    <div className="flex items-center space-x-3">
                        <span className="text-green-500 text-lg">✅</span>
                        <span className="text-gray-700">Real-time traffic updates</span>
                    </div>
                </div>

                {/* Pricing */}
                <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                        $9.99
                        <span className="text-lg font-normal text-gray-500">/month</span>
                    </div>
                    <p className="text-sm text-gray-500">Cancel anytime • 7-day free trial</p>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
                {data.rpc_on_purchase && (
                    <button
                        onClick={() => handleRpcAction(data.rpc_on_purchase!)}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-lg font-semibold text-lg shadow-lg transform hover:scale-105 transition-all duration-200"
                    >
                        💳 Start Free Trial
                    </button>
                )}

                {data.rpc_on_skip && (
                    <button
                        onClick={() => handleRpcAction(data.rpc_on_skip!)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-200"
                    >
                        ⏭️ Skip for Now
                    </button>
                )}
            </div>

            {/* Additional Info */}
            <div className="text-center mt-6 text-sm text-gray-500">
                <p>Placement: <span className="font-medium">{data.placement}</span></p>
            </div>
        </div>
    );
}; 