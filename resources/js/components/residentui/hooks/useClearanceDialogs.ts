// clearance-show/hooks/useClearanceDialogs.ts
import { useState } from 'react';

export const useClearanceDialogs = () => {
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [showPaymentDialog, setShowPaymentDialog] = useState(false);
    const [showMessageDialog, setShowMessageDialog] = useState(false);

    return {
        showCancelDialog,
        showPaymentDialog,
        showMessageDialog,
        setShowCancelDialog,
        setShowPaymentDialog,
        setShowMessageDialog
    };
};