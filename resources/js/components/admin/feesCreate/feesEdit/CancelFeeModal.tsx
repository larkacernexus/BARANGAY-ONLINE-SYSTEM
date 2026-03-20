// components/admin/feesEdit/CancelFeeModal.tsx

import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Info } from 'lucide-react';

interface CancelFeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    fee: any;
}

export default function CancelFeeModal({ isOpen, onClose, fee }: CancelFeeModalProps) {
    const [reason, setReason] = useState('');
    const { post, processing } = useForm();

    const handleCancel = () => {
        if (!reason.trim()) {
            alert('Please provide a reason for cancellation');
            return;
        }

        post(`/admin/fees/${fee.id}/cancel`, {
            data: { reason },
            onSuccess: () => {
                setReason('');
                onClose();
            }
        });
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent className="max-w-md dark:bg-gray-900">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                        <AlertCircle className="h-5 w-5" />
                        Cancel Fee
                    </AlertDialogTitle>
                    <AlertDialogDescription className="space-y-4 dark:text-gray-300">
                        <p>
                            Are you sure you want to cancel this fee? This action cannot be undone.
                        </p>
                        
                        <div className="rounded-lg bg-gray-50 p-4 space-y-2 dark:bg-gray-900">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <span className="font-medium">Fee Code:</span>
                                <span className="font-mono">{fee.fee_code}</span>
                                
                                <span className="font-medium">Payer:</span>
                                <span>{fee.payer_name}</span>
                                
                                <span className="font-medium">Amount:</span>
                                <span className="font-semibold">₱{parseFloat(fee.total_amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                                
                                <span className="font-medium">Status:</span>
                                <span className="capitalize">{fee.status}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium dark:text-gray-200 flex items-center gap-1">
                                Reason for Cancellation <span className="text-red-500">*</span>
                            </label>
                            <Textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Please provide a detailed reason for cancelling this fee..."
                                rows={4}
                                className="dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-start gap-1 mt-1">
                                <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                This reason will be recorded and visible in the fee history.
                            </p>
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2">
                    <AlertDialogCancel onClick={onClose} className="dark:border-gray-700 dark:text-gray-300">
                        No, Keep Fee
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleCancel}
                        disabled={processing || !reason.trim()}
                        className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white"
                    >
                        {processing ? 'Cancelling...' : 'Yes, Cancel Fee'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}