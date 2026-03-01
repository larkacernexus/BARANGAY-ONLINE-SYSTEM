// components/community-report/EmergencyModal.tsx

import React from 'react';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Phone, X } from 'lucide-react';

interface EmergencyModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-sm w-full">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-red-600">Emergency Contact</h3>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="space-y-4">
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <ShieldAlert className="h-5 w-5 text-red-600" />
                                <span className="font-bold">Emergency Hotline</span>
                            </div>
                            <a 
                                href="tel:911" 
                                className="text-red-600 text-2xl font-bold hover:underline block text-center py-2"
                            >
                                911
                            </a>
                        </div>
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Phone className="h-5 w-5 text-blue-600" />
                                <span className="font-bold">Local Authorities</span>
                            </div>
                            <a 
                                href="tel:02-8123-4567" 
                                className="text-blue-600 text-xl font-bold hover:underline block text-center py-2"
                            >
                                (02) 8123-4567
                            </a>
                        </div>
                    </div>
                    <Button
                        type="button"
                        onClick={onClose}
                        className="w-full mt-6"
                    >
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
};