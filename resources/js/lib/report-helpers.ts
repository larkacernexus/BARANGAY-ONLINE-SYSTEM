export const formatCurrency = (amount: number, withDecimals: boolean = true): string => {
    if (amount === null || amount === undefined) return '₱0.00';
    const num = parseFloat(amount as any);
    if (isNaN(num)) return '₱0.00';
    
    return `₱${num.toLocaleString('en-PH', {
        minimumFractionDigits: withDecimals ? 2 : 0,
        maximumFractionDigits: withDecimals ? 2 : 0
    })}`;
};

export const formatDate = (dateString: string, includeTime: boolean = false): string => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            ...(includeTime && { hour: '2-digit', minute: '2-digit' })
        };
        
        return date.toLocaleDateString('en-PH', options);
    } catch {
        return '';
    }
};

export const calculatePercentageChange = (current: number, previous: number): number => {
    if (!previous || previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / Math.abs(previous)) * 100;
};

export const parsePeriodToDate = (period: string, periodType: string): Date => {
    try {
        const date = new Date(period);
        if (!isNaN(date.getTime())) return date;
        
        if (periodType === 'month') {
            return new Date(period);
        } else if (periodType === 'week') {
            const match = period.match(/Week (\d+), (\d+)/);
            if (match) {
                const week = parseInt(match[1]);
                const year = parseInt(match[2]);
                return new Date(year, 0, (week - 1) * 7 + 1);
            }
        }
        
        return new Date();
    } catch {
        return new Date();
    }
};

export const isDateInRange = (date: Date, startDate: string, endDate: string): boolean => {
    if (!date) return false;
    try {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        return date >= start && date <= end;
    } catch {
        return false;
    }
};