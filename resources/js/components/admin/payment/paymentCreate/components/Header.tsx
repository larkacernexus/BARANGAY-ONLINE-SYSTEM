// resources/js/components/admin/payment/paymentCreate/components/Header.tsx

import React from 'react';
import { Link } from '@inertiajs/react';
import { ArrowLeft, FileText, Receipt, CreditCard } from 'lucide-react';
import { route } from 'ziggy-js';

interface HeaderProps {
    isClearancePayment: boolean;
    pre_filled_data?: any;
    clearance_request?: any;
    selected_fee_details?: any;
    processing: boolean;
    paymentItemsCount: number;
    payerSource: 'residents' | 'households' | 'clearance' | 'fees'; // 🔴 ADD THIS
}

export default function Header({
    isClearancePayment,
    pre_filled_data,
    clearance_request,
    selected_fee_details,
    processing,
    paymentItemsCount,
    payerSource // 🔴 ADD THIS
}: HeaderProps) {
    
    // 🔴 FIXED: Determine payment type based on payerSource and pre_filled_data
    const getPaymentType = () => {
        // Fee payment takes priority
        if (payerSource === 'fees' || pre_filled_data?.fee_id || selected_fee_details) {
            return {
                icon: <Receipt className="w-5 h-5 text-blue-600" />,
                title: 'Fee Payment',
                badge: 'Fee',
                badgeColor: 'bg-blue-100 text-blue-800',
                description: 'Pay for barangay fees and charges'
            };
        }
        
        // Clearance payment
        if (payerSource === 'clearance' || isClearancePayment || clearance_request || pre_filled_data?.clearance_request_id) {
            return {
                icon: <FileText className="w-5 h-5 text-emerald-600" />,
                title: 'Clearance Payment',
                badge: 'Clearance',
                badgeColor: 'bg-emerald-100 text-emerald-800',
                description: 'Pay for barangay clearance certificates'
            };
        }
        
        // Manual payment
        return {
            icon: <CreditCard className="w-5 h-5 text-gray-600" />,
            title: 'Record Payment',
            badge: 'Manual',
            badgeColor: 'bg-gray-100 text-gray-800',
            description: 'Record a manual payment transaction'
        };
    };
    
    const paymentType = getPaymentType();
    
    // Get payment reference info
    const getReferenceInfo = () => {
        if (pre_filled_data?.fee_id || selected_fee_details) {
            return {
                label: 'Fee Reference',
                value: selected_fee_details?.fee_code || pre_filled_data?.fee_id,
                subtext: selected_fee_details?.fee_type_name || 'Fee Payment'
            };
        }
        
        if (clearance_request) {
            return {
                label: 'Clearance Reference',
                value: clearance_request.reference_number,
                subtext: clearance_request.purpose || 'Barangay Clearance'
            };
        }
        
        return null;
    };
    
    const referenceInfo = getReferenceInfo();
    
    return (
        <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link
                        href={route('payments.index')}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-50 rounded-lg">
                            {paymentType.icon}
                        </div>
                        <div>
                            <div className="flex items-center space-x-2">
                                <h1 className="text-xl font-semibold text-gray-900">
                                    {paymentType.title}
                                </h1>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${paymentType.badgeColor}`}>
                                    {paymentType.badge}
                                </span>
                                {processing && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                        Processing...
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-500">
                                {paymentType.description}
                            </p>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center space-x-6">
                    {/* Payment Summary */}
                    <div className="text-right">
                        <div className="text-sm text-gray-500">
                            {paymentItemsCount} {paymentItemsCount === 1 ? 'Item' : 'Items'}
                        </div>
                        {referenceInfo && (
                            <div className="mt-1">
                                <div className="text-xs text-gray-400">
                                    {referenceInfo.label}
                                </div>
                                <div className="text-sm font-medium text-gray-900">
                                    {referenceInfo.value}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {referenceInfo.subtext}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Status Bar */}
            <div className="mt-4 flex items-center space-x-4 text-xs text-gray-500 border-t border-gray-100 pt-4">
                <div className="flex items-center space-x-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${paymentType.badgeColor.split(' ')[0]}`} />
                    <span>{paymentType.badge} Mode</span>
                </div>
                
                {pre_filled_data?.fee_id && (
                    <div className="flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <span>Pre-filled from Fees</span>
                    </div>
                )}
                
                {clearance_request && (
                    <div className="flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>From Clearance Request</span>
                    </div>
                )}
                
                {selected_fee_details?.applicable_discounts?.length > 0 && (
                    <div className="flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                        <span>Discount Eligible</span>
                    </div>
                )}
            </div>
        </div>
    );
}