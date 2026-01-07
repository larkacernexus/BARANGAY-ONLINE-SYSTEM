import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, Percent } from 'lucide-react';

interface FeeType {
    id: string | number;
    name: string;
    code: string;
    description?: string;
    base_amount: number | string;
    category: string;
    frequency: string;
    has_surcharge: boolean;
    surcharge_rate?: number;
    surcharge_fixed?: number;
    has_penalty: boolean;
    penalty_rate?: number;
    penalty_fixed?: number;
    validity_days?: number;
    applicable_to?: string[];
}

interface OutstandingFee {
    id: string | number;
    fee_type_id: string | number;
    fee_type?: FeeType;
    fee_code: string;
    payer_name: string;
    issue_date: string;
    due_date: string;
    base_amount: string;
    surcharge_amount: string;
    penalty_amount: string;
    discount_amount: string;
    total_amount: string;
    amount_paid: string;
    balance: string;
    status: string;
    purpose?: string;
}

interface LatePaymentSettingsProps {
    selectedFee: OutstandingFee; // Changed from Fee to OutstandingFee
    isLatePayment: boolean;
    setIsLatePayment: (value: boolean) => void;
    monthsLate: number;
    setMonthsLate: (value: number) => void;
    handleAddWithLateSettings: () => void;
    handleCancelLateSettings: () => void;
}

export function LatePaymentSettings({
    selectedFee,
    isLatePayment,
    setIsLatePayment,
    monthsLate,
    setMonthsLate,
    handleAddWithLateSettings,
    handleCancelLateSettings
}: LatePaymentSettingsProps) {
    
    // Get fee type details from the outstanding fee
    const feeType = selectedFee.fee_type;
    
    // Calculate base amount
    const parseCurrencyString = (amountString: string): number => {
        return parseFloat(amountString.replace(/[^0-9.-]+/g, ''));
    };
    
    const baseAmount = parseCurrencyString(selectedFee.base_amount);
    const existingSurcharge = parseCurrencyString(selectedFee.surcharge_amount);
    const existingPenalty = parseCurrencyString(selectedFee.penalty_amount);
    const existingDiscount = parseCurrencyString(selectedFee.discount_amount);
    
    // Calculate additional charges if late payment is selected
    let additionalSurcharge = 0;
    let additionalPenalty = 0;
    
    if (isLatePayment && feeType) {
        if (feeType.has_surcharge && feeType.surcharge_rate && monthsLate > 0) {
            additionalSurcharge = baseAmount * (feeType.surcharge_rate / 100) * monthsLate;
        }
        
        if (feeType.has_penalty && feeType.penalty_rate) {
            additionalPenalty = baseAmount * (feeType.penalty_rate / 100);
        }
    }
    
    const totalSurcharge = existingSurcharge + additionalSurcharge;
    const totalPenalty = existingPenalty + additionalPenalty;
    const totalAmount = baseAmount + totalSurcharge + totalPenalty - existingDiscount;
    
    return (
        <div className="mb-6 p-4 border border-yellow-200 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
            <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-300">
                    Late Payment Options
                </h3>
            </div>
            
            {/* Fee Information Summary */}
            <div className="mb-4 p-3 bg-white/50 rounded border border-yellow-100">
                <div className="flex justify-between items-center mb-2">
                    <div>
                        <div className="font-medium">{feeType?.name || 'Fee'}</div>
                        <div className="text-sm text-gray-500">Code: {selectedFee.fee_code}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-gray-500">Original Balance</div>
                        <div className="font-bold text-primary">{selectedFee.balance}</div>
                    </div>
                </div>
                <div className="text-xs text-gray-600">
                    Due: {selectedFee.due_date} • Status: {selectedFee.status}
                </div>
            </div>
            
            <div className="space-y-4">
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="isLate"
                        checked={isLatePayment}
                        onCheckedChange={(checked) => setIsLatePayment(checked as boolean)}
                    />
                    <Label htmlFor="isLate" className="cursor-pointer font-medium">
                        Mark as Late Payment
                    </Label>
                </div>
                
                {isLatePayment && (
                    <div className="space-y-3 pl-6">
                        <div className="space-y-2">
                            <Label htmlFor="monthsLate">How many months late?</Label>
                            <div className="flex items-center gap-3">
                                <Input
                                    id="monthsLate"
                                    type="number"
                                    min="1"
                                    max="36"
                                    value={monthsLate}
                                    onChange={(e) => setMonthsLate(parseInt(e.target.value) || 1)}
                                    className="w-20"
                                />
                                <span className="text-sm text-gray-500">months</span>
                            </div>
                        </div>
                        
                        {/* Late Payment Details */}
                        <div className="space-y-2 text-sm">
                            {feeType?.has_surcharge && feeType.surcharge_rate && (
                                <div className="text-yellow-600">
                                    <Percent className="h-3 w-3 inline mr-1" />
                                    Surcharge: {feeType.surcharge_rate}% per month
                                </div>
                            )}
                            {feeType?.has_penalty && feeType.penalty_rate && (
                                <div className="text-red-600">
                                    <AlertCircle className="h-3 w-3 inline mr-1" />
                                    Penalty: {feeType.penalty_rate}% one-time
                                </div>
                            )}
                        </div>
                        
                        {/* Calculation Breakdown */}
                        <div className="pt-3 border-t border-yellow-200 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Base Amount:</span>
                                <span>{selectedFee.base_amount}</span>
                            </div>
                            
                            {existingSurcharge > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-amber-600">Existing Surcharge:</span>
                                    <span className="text-amber-600">+{selectedFee.surcharge_amount}</span>
                                </div>
                            )}
                            
                            {existingPenalty > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-red-600">Existing Penalty:</span>
                                    <span className="text-red-600">+{selectedFee.penalty_amount}</span>
                                </div>
                            )}
                            
                            {existingDiscount > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-green-600">Existing Discount:</span>
                                    <span className="text-green-600">-{selectedFee.discount_amount}</span>
                                </div>
                            )}
                            
                            {additionalSurcharge > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-amber-700">Additional Surcharge ({monthsLate} months):</span>
                                    <span className="text-amber-700">+₱{additionalSurcharge.toFixed(2)}</span>
                                </div>
                            )}
                            
                            {additionalPenalty > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-red-700">Additional Penalty:</span>
                                    <span className="text-red-700">+₱{additionalPenalty.toFixed(2)}</span>
                                </div>
                            )}
                            
                            <div className="flex justify-between font-medium pt-2 border-t border-gray-300">
                                <span>New Total:</span>
                                <span className="font-bold text-primary">₱{totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            <div className="flex gap-2 mt-4 pt-3 border-t">
                <Button
                    type="button"
                    onClick={handleAddWithLateSettings}
                    className="flex-1"
                >
                    Add Fee with Late Charges
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelLateSettings}
                >
                    Cancel
                </Button>
            </div>
        </div>
    );
}