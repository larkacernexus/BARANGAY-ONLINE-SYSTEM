// payment-show/hooks/usePaymentDialogs.ts
import { useState } from 'react';
import { PaymentMethod } from '@/types/portal/payments/payment.types';

export const usePaymentDialogs = () => {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [showRefundDialog, setShowRefundDialog] = useState(false);
    const [showReceiptPreview, setShowReceiptPreview] = useState(false);
    const [showAddNoteDialog, setShowAddNoteDialog] = useState(false);
    const [showUploadDialog, setShowUploadDialog] = useState(false);
    const [showPaymentMethodDialog, setShowPaymentMethodDialog] = useState(false);
    
    const [noteContent, setNoteContent] = useState('');
    const [isPublicNote, setIsPublicNote] = useState(true);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploadDescription, setUploadDescription] = useState('');
    const [cancelReason, setCancelReason] = useState('');
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('cash');
    const [referenceNumber, setReferenceNumber] = useState('');

    const resetDialogs = () => {
        setNoteContent('');
        setIsPublicNote(true);
        setUploadFile(null);
        setUploadDescription('');
        setCancelReason('');
        setReferenceNumber('');
    };

    return {
        showDeleteDialog,
        showCancelDialog,
        showRefundDialog,
        showReceiptPreview,
        showAddNoteDialog,
        showUploadDialog,
        showPaymentMethodDialog,
        noteContent,
        setNoteContent,
        isPublicNote,
        setIsPublicNote,
        uploadFile,
        setUploadFile,
        uploadDescription,
        setUploadDescription,
        cancelReason,
        setCancelReason,
        selectedPaymentMethod,
        setSelectedPaymentMethod,
        referenceNumber,
        setReferenceNumber,
        setShowDeleteDialog,
        setShowCancelDialog,
        setShowRefundDialog,
        setShowReceiptPreview,
        setShowAddNoteDialog,
        setShowUploadDialog,
        setShowPaymentMethodDialog,
        resetDialogs
    };
};