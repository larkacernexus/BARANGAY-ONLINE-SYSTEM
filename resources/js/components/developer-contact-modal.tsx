// @/components/developer-contact-modal.tsx
import React from 'react';
import { X, Mail, Phone, User, Building, Shield, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface DeveloperContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    developerDetails?: {
        name?: string;
        email?: string;
        phone?: string;
        position?: string; // Added
        department?: string;
        company?: string;
        office?: string;   // Added
        schedule?: string; // Added
        responseTime?: string;
        notes?: string;
    };
}

const defaultDeveloperDetails = {
    name: "System Development Team",
    email: "dev.team@company.com",
    phone: "+1 (555) 123-4567",
    department: "Software Engineering",
    company: "Your Company",
    responseTime: "Within 24-48 hours",
    notes: "For permission requests, please include details."
};

export default function DeveloperContactModal({ 
    isOpen, 
    onClose, 
    developerDetails = defaultDeveloperDetails 
}: DeveloperContactModalProps) {
    if (!isOpen) return null;

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const handleSendEmail = () => {
        window.location.href = `mailto:${developerDetails.email}?subject=Permission Inquiry`;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="relative w-full max-w-md mx-4">
                <Card className="shadow-xl dark:bg-gray-900 dark:border-gray-700">
                    <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                        <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            <div>
                                <h2 className="font-semibold text-gray-900 dark:text-gray-100">Contact IT Support</h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400">System Permissions & Access</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    <CardContent className="p-4 space-y-4">
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                                    <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-gray-100">{developerDetails.name}</p>
                                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">{developerDetails.position}</p>
                                    <p className="text-xs text-gray-500">{developerDetails.department}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-2 border-t pt-3 dark:border-gray-700">
                                <div className="flex items-center justify-between group">
                                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                        <Mail className="h-4 w-4 text-gray-400" />
                                        <span>{developerDetails.email}</span>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => handleCopy(developerDetails.email || '')} className="h-7 text-xs">Copy</Button>
                                </div>

                                {developerDetails.office && (
                                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                        <MapPin className="h-4 w-4 text-gray-400" />
                                        <span>{developerDetails.office}</span>
                                    </div>
                                )}

                                {developerDetails.schedule && (
                                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                        <Clock className="h-4 w-4 text-gray-400" />
                                        <span>{developerDetails.schedule}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {developerDetails.notes && (
                            <div className="p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/30">
                                <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">{developerDetails.notes}</p>
                            </div>
                        )}

                        <div className="flex flex-col gap-2">
                            <Button onClick={handleSendEmail} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                                <Mail className="h-4 w-4 mr-2" />
                                Send Message
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}