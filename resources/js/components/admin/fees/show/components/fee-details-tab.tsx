// resources/js/Pages/Admin/Fees/components/fee-details-tab.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    FileText,
    Calendar,
    CalendarDays,
    MapPin,
    Phone,
    Mail,
    Award,
} from 'lucide-react';
import { Fee } from '../types';
import { PrivilegeBadge } from '@/components/admin/fees/show/components/privilege-badge';

interface Props {
    fee: Fee;
    payerInfo: any;
    formatDate: (date?: string) => string;
    formatCurrency: (amount: number | string | undefined) => string;
}

export const FeeDetailsTab = ({ fee, payerInfo, formatDate, formatCurrency }: Props) => {
    return (
        <div className="space-y-6">
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <FileText className="h-5 w-5" />
                        Fee Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Fee Type</p>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-sm dark:border-gray-600 dark:text-gray-300">
                                    {fee.fee_type?.name || 'N/A'}
                                </Badge>
                                <span className="text-xs text-gray-500 dark:text-gray-400">({fee.fee_type?.code})</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Purpose</p>
                            <p className="text-sm dark:text-gray-300">{fee.purpose || 'Not specified'}</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Payer Type</p>
                            <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                                {payerInfo.typeLabel}
                            </Badge>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Amount</p>
                            <p className="text-lg font-semibold dark:text-gray-100">
                                {formatCurrency(fee.total_amount)}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Issued Date</p>
                            <div className="flex items-center gap-1 text-sm dark:text-gray-300">
                                <Calendar className="h-3 w-3" />
                                {formatDate(fee.issue_date)}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Due Date</p>
                            <div className="flex items-center gap-1 text-sm dark:text-gray-300">
                                <CalendarDays className="h-3 w-3" />
                                {formatDate(fee.due_date)}
                            </div>
                        </div>
                    </div>

                    {fee.billing_period && (
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Billing Period</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{fee.billing_period}</p>
                            {fee.period_start && fee.period_end && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    ({formatDate(fee.period_start)} - {formatDate(fee.period_end)})
                                </p>
                            )}
                        </div>
                    )}

                    {(fee.property_description || fee.business_type || fee.area) && (
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                {fee.payer_type === 'business' ? 'Business Details' : 'Property Details'}
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {fee.property_description && (
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Property Description</p>
                                        <p className="text-sm dark:text-gray-300">{fee.property_description}</p>
                                    </div>
                                )}
                                {fee.business_type && (
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Business Type</p>
                                        <p className="text-sm dark:text-gray-300">{fee.business_type}</p>
                                    </div>
                                )}
                                {fee.area && (
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Area</p>
                                        <p className="text-sm dark:text-gray-300">{fee.area} sqm</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        {payerInfo.icon === 'User' ? <User className="h-5 w-5" /> : 
                         payerInfo.icon === 'Home' ? <Home className="h-5 w-5" /> : 
                         <Building className="h-5 w-5" />}
                        Payer Information
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {payerInfo.name ? (
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                {payerInfo.profile_photo ? (
                                    <img
                                        src={payerInfo.profile_photo}
                                        alt={payerInfo.name}
                                        className="h-16 w-16 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300">
                                        {payerInfo.icon === 'User' ? <User className="h-8 w-8" /> : 
                                         payerInfo.icon === 'Home' ? <Home className="h-8 w-8" /> : 
                                         <Building className="h-8 w-8" />}
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-semibold text-lg dark:text-gray-100">{payerInfo.name}</h3>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                        {payerInfo.contact && (
                                            <span className="flex items-center gap-1">
                                                <Phone className="h-3 w-3" />
                                                {payerInfo.contact}
                                            </span>
                                        )}
                                        {payerInfo.email && (
                                            <span className="flex items-center gap-1">
                                                <Mail className="h-3 w-3" />
                                                {payerInfo.email}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <Separator className="dark:bg-gray-700" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</p>
                                    <p className="text-sm flex items-start gap-1 dark:text-gray-300">
                                        <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                        {payerInfo.address || 'No address provided'}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Purok/Zone</p>
                                    <p className="text-sm dark:text-gray-300">
                                        {payerInfo.purok}
                                        {payerInfo.zone && ` (Zone ${payerInfo.zone})`}
                                    </p>
                                </div>
                                {payerInfo.birth_date && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Date of Birth</p>
                                        <p className="text-sm dark:text-gray-300">{formatDate(payerInfo.birth_date)}</p>
                                    </div>
                                )}
                                {payerInfo.gender && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Gender</p>
                                        <p className="text-sm capitalize dark:text-gray-300">{payerInfo.gender}</p>
                                    </div>
                                )}
                                {payerInfo.occupation && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Occupation</p>
                                        <p className="text-sm dark:text-gray-300">{payerInfo.occupation}</p>
                                    </div>
                                )}
                            </div>

                            {/* DYNAMIC: Special Classifications - from privileges */}
                            {payerInfo.privileges && payerInfo.privileges.length > 0 && (
                                <div className="pt-4 border-t dark:border-gray-700">
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
                                        <Award className="h-4 w-4" />
                                        Special Classifications
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {payerInfo.privileges.map((priv: any) => (
                                            <PrivilegeBadge key={priv.id} privilege={priv} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400">Payer information not available</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

import { User, Home, Building } from 'lucide-react';