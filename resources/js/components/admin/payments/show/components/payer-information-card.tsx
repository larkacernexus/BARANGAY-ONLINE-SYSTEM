// resources/js/Pages/Admin/Payments/components/payer-information-card.tsx
import React from 'react';
import { Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    User,
    Home,
    Phone,
    Mail,
    MapPin,
    ExternalLink,
    Info,
    Users,
    Building2,
} from 'lucide-react';
import { Payment, PayerDetails } from '../types';
import { getRoute } from '../utils/helpers';

interface Props {
    payment: Payment;
    payer: PayerDetails | null;
    getPayerIcon: (type: string) => React.ReactNode;
}

export const PayerInformationCard = ({ payment, payer, getPayerIcon }: Props) => {
    return (
        <Card className="dark:bg-gray-900">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm dark:text-gray-100">
                    {getPayerIcon(payment.payer_type)}
                    Payer Information
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Payer Name</p>
                    <p className="font-semibold text-base dark:text-gray-100">{payment.payer_name}</p>
                    <Badge variant="outline" className="mt-1 capitalize dark:border-gray-600 dark:text-gray-300">
                        {getPayerIcon(payment.payer_type)}
                        <span className="ml-1">{payment.payer_type}</span>
                    </Badge>
                </div>

                {payer && (
                    <>
                        {payer.type === 'resident' && payer.household && (
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Household</p>
                                <div className="flex items-center gap-2">
                                    <Home className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                    <div>
                                        <p className="text-sm dark:text-gray-100">House #{payer.household.household_number}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Purok {payer.household.purok}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {payer.contact_number && (
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Contact Number</p>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                    <span className="text-sm dark:text-gray-300">{payer.contact_number}</span>
                                </div>
                            </div>
                        )}

                        {payer.email && (
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Email</p>
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                    <span className="text-sm break-all dark:text-gray-300">{payer.email}</span>
                                </div>
                            </div>
                        )}

                        {payer.address && (
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Address</p>
                                <div className="flex items-start gap-2">
                                    <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm dark:text-gray-300">{payer.address}</span>
                                </div>
                            </div>
                        )}

                        {/* View Payer Profile Button */}
                        <div className="pt-2">
                            {payer.type === 'resident' ? (
                                <Link href={getRoute('admin.residents.show', payer.id)}>
                                    <Button variant="outline" size="sm" className="w-full dark:border-gray-600 dark:text-gray-300">
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        View Resident Profile
                                    </Button>
                                </Link>
                            ) : payer.type === 'household' ? (
                                <Link href={getRoute('admin.households.show', payer.id)}>
                                    <Button variant="outline" size="sm" className="w-full dark:border-gray-600 dark:text-gray-300">
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        View Household Profile
                                    </Button>
                                </Link>
                            ) : (
                                <Button variant="outline" size="sm" className="w-full dark:border-gray-600 dark:text-gray-300" disabled>
                                    <Info className="h-4 w-4 mr-2" />
                                    No Profile Available
                                </Button>
                            )}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
};