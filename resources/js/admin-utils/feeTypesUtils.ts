// utils/feeTypesUtils.ts
import { FeeType, FilterState, SelectionStats } from '@/types/fee-types';

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

export const getCategoryIcon = (iconName?: string) => {
    if (!iconName) return null;
    
    // Import icons as needed
    return null;
};

export const getCategoryColor = (color?: string) => {
    if (!color) return 'bg-gray-100 text-gray-800 border-gray-200';
    
    const colorMap: Record<string, string> = {
        'purple': 'bg-purple-100 text-purple-800 border-purple-200',
        'pink': 'bg-pink-100 text-pink-800 border-pink-200',
        'green': 'bg-green-100 text-green-800 border-green-200',
        'red': 'bg-red-100 text-red-800 border-red-200',
        'amber': 'bg-amber-100 text-amber-800 border-amber-200',
        'indigo': 'bg-indigo-100 text-indigo-800 border-indigo-200',
        'blue': 'bg-blue-100 text-blue-800 border-blue-200',
        'orange': 'bg-orange-100 text-orange-800 border-orange-200',
        'gray': 'bg-gray-100 text-gray-800 border-gray-200',
    };
    
    return colorMap[color] || 'bg-gray-100 text-gray-800 border-gray-200';
};

export const getCategoryDetails = (feeType: FeeType) => {
    if (!feeType.document_category) {
        return {
            name: 'Uncategorized',
            icon: null,
            color: 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }
    
    return {
        name: feeType.document_category.name,
        icon: getCategoryIcon(feeType.document_category.icon),
        color: getCategoryColor(feeType.document_category.color)
    };
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

    return {
        total: selectedFeeTypes.length,
        active: selectedFeeTypes.filter(ft => ft.is_active).length,
        inactive: selectedFeeTypes.filter(ft => !ft.is_active).length,
        mandatory: selectedFeeTypes.filter(ft => ft.is_mandatory).length,
        autoGenerate: selectedFeeTypes.filter(ft => ft.auto_generate).length,
        totalAmount: totalAmount,
        fixedAmount: selectedFeeTypes.filter(ft => ft.amount_type === 'fixed').length,
        variableAmount: selectedFeeTypes.filter(ft => ft.amount_type === 'variable').length,
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
    if (filters.category !== 'all') {
        const categoryId = parseInt(filters.category);
        filtered = filtered.filter(feeType => feeType.document_category_id === categoryId);
    }

    // Apply status filter
    if (filters.status !== 'all') {
        filtered = filtered.filter(feeType => 
            filters.status === 'active' ? feeType.is_active : !feeType.is_active
        );
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
    
    return [
        Object.keys(data[0]).join(','),
        ...data.map(row => Object.values(row).join(','))
    ].join('\n');
};