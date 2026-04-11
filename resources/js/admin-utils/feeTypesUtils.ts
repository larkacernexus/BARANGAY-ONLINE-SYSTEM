// utils/feeTypesUtils.ts
import { FeeType, FilterState, SelectionStats, CategoryDetails } from '@/types/admin/fee-types/fee.types';
import { FileText, Briefcase, Shield, DollarSign, Heart, Tag } from 'lucide-react';
import React from 'react';

export const formatCurrency = (amount: any): string => {
    if (amount === null || amount === undefined || amount === '') {
        return '₱0.00';
    }
    
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
    
    if (isNaN(numAmount)) {
        return '₱0.00';
    }
    
    return `₱${numAmount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
};

export const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch {
        return 'Invalid date';
    }
};

// Remove the old getCategoryIcon and getCategoryColor functions since they're no longer needed
// or keep them for backward compatibility but mark as deprecated

export const getCategoryIcon = (iconName?: string) => {
    // Deprecated - kept for backward compatibility
    return null;
};

export const getCategoryColor = (color?: string) => {
    // Deprecated - kept for backward compatibility
    return 'bg-gray-100 text-gray-800 border-gray-200';
};

// Updated getCategoryDetails function that matches the expected return type
export const getCategoryDetails = (feeType: FeeType): CategoryDetails => {
    // Get category slug or name from feeType
    const categoryName = feeType.document_category?.name?.toLowerCase() || '';
    const categorySlug = feeType.document_category?.slug?.toLowerCase() || categoryName;
    
    // Define category configurations with all required properties
    const categories: Record<string, CategoryDetails> = {
        tax: {
            name: 'Taxes',
            icon: React.createElement(Briefcase, { className: "h-4 w-4" }),
            color: 'blue',
            bgColor: 'bg-blue-100 dark:bg-blue-900/30',
            textColor: 'text-blue-700 dark:text-blue-400',
            borderColor: 'border-blue-200 dark:border-blue-800'
        },
        clearance: {
            name: 'Clearances',
            icon: React.createElement(FileText, { className: "h-4 w-4" }),
            color: 'green',
            bgColor: 'bg-green-100 dark:bg-green-900/30',
            textColor: 'text-green-700 dark:text-green-400',
            borderColor: 'border-green-200 dark:border-green-800'
        },
        permit: {
            name: 'Permits',
            icon: React.createElement(Shield, { className: "h-4 w-4" }),
            color: 'purple',
            bgColor: 'bg-purple-100 dark:bg-purple-900/30',
            textColor: 'text-purple-700 dark:text-purple-400',
            borderColor: 'border-purple-200 dark:border-purple-800'
        },
        fee: {
            name: 'Fees',
            icon: React.createElement(DollarSign, { className: "h-4 w-4" }),
            color: 'yellow',
            bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
            textColor: 'text-yellow-700 dark:text-yellow-400',
            borderColor: 'border-yellow-200 dark:border-yellow-800'
        },
        donation: {
            name: 'Donations',
            icon: React.createElement(Heart, { className: "h-4 w-4" }),
            color: 'red',
            bgColor: 'bg-red-100 dark:bg-red-900/30',
            textColor: 'text-red-700 dark:text-red-400',
            borderColor: 'border-red-200 dark:border-red-800'
        },
        barangay: {
            name: 'Barangay',
            icon: React.createElement(FileText, { className: "h-4 w-4" }),
            color: 'teal',
            bgColor: 'bg-teal-100 dark:bg-teal-900/30',
            textColor: 'text-teal-700 dark:text-teal-400',
            borderColor: 'border-teal-200 dark:border-teal-800'
        },
        business: {
            name: 'Business',
            icon: React.createElement(Briefcase, { className: "h-4 w-4" }),
            color: 'indigo',
            bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
            textColor: 'text-indigo-700 dark:text-indigo-400',
            borderColor: 'border-indigo-200 dark:border-indigo-800'
        },
        default: {
            name: feeType.document_category?.name || 'Other',
            icon: React.createElement(Tag, { className: "h-4 w-4" }),
            color: 'gray',
            bgColor: 'bg-gray-100 dark:bg-gray-800',
            textColor: 'text-gray-700 dark:text-gray-400',
            borderColor: 'border-gray-200 dark:border-gray-700'
        }
    };
    
    // Try to find a matching category
    let matchedKey = 'default';
    for (const key of Object.keys(categories)) {
        if (categorySlug.includes(key) || categoryName.includes(key)) {
            matchedKey = key;
            break;
        }
    }
    
    const result = categories[matchedKey] || categories.default;
    
    // Override the name with the actual category name if available
    if (feeType.document_category?.name && matchedKey === 'default') {
        return {
            ...result,
            name: feeType.document_category.name
        };
    }
    
    return result;
};

export const safeNumber = (value: any, defaultValue: number = 0): number => {
    if (value === null || value === undefined || value === '') return defaultValue;
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
};

export const getSelectionStats = (selectedFeeTypes: FeeType[]): SelectionStats => {
    const totalAmount = selectedFeeTypes.reduce((sum, ft) => {
        const amount = ft.base_amount;
        if (amount === null || amount === undefined || amount === '') return sum;
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
        return sum + (isNaN(numAmount) ? 0 : numAmount);
    }, 0);

    // Calculate by category
    const byCategory: Record<string, number> = {};
    const byStatus: Record<string, number> = { active: 0, inactive: 0 };
    const byAmountType: Record<string, number> = { fixed: 0, variable: 0 };
    const byFrequency: Record<string, number> = { one_time: 0, annual: 0, quarterly: 0, monthly: 0 };
    const byDiscountType: Record<string, number> = {
        senior: 0, pwd: 0, solo_parent: 0, indigent: 0
    };

    selectedFeeTypes.forEach(ft => {
        // By category
        const categoryId = ft.document_category_id?.toString() || 'uncategorized';
        byCategory[categoryId] = (byCategory[categoryId] || 0) + 1;
        
        // By status
        if (ft.is_active) byStatus.active++;
        else byStatus.inactive++;
        
        // By amount type
        if (ft.amount_type === 'fixed') byAmountType.fixed++;
        else byAmountType.variable++;
        
        // By frequency
        if (byFrequency[ft.frequency] !== undefined) {
            byFrequency[ft.frequency]++;
        }
        
        // By discount type
        if (ft.has_senior_discount) byDiscountType.senior++;
        if (ft.has_pwd_discount) byDiscountType.pwd++;
        if (ft.has_solo_parent_discount) byDiscountType.solo_parent++;
        if (ft.has_indigent_discount) byDiscountType.indigent++;
    });

    return {
        total: selectedFeeTypes.length,
        active: byStatus.active,
        inactive: byStatus.inactive,
        mandatory: selectedFeeTypes.filter(ft => ft.is_mandatory).length,
        autoGenerate: selectedFeeTypes.filter(ft => ft.auto_generate).length,
        totalAmount: totalAmount,
        fixedAmount: byAmountType.fixed,
        variableAmount: byAmountType.variable,
        byCategory,
        byStatus,
        byAmountType,
        byFrequency,
        byDiscountType
    };
};

export const filterFeeTypes = (
    feeTypes: FeeType[],
    search: string,
    filters: FilterState,
    sortBy: string = 'name',
    sortOrder: string = 'asc'
): FeeType[] => {
    let filtered = [...feeTypes];

    // Apply search filter
    if (search.trim()) {
        const query = search.toLowerCase();
        filtered = filtered.filter(feeType =>
            feeType.code?.toLowerCase().includes(query) ||
            feeType.name?.toLowerCase().includes(query) ||
            feeType.short_name?.toLowerCase().includes(query) ||
            feeType.description?.toLowerCase().includes(query) ||
            feeType.document_category?.name?.toLowerCase().includes(query)
        );
    }

    // Apply category filter
    if (filters.category && filters.category !== 'all') {
        const categoryId = parseInt(filters.category);
        filtered = filtered.filter(feeType => feeType.document_category_id === categoryId);
    }

    // Apply status filter
    if (filters.status && filters.status !== 'all') {
        filtered = filtered.filter(feeType => 
            filters.status === 'active' ? feeType.is_active : !feeType.is_active
        );
    }

    // Apply has discount filter
    if (filters.hasDiscount && filters.hasDiscount !== 'all') {
        const hasDiscount = filters.hasDiscount === 'yes';
        filtered = filtered.filter(feeType => 
            (feeType.has_senior_discount || 
             feeType.has_pwd_discount || 
             feeType.has_solo_parent_discount || 
             feeType.has_indigent_discount) === hasDiscount
        );
    }

    // Apply has penalty filter
    if (filters.hasPenalty && filters.hasPenalty !== 'all') {
        const hasPenalty = filters.hasPenalty === 'yes';
        filtered = filtered.filter(feeType => feeType.has_penalty === hasPenalty);
    }

    // Apply frequency filter
    if (filters.frequency && filters.frequency !== 'all') {
        filtered = filtered.filter(feeType => feeType.frequency === filters.frequency);
    }

    // Apply sorting
    filtered.sort((a, b) => {
        let aValue: any = a[sortBy as keyof FeeType];
        let bValue: any = b[sortBy as keyof FeeType];

        if (sortBy === 'base_amount') {
            const aNum = typeof a.base_amount === 'string' ? parseFloat(a.base_amount) : Number(a.base_amount);
            const bNum = typeof b.base_amount === 'string' ? parseFloat(b.base_amount) : Number(b.base_amount);
            aValue = isNaN(aNum) ? 0 : aNum;
            bValue = isNaN(bNum) ? 0 : bNum;
        } else if (sortBy === 'created_at') {
            aValue = new Date(a.created_at || '').getTime();
            bValue = new Date(b.created_at || '').getTime();
        } else if (sortBy === 'name') {
            aValue = a.name || '';
            bValue = b.name || '';
        } else if (sortBy === 'code') {
            aValue = a.code || '';
            bValue = b.code || '';
        } else if (sortBy === 'category') {
            const aCategoryName = a.document_category?.name || '';
            const bCategoryName = b.document_category?.name || '';
            aValue = aCategoryName.toLowerCase();
            bValue = bCategoryName.toLowerCase();
        }

        if (aValue == null) aValue = '';
        if (bValue == null) bValue = '';

        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    return filtered;
};

export const formatForClipboard = (feeTypes: FeeType[]): string => {
    const data = feeTypes.map(feeType => ({
        Code: feeType.code,
        Name: feeType.name,
        Category: feeType.document_category?.name || 'Uncategorized',
        Amount: formatCurrency(feeType.base_amount),
        Frequency: feeType.frequency,
        Status: feeType.is_active ? 'Active' : 'Inactive',
    }));
    
    if (data.length === 0) return '';
    
    return [
        Object.keys(data[0]).join(','),
        ...data.map(row => Object.values(row).join(','))
    ].join('\n');
};