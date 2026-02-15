// @/components/developer-contact-modal.tsx
import React from 'react';
import { X, Mail, Phone, User, Building, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface DeveloperContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    developerDetails?: {
        name?: string;
        email?: string;
        phone?: string;
        department?: string;
        company?: string;
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
    notes: "For permission requests, please include the permission name, display name, module, description, and initial roles."
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
        window.location.href = `mailto:${developerDetails.email}?subject=Permission Creation Request`;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="relative w-full max-w-md mx-4">
                <Card className="shadow-xl">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b">
                        <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-blue-600" />
                            <div>
                                <h2 className="font-semibold text-gray-900">Contact Development Team</h2>
                                <p className="text-sm text-gray-600">Request permission creation</p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="h-8 w-8 p-0"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Content */}
                    <CardContent className="p-4 space-y-4">
                        {/* Contact Information */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-500" />
                                <div>
                                    <p className="font-medium text-gray-900">{developerDetails.name}</p>
                                    <p className="text-sm text-gray-600">{developerDetails.department}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-gray-500" />
                                    <p className="text-sm">{developerDetails.email}</p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCopy(developerDetails.email || '')}
                                    className="text-xs"
                                >
                                    Copy
                                </Button>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-gray-500" />
                                    <p className="text-sm">{developerDetails.phone}</p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCopy(developerDetails.phone || '')}
                                    className="text-xs"
                                >
                                    Copy
                                </Button>
                            </div>

                            <div className="flex items-center gap-2">
                                <Building className="h-4 w-4 text-gray-500" />
                                <p className="text-sm">{developerDetails.company}</p>
                            </div>

                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-500" />
                                <p className="text-sm">{developerDetails.responseTime}</p>
                            </div>
                        </div>

                        {/* Important Notes */}
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-gray-700">{developerDetails.notes}</p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2 pt-2">
                            <Button
                                onClick={handleSendEmail}
                                className="w-full"
                            >
                                <Mail className="h-4 w-4 mr-2" />
                                Send Email Request
                            </Button>
                            <Button
                                variant="outline"
                                onClick={onClose}
                                className="w-full"
                            >
                                Close
                            </Button>
                        </div>

                        {/* Footer Note */}
                        <p className="text-xs text-gray-500 text-center pt-2">
                            All requests are reviewed based on system requirements and security policies.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}