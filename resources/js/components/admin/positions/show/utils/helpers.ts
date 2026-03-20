// resources/js/Pages/Admin/Positions/utils/helpers.tsx
import React from 'react';
import { Crown, Star, Shield, CheckCircle, XCircle } from 'lucide-react';

export const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export const formatShortDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

export const getStatusVariant = (status: boolean) => {
    return status ? 'default' : 'secondary';
};

export const getStatusIcon = (status: boolean) => {
    return status ? 
        React.createElement(CheckCircle, { className: "h-4 w-4 text-green-500 dark:text-green-400" }) : 
        React.createElement(XCircle, { className: "h-4 w-4 text-gray-500 dark:text-gray-400" });
};

export const getPositionIcon = (isCaptainPosition: boolean, isKagawadPosition: boolean) => {
    if (isCaptainPosition) return React.createElement(Crown, { className: "h-8 w-8 text-amber-600 dark:text-amber-500" });
    if (isKagawadPosition) return React.createElement(Star, { className: "h-8 w-8 text-amber-600 dark:text-amber-500" });
    return React.createElement(Shield, { className: "h-8 w-8 text-blue-600 dark:text-blue-500" });
};