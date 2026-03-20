// resources/js/Pages/Admin/Officials/components/contact-info-card.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    Phone,
    Mail,
    MapPin,
    Copy,
    Check,
    PhoneCall,
    Mail as MailIcon,
} from 'lucide-react';

interface Props {
    official: any;
}

export const ContactInfoCard = ({ official }: Props) => {
    const [copiedPhone, setCopiedPhone] = useState(false);
    const [copiedEmail, setCopiedEmail] = useState(false);

    const copyToClipboard = (text: string, type: 'phone' | 'email') => {
        navigator.clipboard.writeText(text);
        if (type === 'phone') {
            setCopiedPhone(true);
            setTimeout(() => setCopiedPhone(false), 2000);
        } else {
            setCopiedEmail(true);
            setTimeout(() => setCopiedEmail(false), 2000);
        }
    };

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <Phone className="h-5 w-5" />
                    Contact Information
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {official.contact_number ? (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                            <div>
                                <p className="text-sm font-medium dark:text-gray-300">{official.contact_number}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Contact Number</p>
                            </div>
                        </div>
                        <div className="flex gap-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(official.contact_number!, 'phone')}
                                className="h-8 w-8 p-0"
                            >
                                {copiedPhone ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                            <a href={`tel:${official.contact_number}`}>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <PhoneCall className="h-4 w-4" />
                                </Button>
                            </a>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <Phone className="h-4 w-4" />
                        <span className="text-sm">No contact number provided</span>
                    </div>
                )}

                <Separator className="dark:bg-gray-700" />

                {official.email ? (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                            <div>
                                <p className="text-sm font-medium dark:text-gray-300">{official.email}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Email Address</p>
                            </div>
                        </div>
                        <div className="flex gap-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(official.email!, 'email')}
                                className="h-8 w-8 p-0"
                            >
                                {copiedEmail ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                            <a href={`mailto:${official.email}`}>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MailIcon className="h-4 w-4" />
                                </Button>
                            </a>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <Mail className="h-4 w-4" />
                        <span className="text-sm">No email address provided</span>
                    </div>
                )}

                {official.resident?.address && (
                    <>
                        <Separator className="dark:bg-gray-700" />
                        <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-gray-400 dark:text-gray-500 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium dark:text-gray-300">{official.resident.address}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Resident Address</p>
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
};