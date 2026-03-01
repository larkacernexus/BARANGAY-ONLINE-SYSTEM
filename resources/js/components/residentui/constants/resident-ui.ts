import { 
    Clock, 
    Loader2, 
    DollarSign, 
    CheckCircle, 
    XCircle, 
    FileCheck 
} from 'lucide-react';

export const STATUS_CONFIG = {
    pending: { 
        label: 'Pending', 
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', 
        icon: Clock,
        gradient: 'from-yellow-50 to-yellow-100/50 dark:from-yellow-900/20 dark:to-yellow-800/20'
    },
    processing: { 
        label: 'Processing', 
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', 
        icon: Loader2,
        gradient: 'from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20'
    },
    ready_for_payment: { 
        label: 'Ready for Payment', 
        color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400', 
        icon: DollarSign,
        gradient: 'from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/20'
    },
    paid: { 
        label: 'Paid', 
        color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', 
        icon: CheckCircle,
        gradient: 'from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/20'
    },
    approved: { 
        label: 'Approved', 
        color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', 
        icon: CheckCircle,
        gradient: 'from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/20'
    },
    issued: { 
        label: 'Issued', 
        color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400', 
        icon: FileCheck,
        gradient: 'from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/20'
    },
    rejected: { 
        label: 'Rejected', 
        color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', 
        icon: XCircle,
        gradient: 'from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/20'
    },
    cancelled: { 
        label: 'Cancelled', 
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400', 
        icon: XCircle,
        gradient: 'from-gray-50 to-gray-100/50 dark:from-gray-800 dark:to-gray-700'
    },
};

export const URGENCY_CONFIG = {
    normal: { 
        label: 'Normal', 
        color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        dot: 'bg-blue-500'
    },
    rush: { 
        label: 'Rush', 
        color: 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
        dot: 'bg-orange-500'
    },
    express: { 
        label: 'Express', 
        color: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        dot: 'bg-red-500'
    },
};