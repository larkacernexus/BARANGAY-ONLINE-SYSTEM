import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { InertiaLinkProps } from '@inertiajs/react';
import { format, formatDistance, formatRelative, parseISO } from 'date-fns';

// ==================== CLASS NAME UTILITIES ====================

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// ==================== URL UTILITIES ====================

export function isSameUrl(
    url1: NonNullable<InertiaLinkProps['href']>,
    url2: NonNullable<InertiaLinkProps['href']>,
) {
    return resolveUrl(url1) === resolveUrl(url2);
}

export function resolveUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url;
}

// ==================== DATE UTILITIES ====================

export function formatDate(dateString?: string | null, formatStr: string = 'MMM dd, yyyy'): string {
    if (!dateString) return 'N/A';
    try {
        return format(parseISO(dateString), formatStr);
    } catch (error) {
        return 'Invalid date';
    }
}

export function formatDateTime(dateString?: string | null): string {
    if (!dateString) return 'N/A';
    try {
        return format(parseISO(dateString), 'MMM dd, yyyy HH:mm');
    } catch (error) {
        return 'Invalid date';
    }
}

export function formatShortDate(dateString?: string | null): string {
    if (!dateString) return 'N/A';
    try {
        return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch (error) {
        return 'Invalid date';
    }
}

export function formatTimeAgo(dateString?: string | null): string {
    if (!dateString) return 'N/A';
    try {
        const date = parseISO(dateString);
        const now = new Date();
        return formatDistance(date, now, { addSuffix: true });
    } catch (error) {
        return 'Invalid date';
    }
}

export function formatRelativeDate(dateString?: string | null, baseDate: Date = new Date()): string {
    if (!dateString) return 'N/A';
    try {
        return formatRelative(parseISO(dateString), baseDate);
    } catch (error) {
        return 'Invalid date';
    }
}

export function isExpiringSoon(expiresAt?: string | null, daysThreshold: number = 30): boolean {
    if (!expiresAt) return false;
    try {
        const expiryDate = parseISO(expiresAt);
        const now = new Date();
        const diffDays = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays <= daysThreshold && diffDays > 0;
    } catch (error) {
        return false;
    }
}

export function isExpired(expiresAt?: string | null): boolean {
    if (!expiresAt) return false;
    try {
        const expiryDate = parseISO(expiresAt);
        const now = new Date();
        return expiryDate < now;
    } catch (error) {
        return false;
    }
}

export function getExpiryStatus(expiresAt?: string | null): 'active' | 'expiring_soon' | 'expired' | 'no_expiry' {
    if (!expiresAt) return 'no_expiry';
    if (isExpired(expiresAt)) return 'expired';
    if (isExpiringSoon(expiresAt)) return 'expiring_soon';
    return 'active';
}

// ==================== FILE UTILITIES ====================

export function formatFileSize(bytes?: number | null): string {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
}

export function isImageFile(mimeType?: string | null, fileName?: string | null): boolean {
    if (mimeType?.startsWith('image/')) return true;
    if (!fileName) return false;
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
    const ext = getFileExtension(fileName);
    return imageExts.includes(ext);
}

export function isPdfFile(mimeType?: string | null, fileName?: string | null): boolean {
    if (mimeType?.includes('pdf')) return true;
    if (!fileName) return false;
    return getFileExtension(fileName) === 'pdf';
}

export function isOfficeDocument(mimeType?: string | null, fileName?: string | null): boolean {
    if (!mimeType && !fileName) return false;
    
    const officeMimes = [
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];
    
    if (mimeType && officeMimes.includes(mimeType)) return true;
    
    if (!fileName) return false;
    const officeExts = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
    const ext = getFileExtension(fileName);
    return officeExts.includes(ext);
}

export function getFileIcon(fileType?: string | null, fileName?: string | null): string {
    if (isPdfFile(fileType, fileName)) return '📄';
    if (isImageFile(fileType, fileName)) return '🖼️';
    if (isOfficeDocument(fileType, fileName)) {
        const ext = fileName ? getFileExtension(fileName) : '';
        if (ext.startsWith('doc')) return '📝';
        if (ext.startsWith('xls')) return '📊';
        if (ext.startsWith('ppt')) return '📽️';
        return '📎';
    }
    return '📎';
}

// ==================== PHOTO UTILITIES ====================

export function getPhotoUrl(photoPath?: string | null, photoUrl?: string | null): string | null {
    if (photoUrl) {
        if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://') || photoUrl.startsWith('/')) {
            return photoUrl;
        }
        return `/${photoUrl.replace(/^\/+/, '')}`;
    }
    
    if (photoPath) {
        // Remove 'public/' prefix if present
        const cleanPath = photoPath.replace('public/', '');
        
        // If it already starts with 'storage/', just add leading slash
        if (cleanPath.startsWith('storage/')) {
            return `/${cleanPath}`;
        }
        
        // Otherwise, assume it's in the storage directory
        return `/storage/${cleanPath}`;
    }
    
    return null;
}

// ==================== STRING UTILITIES ====================

export function truncate(str: string, length: number = 50, suffix: string = '...'): string {
    if (str.length <= length) return str;
    return str.substring(0, length) + suffix;
}

export function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function titleCase(str: string): string {
    return str.split(' ').map(word => capitalize(word)).join(' ');
}

export function slugify(str: string): string {
    return str
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export function formatRelationship(relationship: string): string {
    return relationship.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

export function formatPurok(purok: string | number): string {
    return `Purok ${purok}`;
}

// ==================== NUMBER UTILITIES ====================

export function formatNumber(num: number): string {
    return new Intl.NumberFormat().format(num);
}

export function formatPercentage(num: number, decimals: number = 0): string {
    return `${num.toFixed(decimals)}%`;
}

export function formatCurrency(amount: number, currency: string = 'PHP'): string {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

// ==================== COLOR UTILITIES ====================

export function getRandomColorClass(seed: string): string {
    const colors = [
        'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
        'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
        'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
        'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800',
        'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
        'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
        'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800',
        'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
    ];
    
    const index = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
}

export function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
        active: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
        inactive: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700',
        pending: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
        expired: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
        expiring_soon: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
        deceased: 'bg-gray-900 text-white border-gray-900 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-800',
        new: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-transparent',
    };
    
    return colors[status.toLowerCase()] || colors.inactive;
}

// ==================== ARRAY UTILITIES ====================

export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce((result, item) => {
        const groupKey = String(item[key]);
        if (!result[groupKey]) {
            result[groupKey] = [];
        }
        result[groupKey].push(item);
        return result;
    }, {} as Record<string, T[]>);
}

export function sortBy<T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] {
    return [...array].sort((a, b) => {
        const aVal = a[key];
        const bVal = b[key];
        
        if (aVal < bVal) return direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return direction === 'asc' ? 1 : -1;
        return 0;
    });
}

export function uniqueBy<T>(array: T[], key: keyof T): T[] {
    const seen = new Set();
    return array.filter(item => {
        const value = item[key];
        if (seen.has(value)) return false;
        seen.add(value);
        return true;
    });
}

// ==================== OBJECT UTILITIES ====================

export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
    const result = { ...obj };
    keys.forEach(key => delete result[key]);
    return result;
}

export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
    return keys.reduce((result, key) => {
        if (key in obj) {
            result[key] = obj[key];
        }
        return result;
    }, {} as Pick<T, K>);
}

// ==================== STORAGE UTILITIES ====================

export function setLocalStorage<T>(key: string, value: T): void {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

export function getLocalStorage<T>(key: string, defaultValue: T): T {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return defaultValue;
    }
}

export function removeLocalStorage(key: string): void {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error('Error removing from localStorage:', error);
    }
}

// ==================== CLIPBOARD UTILITIES ====================

export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        console.error('Failed to copy:', error);
        return false;
    }
}

// ==================== VALIDATION UTILITIES ====================

export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    return phoneRegex.test(phone);
}

export function isValidUrl(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

// ==================== DEBOUNCE UTILITIES ====================

export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    
    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ==================== THROTTLE UTILITIES ====================

export function throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    
    return function executedFunction(...args: Parameters<T>) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}