import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
    AlertTriangle,
    Clock,
    DollarSign,
    FileCheck,
    FileText,
    Home,
    Package,
    Shield,
    Zap,
    Info,
    Calendar,
    CreditCard,
    Building,
    UserCheck
} from 'lucide-react';

// Updated Fee interface to match your main component
interface Fee {
    id: string | number;
    name: string;
    code: string;
    description?: string;
    base_amount: number | string;
    category: 'tax' | 'clearance' | 'certificate' | 'service' | 'rental' | 'fine' | 'business' | 'document' | 'other';
    frequency: string;
    has_surcharge?: boolean;
    surcharge_rate?: number;
    surcharge_fixed?: number;
    has_penalty?: boolean;
    penalty_rate?: number;
    penalty_fixed?: number;
    validity_days?: number;
    applicable_to?: string[];
    is_active?: boolean;
    processing_days?: number;
}

interface FeeItemProps {
    fee: Fee;
    handleFeeSelection: (fee: Fee) => void;
    isSelected?: boolean;
    showDetails?: boolean;
    compact?: boolean;
    disabled?: boolean;
}

// Helper functions
function formatCurrency(amount: number): string {
    return `₱${amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
}

const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ElementType> = {
        'tax': DollarSign,
        'clearance': FileCheck,
        'certificate': Shield,
        'service': Package,
        'rental': Home,
        'fine': AlertTriangle,
        'business': Building,
        'document': FileText,
        'other': FileText,
        'government': UserCheck,
        'utility': Zap
    };
    const IconComponent = icons[category] || FileText;
    return <IconComponent className="h-4 w-4" />;
};

const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
        'tax': 'bg-blue-100 text-blue-800 border-blue-200',
        'clearance': 'bg-green-100 text-green-800 border-green-200',
        'certificate': 'bg-purple-100 text-purple-800 border-purple-200',
        'service': 'bg-yellow-100 text-yellow-800 border-yellow-200',
        'rental': 'bg-indigo-100 text-indigo-800 border-indigo-200',
        'fine': 'bg-red-100 text-red-800 border-red-200',
        'business': 'bg-cyan-100 text-cyan-800 border-cyan-200',
        'document': 'bg-gray-100 text-gray-800 border-gray-200',
        'other': 'bg-gray-100 text-gray-800 border-gray-200',
        'government': 'bg-orange-100 text-orange-800 border-orange-200',
        'utility': 'bg-teal-100 text-teal-800 border-teal-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
};

const getFrequencyLabel = (frequency: string) => {
    const labels: Record<string, string> = {
        'one_time': 'One-time',
        'monthly': 'Monthly',
        'quarterly': 'Quarterly',
        'semi_annual': 'Semi-Annual',
        'annual': 'Annual',
        'bi_monthly': 'Bi-Monthly',
        'on_demand': 'On Demand',
        'per_use': 'Per Use'
    };
    return labels[frequency] || frequency.replace('_', ' ').toLowerCase();
};

export function FeeItem({ 
    fee, 
    handleFeeSelection, 
    isSelected = false,
    showDetails = false,
    compact = false,
    disabled = false
}: FeeItemProps) {
    
    const baseAmount = typeof fee.base_amount === 'string' 
        ? parseFloat(fee.base_amount)
        : fee.base_amount;
    
    const handleClick = () => {
        if (!disabled) {
            handleFeeSelection(fee);
        }
    };

    // Compact version for lists
    if (compact) {
        return (
            <div
                onClick={handleClick}
                className={`w-full text-left p-3 border rounded-lg transition-all cursor-pointer ${
                    isSelected 
                        ? 'bg-primary/10 border-primary' 
                        : 'hover:border-primary hover:bg-primary/5'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-md ${getCategoryColor(fee.category)}`}>
                            {getCategoryIcon(fee.category)}
                        </div>
                        <div>
                            <div className="font-medium">{fee.name}</div>
                            <div className="text-sm text-gray-500">{fee.code}</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="font-bold text-primary">
                            {formatCurrency(baseAmount)}
                        </div>
                        <div className="text-xs text-gray-500">
                            {getFrequencyLabel(fee.frequency)}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Full version with details
    return (
        <Card 
            className={`overflow-hidden transition-all hover:shadow-md ${
                isSelected ? 'border-primary ring-1 ring-primary' : ''
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            onClick={handleClick}
        >
            <CardContent className="p-4">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        {/* Category and Code Badges */}
                        <div className="flex items-center gap-2 mb-3">
                            <Badge variant="outline" className={getCategoryColor(fee.category)}>
                                {getCategoryIcon(fee.category)}
                                <span className="ml-1 capitalize">{fee.category}</span>
                            </Badge>
                            <Badge variant="secondary" className="text-xs font-mono">
                                {fee.code}
                            </Badge>
                            {isSelected && (
                                <Badge className="bg-green-600">
                                    Selected
                                </Badge>
                            )}
                        </div>
                        
                        {/* Fee Name and Description */}
                        <div className="mb-3">
                            <h3 className="font-bold text-lg">{fee.name}</h3>
                            {fee.description && (
                                <p className="text-sm text-gray-600 mt-1">{fee.description}</p>
                            )}
                        </div>
                        
                        {/* Fee Details Grid */}
                        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                    <span className="text-gray-600">Frequency:</span>
                                </div>
                                <Badge variant="outline" className="w-fit">
                                    {getFrequencyLabel(fee.frequency)}
                                </Badge>
                            </div>
                            
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-gray-400" />
                                    <span className="text-gray-600">Validity:</span>
                                </div>
                                <div className="font-medium">
                                    {fee.validity_days 
                                        ? `${fee.validity_days} days` 
                                        : 'N/A'}
                                </div>
                            </div>
                        </div>
                        
                        {/* Surcharge and Penalty Information */}
                        {showDetails && (fee.has_surcharge || fee.has_penalty) && (
                            <div className="p-3 bg-gray-50 rounded-md mb-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Info className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm font-medium text-gray-700">Late Payment Settings</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    {fee.has_surcharge && (
                                        <div className="text-amber-600">
                                            <span>Surcharge: </span>
                                            {fee.surcharge_rate 
                                                ? `${fee.surcharge_rate}% per month` 
                                                : fee.surcharge_fixed 
                                                    ? `₱${fee.surcharge_fixed} fixed` 
                                                    : 'Yes'}
                                        </div>
                                    )}
                                    {fee.has_penalty && (
                                        <div className="text-red-600">
                                            <span>Penalty: </span>
                                            {fee.penalty_rate 
                                                ? `${fee.penalty_rate}% one-time` 
                                                : fee.penalty_fixed 
                                                    ? `₱${fee.penalty_fixed} fixed` 
                                                    : 'Yes'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        
                        {/* Applicable To */}
                        {showDetails && fee.applicable_to && fee.applicable_to.length > 0 && (
                            <div className="text-xs text-gray-500">
                                <span className="font-medium">Applicable to: </span>
                                {fee.applicable_to.join(', ')}
                            </div>
                        )}
                    </div>
                    
                    {/* Amount and Action Button */}
                    <div className="ml-6 text-right">
                        <div className="mb-3">
                            <div className="text-xs text-gray-500 mb-1">Base Amount</div>
                            <div className="font-bold text-2xl text-primary">
                                {formatCurrency(baseAmount)}
                            </div>
                        </div>
                        
                        <Button
                            type="button"
                            size="sm"
                            variant={isSelected ? "default" : "outline"}
                            className="min-w-[100px]"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleFeeSelection(fee);
                            }}
                            disabled={disabled}
                        >
                            {isSelected ? '✓ Selected' : 'Add Fee'}
                        </Button>
                        
                        {/* Additional Info */}
                        <div className="mt-3 text-xs text-gray-500 space-y-1">
                            <div className="flex items-center gap-1 justify-end">
                                <CreditCard className="h-3 w-3" />
                                <span>Payable in person</span>
                            </div>
                            {fee.processing_days && fee.processing_days > 0 && (
                                <div className="flex items-center gap-1 justify-end">
                                    <Clock className="h-3 w-3" />
                                    <span>{fee.processing_days} day processing</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// Optional: FeeList component for displaying multiple fees
interface FeeListProps {
    fees: Fee[];
    onFeeSelect: (fee: Fee) => void;
    selectedFeeIds?: (string | number)[];
    title?: string;
    emptyMessage?: string;
    compact?: boolean;
}

export function FeeList({ 
    fees, 
    onFeeSelect, 
    selectedFeeIds = [],
    title = "Available Fees",
    emptyMessage = "No fees available",
    compact = false
}: FeeListProps) {
    if (fees.length === 0) {
        return (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <h4 className="font-medium text-gray-700">{emptyMessage}</h4>
                <p className="text-sm text-gray-500 mt-1">Check back later for available fees</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {title && (
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <Badge variant="outline" className="text-sm">
                        {fees.length} fee{fees.length !== 1 ? 's' : ''}
                    </Badge>
                </div>
            )}
            
            <div className="space-y-3">
                {fees.map((fee) => (
                    <FeeItem
                        key={fee.id}
                        fee={fee}
                        handleFeeSelection={onFeeSelect}
                        isSelected={selectedFeeIds.includes(fee.id)}
                        compact={compact}
                    />
                ))}
            </div>
        </div>
    );
}

// Optional: FeeSummary component for checkout/summary view
interface FeeSummaryProps {
    fee: Fee;
    quantity?: number;
    totalAmount?: number;
    onRemove?: () => void;
    onQuantityChange?: (quantity: number) => void;
}

export function FeeSummary({ 
    fee, 
    quantity = 1,
    totalAmount,
    onRemove,
    onQuantityChange
}: FeeSummaryProps) {
    const baseAmount = typeof fee.base_amount === 'string' 
        ? parseFloat(fee.base_amount)
        : fee.base_amount;
    
    const calculatedTotal = totalAmount || baseAmount * quantity;

    return (
        <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-md ${getCategoryColor(fee.category)}`}>
                    {getCategoryIcon(fee.category)}
                </div>
                <div>
                    <div className="font-medium">{fee.name}</div>
                    <div className="text-sm text-gray-500">
                        {formatCurrency(baseAmount)} × {quantity}
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-4">
                {onQuantityChange && (
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                        >
                            -
                        </Button>
                        <span className="w-8 text-center font-medium">{quantity}</span>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => onQuantityChange(quantity + 1)}
                        >
                            +
                        </Button>
                    </div>
                )}
                
                <div className="text-right">
                    <div className="font-bold text-primary">
                        {formatCurrency(calculatedTotal)}
                    </div>
                    <div className="text-xs text-gray-500">
                        Total
                    </div>
                </div>
                
                {onRemove && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={onRemove}
                    >
                        ×
                    </Button>
                )}
            </div>
        </div>
    );
}