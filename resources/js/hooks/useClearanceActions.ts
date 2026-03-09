import { useState } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { ClearanceRequest } from '@/types/clearance';

export function useClearanceActions(clearance: ClearanceRequest) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);

    const handlePrint = () => {
        setIsPrinting(true);
        router.get(`/admin/clearances/${clearance.id}/print`, {}, {
            onFinish: () => setIsPrinting(false)
        });
    };

    const handleDownload = () => {
        router.get(`/admin/clearances/${clearance.id}/download`);
    };

    const handleMarkAsProcessing = () => {
        if (confirm('Mark this request as "Under Processing"?')) {
            setIsProcessing(true);
            router.post(`/admin/clearances/${clearance.id}/process`, {}, {
                onSuccess: () => setIsProcessing(false),
                onError: () => setIsProcessing(false)
            });
        }
    };

    const handleApprove = () => {
        if (confirm('Approve this clearance request?')) {
            setIsProcessing(true);
            router.post(`/admin/clearances/${clearance.id}/approve`, {}, {
                onSuccess: () => setIsProcessing(false),
                onError: () => setIsProcessing(false)
            });
        }
    };

    const handleIssue = () => {
        if (confirm('Issue this clearance certificate?')) {
            setIsProcessing(true);
            router.post(`/admin/clearances/${clearance.id}/issue`, {}, {
                onSuccess: () => setIsProcessing(false),
                onError: () => setIsProcessing(false)
            });
        }
    };

    const handleReject = () => {
        const reason = prompt('Please enter the reason for rejection:');
        if (reason) {
            setIsProcessing(true);
            router.post(`/admin/clearances/${clearance.id}/reject`, { reason }, {
                onSuccess: () => setIsProcessing(false),
                onError: () => setIsProcessing(false)
            });
        }
    };

    const handleCancel = () => {
        const reason = prompt('Please enter the reason for cancellation:');
        if (reason !== null) {
            setIsProcessing(true);
            router.post(`/admin/clearances/${clearance.id}/cancel`, { reason }, {
                onSuccess: () => setIsProcessing(false),
                onError: () => setIsProcessing(false)
            });
        }
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this clearance request? This action cannot be undone.')) {
            router.delete(`/admin/clearances/${clearance.id}`);
        }
    };

    const handleEdit = () => {
        router.visit(`/admin/clearances/${clearance.id}/edit`);
    };

    const handleVerifyPayment = () => {
        if (confirm('Mark this payment as verified? This will update the payment status to paid.')) {
            router.post(`/admin/clearances/${clearance.id}/verify-payment`, {}, {
                onSuccess: () => {
                    toast.success('Payment verified successfully');
                },
                onError: () => {
                    toast.error('Failed to verify payment');
                }
            });
        }
    };

    const handleRequestPayment = () => {
        if (confirm('Send payment request to the resident?')) {
            router.post(`/admin/clearances/${clearance.id}/request-payment`, {}, {
                onSuccess: () => {
                    toast.success('Payment request sent');
                },
                onError: () => {
                    toast.error('Failed to send payment request');
                }
            });
        }
    };

    const handleSendReminder = () => {
        if (confirm('Send payment reminder to the resident?')) {
            router.post(`/admin/clearances/${clearance.id}/send-payment-reminder`, {}, {
                onSuccess: () => {
                    toast.success('Payment reminder sent');
                },
                onError: () => {
                    toast.error('Failed to send reminder');
                }
            });
        }
    };

    const copyReferenceNumber = () => {
        navigator.clipboard.writeText(clearance.reference_number);
        toast.success('Reference number copied to clipboard!');
    };

    return {
        isProcessing,
        isPrinting,
        setIsPrinting,
        handlePrint,
        handleDownload,
        handleMarkAsProcessing,
        handleApprove,
        handleIssue,
        handleReject,
        handleCancel,
        handleDelete,
        handleEdit,
        handleVerifyPayment,
        handleRequestPayment,
        handleSendReminder,
        copyReferenceNumber
    };
}