import { format, isAfter } from 'date-fns';

export const feesUtils = {
    formatCurrency: (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2
        }).format(amount);
    },

    formatDate: (dateString: string) => {
        return format(new Date(dateString), 'MMM dd, yyyy');
    },

    isOverdue: (dueDate: string) => {
        const due = new Date(dueDate);
        const today = new Date();
        return isAfter(today, due);
    },

    getDaysOverdue: (dueDate: string) => {
        const due = new Date(dueDate);
        const today = new Date();
        const diffTime = today.getTime() - due.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    },

    truncateText: (text: string, maxLength: number = 30): string => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    },

    getTruncationLength: (type: 'name' | 'contact' | 'code' = 'name', windowWidth: number): number => {
        if (windowWidth < 640) {
            switch(type) {
                case 'name': return 15;
                case 'contact': return 10;
                case 'code': return 12;
                default: return 15;
            }
        }
        if (windowWidth < 768) {
            switch(type) {
                case 'name': return 20;
                case 'contact': return 12;
                case 'code': return 15;
                default: return 20;
            }
        }
        if (windowWidth < 1024) {
            switch(type) {
                case 'name': return 25;
                case 'contact': return 15;
                case 'code': return 18;
                default: return 25;
            }
        }
        switch(type) {
            case 'name': return 30;
            case 'contact': return 15;
            case 'code': return 20;
            default: return 30;
        }
    },

    getStatusIcon: (status: string) => {
        switch (status) {
            case 'paid': return 'check-circle';
            case 'issued': return 'file-text';
            case 'pending': return 'clock';
            case 'partially_paid': return 'dollar-sign';
            case 'overdue': return 'alert-circle';
            default: return null;
        }
    },

    getPayerIcon: (payerType: string) => {
        switch (payerType) {
            case 'resident': return 'user';
            case 'household': return 'home';
            case 'business': return 'building';
            default: return 'user';
        }
    }
};

