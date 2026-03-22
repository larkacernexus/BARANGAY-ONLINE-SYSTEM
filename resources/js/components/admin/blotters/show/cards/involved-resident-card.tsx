// resources/js/components/admin/blotters/show/components/cards/involved-resident-card.tsx

import { Card, CardContent } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { User, MapPin, Phone, ChevronRight } from 'lucide-react';
import { InvolvedResident } from '@/components/admin/blotters/show/types';

interface InvolvedResidentCardProps {
    resident: InvolvedResident;
}

export function InvolvedResidentCard({ resident }: InvolvedResidentCardProps) {
    return (
        <Link href={`/admin/residents/${resident.id}`}>
            <Card className="hover:shadow-md transition-all cursor-pointer dark:bg-gray-900">
                <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                <h5 className="font-medium dark:text-gray-200">{resident.name}</h5>
                            </div>
                            {resident.address && (
                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                    <MapPin className="h-3 w-3" />
                                    {resident.address}
                                </div>
                            )}
                            {resident.contact && (
                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                    <Phone className="h-3 w-3" />
                                    {resident.contact}
                                </div>
                            )}
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}