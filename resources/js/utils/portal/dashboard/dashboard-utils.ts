// /components/residentui/dashboard/utils.ts
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2
    }).format(amount || 0);
};

export const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
};

export const getStatusBadge = (status: string): string => {
    const variants: Record<string, string> = {
        completed: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
        paid: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
        approved: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
        pending: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
        processing: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
        'in-progress': 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
        rejected: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
        cancelled: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
        overdue: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
    };
    
    return variants[status?.toLowerCase()] || 'bg-gray-50 text-gray-600 dark:bg-gray-500/10 dark:text-gray-400';
};