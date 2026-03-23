// payment-show/hooks/usePaymentActions.ts
import { useState } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { route } from 'ziggy-js';
import { Payment } from '@/types/portal/payments/payment.types';

interface UsePaymentActionsProps {
    payment: Payment;
    canEdit: boolean;
    canDelete: boolean;
    canAddNote: boolean;
    canUploadAttachment: boolean;
    canPayOnline: boolean;
}

export const usePaymentActions = ({ 
    payment, 
    canEdit, 
    canDelete, 
    canAddNote, 
    canUploadAttachment, 
    canPayOnline 
}: UsePaymentActionsProps) => {
    const [loading, setLoading] = useState(false);
    const [isDownloadingReceipt, setIsDownloadingReceipt] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);
    const [isSavingReceipt, setIsSavingReceipt] = useState(false);

    const handlePrintReceipt = () => {
        setIsPrinting(true);
        router.get(route('portal.my.payments.receipt.view', payment.id), {}, {
            preserveState: false,
            onFinish: () => setIsPrinting(false),
            onError: () => toast.error('Failed to generate receipt'),
        });
    };

    const handleDownloadReceipt = () => {
        setIsDownloadingReceipt(true);
        window.location.href = route('portal.resident.my.payments.receipt.download', payment.id);
        setTimeout(() => setIsDownloadingReceipt(false), 3000);
    };

    const handleSaveReceipt = () => {
        setIsSavingReceipt(true);
        router.post(route('portal.resident.my.payments.receipt.save', payment.id), {
            receipt_number: `RCP-${payment.or_number}-${new Date().getFullYear()}`,
            or_number: payment.or_number,
            receipt_type: payment.collection_type || 'payment',
            payer_name: payment.payer_details?.name || 'Unknown',
            payer_address: payment.payer_details?.address || null,
            subtotal: payment.subtotal,
            surcharge: payment.surcharge,
            penalty: payment.penalty,
            discount: payment.discount,
            total_amount: payment.total_amount,
            amount_paid: payment.status === 'paid' || payment.status === 'completed' ? payment.total_amount : 0,
            change_due: 0,
            payment_method: payment.payment_method,
            reference_number: payment.reference_number,
            payment_date: payment.payment_date || new Date().toISOString(),
            issued_date: new Date().toISOString(),
            issued_by: 'Resident',
            fee_breakdown: payment.items?.map(item => ({
                fee_name: item.item_name || item.fee_name || 'Payment Item',
                fee_code: item.fee_code,
                base_amount: item.unit_price,
                total_amount: item.total
            })) || [],
            notes: payment.remarks,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Receipt saved successfully!');
                setIsSavingReceipt(false);
            },
            onError: () => {
                toast.error('Failed to save receipt');
                setIsSavingReceipt(false);
            },
        });
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: `Payment Receipt - OR #${payment.or_number}`,
                text: `Payment of ${payment.formatted_total} for ${payment.purpose}`,
                url: window.location.href,
            }).catch(() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success('Link copied to clipboard');
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success('Link copied to clipboard');
        }
    };

    const copyOrNumber = () => {
        navigator.clipboard.writeText(payment.or_number)
            .then(() => toast.success('OR number copied to clipboard!'))
            .catch(() => toast.error('Failed to copy'));
    };

    const handleEdit = () => {
        router.get(`/portal/payments/${payment.id}/edit`);
    };

    const handleDelete = () => {
        setLoading(true);
        router.delete(route('portal.resident.payments.destroy', payment.id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Payment deleted successfully');
                router.get('/payments');
            },
            onError: () => {
                toast.error('Failed to delete payment');
                setLoading(false);
            },
            onFinish: () => setLoading(false),
        });
    };

    const handleCancel = (reason: string) => {
        setLoading(true);
        router.put(route('portal.resident.payments.cancel', payment.id), { reason }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Payment cancelled successfully');
                router.reload();
            },
            onError: () => {
                toast.error('Failed to cancel payment');
                setLoading(false);
            },
            onFinish: () => setLoading(false),
        });
    };

    const handleUpdatePaymentMethod = (paymentMethod: string, referenceNumber: string) => {
        setLoading(true);
        router.put(route('portal.resident.payments.update-method', payment.id), {
            payment_method: paymentMethod,
            reference_number: referenceNumber
        }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Payment method updated successfully');
                router.reload();
            },
            onError: () => {
                toast.error('Failed to update payment method');
                setLoading(false);
            },
            onFinish: () => setLoading(false),
        });
    };

    const handleAddNote = (content: string, isPublic: boolean) => {
        setLoading(true);
        router.post(route('portal.resident.payments.notes.store', payment.id), {
            content,
            is_public: isPublic
        }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Note added successfully');
                router.reload();
            },
            onError: () => {
                toast.error('Failed to add note');
                setLoading(false);
            },
            onFinish: () => setLoading(false),
        });
    };

    const handleUploadAttachment = (file: File, description: string) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('description', description);
        
        setLoading(true);
        router.post(route('portal.resident.payments.attachments.store', payment.id), formData, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('File uploaded successfully');
                router.reload();
            },
            onError: () => {
                toast.error('Failed to upload file');
                setLoading(false);
            },
            onFinish: () => setLoading(false),
        });
    };

    const handleDownloadAttachment = (attachmentId: number) => {
        window.location.href = route('portal.resident.payments.attachments.download', [payment.id, attachmentId]);
    };

    const handleDeleteAttachment = (attachmentId: number) => {
        if (!confirm('Are you sure you want to delete this attachment?')) return;
        
        setLoading(true);
        router.delete(route('portal.resident.payments.attachments.destroy', [payment.id, attachmentId]), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Attachment deleted successfully');
                router.reload();
            },
            onError: () => {
                toast.error('Failed to delete attachment');
                setLoading(false);
            },
            onFinish: () => setLoading(false),
        });
    };

    const handleGetPaymentLink = () => {
        setLoading(true);
        router.get(route('portal.resident.payments.payment-link', payment.id), {}, {
            preserveScroll: true,
            onSuccess: () => setLoading(false),
            onError: () => {
                toast.error('Failed to generate payment link');
                setLoading(false);
            },
        });
    };

    return {
        loading,
        isDownloadingReceipt,
        isPrinting,
        isSavingReceipt,
        handlePrintReceipt,
        handleDownloadReceipt,
        handleSaveReceipt,
        handleShare,
        handleEdit,
        handleDelete,
        handleCancel,
        handleUpdatePaymentMethod,
        handleAddNote,
        handleUploadAttachment,
        handleDownloadAttachment,
        handleDeleteAttachment,
        handleGetPaymentLink,
        copyOrNumber,
        setLoading
    };
};