// resources/js/Pages/Admin/Users/utils/helpers.tsx
import React from 'react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export const formatDate = (dateString: string | null, includeTime: boolean = false) => {
    if (!dateString) return 'N/A';
    try {
        const date = parseISO(dateString);
        return format(date, includeTime ? 'MMM dd, yyyy hh:mm a' : 'MMM dd, yyyy');
    } catch {
        return 'Invalid date';
    }
};

export const getFullName = (user: { first_name: string | null; last_name: string | null; email: string }) => {
    if (user.first_name && user.last_name) {
        return `${user.first_name} ${user.last_name}`.trim();
    }
    return user.email || 'Unknown User';
};

export const getInitials = (name: string) => {
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

export const getStatusColor = (status: string) => {
    switch (status) {
        case 'active':
            return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
        case 'inactive':
            return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700';
        default:
            return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
    }
};

export const getStatusIcon = (status: string) => {
    switch (status) {
        case 'active':
            return <CheckCircle className="h-3 w-3" />;
        case 'inactive':
            return <XCircle className="h-3 w-3" />;
        default:
            return <AlertCircle className="h-3 w-3" />;
    }
};

export const getSecurityScore = (user: any) => {
    let score = 0;
    if (user.email_verified_at) score += 25;
    if (user.two_factor_confirmed_at) score += 35;
    if (user.password_changed_at) {
        const daysSinceChange = differenceInDays(new Date(), parseISO(user.password_changed_at));
        if (daysSinceChange < 90) score += 25;
        else if (daysSinceChange < 180) score += 15;
        else score += 5;
    } else {
        score += 5;
    }
    if (user.last_login_at) score += 15;
    return score;
};

export const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
};

export const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-red-500';
};

export const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
};