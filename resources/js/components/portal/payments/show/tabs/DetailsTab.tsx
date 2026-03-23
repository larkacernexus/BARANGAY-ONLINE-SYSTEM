// payment-show/components/tabs/DetailsTab.tsx
import { ReactNode } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ModernCard } from '@/components/residentui/modern-card';
import { ModernExpandableSection } from '@/components/residentui/modern-expandable-section';
import { ModernEmptyState } from '@/components/residentui/modern-empty-state';
import { formatDate, formatDateTime, formatCurrency } from '@/components/residentui/lib/resident-ui-utils';
import { cn } from '@/lib/utils';
import { 
    Receipt, User, DollarSign, Calendar, Hash, Phone, Mail, MapPin, Building, 
    CreditCard, Clock, Info, MessageSquare, Gift, TrendingUp, AlertCircle, 
    Copy
} from 'lucide-react';
import { Payment } from '@/utils/portal/payments/payment-utils';
import { getPaymentMethodIcon, getPaymentMethodColor, getStringValue, toNumber } from '@/utils/portal/payments/payment-utils';
import { Button } from '@/components/ui/button';

interface DetailsTabProps {
    payment: Payment;
    expandedSections: Record<string, boolean>;
    toggleSection: (section: string) => void;
    isMobile: boolean;
    onCopyOrNumber?: () => void; // Add this prop
}

export function DetailsTab({ payment, expandedSections, toggleSection, isMobile, onCopyOrNumber }: DetailsTabProps) {
    const MethodIcon = getPaymentMethodIcon(payment.payment_method);
    
    const payerInitials = payment.payer_details?.first_name && payment.payer_details?.last_name
        ? `${payment.payer_details.first_name[0]}${payment.payer_details.last_name[0]}`
        : payment.payer_details?.name?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'U';

    // Helper function to copy OR number
    const handleCopyOrNumber = () => {
        if (onCopyOrNumber) {
            onCopyOrNumber();
        } else {
            navigator.clipboard.writeText(payment.or_number);
        }
    };

    // Helper function to format date with format string
    const formatDateWithFormat = (dateString: string | null | undefined) => {
        if (!dateString) return 'N/A';
        return formatDate(dateString, 'MMM D, YYYY');
    };

    if (isMobile) {
        return (
            <>
                <ModernExpandableSection
                    title="Payment Information"
                    icon={
                        <div className="h-6 w-6 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <Receipt className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                        </div>
                    }
                    isExpanded={expandedSections.paymentInfo}
                    onToggle={() => toggleSection('paymentInfo')}
                >
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                            <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                <p className="text-[10px] text-gray-500">OR Number</p>
                                <p className="text-xs font-mono truncate">{payment.or_number}</p>
                            </div>
                            <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                <p className="text-[10px] text-gray-500">Payment Date</p>
                                <p className="text-xs">{formatDateWithFormat(payment.payment_date)}</p>
                            </div>
                            <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                <p className="text-[10px] text-gray-500">Method</p>
                                <div className="flex items-center gap-1 mt-0.5">
                                    <div className={cn("p-0.5 rounded", getPaymentMethodColor(payment.payment_method))}>
                                        <MethodIcon className="h-3 w-3" />
                                    </div>
                                    <span className="text-xs">{payment.payment_method_display}</span>
                                </div>
                            </div>
                            {payment.reference_number && (
                                <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                    <p className="text-[10px] text-gray-500">Reference</p>
                                    <p className="text-xs font-mono truncate">{payment.reference_number}</p>
                                </div>
                            )}
                        </div>
                        
                        <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                            <p className="text-[10px] text-gray-500 mb-1">Purpose</p>
                            <p className="text-xs">{payment.purpose}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                            <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                <p className="text-[10px] text-gray-500">Collection Type</p>
                                <p className="text-xs">{payment.collection_type_display}</p>
                            </div>
                            {payment.certificate_type && (
                                <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                    <p className="text-[10px] text-gray-500">Certificate</p>
                                    <p className="text-xs">{payment.certificate_type_display}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </ModernExpandableSection>

                <ModernExpandableSection
                    title="Payer Information"
                    icon={
                        <div className="h-6 w-6 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                            <User className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                        </div>
                    }
                    isExpanded={expandedSections.payerInfo}
                    onToggle={() => toggleSection('payerInfo')}
                >
                    {payment.payer_details ? (
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 rounded-lg">
                                    {payment.payer_details.profile_photo ? (
                                        <AvatarImage src={payment.payer_details.profile_photo} />
                                    ) : (
                                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                                            {payerInitials}
                                        </AvatarFallback>
                                    )}
                                </Avatar>
                                <div>
                                    <p className="text-sm font-medium">
                                        {payment.payer_details.name}
                                    </p>
                                    {payment.payer_details.contact_number && (
                                        <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-500">
                                            <Phone className="h-3 w-3" />
                                            {payment.payer_details.contact_number}
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {payment.payer_details.address && (
                                <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                    <p className="text-[10px] text-gray-500 mb-1">Address</p>
                                    <div className="flex items-start gap-2">
                                        <MapPin className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" />
                                        <p className="text-xs">{payment.payer_details.address}</p>
                                    </div>
                                </div>
                            )}
                            
                            {(payment.payer_details.household_number || payment.payer_details.purok || payment.payer_details.zone) && (
                                <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                    <p className="text-[10px] text-gray-500 mb-1">Location Details</p>
                                    <div className="space-y-1 text-xs">
                                        {payment.payer_details.household_number && (
                                            <p>Household #{payment.payer_details.household_number}</p>
                                        )}
                                        {payment.payer_details.purok && (
                                            <p>Purok {getStringValue(payment.payer_details.purok)}</p>
                                        )}
                                        {payment.payer_details.zone && (
                                            <p>Zone {payment.payer_details.zone}</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                            <p className="text-xs text-gray-500 text-center">No payer information available</p>
                        </div>
                    )}
                </ModernExpandableSection>

                <ModernExpandableSection
                    title="Amount Breakdown"
                    icon={
                        <div className="h-6 w-6 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <DollarSign className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                        </div>
                    }
                    isExpanded={expandedSections.breakdownInfo}
                    onToggle={() => toggleSection('breakdownInfo')}
                >
                    <div className="space-y-2">
                        <div className="flex justify-between items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                            <span className="text-xs text-gray-600">Base Amount</span>
                            <span className="text-sm font-medium">{payment.formatted_subtotal}</span>
                        </div>
                        
                        {payment.surcharge > 0 && (
                            <div className="flex justify-between items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                <span className="text-xs text-gray-600">Surcharge</span>
                                <span className="text-sm font-medium text-amber-600">{payment.formatted_surcharge}</span>
                            </div>
                        )}
                        
                        {payment.penalty > 0 && (
                            <div className="flex justify-between items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                <span className="text-xs text-gray-600">Penalty</span>
                                <span className="text-sm font-medium text-red-600">{payment.formatted_penalty}</span>
                            </div>
                        )}
                        
                        {payment.discount > 0 && (
                            <div className="flex justify-between items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                <span className="text-xs text-gray-600">Discount</span>
                                <span className="text-sm font-medium text-green-600">-{payment.formatted_discount}</span>
                            </div>
                        )}
                        
                        <Separator className="my-1" />
                        
                        <div className="flex justify-between items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                            <span className="text-xs font-semibold">Total Amount</span>
                            <span className="text-base font-bold text-gray-900 dark:text-white">
                                {payment.formatted_total}
                            </span>
                        </div>
                    </div>
                </ModernExpandableSection>

                {payment.remarks && (
                    <ModernCard title="Remarks" className="p-3">
                        <p className="text-xs whitespace-pre-line">{payment.remarks}</p>
                    </ModernCard>
                )}
            </>
        );
    }

    // Desktop version
    return (
        <>
            <ModernCard
                title="Payment Information"
                icon={Receipt}
                iconColor="from-blue-500 to-blue-600"
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                        <p className="text-xs text-gray-500">OR Number</p>
                        <div className="flex items-center gap-1 mt-1">
                            <p className="font-mono font-medium">{payment.or_number}</p>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 w-5 p-0"
                                onClick={handleCopyOrNumber}
                            >
                                <Copy className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                        <p className="text-xs text-gray-500">Payment Date</p>
                        <p className="font-medium mt-1">{formatDateWithFormat(payment.payment_date)}</p>
                    </div>
                    {payment.due_date && (
                        <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                            <p className="text-xs text-gray-500">Due Date</p>
                            <p className={cn(
                                "font-medium mt-1",
                                payment.status === 'overdue' && "text-red-600"
                            )}>
                                {formatDateWithFormat(payment.due_date)}
                            </p>
                        </div>
                    )}
                    <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                        <p className="text-xs text-gray-500">Payment Method</p>
                        <div className="flex items-center gap-2 mt-1">
                            <div className={cn("p-1 rounded-lg", getPaymentMethodColor(payment.payment_method))}>
                                <MethodIcon className="h-4 w-4" />
                            </div>
                            <span className="font-medium">{payment.payment_method_display}</span>
                        </div>
                    </div>
                </div>
                
                <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                    <p className="text-xs text-gray-500 mb-1">Purpose</p>
                    <p className="font-medium">{payment.purpose}</p>
                </div>
                
                {payment.reference_number && (
                    <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                        <p className="text-xs text-gray-500 mb-1">Reference Number</p>
                        <div className="flex items-center gap-1">
                            <p className="font-mono font-medium">{payment.reference_number}</p>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 w-5 p-0"
                                onClick={() => navigator.clipboard.writeText(payment.reference_number!)}
                            >
                                <Copy className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                        <p className="text-xs text-gray-500">Collection Type</p>
                        <p className="font-medium mt-1">{payment.collection_type_display}</p>
                    </div>
                    {payment.certificate_type && (
                        <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                            <p className="text-xs text-gray-500">Certificate Type</p>
                            <p className="font-medium mt-1">{payment.certificate_type_display}</p>
                        </div>
                    )}
                </div>
            </ModernCard>

            <ModernCard
                title="Payer Information"
                icon={User}
                iconColor="from-green-500 to-emerald-500"
            >
                {payment.payer_details ? (
                    <>
                        <div className="flex items-start gap-4 p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                            <Avatar className="h-12 w-12 rounded-xl">
                                {payment.payer_details.profile_photo ? (
                                    <AvatarImage src={payment.payer_details.profile_photo} />
                                ) : (
                                    <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-500 text-white">
                                        {payerInitials}
                                    </AvatarFallback>
                                )}
                            </Avatar>
                            
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                    {payment.payer_details.name}
                                </h3>
                                {payment.payer_details.contact_number && (
                                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-600 dark:text-gray-400">
                                        <Phone className="h-3.5 w-3.5" />
                                        {payment.payer_details.contact_number}
                                    </div>
                                )}
                                {payment.payer_details.email && (
                                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-600 dark:text-gray-400">
                                        <Mail className="h-3.5 w-3.5" />
                                        {payment.payer_details.email}
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {payment.payer_details.address && (
                            <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                <p className="text-xs text-gray-500 mb-1">Address</p>
                                <div className="flex items-start gap-2">
                                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm">{payment.payer_details.address}</span>
                                </div>
                            </div>
                        )}
                        
                        {(payment.payer_details.household_number || payment.payer_details.purok || payment.payer_details.zone) && (
                            <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                <p className="text-xs text-gray-500 mb-1">Location Details</p>
                                <div className="space-y-1 text-sm">
                                    {payment.payer_details.household_number && (
                                        <p>Household #{payment.payer_details.household_number}</p>
                                    )}
                                    {payment.payer_details.purok && (
                                        <p>Purok {getStringValue(payment.payer_details.purok)}</p>
                                    )}
                                    {payment.payer_details.zone && (
                                        <p>Zone {payment.payer_details.zone}</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 text-center">
                        <p className="text-sm text-gray-500">No payer information available</p>
                    </div>
                )}
            </ModernCard>

            <ModernCard
                title="Amount Breakdown"
                icon={DollarSign}
                iconColor="from-purple-500 to-pink-500"
            >
                <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">Base Amount</span>
                        <span className="font-semibold">{payment.formatted_subtotal}</span>
                    </div>
                    
                    {payment.surcharge > 0 && (
                        <div className="flex justify-between items-center p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                            <span className="text-gray-600 dark:text-gray-400">Surcharge</span>
                            <span className="font-semibold text-amber-600">{payment.formatted_surcharge}</span>
                        </div>
                    )}
                    
                    {payment.penalty > 0 && (
                        <div className="flex justify-between items-center p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                            <span className="text-gray-600 dark:text-gray-400">Penalty</span>
                            <span className="font-semibold text-red-600">{payment.formatted_penalty}</span>
                        </div>
                    )}
                    
                    {payment.discount > 0 && (
                        <div className="flex justify-between items-center p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                            <span className="text-gray-600 dark:text-gray-400">Discount</span>
                            <span className="font-semibold text-green-600">-{payment.formatted_discount}</span>
                        </div>
                    )}
                    
                    <Separator />
                    
                    <div className="flex justify-between items-center p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                        <span className="font-semibold">Total Amount</span>
                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                            {payment.formatted_total}
                        </span>
                    </div>
                </div>
            </ModernCard>

            {payment.remarks && (
                <ModernCard title="Remarks" icon={MessageSquare} iconColor="from-amber-500 to-orange-500">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                        <p className="whitespace-pre-line">{payment.remarks}</p>
                    </div>
                </ModernCard>
            )}
        </>
    );
}