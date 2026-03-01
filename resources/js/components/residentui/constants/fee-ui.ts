import { 
    CheckCircle, 
    Clock, 
    CreditCard, 
    FileText, 
    AlertCircle 
} from 'lucide-react';

export const FEE_STATUS_CONFIG = {
    paid: {
        label: 'Paid',
        icon: CheckCircle,
        color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        gradient: 'from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/20'
    },
    pending: {
        label: 'Pending',
        icon: Clock,
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        gradient: 'from-yellow-50 to-yellow-100/50 dark:from-yellow-900/20 dark:to-yellow-800/20'
    },
    partially_paid: {
        label: 'Partially Paid',
        icon: CreditCard,
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        gradient: 'from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20'
    },
    issued: {
        label: 'Issued',
        icon: FileText,
        color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
        gradient: 'from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/20'
    },
    overdue: {
        label: 'Overdue',
        icon: AlertCircle,
        color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        gradient: 'from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/20'
    },
};