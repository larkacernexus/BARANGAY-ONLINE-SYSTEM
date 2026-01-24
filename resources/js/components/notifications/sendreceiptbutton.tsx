import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Receipt, Loader2, Check } from 'lucide-react';

interface SendReceiptButtonProps {
  paymentId: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const SendReceiptButton: React.FC<SendReceiptButtonProps> = ({
  paymentId,
  className = '',
  size = 'md'
}) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSendReceipt = async () => {
    if (!confirm('Send payment receipt notification?')) return;
    
    setLoading(true);
    try {
      await router.post(`/api/payments/${paymentId}/send-receipt`);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error sending receipt:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'px-2 py-1 text-xs';
      case 'lg': return 'px-6 py-3 text-sm';
      default: return 'px-4 py-2 text-sm';
    }
  };

  return (
    <button
      onClick={handleSendReceipt}
      disabled={loading || success}
      className={`
        ${getSizeClasses()} 
        ${className}
        inline-flex items-center justify-center rounded-md border border-transparent
        bg-green-600 hover:bg-green-700 focus:ring-green-500
        font-medium uppercase tracking-widest text-white
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 transition ease-in-out duration-150 space-x-2
      `}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : success ? (
        <>
          <Check className="h-4 w-4" />
          <span>Sent</span>
        </>
      ) : (
        <>
          <Receipt className="h-4 w-4" />
          <span>Send Receipt</span>
        </>
      )}
    </button>
  );
};

export default SendReceiptButton;