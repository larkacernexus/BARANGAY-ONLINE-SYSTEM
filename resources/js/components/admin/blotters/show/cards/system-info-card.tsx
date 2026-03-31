// resources/js/components/admin/blotters/show/components/cards/system-info-card.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, Hash, Tag, MapPin } from 'lucide-react';
import { Blotter } from '@/types/admin/blotters/blotter';

interface SystemInfoCardProps {
    blotter: Blotter;
}

export function SystemInfoCard({ blotter }: SystemInfoCardProps) {
    const infoItems = [
        { label: 'ID', value: `#${blotter.id}`, icon: Hash },
        { label: 'Blotter Number', value: blotter.blotter_number, icon: Tag, isCode: true },
        { label: 'Barangay', value: blotter.barangay, icon: MapPin },
    ];

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <Info className="h-5 w-5" />
                    System Information
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {infoItems.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Icon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
                                </div>
                                {item.isCode ? (
                                    <code className="text-xs bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded dark:text-gray-300">
                                        {item.value}
                                    </code>
                                ) : (
                                    <span className="text-sm font-medium dark:text-gray-200">{item.value}</span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}