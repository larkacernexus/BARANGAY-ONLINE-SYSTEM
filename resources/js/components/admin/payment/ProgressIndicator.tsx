// resources/js/components/admin/payment/ProgressIndicator.tsx

import React from 'react';
import { Link } from '@inertiajs/react';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, CreditCard, UserPlus, Receipt, ArrowLeft, FileText, Package } from 'lucide-react';
import { route } from 'ziggy-js';

interface ProgressIndicatorProps {
    step: number;
    onStepClick?: (step: number) => void;
    isClearancePayment?: boolean;
    pre_filled_data?: any;
    clearance_request?: any;
    selected_fee_details?: any;
    processing?: boolean;
    paymentItemsCount?: number;
    payerSource?: 'residents' | 'households' | 'businesses' | 'clearance' | 'fees';
}

export function ProgressIndicator({ 
    step, 
    onStepClick,
    isClearancePayment = false,
    pre_filled_data,
    clearance_request,
    selected_fee_details,
    processing = false,
    paymentItemsCount = 0,
    payerSource = 'residents'
}: ProgressIndicatorProps) {
    
    const steps = [
        { number: 1, label: 'Payer', icon: UserPlus },
        { number: 2, label: 'Fees', icon: Receipt },
        { number: 3, label: 'Payment', icon: CreditCard },
    ];

    const progressPercentage = step === 1 ? 33 : step === 2 ? 66 : 100;

    const isStepClickable = (stepNumber: number) => {
        if (step >= 3) return true;
        if (step === 2) return stepNumber <= 2;
        return stepNumber === 1;
    };

    // Get payment config for header
    const getPaymentConfig = () => {
        if (payerSource === 'fees' || pre_filled_data?.fee_id || selected_fee_details) {
            return {
                icon: Receipt,
                title: 'Fee Payment',
                badge: 'Fee',
                color: 'blue'
            };
        }
        if (payerSource === 'clearance' || isClearancePayment || clearance_request || pre_filled_data?.clearance_request_id) {
            return {
                icon: FileText,
                title: 'Clearance',
                badge: 'CLR',
                color: 'emerald'
            };
        }
        return {
            icon: CreditCard,
            title: 'Payment',
            badge: 'New',
            color: 'gray'
        };
    };
    
    const config = getPaymentConfig();
    const Icon = config.icon;
    const reference = selected_fee_details?.fee_code || clearance_request?.reference_number || null;
    
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
        emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
        gray: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            {/* Header Section */}
            <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/30">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('admin.payments.index')}
                            className="p-1 -ml-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-500 dark:hover:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        
                        <div className={`p-1.5 rounded-md ${colorClasses[config.color as keyof typeof colorClasses]}`}>
                            <Icon className="w-3.5 h-3.5" />
                        </div>
                        
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                    {config.title}
                                </h2>
                                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${colorClasses[config.color as keyof typeof colorClasses]}`}>
                                    {config.badge}
                                </span>
                                {processing && (
                                    <div className="w-3 h-3 rounded-full border border-amber-500 border-t-transparent animate-spin" />
                                )}
                            </div>
                            {reference && (
                                <div className="text-[10px] text-gray-400 dark:text-gray-500 font-mono mt-0.5">
                                    {reference}
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Items Counter Badge */}
                    {paymentItemsCount > 0 && (
                        <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800">
                            <Package className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                            <div className="flex items-baseline gap-1">
                                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                    {paymentItemsCount}
                                </span>
                                <span className="text-[10px] text-gray-500 dark:text-gray-400">
                                    {paymentItemsCount === 1 ? 'item' : 'items'}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Progress Section */}
            <div className="px-4 py-3">
                <div className="flex items-center gap-3">
                    {/* Steps */}
                    <div className="flex items-center gap-1 flex-1">
                        {steps.map((s, idx) => {
                            const isCompleted = step > s.number;
                            const isCurrent = step === s.number;
                            const clickable = isStepClickable(s.number);
                            const StepIcon = s.icon;
                            
                            return (
                                <React.Fragment key={s.number}>
                                    <button
                                        type="button"
                                        onClick={() => clickable && onStepClick?.(s.number)}
                                        disabled={!clickable || isCurrent}
                                        className={`
                                            flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all
                                            ${isCurrent 
                                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' 
                                                : isCompleted
                                                ? 'text-green-600 dark:text-green-400'
                                                : clickable
                                                ? 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                                : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                            }
                                        `}
                                    >
                                        {isCompleted ? (
                                            <CheckCircle className="h-3 w-3" />
                                        ) : isCurrent ? (
                                            <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-500" />
                                        ) : (
                                            <StepIcon className="h-3 w-3" />
                                        )}
                                        <span className="hidden sm:inline">{s.label}</span>
                                    </button>
                                    
                                    {idx < steps.length - 1 && (
                                        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700 min-w-[8px]" />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>

                    {/* Percentage */}
                    <div className="text-xs font-mono text-gray-400 dark:text-gray-500 tabular-nums">
                        {progressPercentage}%
                    </div>
                </div>

                {/* Progress Bar */}
                <Progress 
                    value={progressPercentage} 
                    className="h-1 mt-2 dark:bg-gray-700" 
                    indicatorClassName="bg-gradient-to-r from-blue-600 to-indigo-600"
                />
            </div>
        </div>
    );
}