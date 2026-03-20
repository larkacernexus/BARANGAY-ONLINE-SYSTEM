// resources/js/Pages/Admin/Payments/utils/helpers.tsx
import { JSX } from 'react';
import {
    CheckCircle,
    Clock,
    XCircle,
    RefreshCw,
    DollarSign,
    Smartphone,
    Globe,
    Banknote,
    FileText,
    CreditCard,
    User,
    Users,
    Building2,
    Home,
    Shield,
    Award,
    Briefcase,
    File,
    FileType,
    MapPin,
    Phone,
    Mail,
    Calendar,
    AlertTriangle,
    Tag,
    Percent,
    Check,
    Info,
    History,
    ExternalLink,
    Database,
    Receipt,
    FileBarChart,
    FileCheck,
    ChevronUp,
    ChevronDown,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

// Route helper
export const getRoute = (name: string, params?: any) => {
    if (typeof window !== 'undefined' && (window as any).route) {
        try {
            return (window as any).route(name, params);
        } catch (e) {
            console.warn(`Route ${name} not found`);
        }
    }
    
    const fallbacks: Record<string, any> = {
        'admin.payments.index': '/admin/payments',
        'admin.residents.show': (id: number) => `/admin/residents/${id}`,
        'admin.households.show': (id: number) => `/admin/households/${id}`,
        'admin.clearance-requests.show': (id: number) => `/admin/clearances/${id}`,
        'admin.fees.show': (id: number) => `/admin/fees/${id}`,
        'admin.dashboard': '/dashboard',
    };
    
    const fallback = fallbacks[name];
    if (typeof fallback === 'function') {
        return fallback(params);
    }
    return fallback || '/';
};

// Format currency
export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
};

// Format date
export const formatDate = (dateString: string | undefined, includeTime: boolean = false) => {
    if (!dateString) return 'N/A';
    try {
        const date = parseISO(dateString);
        return format(date, includeTime ? 'MMM dd, yyyy hh:mm a' : 'MMM dd, yyyy');
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid Date';
    }
};

// Get status icon
export const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
        case 'completed': 
            return <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />;
        case 'pending': 
            return <Clock className="h-5 w-5 text-amber-500 dark:text-amber-400" />;
        case 'cancelled':
            return <XCircle className="h-5 w-5 text-red-500 dark:text-red-400" />;
        case 'refunded':
            return <RefreshCw className="h-5 w-5 text-purple-500 dark:text-purple-400" />;
        default: 
            return <Clock className="h-5 w-5 text-gray-500 dark:text-gray-400" />;
    }
};

// Get status color
export const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
        case 'completed': 
            return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
        case 'pending': 
            return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
        case 'cancelled':
            return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
        case 'refunded':
            return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800';
        default: 
            return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700';
    }
};

// Get method icon
export const getMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
        case 'cash': 
            return <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />;
        case 'gcash':
            return <Smartphone className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
        case 'maya':
            return <Smartphone className="h-5 w-5 text-purple-600 dark:text-purple-400" />;
        case 'online':
            return <Globe className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />;
        case 'bank':
            return <Banknote className="h-5 w-5 text-orange-600 dark:text-orange-400" />;
        case 'check':
            return <FileText className="h-5 w-5 text-red-600 dark:text-red-400" />;
        default: 
            return <CreditCard className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
    }
};

// Get payer icon
export const getPayerIcon = (payerType: string) => {
    switch (payerType.toLowerCase()) {
        case 'resident': 
            return <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
        case 'household':
            return <Users className="h-5 w-5 text-green-600 dark:text-green-400" />;
        case 'business':
            return <Building2 className="h-5 w-5 text-teal-600 dark:text-teal-400" />;
        default: 
            return <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
    }
};

// Get certificate icon
export const getCertificateIcon = (certificateType?: string) => {
    if (!certificateType) return <File className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
    
    const icons: Record<string, JSX.Element> = {
        'residency': <Home className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
        'indigency': <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />,
        'clearance': <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />,
        'cedula': <FileType className="h-5 w-5 text-orange-600 dark:text-orange-400" />,
        'business': <Briefcase className="h-5 w-5 text-teal-600 dark:text-teal-400" />,
        'other': <File className="h-5 w-5 text-gray-600 dark:text-gray-400" />,
    };
    
    return icons[certificateType] || <File className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
};

// Get urgency color
export const getUrgencyColor = (urgency: string) => {
    switch (urgency.toLowerCase()) {
        case 'express':
            return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
        case 'rush':
            return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800';
        case 'normal':
            return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700';
    }
};

// Get fee status icon
export const getFeeStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
        case 'paid':
        case 'completed':
            return <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />;
        case 'pending':
        case 'unpaid':
            return <Clock className="h-4 w-4 text-amber-500 dark:text-amber-400" />;
        case 'cancelled':
            return <XCircle className="h-4 w-4 text-red-500 dark:text-red-400" />;
        case 'overdue':
            return <AlertTriangle className="h-4 w-4 text-red-500 dark:text-red-400" />;
        default:
            return <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />;
    }
};

// Get fee status color
export const getFeeStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
        case 'paid':
        case 'completed':
            return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
        case 'pending':
        case 'unpaid':
            return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
        case 'cancelled':
            return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
        case 'overdue':
            return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700';
    }
};

// Get payer icon for fees
export const getFeePayerIcon = (payerType: string) => {
    switch (payerType.toLowerCase()) {
        case 'resident':
            return <User className="h-4 w-4" />;
        case 'household':
            return <Users className="h-4 w-4" />;
        case 'business':
            return <Building2 className="h-4 w-4" />;
        default:
            return <User className="h-4 w-4" />;
    }
};