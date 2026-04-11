// resources/js/components/admin/payment/paymentCreate/components/VerificationModal.tsx

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, IdCard, Shield, X, CheckCircle, Loader2, Search, UserCheck } from 'lucide-react';
import { DiscountRule } from '@/types/admin/payments/payments';
import axios from 'axios';

interface VerificationModalProps {
    show: boolean;
    onClose: () => void;
    onSubmit: (verificationData: { 
        idNumber: string; 
        remarks: string; 
        isValid: boolean; 
        privilegeId?: number; 
        privilegeData?: any;
        discountTypeId?: number;
        discountTypeCode?: string;
        discountTypeName?: string;
        discountPercentage?: number;
        requiresIdNumber?: boolean;
        requiresVerification?: boolean;
        verificationDocument?: string | null;
        validityDays?: number;
    }) => void;
    discountRule?: DiscountRule;
    idNumber: string;
    onIdNumberChange: (value: string) => void;
    remarks: string;
    onRemarksChange: (value: string) => void;
    isLoading?: boolean;
    payerId?: string | number | null | undefined;
    payerType?: string;
    discountCode?: string;
}

// Helper to format discount value
const formatDiscountValue = (rule: DiscountRule): string => {
    if (rule.value_type === 'percentage') {
        return `${rule.discount_value || rule.value || 0}% OFF`;
    }
    const amount = rule.discount_value || rule.value || 0;
    return `₱${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} OFF`;
};

// Helper to format currency
const formatCurrency = (amount: number): string => {
    return `₱${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

interface VerificationResult {
    isValid: boolean;
    privilegeId?: number;
    privilegeName?: string;
    privilegeCode?: string;
    discountTypeId?: number;
    discountTypeCode?: string;
    discountTypeName?: string;
    message?: string;
    idNumber?: string;
    expiresAt?: string;
    discountPercentage?: number;
    requiresIdNumber?: boolean;
    requiresVerification?: boolean;
    verificationDocument?: string | null;
    validityDays?: number;
    privilegeData?: {
        id: number;
        name: string;
        code: string;
        id_number: string;
        expires_at: string;
        discount_percentage: number;
    };
}

// Helper to get CSRF token reliably
const getCsrfToken = (): string | null => {
    const metaToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (metaToken) return metaToken;
    
    if ((window as any).Laravel && (window as any).Laravel.csrfToken) {
        return (window as any).Laravel.csrfToken;
    }
    
    const inputToken = document.querySelector('input[name="_token"]')?.getAttribute('value');
    if (inputToken) return inputToken;
    
    return null;
};

// Set axios defaults once
const csrfToken = getCsrfToken();
if (csrfToken) {
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;
    axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
    axios.defaults.withCredentials = true;
}

export function VerificationModal({
    show,
    onClose,
    onSubmit,
    discountRule,
    idNumber,
    onIdNumberChange,
    remarks,
    onRemarksChange,
    isLoading = false,
    payerId,
    payerType,
    discountCode
}: VerificationModalProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
    const [verificationError, setVerificationError] = useState<string | null>(null);

    // Focus input when modal opens
    useEffect(() => {
        if (show && inputRef.current) {
            const timer = setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
            return () => clearTimeout(timer);
        }
        if (show) {
            setVerificationResult(null);
            setVerificationError(null);
        }
    }, [show]);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && show && !isLoading && !isVerifying) {
                onClose();
            }
        };
        
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [show, isLoading, isVerifying, onClose]);

    // Handle click outside
    const handleBackdropClick = useCallback((e: React.MouseEvent) => {
        if (e.target === e.currentTarget && !isLoading && !isVerifying) {
            onClose();
        }
    }, [isLoading, isVerifying, onClose]);

    // Verify ID number against database
    const verifyIdNumber = useCallback(async () => {
        if (!idNumber.trim()) {
            setVerificationError('Please enter an ID number');
            return false;
        }

        if (!payerId || !payerType) {
            console.error('Missing payer info:', { payerId, payerType });
            setVerificationError('Payer information not available. Please try again.');
            return false;
        }

        setIsVerifying(true);
        setVerificationError(null);
        setVerificationResult(null);

        try {
            // Convert payer_type to the format backend expects
            let backendPayerType = '';
            
            const payerTypeLower = String(payerType).toLowerCase();
            
            if (payerTypeLower === 'resident' || payerTypeLower.includes('resident')) {
                backendPayerType = 'App\\Models\\Resident';
            } else if (payerTypeLower === 'household' || payerTypeLower.includes('household')) {
                backendPayerType = 'App\\Models\\Household';
            } else if (payerTypeLower === 'business' || payerTypeLower.includes('business')) {
                backendPayerType = 'App\\Models\\Business';
            } else {
                backendPayerType = String(payerType);
            }

            // ✅ FIXED: Get the discount type code from the discount rule
            let discountTypeCode = '';
            
            if (discountRule) {
                // First try to get discount_type_code directly from the rule
                if ((discountRule as any).discount_type_code) {
                    discountTypeCode = (discountRule as any).discount_type_code;
                }
                // Then try to get from discount_type
                else if ((discountRule as any).discount_type) {
                    discountTypeCode = (discountRule as any).discount_type;
                }
                // Then try to map from name
                else {
                    const discountName = (discountRule.name || '').toLowerCase();
                    if (discountName.includes('senior')) {
                        discountTypeCode = 'SENIOR';
                    } else if (discountName.includes('pwd')) {
                        discountTypeCode = 'PWD';
                    } else if (discountName.includes('solo')) {
                        discountTypeCode = 'SOLO_PARENT';
                    } else if (discountName.includes('indigent')) {
                        discountTypeCode = 'INDIGENT';
                    } else if (discountName.includes('student')) {
                        discountTypeCode = 'STUDENT';
                    } else if (discountName.includes('veteran')) {
                        discountTypeCode = 'VETERAN';
                    }
                }
            }
            
            // Also check discountCode parameter if discountTypeCode not found
            if (!discountTypeCode && discountCode) {
                const discountLower = discountCode.toLowerCase();
                if (discountLower.includes('senior')) {
                    discountTypeCode = 'SENIOR';
                } else if (discountLower.includes('pwd')) {
                    discountTypeCode = 'PWD';
                } else if (discountLower.includes('solo')) {
                    discountTypeCode = 'SOLO_PARENT';
                } else if (discountLower.includes('indigent')) {
                    discountTypeCode = 'INDIGENT';
                }
            }

            console.log('🔍 Verification request:', {
                id_number: idNumber.trim(),
                payer_id: payerId,
                original_payer_type: payerType,
                converted_payer_type: backendPayerType,
                discount_code: discountTypeCode,
                discount_rule_name: discountRule?.name
            });

            // Send request to backend
            const response = await axios.post('/admin/payments/verify-discount-id', {
                id_number: idNumber.trim(),
                payer_id: payerId,
                payer_type: backendPayerType,
                discount_code: discountTypeCode,
                privilege_code: '' // Not needed, we use discount_code
            });

            console.log('✅ Verification response:', response.data);

            if (response.data.success) {
                setVerificationResult({
                    isValid: true,
                    privilegeId: response.data.privilege_id,
                    privilegeName: response.data.privilege_name,
                    privilegeCode: response.data.privilege_code,
                    discountTypeId: response.data.discount_type_id,
                    discountTypeCode: response.data.discount_type_code,
                    discountTypeName: response.data.discount_type_name,
                    message: response.data.message,
                    idNumber: response.data.id_number,
                    expiresAt: response.data.expires_at,
                    discountPercentage: response.data.discount_percentage,
                    requiresIdNumber: response.data.requires_id_number,
                    requiresVerification: response.data.requires_verification,
                    verificationDocument: response.data.verification_document,
                    validityDays: response.data.validity_days,
                    privilegeData: response.data.privilege_data
                });
                setVerificationError(null);
                return true;
            } else {
                setVerificationError(response.data.message || 'Invalid ID number. Please check and try again.');
                setVerificationResult(null);
                return false;
            }
        } catch (error: any) {
            console.error('Error verifying ID number:', error);
            
            let errorMessage = 'Failed to verify ID number. Please try again.';
            
            if (error.response) {
                console.error('Error response:', error.response.data);
                errorMessage = error.response.data?.message || errorMessage;
                
                if (error.response.status === 422 && error.response.data.errors) {
                    const errors = Object.values(error.response.data.errors).flat();
                    errorMessage = errors[0] as string || errorMessage;
                } else if (error.response.status === 419) {
                    errorMessage = 'Session expired. Please refresh the page and try again.';
                } else if (error.response.status === 405) {
                    errorMessage = 'Route not found. Please check your connection.';
                }
            } else if (error.request) {
                errorMessage = 'Network error. Please check your connection.';
            }
            
            setVerificationError(errorMessage);
            setVerificationResult(null);
            return false;
        } finally {
            setIsVerifying(false);
        }
    }, [idNumber, payerId, payerType, discountCode, discountRule]);

    // Handle submit with verification
    const handleSubmit = useCallback(async () => {
        if (!idNumber.trim()) {
            setVerificationError('Please enter an ID number');
            return;
        }

        // First verify the ID number
        const isValid = await verifyIdNumber();
        
        if (isValid && verificationResult) {
            onSubmit({
                idNumber: idNumber.trim(),
                remarks: remarks,
                isValid: true,
                privilegeId: verificationResult.privilegeId,
                privilegeData: verificationResult.privilegeData,
                discountTypeId: verificationResult.discountTypeId,
                discountTypeCode: verificationResult.discountTypeCode,
                discountTypeName: verificationResult.discountTypeName,
                discountPercentage: verificationResult.discountPercentage,
                requiresIdNumber: verificationResult.requiresIdNumber,
                requiresVerification: verificationResult.requiresVerification,
                verificationDocument: verificationResult.verificationDocument,
                validityDays: verificationResult.validityDays
            });
        }
    }, [idNumber, remarks, verifyIdNumber, verificationResult, onSubmit]);

    // Handle submit on Enter
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey && idNumber.trim() && !isLoading && !isVerifying) {
            e.preventDefault();
            if (verificationResult?.isValid) {
                handleSubmit();
            } else {
                verifyIdNumber();
            }
        }
    }, [idNumber, isLoading, isVerifying, verificationResult, handleSubmit, verifyIdNumber]);

    // Reset form when modal closes
    useEffect(() => {
        if (!show) {
            const timer = setTimeout(() => {
                if (!show && idNumber) {
                    onIdNumberChange('');
                }
                if (!show && remarks) {
                    onRemarksChange('');
                }
                setVerificationResult(null);
                setVerificationError(null);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [show, idNumber, remarks, onIdNumberChange, onRemarksChange]);

    if (!show) return null;

    // Get verification document from discount rule's discount_type or fallback
    const getVerificationDocument = (): string => {
        // First try from discount rule's discount_type_verification_document
        if ((discountRule as any)?.discount_type_verification_document) {
            return (discountRule as any).discount_type_verification_document;
        }
        // Fallback to discount rule's verification_document
        if (discountRule?.verification_document) {
            return discountRule.verification_document;
        }
        return 'Valid Government ID';
    };

    // Check if verification is required from discount type
    const getRequiresVerification = (): boolean => {
        if ((discountRule as any)?.discount_type_requires_verification !== undefined) {
            return (discountRule as any).discount_type_requires_verification;
        }
        return discountRule?.requires_verification || false;
    };

    // Loading state
    if (isLoading || isVerifying) {
        return (
            <div 
                className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-[9999] p-4"
                onClick={handleBackdropClick}
            >
                <div 
                    ref={modalRef}
                    className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-[90vw] sm:max-w-md md:max-w-lg relative animate-in fade-in zoom-in duration-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex flex-col items-center justify-center p-6 sm:p-8 space-y-4">
                        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-primary border-t-transparent" />
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-medium text-center">
                            {isVerifying ? 'Verifying ID number...' : 'Applying discount...'}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 text-center">
                            {isVerifying ? 'Please wait while we verify the ID number against our records' : 'Please wait'}
                        </p>
                        <Button 
                            variant="outline" 
                            onClick={onClose} 
                            className="mt-2 sm:mt-4 w-full sm:w-auto"
                            disabled={isVerifying}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // No discount rule found
    if (!discountRule) {
        return (
            <div 
                className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-[9999] p-4"
                onClick={handleBackdropClick}
            >
                <div 
                    className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-[90vw] sm:max-w-md relative animate-in fade-in zoom-in duration-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex flex-col items-center justify-center p-6 sm:p-8 space-y-4 text-center">
                        <div className="p-2 sm:p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                            <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-600 dark:text-red-400" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">Discount Not Found</h3>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                            The discount rule could not be loaded. Please try again or contact support.
                        </p>
                        <Button onClick={onClose} className="mt-2 w-full sm:w-auto">
                            Close
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    const isSubmitDisabled = !idNumber.trim() || isLoading || isVerifying;
    const discountValueDisplay = formatDiscountValue(discountRule);
    const minPurchaseAmount = discountRule.minimum_purchase_amount || 0;
    const verificationDocument = getVerificationDocument();
    const requiresVerification = getRequiresVerification();
    const isIdValid = verificationResult?.isValid === true;

    return (
        <div 
            className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-[9999] p-3 sm:p-4 md:p-6 overflow-y-auto"
            onClick={handleBackdropClick}
        >
            <div 
                ref={modalRef}
                className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-md lg:max-w-lg relative animate-in fade-in zoom-in duration-200 my-auto max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
                style={{
                    maxWidth: 'min(95vw, 500px)',
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 sm:p-5 md:p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-10">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <div className="p-2 sm:p-2.5 bg-amber-100 dark:bg-amber-900/30 rounded-full flex-shrink-0">
                            <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100 truncate">
                            Verification Required
                        </h3>
                    </div>
                    <button 
                        onClick={onClose}
                        disabled={isLoading || isVerifying}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors disabled:opacity-50 flex-shrink-0"
                        aria-label="Close"
                    >
                        <X className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>
                
                {/* Content */}
                <div className="p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5">
                    {/* Discount Info Card */}
                    <div className="bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5 p-3 sm:p-4 rounded-lg border border-primary/20 dark:border-primary/30">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2 mb-2">
                            <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Discount:</span>
                            <span className="text-sm sm:text-base md:text-lg font-bold text-primary dark:text-primary-400 break-words">
                                {discountRule.name}
                            </span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2 mb-2">
                            <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Value:</span>
                            <span className="text-sm sm:text-base font-semibold bg-white dark:bg-gray-800 px-2 sm:px-3 py-1 rounded-full border border-primary/20 dark:border-primary/30 text-gray-900 dark:text-gray-100 inline-block">
                                {discountValueDisplay}
                            </span>
                        </div>
                        {minPurchaseAmount > 0 && (
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2">
                                <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Min. Purchase:</span>
                                <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {formatCurrency(minPurchaseAmount)}
                                </span>
                            </div>
                        )}
                        {discountRule.description && (
                            <div className="mt-2 pt-2 border-t border-primary/20 dark:border-primary/30">
                                <p className="text-xs text-gray-500 dark:text-gray-400 break-words">{discountRule.description}</p>
                            </div>
                        )}
                    </div>
                    
                    {/* Verification Status - Show if ID is valid */}
                    {isIdValid && (
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                            <div className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-green-800 dark:text-green-300">
                                        ✓ ID Verified Successfully
                                    </p>
                                    {/* Show discount type info */}
                                    {verificationResult.discountTypeName && (
                                        <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                                            Discount Type: {verificationResult.discountTypeName} ({verificationResult.discountTypeCode})
                                        </p>
                                    )}
                                    {/* Show privilege info */}
                                    {verificationResult.privilegeName && (
                                        <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                                            Privilege: {verificationResult.privilegeName} ({verificationResult.privilegeCode})
                                        </p>
                                    )}
                                    {/* Show discount percentage */}
                                    {verificationResult.discountPercentage !== undefined && (
                                        <p className="text-xs font-semibold text-green-700 dark:text-green-400 mt-1">
                                            Discount: {verificationResult.discountPercentage}% OFF
                                        </p>
                                    )}
                                    {verificationResult.idNumber && (
                                        <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                                            ID Number: {verificationResult.idNumber}
                                        </p>
                                    )}
                                    {verificationResult.expiresAt && (
                                        <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                                            Valid until: {new Date(verificationResult.expiresAt).toLocaleDateString()}
                                        </p>
                                    )}
                                    {verificationResult.validityDays && (
                                        <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                                            Validity: {verificationResult.validityDays} days
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Required Document */}
                    <div>
                        <Label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2 block">
                            Required Document
                        </Label>
                        <div className="p-2.5 sm:p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-300 flex items-center gap-2 break-words">
                                <IdCard className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                <span className="font-medium break-words">{verificationDocument}</span>
                            </p>
                        </div>
                    </div>
                    
                    {/* ID Number Input with Verify Button */}
                    <div className="space-y-1.5 sm:space-y-2">
                        <Label htmlFor="idNumber" className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                            ID Number <span className="text-red-500 dark:text-red-400">*</span>
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                ref={inputRef}
                                id="idNumber"
                                type="text"
                                value={idNumber}
                                onChange={(e) => {
                                    onIdNumberChange(e.target.value);
                                    if (verificationResult) {
                                        setVerificationResult(null);
                                        setVerificationError(null);
                                    }
                                }}
                                onKeyDown={handleKeyDown}
                                placeholder="e.g., SC-2024-00123, PWD-2024-001"
                                className="flex-1 text-sm sm:text-base bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                autoComplete="off"
                                disabled={isLoading || isVerifying || isIdValid}
                                aria-required="true"
                            />
                            {!isIdValid && (
                                <Button
                                    type="button"
                                    onClick={verifyIdNumber}
                                    disabled={!idNumber.trim() || isVerifying}
                                    variant="outline"
                                    size="sm"
                                    className="whitespace-nowrap"
                                >
                                    {isVerifying ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Search className="h-4 w-4 mr-1" />
                                            Verify
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                        
                        {/* Error message */}
                        {verificationError && !isIdValid && (
                            <div className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mt-2">
                                <p className="text-xs text-red-600 dark:text-red-400 flex items-start gap-2">
                                    <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 mt-0.5" />
                                    <span>{verificationError}</span>
                                </p>
                            </div>
                        )}
                        
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Enter the ID number exactly as shown on the document, then click Verify
                        </p>
                    </div>
                    
                    {/* Remarks */}
                    <div className="space-y-1.5 sm:space-y-2">
                        <Label htmlFor="remarks" className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                            Remarks <span className="text-gray-400 dark:text-gray-500">(Optional)</span>
                        </Label>
                        <Textarea
                            id="remarks"
                            value={remarks}
                            onChange={(e) => onRemarksChange(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Additional notes (e.g., ID expiry, observations)"
                            rows={3}
                            className="resize-none bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm"
                            disabled={isLoading || isVerifying}
                        />
                    </div>
                    
                    {/* Warning */}
                    <div className="p-2.5 sm:p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                        <p className="text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                            <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 mt-0.5" />
                            <span className="text-xs sm:text-xs">
                                By applying this discount, you confirm that the payer has presented 
                                valid documentation and is eligible. This action will be logged.
                            </span>
                        </p>
                    </div>
                </div>
                
                {/* Footer */}
                <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 p-4 sm:p-5 md:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-lg sticky bottom-0">
                    <Button
                        onClick={handleSubmit}
                        className="w-full sm:flex-1"
                        disabled={isSubmitDisabled || !isIdValid}
                        size={window.innerWidth < 640 ? "default" : "lg"}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin mr-2" />
                                Applying...
                            </>
                        ) : isIdValid ? (
                            <>
                                <UserCheck className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                                Apply Discount
                            </>
                        ) : idNumber.trim() ? (
                            'Verify ID First'
                        ) : (
                            'Enter ID Number'
                        )}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading || isVerifying}
                        size={window.innerWidth < 640 ? "default" : "lg"}
                        className="w-full sm:w-auto border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default VerificationModal;