// resources/js/Pages/Admin/Fees/components/fee-details-tab.tsx

import React from 'react';
import { Link } from '@inertiajs/react';
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
    User,
    Home,
    Building,
} from 'lucide-react';
import { Fee, PrivilegeData, FeeDetailsTabProps } from '@/types/admin/fees/fees';
import { PrivilegeBadge } from '@/components/admin/fees/show/components/privilege-badge';



export const FeeDetailsTab: React.FC<FeeDetailsTabProps> = ({ 
    fee, 
    payerInfo, 
    formatDate, 
    formatCurrency 
}) => {
    // Helper to generate the correct profile link based on payer type
    const getPayerProfileLink = (): string | null => {
        const id = payerInfo?.resident_id || payerInfo?.household_id || payerInfo?.business_id || payerInfo?.id;
        
        if (!id) {
            return null;
        }
        
        switch (fee.payer_type) {
            case 'resident':
                return `/admin/residents/${id}`;
            case 'household':
                return `/admin/households/${id}`;
            case 'business':
                return `/admin/businesses/${id}`;
            default:
                return null;
        }
    };

    const profileLink = getPayerProfileLink();
    
    // Determine which icon component to use
    const PayerIcon = () => {
        switch (payerInfo.icon) {
            case 'User':
                return <User className="h-8 w-8" />;
            case 'Home':
                return <Home className="h-8 w-8" />;
            case 'Building':
                return <Building className="h-8 w-8" />;
            default:
                return <User className="h-8 w-8" />;
        }
    };

    const HeaderIcon = () => {
        switch (payerInfo.icon) {
            case 'User':
                return <User className="h-5 w-5" />;
            case 'Home':
                return <Home className="h-5 w-5" />;
            case 'Building':
                return <Building className="h-5 w-5" />;
            default:
                return <User className="h-5 w-5" />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Fee Information Card */}
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
                                {fee.fee_type?.code && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        ({fee.fee_type.code})
                                    </span>
                                )}
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Purpose</p>
                            <p className="text-sm dark:text-gray-300">
                                {(fee as any).purpose || fee.description || 'Not specified'}
                            </p>
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
                                {formatCurrency(fee.total_amount || fee.amount)}
                            </p>
                        </div>
                        
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Issued Date</p>
                            <div className="flex items-center gap-1 text-sm dark:text-gray-300">
                                <Calendar className="h-3 w-3" />
                                {formatDate(fee.issue_date || fee.created_at)}
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

                    {(fee as any).billing_period && (
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Billing Period</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                {(fee as any).billing_period}
                            </p>
                            {(fee as any).period_start && (fee as any).period_end && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    ({formatDate((fee as any).period_start)} - {formatDate((fee as any).period_end)})
                                </p>
                            )}
                        </div>
                    )}

                    {((fee as any).property_description || (fee as any).business_type || (fee as any).area) && (
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                {fee.payer_type === 'business' ? 'Business Details' : 'Property Details'}
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {(fee as any).property_description && (
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Property Description</p>
                                        <p className="text-sm dark:text-gray-300">{(fee as any).property_description}</p>
                                    </div>
                                )}
                                {(fee as any).business_type && (
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Business Type</p>
                                        <p className="text-sm dark:text-gray-300">{(fee as any).business_type}</p>
                                    </div>
                                )}
                                {(fee as any).area && (
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Area</p>
                                        <p className="text-sm dark:text-gray-300">{(fee as any).area} sqm</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Payer Information Card */}
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <HeaderIcon />
                        Payer Information
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {payerInfo.name ? (
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                {/* Clickable Profile Photo */}
                                {profileLink ? (
                                    <Link href={profileLink} className="flex-shrink-0">
                                        {payerInfo.profile_photo ? (
                                            <img
                                                src={payerInfo.profile_photo}
                                                alt={payerInfo.name}
                                                className="h-16 w-16 rounded-full object-cover hover:opacity-80 transition-opacity cursor-pointer"
                                            />
                                        ) : (
                                            <div className="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors cursor-pointer">
                                                <PayerIcon />
                                            </div>
                                        )}
                                    </Link>
                                ) : (
                                    <div className="flex-shrink-0">
                                        {payerInfo.profile_photo ? (
                                            <img
                                                src={payerInfo.profile_photo}
                                                alt={payerInfo.name}
                                                className="h-16 w-16 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300">
                                                <PayerIcon />
                                            </div>
                                        )}
                                    </div>
                                )}
                                
                                <div className="flex-1 min-w-0">
                                    {/* Clickable Name */}
                                    {profileLink ? (
                                        <Link href={profileLink}>
                                            <h3 className="font-semibold text-lg text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors truncate">
                                                {payerInfo.name}
                                            </h3>
                                        </Link>
                                    ) : (
                                        <h3 className="font-semibold text-lg dark:text-gray-100 truncate">
                                            {payerInfo.name}
                                        </h3>
                                    )}
                                    
                                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                        {payerInfo.contact && (
                                            <span className="flex items-center gap-1">
                                                <Phone className="h-3 w-3 flex-shrink-0" />
                                                <span className="truncate">{payerInfo.contact}</span>
                                            </span>
                                        )}
                                        {payerInfo.email && (
                                            <span className="flex items-center gap-1">
                                                <Mail className="h-3 w-3 flex-shrink-0" />
                                                <span className="truncate">{payerInfo.email}</span>
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
                                        <span>{payerInfo.address || 'No address provided'}</span>
                                    </p>
                                </div>
                                
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Purok/Zone</p>
                                    <p className="text-sm dark:text-gray-300">
                                        {payerInfo.purok || 'N/A'}
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

                            {/* Special Classifications - from privileges */}
                            {payerInfo.privileges && payerInfo.privileges.length > 0 && (
                                <div className="pt-4 border-t dark:border-gray-700">
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
                                        <Award className="h-4 w-4" />
                                        Special Classifications
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {payerInfo.privileges.map((priv: PrivilegeData) => (
                                            <PrivilegeBadge key={priv.id} privilege={priv} />
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {/* Head Privileges for Household */}
                            {payerInfo.head_privileges && payerInfo.head_privileges.length > 0 && (
                                <div className="pt-4 border-t dark:border-gray-700">
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
                                        <Award className="h-4 w-4" />
                                        Household Head Classifications
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {payerInfo.head_privileges.map((priv: PrivilegeData) => (
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