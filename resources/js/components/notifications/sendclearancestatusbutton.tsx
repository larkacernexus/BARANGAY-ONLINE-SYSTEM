import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { FileText, Loader2, Check } from 'lucide-react';

interface SendClearanceStatusButtonProps {
  clearanceRequestId: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'info' | 'success' | 'warning';
}

const SendClearanceStatusButton: React.FC<SendClearanceStatusButtonProps> = ({
  clearanceRequestId,
  className = '',
  size = 'md',
  variant = 'info'
}) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSendStatus = async () => {
    if (!confirm('Send clearance status notification?')) return;
    
    setLoading(true);
    try {
      await router.post(`/api/clearance-requests/${clearanceRequestId}/send-status`);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error sending status:', error);
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

  const getVariantClasses = () => {
    switch (variant) {
      case 'success': return 'bg-green-600 hover:bg-green-700 focus:ring-green-500';
      case 'warning': return 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500';
      default: return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';
    }
  };

  return (
    <button
      onClick={handleSendStatus}
      disabled={loading || success}
      className={`
        ${getSizeClasses()} 
        ${getVariantClasses()}
        ${className}
        inline-flex items-center justify-center rounded-md border border-transparent
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
          <FileText className="h-4 w-4" />
          <span>Send Status</span>
        </>
      )}
    </button>
  );
};

export default SendClearanceStatusButton;