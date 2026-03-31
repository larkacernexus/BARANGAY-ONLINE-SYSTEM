// components/admin/clearances/show/QuickInfoCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
    Calendar,
    Clock,
    DollarSign,
    FileText,
    Info,
    Copy,
    User,
    Phone,
    Mail,
    MapPin,
    Home
} from 'lucide-react';
import { ClearanceRequest } from '@/types/admin/clearances/clearance-types';
import { useState } from 'react';
import { toast } from 'sonner';

interface QuickInfoCardProps {
    clearance: ClearanceRequest;
    formatDate: (date?: string | null) => string;
}

export function QuickInfoCard({ clearance, formatDate }: QuickInfoCardProps) {
    const [copied, setCopied] = useState(false);
    const resident = clearance.resident as any;

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success(`${label} copied`);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm dark:text-gray-100">
                    <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700 flex items-center justify-center">
                        <Info className="h-3 w-3 text-white" />
                    </div>
                    Quick Information
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
                {/* Reference Numbers */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Reference #</span>
                        <div className="flex items-center gap-1">
                            <span className="font-mono font-medium dark:text-gray-300">{clearance.reference_number}</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5"
                                onClick={() => copyToClipboard(clearance.reference_number, 'Reference number')}
                            >
                                <Copy className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                    {clearance.clearance_number && (
                        <div className="flex items-center justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Clearance #</span>
                            <span className="font-mono font-medium dark:text-gray-300">{clearance.clearance_number}</span>
                        </div>
                    )}
                </div>

                <Separator className="dark:bg-gray-700" />

                {/* Dates */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Created
                        </span>
                        <span className="font-medium dark:text-gray-300">{formatDate(clearance.created_at)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Last Updated
                        </span>
                        <span className="font-medium dark:text-gray-300">{formatDate(clearance.updated_at)}</span>
                    </div>
                    {clearance.issue_date && (
                        <div className="flex items-center justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Issued Date</span>
                            <span className="font-medium dark:text-gray-300">{formatDate(clearance.issue_date)}</span>
                        </div>
                    )}
                    {clearance.valid_until && (
                        <div className="flex items-center justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Valid Until</span>
                            <span className="font-medium dark:text-gray-300">{formatDate(clearance.valid_until)}</span>
                        </div>
                    )}
                    {clearance.payment_date && (
                        <div className="flex items-center justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Payment Date</span>
                            <span className="font-medium dark:text-gray-300">{formatDate(clearance.payment_date)}</span>
                        </div>
                    )}
                </div>

                {/* Resident Info (if available) */}
                {resident && (
                    <>
                        <Separator className="dark:bg-gray-700" />
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <User className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                                <span className="font-medium dark:text-gray-300">{resident.full_name}</span>
                            </div>
                            {resident.contact_number && (
                                <div className="flex items-center gap-2 text-xs">
                                    <Phone className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                                    <span className="dark:text-gray-400">{resident.contact_number}</span>
                                </div>
                            )}
                            {resident.email && (
                                <div className="flex items-center gap-2 text-xs">
                                    <Mail className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                                    <span className="dark:text-gray-400">{resident.email}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-xs">
                                <MapPin className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                                <span className="dark:text-gray-400">{resident.address}</span>
                            </div>
                            {resident.purok && (
                                <div className="flex items-center gap-2 text-xs">
                                    <Home className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                                    <span className="dark:text-gray-400">Purok {resident.purok.name}</span>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}