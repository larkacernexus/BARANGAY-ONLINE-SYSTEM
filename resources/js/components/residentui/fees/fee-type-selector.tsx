// /components/residentui/fees/fee-type-selector.tsx
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { DollarSign, Calendar, Info } from 'lucide-react';
import { 
    FEE_TYPES, 
    getFrequencyLabel, 
    calculateFeeAmount, 
    FeeType, 
    getDiscountRate, 
    getPenaltyRate,
    hasDiscount,
    hasPenalty
} from '@/types/fee-types';
import { cn } from '@/lib/utils';

interface FeeTypeSelectorProps {
    selectedFeeTypeId?: string;
    onSelectFeeType: (feeType: FeeType, amount: number) => void;
    showDiscounts?: boolean;
    showPenalties?: boolean;
    className?: string;
}

export const FeeTypeSelector = ({
    selectedFeeTypeId,
    onSelectFeeType,
    showDiscounts = true,
    showPenalties = true,
    className
}: FeeTypeSelectorProps) => {
    const [isSenior, setIsSenior] = useState(false);
    const [isPWD, setIsPWD] = useState(false);
    const [earlyPayment, setEarlyPayment] = useState(false);
    const [latePayment, setLatePayment] = useState(false);
    
    const handleFeeTypeSelect = (feeType: FeeType) => {
        const amount = calculateFeeAmount(feeType, {
            isSenior,
            isPWD,
            earlyPayment,
            latePayment
        });
        onSelectFeeType(feeType, amount);
    };
    
    const selectedFeeType = selectedFeeTypeId 
        ? FEE_TYPES.find(ft => ft.id.toString() === selectedFeeTypeId)
        : null;
    
    const discount = selectedFeeType ? getDiscountRate(selectedFeeType) : 0;
    const penalty = selectedFeeType ? getPenaltyRate(selectedFeeType) : 0;
    const showDiscountOptions = showDiscounts && selectedFeeType && hasDiscount(selectedFeeType);
    const showPenaltyOptions = showPenalties && selectedFeeType && hasPenalty(selectedFeeType);
    
    return (
        <div className={cn('space-y-4', className)}>
            <RadioGroup
                value={selectedFeeTypeId}
                onValueChange={(value) => {
                    const feeType = FEE_TYPES.find(ft => ft.id.toString() === value);
                    if (feeType) handleFeeTypeSelect(feeType);
                }}
                className="space-y-3"
            >
                {FEE_TYPES.filter(ft => ft.is_active).map((feeType) => {
                    const Icon = feeType.icon;
                    const baseAmount = feeType.amount;
                    const discountedAmount = calculateFeeAmount(feeType, { isSenior, isPWD });
                    const earlyDiscountAmount = calculateFeeAmount(feeType, { isSenior, isPWD, earlyPayment: true });
                    const latePenaltyAmount = calculateFeeAmount(feeType, { isSenior, isPWD, latePayment: true });
                    
                    return (
                        <Card
                            key={feeType.id}
                            className={cn(
                                'p-4 cursor-pointer transition-all hover:shadow-md',
                                selectedFeeTypeId === feeType.id.toString() && 'ring-2 ring-blue-500'
                            )}
                            onClick={() => handleFeeTypeSelect(feeType)}
                        >
                            <div className="flex items-start gap-3">
                                <RadioGroupItem value={feeType.id.toString()} id={feeType.id.toString()} />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className={cn('p-1.5 rounded-lg', feeType.bgColor)}>
                                            <Icon className={cn('h-4 w-4', feeType.color)} />
                                        </div>
                                        <Label
                                            htmlFor={feeType.id.toString()}
                                            className="font-semibold cursor-pointer"
                                        >
                                            {feeType.name}
                                        </Label>
                                        <span className="text-xs text-gray-500">
                                            {feeType.code}
                                        </span>
                                    </div>
                                    
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                        {feeType.description}
                                    </p>
                                    
                                    <div className="flex flex-wrap gap-4 text-sm">
                                        <div className="flex items-center gap-1">
                                            <DollarSign className="h-4 w-4 text-gray-400" />
                                            <span className="font-medium">
                                                ₱{baseAmount.toLocaleString()}
                                            </span>
                                            {discountedAmount !== baseAmount && (
                                                <span className="text-xs text-green-600">
                                                    (₱{discountedAmount.toLocaleString()} with discount)
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                            <span>{getFrequencyLabel(feeType.frequency)}</span>
                                        </div>
                                        {feeType.requires_approval && (
                                            <div className="flex items-center gap-1 text-yellow-600">
                                                <Info className="h-4 w-4" />
                                                <span className="text-xs">Requires approval</span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {(showDiscounts || showPenalties) && (
                                        <div className="mt-3 pt-3 border-t text-xs text-gray-500">
                                            {getDiscountRate(feeType) > 0 && (
                                                <span className="mr-3">
                                                    💰 {getDiscountRate(feeType) * 100}% early payment discount
                                                </span>
                                            )}
                                            {getPenaltyRate(feeType) > 0 && (
                                                <span>
                                                    ⚠️ {getPenaltyRate(feeType) * 100}% late payment penalty
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </RadioGroup>
            
            {/* Discount/Penalty Options */}
            {(showDiscountOptions || showPenaltyOptions) && (
                <Card className="p-4 bg-gray-50 dark:bg-gray-800/50">
                    <h4 className="font-medium mb-3">Additional Options</h4>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isSenior"
                                checked={isSenior}
                                onChange={(e) => setIsSenior(e.target.checked)}
                                className="rounded border-gray-300"
                            />
                            <Label htmlFor="isSenior" className="text-sm cursor-pointer">
                                Senior Citizen (20% discount)
                            </Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isPWD"
                                checked={isPWD}
                                onChange={(e) => setIsPWD(e.target.checked)}
                                className="rounded border-gray-300"
                            />
                            <Label htmlFor="isPWD" className="text-sm cursor-pointer">
                                Person with Disability (20% discount)
                            </Label>
                        </div>
                        {showDiscountOptions && discount > 0 && (
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="earlyPayment"
                                    checked={earlyPayment}
                                    onChange={(e) => setEarlyPayment(e.target.checked)}
                                    className="rounded border-gray-300"
                                />
                                <Label htmlFor="earlyPayment" className="text-sm cursor-pointer">
                                    Early Payment ({discount * 100}% discount)
                                </Label>
                            </div>
                        )}
                        {showPenaltyOptions && penalty > 0 && (
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="latePayment"
                                    checked={latePayment}
                                    onChange={(e) => setLatePayment(e.target.checked)}
                                    className="rounded border-gray-300"
                                />
                                <Label htmlFor="latePayment" className="text-sm cursor-pointer">
                                    Late Payment ({penalty * 100}% penalty)
                                </Label>
                            </div>
                        )}
                    </div>
                </Card>
            )}
        </div>
    );
};