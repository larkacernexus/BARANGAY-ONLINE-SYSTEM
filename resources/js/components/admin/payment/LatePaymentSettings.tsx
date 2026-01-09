// resources/js/components/admin/payment/LatePaymentSettings.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle, Percent } from 'lucide-react';

interface FeeType {
    id: string | number;
    name: string;
    code: string;
    base_amount: number | string;
    category: string;
    has_surcharge?: boolean;
    surcharge_rate?: number;
    surcharge_fixed?: number;
    has_penalty?: boolean;
    penalty_rate?: number;
    penalty_fixed?: number;
}

interface OutstandingFee {
    id: string | number;
    fee_type_id: string | number;
    fee_type?: FeeType;
    fee_code: string;
    due_date: string;
    base_amount: string;
    surcharge_amount?: string;
    penalty_amount: string;
    discount_amount?: string;
    balance: string;
    status: string;
}

interface LatePaymentSettingsProps {
    selectedFee: OutstandingFee;
    isLatePayment: boolean;
    setIsLatePayment: (value: boolean) => void;
    monthsLate: number;
    setMonthsLate: (value: number) => void;
    handleAddWithLateSettings: () => void;
    handleCancelLateSettings: () => void;
}

function parseCurrencyString(amountString: string): number {
    return parseFloat(amountString.replace(/[^0-9.-]+/g, '')) || 0;
}

function formatCurrency(amount: number): string {
    return `₱${amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
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
    
    const feeType = selectedFee.fee_type;
    const baseAmount = parseCurrencyString(selectedFee.base_amount);
    const existingSurcharge = parseCurrencyString(selectedFee.surcharge_amount || '0');
    const existingPenalty = parseCurrencyString(selectedFee.penalty_amount);
    const existingDiscount = parseCurrencyString(selectedFee.discount_amount || '0');
    
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
        <div className="mb-6 p-4 border border-yellow-200 rounded-lg bg-yellow-50">
            <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <h3 className="font-semibold text-yellow-800">
                    Late Payment Options
                </h3>
            </div>
            
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
                        
                        <div className="space-y-2 text-sm">
                            {feeType?.has_surcharge && feeType.surcharge_rate && (
                                <div className="text-yellow-600">
                                    <Percent className="h-3 w-3 inline mr-1" />
                                    Surcharge: {feeType.surcharge_rate}% per month
                                </div>
                            )}
                            {feeType?.has_penalty && feeType.penalty_rate && (
                                <div className="text-red-600">
                                    <AlertTriangle className="h-3 w-3 inline mr-1" />
                                    Penalty: {feeType.penalty_rate}% one-time
                                </div>
                            )}
                        </div>
                        
                        <div className="pt-3 border-t border-yellow-200 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Base Amount:</span>
                                <span>{selectedFee.base_amount}</span>
                            </div>
                            
                            {existingSurcharge > 0 && (
                                <div className="flex justify-between text-sm text-amber-600">
                                    <span>Existing Surcharge:</span>
                                    <span>+{selectedFee.surcharge_amount}</span>
                                </div>
                            )}
                            
                            {existingPenalty > 0 && (
                                <div className="flex justify-between text-sm text-red-600">
                                    <span>Existing Penalty:</span>
                                    <span>+{selectedFee.penalty_amount}</span>
                                </div>
                            )}
                            
                            {additionalSurcharge > 0 && (
                                <div className="flex justify-between text-sm text-amber-700">
                                    <span>Additional Surcharge:</span>
                                    <span>+{formatCurrency(additionalSurcharge)}</span>
                                </div>
                            )}
                            
                            {additionalPenalty > 0 && (
                                <div className="flex justify-between text-sm text-red-700">
                                    <span>Additional Penalty:</span>
                                    <span>+{formatCurrency(additionalPenalty)}</span>
                                </div>
                            )}
                            
                            <div className="flex justify-between font-medium pt-2 border-t border-gray-300">
                                <span>New Total:</span>
                                <span className="font-bold text-primary">{formatCurrency(totalAmount)}</span>
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