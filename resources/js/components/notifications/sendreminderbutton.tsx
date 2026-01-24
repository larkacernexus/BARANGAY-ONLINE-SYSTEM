import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Bell, Loader2, Check } from 'lucide-react';

interface SendReminderButtonProps {
  feeId: number;
  type?: 'reminder' | 'due_today' | 'overdue';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'secondary' | 'danger' | 'outline';
}

const SendReminderButton: React.FC<SendReminderButtonProps> = ({
  feeId,
  type = 'reminder',
  className = '',
  size = 'md',
  variant = 'secondary'
}) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSendReminder = async () => {
    if (!confirm(`Send ${type} notification for this fee?`)) return;
    
    setLoading(true);
    try {
      await router.post(`/api/fees/${feeId}/send-reminder`, { type });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error sending reminder:', error);
    } finally {
      setLoading(false);
    }
  };

  const getButtonText = () => {
    switch (type) {
      case 'overdue': return 'Send Overdue Notice';
      case 'due_today': return 'Send Due Today Notice';
      default: return 'Send Reminder';
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
      case 'danger': return 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white';
      case 'outline': return 'bg-white border border-gray-300 hover:bg-gray-50 focus:ring-indigo-500 text-gray-700';
      default: return 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 text-white';
    }
  };

  return (
    <button
      onClick={handleSendReminder}
      disabled={loading || success}
      className={`
        ${getSizeClasses()} 
        ${getVariantClasses()}
        ${className}
        inline-flex items-center justify-center rounded-md border border-transparent font-medium
        uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-offset-2
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
          <Bell className="h-4 w-4" />
          <span>{getButtonText()}</span>
        </>
      )}
    </button>
  );
};

export default SendReminderButton;