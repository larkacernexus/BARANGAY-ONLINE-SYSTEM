// payment-show/components/PaymentSidebar.tsx
import { Link } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ModernCard } from '@/components/residentui/modern-card';
import { formatDateTime } from '@/components/residentui/lib/resident-ui-utils';
import { cn } from '@/lib/utils';
import { 
    CheckCircle, ShieldCheck, BadgeCheck, Tag, Database, Link2, 
    Building, Phone, MapPin, CreditCard, Wallet, Clock
} from 'lucide-react';
import { Payment } from '@/utils/portal/payments/payment-utils';
import { getPaymentMethodIcon, getPaymentMethodColor, getPaymentStatusConfig } from '@/utils/portal/payments/payment-utils';

interface PaymentSidebarProps {
    payment: Payment;
}

export function PaymentSidebar({ payment }: PaymentSidebarProps) {
    const statusConfig = getPaymentStatusConfig(payment.status);
    const StatusIcon = statusConfig.icon;
    const MethodIcon = getPaymentMethodIcon(payment.payment_method);

    return (
        <div className="space-y-4 lg:space-y-6">
            <ModernCard title="Payment Summary">
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                        <p className="text-sm text-gray-500">Status</p>
                        <Badge className={cn(
                            "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                            statusConfig.bgColor,
                            statusConfig.color
                        )}>
                            <StatusIcon className="h-3 w-3" />
                            {statusConfig.label}
                        </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                        <p className="text-sm text-gray-500">Payment Method</p>
                        <div className="flex items-center gap-1">
                            <div className={cn("p-1 rounded", getPaymentMethodColor(payment.payment_method))}>
                                <MethodIcon className="h-3 w-3" />
                            </div>
                            <span className="text-sm">{payment.payment_method_display}</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                        <p className="text-sm text-gray-500">Total Amount</p>
                        <p className="font-bold text-lg">{payment.formatted_total}</p>
                    </div>
                    
                    {payment.is_cleared && (
                        <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                            <p className="text-sm text-gray-500">Clearance</p>
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Cleared
                            </Badge>
                        </div>
                    )}
                    
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 mb-1">Last Updated</p>
                        <p className="text-sm font-medium">{payment.updated_at ? formatDateTime(payment.updated_at) : 'N/A'}</p>
                    </div>
                </div>
            </ModernCard>

            {payment.approved_by && (
                <ModernCard title="Approval Status" icon={ShieldCheck} iconColor="from-indigo-500 to-purple-500">
                    <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                            <div className="h-8 w-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">Approved by {payment.approved_by.name}</p>
                                <p className="text-xs text-gray-500">{payment.approved_by.role}</p>
                                <p className="text-xs text-gray-400 mt-1">{payment.approved_by.date ? formatDateTime(payment.approved_by.date) : 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </ModernCard>
            )}

            {payment.verified_by && (
                <ModernCard title="Verification Status" icon={BadgeCheck} iconColor="from-blue-500 to-cyan-500">
                    <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                            <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <BadgeCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">Verified by {payment.verified_by.name}</p>
                                <p className="text-xs text-gray-500">{payment.verified_by.role}</p>
                                <p className="text-xs text-gray-400 mt-1">{payment.verified_by.date ? formatDateTime(payment.verified_by.date) : 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </ModernCard>
            )}

            {payment.tags && payment.tags.length > 0 && (
                <ModernCard title="Tags" icon={Tag} iconColor="from-pink-500 to-rose-500">
                    <div className="flex flex-wrap gap-2">
                        {payment.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="px-3 py-1.5">
                                <Tag className="h-3 w-3 mr-1" />
                                {tag}
                            </Badge>
                        ))}
                    </div>
                </ModernCard>
            )}

            {payment.metadata && Object.keys(payment.metadata).length > 0 && (
                <ModernCard title="Metadata" icon={Database} iconColor="from-cyan-500 to-blue-500">
                    <div className="space-y-2">
                        {Object.entries(payment.metadata).map(([key, value]) => (
                            <div key={key} className="flex items-start gap-2 p-2 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                <span className="text-xs font-medium text-gray-500 min-w-[100px]">
                                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                                </span>
                                <span className="text-sm">
                                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                </span>
                            </div>
                        ))}
                    </div>
                </ModernCard>
            )}

            {payment.related_payments && payment.related_payments.length > 0 && (
                <ModernCard title="Related Payments" icon={Link2} iconColor="from-teal-500 to-emerald-500">
                    <div className="space-y-2">
                        {payment.related_payments.map((related) => {
                            const RelatedIcon = getPaymentMethodIcon(related.payment_method);
                            return (
                                <Link
                                    key={related.id}
                                    href={`/portal/payments/${related.id}`}
                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors group"
                                >
                                    <div className={cn(
                                        "p-2 rounded-lg",
                                        getPaymentMethodColor(related.payment_method)
                                    )}>
                                        <RelatedIcon className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                            OR #{related.or_number}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">
                                            {related.purpose}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium">{related.formatted_total}</p>
                                        <p className="text-xs text-gray-500">{related.formatted_date}</p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </ModernCard>
            )}

            <ModernCard title="Contact Information">
                <div className="space-y-3">
                    <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                        <Building className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                            <p className="font-medium text-sm">Barangay Hall</p>
                            <p className="text-xs text-gray-500">Open Mon-Fri, 8AM-5PM</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                        <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                            <p className="font-medium text-sm">Contact Us</p>
                            <p className="text-xs text-gray-500">0999-999-9999</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                        <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                            <p className="font-medium text-sm">Location</p>
                            <p className="text-xs text-gray-500">Barangay Hall, Main Street</p>
                        </div>
                    </div>
                </div>
            </ModernCard>
        </div>
    );
}