// resources/js/components/admin/payment/paymentCreate/components/VerificationModal.tsx
import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, IdCard, Shield, X } from 'lucide-react';
import { DiscountRule } from '@/components/admin/payment/paymentCreate/types';

interface VerificationModalProps {
    show: boolean;
    onClose: () => void;
    onSubmit: () => void;
    discountRule?: DiscountRule;
    idNumber: string;
    onIdNumberChange: (value: string) => void;
    remarks: string;
    onRemarksChange: (value: string) => void;
}

export function VerificationModal({
    show,
    onClose,
    onSubmit,
    discountRule,
    idNumber,
    onIdNumberChange,
    remarks,
    onRemarksChange
}: VerificationModalProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    
    // Log whenever props change
    useEffect(() => {
        console.log('🔍 VerificationModal - Props changed:', {
            show,
            hasDiscountRule: !!discountRule,
            discountRuleName: discountRule?.name,
            discountRuleCode: discountRule?.code,
            requiresVerification: discountRule?.requires_verification,
            idNumberLength: idNumber.length,
            remarksLength: remarks.length
        });
    }, [show, discountRule, idNumber, remarks]);

    // Focus input when modal opens
    useEffect(() => {
        if (show && inputRef.current) {
            console.log('🎯 Focusing input field');
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [show]);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && show) {
                console.log('🔑 Escape key pressed, closing modal');
                onClose();
            }
        };
        
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [show, onClose]);

    // Handle submit on Enter
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey && idNumber.trim()) {
            e.preventDefault();
            console.log('⏎ Enter key pressed, submitting');
            onSubmit();
        }
    };

    // Don't render anything if not showing
    if (!show) {
        console.log('👻 Modal not showing, returning null');
        return null;
    }

    console.log('📱 Rendering modal, show=', show, 'discountRule=', !!discountRule);

    // If no discount rule, show loading but with proper structure
    if (!discountRule) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]" onClick={onClose}>
                <div className="bg-white rounded-lg p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                        <p className="text-gray-600 font-medium">Loading discount details...</p>
                        <p className="text-sm text-gray-500">Please wait</p>
                        <Button variant="outline" onClick={onClose} className="mt-4">
                            Cancel
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]" 
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 relative animate-in fade-in zoom-in duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header with close button */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-yellow-100 rounded-full">
                            <Shield className="h-5 w-5 text-yellow-600" />
                        </div>
                        <h3 className="text-xl font-semibold">Verification Required</h3>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>
                
                <div className="p-6 space-y-5">
                    {/* Discount Info Card */}
                    <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-4 rounded-lg border border-primary/20">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-600">Discount:</span>
                            <span className="text-lg font-bold text-primary">{discountRule.name}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-600">Value:</span>
                            <span className="text-base font-semibold bg-white px-3 py-1 rounded-full border border-primary/20">
                                {discountRule.formatted_value}
                            </span>
                        </div>
                        {discountRule.minimum_purchase_amount > 0 && (
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-600">Min. Purchase:</span>
                                <span className="text-sm font-medium">
                                    ₱{discountRule.minimum_purchase_amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                </span>
                            </div>
                        )}
                    </div>
                    
                    {/* Required Document */}
                    <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">
                            Required Document
                        </Label>
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-800 flex items-center gap-2">
                                <IdCard className="h-4 w-4 flex-shrink-0" />
                                <span className="font-medium">{discountRule.verification_document || 'Valid Government ID'}</span>
                            </p>
                        </div>
                    </div>
                    
                    {/* ID Number Input */}
                    <div className="space-y-2">
                        <Label htmlFor="idNumber" className="text-sm font-medium text-gray-700">
                            ID Number <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            ref={inputRef}
                            id="idNumber"
                            value={idNumber}
                            onChange={(e) => onIdNumberChange(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="e.g., SC-2024-00123, PWD-2024-001"
                            className="w-full text-base"
                            autoComplete="off"
                        />
                        <p className="text-xs text-gray-500">
                            Enter the ID number exactly as shown on the document
                        </p>
                    </div>
                    
                    {/* Remarks */}
                    <div className="space-y-2">
                        <Label htmlFor="remarks" className="text-sm font-medium text-gray-700">
                            Remarks <span className="text-gray-400">(Optional)</span>
                        </Label>
                        <Textarea
                            id="remarks"
                            value={remarks}
                            onChange={(e) => onRemarksChange(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Additional notes (e.g., ID expiry, observations)"
                            rows={3}
                            className="resize-none"
                        />
                    </div>
                    
                    {/* Warning */}
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-xs text-amber-800 flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                            <span>
                                By applying this discount, you confirm that the payer has presented 
                                valid documentation and is eligible. This action will be logged.
                            </span>
                        </p>
                    </div>
                </div>
                
                {/* Footer with buttons */}
                <div className="flex gap-3 p-6 border-t bg-gray-50 rounded-b-lg">
                    <Button
                        onClick={() => {
                            console.log('✅ Submit button clicked, idNumber:', idNumber);
                            onSubmit();
                        }}
                        className="flex-1"
                        disabled={!idNumber.trim()}
                        size="lg"
                    >
                        {idNumber.trim() ? 'Apply Discount' : 'Enter ID Number'}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => {
                            console.log('❌ Cancel button clicked');
                            onClose();
                        }}
                        size="lg"
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default VerificationModal;