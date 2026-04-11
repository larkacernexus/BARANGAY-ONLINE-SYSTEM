// resources/js/components/admin/payment/LatePaymentSettings.tsx

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle, Percent, Calendar, Clock } from 'lucide-react';

// Import types from central types file
import { OutstandingFee, LatePaymentSettingsProps } from '@/types/admin/payments/payments';

// ========== HELPER FUNCTIONS ==========
function parseCurrencyString(amount: string | number | null | undefined): number {
    if (amount === null || amount === undefined || amount === '') return 0;
    if (typeof amount === 'number') return parseFloat(amount.toFixed(2));
    if (typeof amount === 'string') {
        const cleaned = amount.replace(/[₱,$,\s,]/g, '').trim();
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? 0 : parseFloat(parsed.toFixed(2));
    }
    return 0;
}

function formatCurrency(amount: number): string {
    if (!amount && amount !== 0) return '₱0.00';
    const numAmount = typeof amount === 'number' ? amount : parseFloat(String(amount));
    if (isNaN(numAmount)) return '₱0.00';
    return `₱${numAmount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
}

export function LatePaymentSettings({
    selectedFee,
    isLatePayment,
    setIsLatePayment,
    monthsLate,
    setMonthsLate,
    handleAddWithLateSettings,
    handleCancelLateSettings,
    onAddWithLateSettings,
    onCancelLateSettings
}: LatePaymentSettingsProps) {
    
    // Use either prop name (prefer the handle* version, fall back to on* version)
    const addWithLateSettings = handleAddWithLateSettings || onAddWithLateSettings;
    const cancelLateSettings = handleCancelLateSettings || onCancelLateSettings;
    
    // Parse amounts safely
    const baseAmount = parseCurrencyString(selectedFee.base_amount);
    const existingSurcharge = parseCurrencyString((selectedFee as any).surcharge_amount || '0');
    const existingPenalty = parseCurrencyString((selectedFee as any).penalty_amount || '0');
    const existingDiscount = parseCurrencyString((selectedFee as any).discount_amount || '0');
    const currentBalance = parseCurrencyString(selectedFee.balance);
    
    // Calculate additional charges based on late payment
    let additionalSurcharge = 0;
    let additionalPenalty = 0;
    let surchargeRate = 0;
    let penaltyRate = 0;
    
    if (isLatePayment && monthsLate > 0) {
        // Default rates if fee_type not available
        surchargeRate = 2; // 2% per month default
        penaltyRate = 5;   // 5% one-time default
        
        // Try to get rates from fee_type if available
        if ((selectedFee as any).fee_type) {
            const feeType = (selectedFee as any).fee_type;
            surchargeRate = feeType.surcharge_rate || surchargeRate;
            penaltyRate = feeType.penalty_rate || penaltyRate;
        }
        
        // Calculate surcharge (percentage per month)
        if (surchargeRate > 0) {
            additionalSurcharge = baseAmount * (surchargeRate / 100) * monthsLate;
        }
        
        // Calculate penalty (one-time percentage)
        if (penaltyRate > 0) {
            additionalPenalty = baseAmount * (penaltyRate / 100);
        }
    }
    
    const totalSurcharge = existingSurcharge + additionalSurcharge;
    const totalPenalty = existingPenalty + additionalPenalty;
    const totalAmount = baseAmount + totalSurcharge + totalPenalty - existingDiscount;
    
    // Determine if the fee is already overdue
    const isOverdue = selectedFee.status === 'overdue';
    
    return (
        <div className="mb-6 p-4 border border-yellow-200 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800">
            <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-300">
                    Late Payment Settings
                </h3>
                {isOverdue && (
                    <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
                        Overdue
                    </Badge>
                )}
            </div>
            
            <div className="mb-4 p-3 bg-white/50 dark:bg-gray-800/50 rounded border border-yellow-100 dark:border-yellow-800">
                <div className="flex justify-between items-center mb-2">
                    <div>
                        <div className="font-medium dark:text-gray-200">
                            {selectedFee.fee_name || selectedFee.fee_code}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Code: {selectedFee.fee_code}
                        </div>
                        {selectedFee.period_covered && (
                            <div className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Period: {selectedFee.period_covered}
                            </div>
                        )}
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Current Balance</div>
                        <div className="font-bold text-primary dark:text-blue-400">
                            {formatCurrency(currentBalance)}
                        </div>
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
                    <Label htmlFor="isLate" className="cursor-pointer font-medium dark:text-gray-300">
                        Apply late payment charges
                    </Label>
                </div>
                
                {isLatePayment && (
                    <div className="space-y-3 pl-6">
                        <div className="space-y-2">
                            <Label htmlFor="monthsLate" className="dark:text-gray-300">
                                Number of months late
                            </Label>
                            <div className="flex items-center gap-3">
                                <Input
                                    id="monthsLate"
                                    type="number"
                                    min="1"
                                    max="36"
                                    value={monthsLate}
                                    onChange={(e) => setMonthsLate(Math.max(1, parseInt(e.target.value) || 1))}
                                    className="w-24 dark:bg-gray-800 dark:border-gray-700"
                                />
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    month{monthsLate !== 1 ? 's' : ''}
                                </span>
                            </div>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                            {surchargeRate > 0 && (
                                <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-500">
                                    <Percent className="h-3 w-3" />
                                    <span>Surcharge: {surchargeRate}% per month ({monthsLate} month{monthsLate !== 1 ? 's' : ''})</span>
                                </div>
                            )}
                            {penaltyRate > 0 && (
                                <div className="flex items-center gap-1 text-red-600 dark:text-red-500">
                                    <AlertTriangle className="h-3 w-3" />
                                    <span>Penalty: {penaltyRate}% one-time fee</span>
                                </div>
                            )}
                            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs">
                                <Clock className="h-3 w-3" />
                                <span>Charges are calculated based on the original fee amount</span>
                            </div>
                        </div>
                        
                        <div className="pt-3 border-t border-yellow-200 dark:border-yellow-800 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Base Amount:</span>
                                <span className="dark:text-gray-300">{formatCurrency(baseAmount)}</span>
                            </div>
                            
                            {existingSurcharge > 0 && (
                                <div className="flex justify-between text-sm text-amber-600 dark:text-amber-500">
                                    <span>Existing Surcharge:</span>
                                    <span>+{formatCurrency(existingSurcharge)}</span>
                                </div>
                            )}
                            
                            {existingPenalty > 0 && (
                                <div className="flex justify-between text-sm text-red-600 dark:text-red-500">
                                    <span>Existing Penalty:</span>
                                    <span>+{formatCurrency(existingPenalty)}</span>
                                </div>
                            )}
                            
                            {existingDiscount > 0 && (
                                <div className="flex justify-between text-sm text-green-600 dark:text-green-500">
                                    <span>Existing Discount:</span>
                                    <span>-{formatCurrency(existingDiscount)}</span>
                                </div>
                            )}
                            
                            {additionalSurcharge > 0 && (
                                <div className="flex justify-between text-sm text-amber-700 dark:text-amber-400">
                                    <span>Additional Surcharge ({monthsLate} month{monthsLate !== 1 ? 's' : ''}):</span>
                                    <span>+{formatCurrency(additionalSurcharge)}</span>
                                </div>
                            )}
                            
                            {additionalPenalty > 0 && (
                                <div className="flex justify-between text-sm text-red-700 dark:text-red-400">
                                    <span>Additional Penalty:</span>
                                    <span>+{formatCurrency(additionalPenalty)}</span>
                                </div>
                            )}
                            
                            <div className="flex justify-between font-medium pt-2 border-t border-gray-200 dark:border-gray-700">
                                <span className="dark:text-gray-300">New Total Amount:</span>
                                <span className="font-bold text-primary dark:text-blue-400 text-lg">
                                    {formatCurrency(totalAmount)}
                                </span>
                            </div>
                            
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                * This amount will be added to your payment total
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            <div className="flex gap-2 mt-4 pt-3 border-t border-yellow-200 dark:border-yellow-800">
                <Button
                    type="button"
                    onClick={addWithLateSettings}
                    className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                    disabled={!addWithLateSettings}
                >
                    Add Fee with Late Charges
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={cancelLateSettings}
                    className="dark:border-gray-600 dark:text-gray-300"
                    disabled={!cancelLateSettings}
                >
                    Cancel
                </Button>
            </div>
        </div>
    );
}