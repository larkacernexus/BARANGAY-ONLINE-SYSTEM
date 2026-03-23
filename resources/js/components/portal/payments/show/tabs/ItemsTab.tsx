// payment-show/components/tabs/ItemsTab.tsx
import { ModernCard } from '@/components/residentui/modern-card';
import { ModernEmptyState } from '@/components/residentui/modern-empty-state';
import { Badge } from '@/components/ui/badge';
import { Layers } from 'lucide-react';
import { PaymentItem } from '@/utils/portal/payments/payment-utils';

interface ItemsTabProps {
    items: PaymentItem[];
}

export function ItemsTab({ items }: ItemsTabProps) {
    return (
        <ModernCard
            title="Payment Items"
            description={`${items?.length || 0} item(s)`}
        >
            {items && items.length > 0 ? (
                <div className="space-y-3">
                    {items.map((item, index) => (
                        <div key={item.id || index} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 mb-1.5">
                                        {item.fee_code && (
                                            <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">
                                                {item.fee_code}
                                            </Badge>
                                        )}
                                        {item.category && (
                                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
                                                {item.category}
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-sm font-medium">{item.item_name || item.fee_name}</p>
                                    {item.description && (
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                            {item.description}
                                        </p>
                                    )}
                                    {item.period_covered && (
                                        <p className="text-[10px] text-gray-500 mt-1">
                                            Period: {item.period_covered}
                                        </p>
                                    )}
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="text-sm font-bold">{item.formatted_total || new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(item.total)}</p>
                                    {item.quantity > 1 && (
                                        <p className="text-[10px] text-gray-500">
                                            {item.quantity} x {item.formatted_unit_price || new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(item.unit_price)}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <ModernEmptyState
                    status="default"
                    title="No Items"
                    message="No payment items found for this transaction"
                    icon={Layers}
                />
            )}
        </ModernCard>
    );
}