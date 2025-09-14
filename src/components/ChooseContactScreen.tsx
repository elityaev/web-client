import React from 'react';
import { ChooseContactData, RpcAction } from '../services/onboardingService';
import { MicrophoneIndicator } from './MicrophoneIndicator';
import { Button } from './ui/Button';
import { Phone } from 'lucide-react';

interface ChooseContactScreenProps {
    data: ChooseContactData;
    useMicrophone: boolean;
    onRpcAction: (action: RpcAction) => void;
}

export const ChooseContactScreen: React.FC<ChooseContactScreenProps> = ({
    data,
    useMicrophone,
    onRpcAction
}) => {
    const handleContactClick = (contact: any) => {
        if (contact.rpc_on_call_click) {
            onRpcAction({
                name: contact.rpc_on_call_click.name,
                payload: contact.rpc_on_call_click.payload
            });
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
            <MicrophoneIndicator useMicrophone={useMicrophone} />

            <div className="text-center mb-6">
                <h1 className="text-xl font-semibold text-gray-800">
                    {data.text}
                </h1>
            </div>

            <div className="space-y-3">
                {data.contacts.map((contact, index) => (
                    <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                    >
                        <div className="flex-1">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
                                    {contact.label}
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900">{contact.title}</h3>
                                    <p className="text-sm text-gray-600">{contact.subtitle}</p>
                                </div>
                            </div>
                        </div>

                        {contact.rpc_on_call_click ? (
                            <Button
                                onClick={() => handleContactClick(contact)}
                                className="ml-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                            >
                                <Phone className="h-4 w-4" />
                                <span>Вызов</span>
                            </Button>
                        ) : (
                            <div className="ml-4 px-4 py-2 rounded-lg bg-gray-300 text-gray-500 flex items-center space-x-2 cursor-not-allowed">
                                <Phone className="h-4 w-4" />
                                <span>Недоступно</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
