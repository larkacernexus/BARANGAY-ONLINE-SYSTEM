// resources/js/utils/date.ts

/**
 * Format a date string to a readable format
 * @param date - Date string or Date object
 * @returns Formatted date string (e.g., "Mar 20, 2024 2:30 PM")
 */
export const formatDateTime = (date: string | Date | null | undefined): string => {
    if (!date) return 'N/A';
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Invalid date';
    
    return d.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
};

/**
 * Format a date string to a short date format
 * @param date - Date string or Date object
 * @returns Formatted date string (e.g., "Mar 20, 2024")
 */
export const formatDate = (date: string | Date | null | undefined): string => {
    if (!date) return 'N/A';
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Invalid date';
    
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

/**
 * Format a time string
 * @param date - Date string or Date object
 * @returns Formatted time string (e.g., "2:30 PM")
 */
export const formatTime = (date: string | Date | null | undefined): string => {
    if (!date) return 'N/A';
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Invalid time';
    
    return d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
};

/**
 * Get relative time (e.g., "2 days ago", "just now")
 * @param date - Date string or Date object
 * @returns Relative time string
 */
export const formatTimeAgo = (date: string | Date | null | undefined): string => {
    if (!date) return 'N/A';
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Invalid date';
    
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago`;
    if (diffMonths < 12) return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`;
    return `${diffYears} year${diffYears !== 1 ? 's' : ''} ago`;
};

/**
 * Check if a date is expiring soon (within 30 days)
 * @param date - Date string or Date object
 * @returns True if expiring within 30 days
 */
export const isExpiringSoon = (date: string | Date | null | undefined): boolean => {
    if (!date) return false;
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return false;
    
    const now = new Date();
    const daysUntilExpiry = Math.ceil((d.getTime() - now.getTime()) / (1000 * 3600 * 24));
    
    return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
};

/**
 * Check if a date has expired
 * @param date - Date string or Date object
 * @returns True if date has passed
 */
export const isExpired = (date: string | Date | null | undefined): boolean => {
    if (!date) return false;
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return false;
    
    const now = new Date();
    return d.getTime() < now.getTime();
};

/**
 * Format number as currency
 * @param amount - Number amount
 * @returns Formatted currency string (e.g., "₱1,234.56")
 */
export const formatCurrency = (amount: number | string | null | undefined): string => {
    const num = typeof amount === 'number' ? amount : parseFloat(String(amount || '0'));
    if (isNaN(num)) return '₱0.00';
    
    return `₱${num.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
};

/**
 * Get days until expiry
 * @param date - Date string or Date object
 * @returns Number of days until expiry
 */
export const getDaysUntilExpiry = (date: string | Date | null | undefined): number => {
    if (!date) return 0;
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return 0;
    
    const now = new Date();
    return Math.ceil((d.getTime() - now.getTime()) / (1000 * 3600 * 24));
};

/**
 * Format a date range
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Formatted date range (e.g., "Mar 20 - Mar 25, 2024")
 */
export const formatDateRange = (
    startDate: string | Date | null | undefined,
    endDate: string | Date | null | undefined
): string => {
    if (!startDate && !endDate) return 'N/A';
    if (!startDate) return `Until ${formatDate(endDate)}`;
    if (!endDate) return `From ${formatDate(startDate)}`;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start.getFullYear() === end.getFullYear()) {
        if (start.getMonth() === end.getMonth()) {
            return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { day: 'numeric', year: 'numeric' })}`;
        }
        return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    
    return `${formatDate(start)} - ${formatDate(end)}`;
};