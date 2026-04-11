import { format } from 'date-fns';
import { CommunityReport } from '../types/admin/reports/communityReportTypes';
import {
    AlertTriangle,
    AlertCircle,
    Clock,
    CheckCircle,
    X,
    Eye,
    UserCheck,
    Zap,
    Info,
    Globe,
    Users as UsersIcon,
    User,
    ShieldAlert,
    AlertOctagon,
    RefreshCw,
    CheckSquare,
    Square,
    FileText,
    MapPin,
    Home,
    Phone,
    Mail,
    Link as LinkIcon,
    Clipboard,
    Printer,
    Trash2,
    Edit,
    Shield,
    UserX,
    TrendingUp,
    Timer,
    Hash,
    BarChart3,
    Plus,
    Layers,
    MousePointer,
    Filter,
    Download,
    Search,
    FilterX,
    RotateCcw,
    FileSpreadsheet,
    PackageCheck,
    PackageX,
    ClipboardCopy,
    ExternalLink,
    Grid3X3,
    List,
    ChevronUp,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    MoreVertical,
    Loader2,
    Smartphone
} from 'lucide-react';
import { type Icon } from 'lucide-react';

// ========== TEXT FORMATTING ==========
export const truncateText = (text: string, maxLength: number = 50): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

// Mobile-optimized truncation
export const truncateTextMobile = (text: string, maxLength: number = 30): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

// Get responsive truncation length
export const getTruncationLength = (windowWidth: number, type: 'title' | 'description' | 'location' | 'user' = 'title'): number => {
    if (windowWidth < 640) { // Mobile
        switch(type) {
            case 'title': return 20;
            case 'description': return 15;
            case 'location': return 15;
            case 'user': return 10;
            default: return 15;
        }
    }
    if (windowWidth < 768) { // Tablet
        switch(type) {
            case 'title': return 30;
            case 'description': return 25;
            case 'location': return 20;
            case 'user': return 15;
            default: return 20;
        }
    }
    if (windowWidth < 1024) { // Small desktop
        switch(type) {
            case 'title': return 40;
            case 'description': return 35;
            case 'location': return 25;
            case 'user': return 20;
            default: return 30;
        }
    }
    // Large desktop
    switch(type) {
        case 'title': return 50;
        case 'description': return 45;
        case 'location': return 30;
        case 'user': return 25;
        default: return 40;
    }
};

// ========== PHONE NUMBER FORMATTING ==========
export const formatPhoneNumber = (phone?: string): string => {
    if (!phone) return 'Not provided';
    
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Format based on length
    if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
        return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    } else if (cleaned.length > 10) {
        return `+${cleaned}`;
    }
    
    return phone; // Return original if format doesn't match
};

// Mobile-optimized phone number formatting
export const formatPhoneNumberMobile = (phone?: string): string => {
    if (!phone) return 'N/A';
    
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 10) {
        return `${cleaned.slice(0, 4)}-${cleaned.slice(6)}`;
    }
    
    return truncateText(phone, 12);
};

// ========== FILE SIZE FORMATTING ==========
export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Get file icon based on file type
export const getFileIcon = (fileType?: string): string => {
    if (!fileType) return '📄';
    
    const type = fileType.toLowerCase();
    if (type.includes('image')) return '🖼️';
    if (type.includes('video')) return '🎬';
    if (type.includes('pdf')) return '📕';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
    if (type.includes('zip') || type.includes('compressed')) return '📦';
    
    return '📄';
};

// ========== CURRENCY & NUMBER FORMATTING ==========
// Format currency
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2
    }).format(amount);
};

// Format percentage
export const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
};

// Format duration (hours/minutes)
export const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
        return `${minutes} min${minutes !== 1 ? 's' : ''}`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
        return `${hours} hr${hours !== 1 ? 's' : ''}`;
    }
    
    return `${hours} hr${hours !== 1 ? 's' : ''} ${remainingMinutes} min${remainingMinutes !== 1 ? 's' : ''}`;
};

// Format address for display
export const formatAddress = (address?: string, purok?: string): string => {
    if (!address && !purok) return 'Not provided';
    
    let formatted = '';
    if (address) formatted += address;
    if (purok) {
        if (formatted) formatted += ', ';
        formatted += `Purok ${purok}`;
    }
    
    return formatted;
};

// Get initials from name
export const getInitials = (name?: string): string => {
    if (!name) return '??';
    
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
};

// Format date range
export const formatDateRange = (startDate?: string, endDate?: string): string => {
    if (!startDate && !endDate) return 'Not specified';
    if (!endDate) return `From ${formatDate(startDate!)}`;
    if (!startDate) return `Until ${formatDate(endDate)}`;
    
    if (startDate === endDate) {
        return formatDate(startDate);
    }
    
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};

// ========== DATE FORMATTING ==========
export const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        return 'Invalid Date';
    }
};

// Mobile-optimized date formatting
export const formatDateMobile = (dateString: string): string => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return date.toLocaleDateString('en-PH', {
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        return 'N/A';
    }
};

export const formatDateTime = (dateString: string): string => {
    if (!dateString) return 'N/A';
    try {
        return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch (error) {
        return 'Invalid Date';
    }
};

export const getTimeAgo = (dateString: string): string => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
        return formatDate(dateString);
    } catch (error) {
        return 'Invalid Date';
    }
};

// Compact time ago for mobile
export const getTimeAgoMobile = (dateString: string): string => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 1) return 'now';
        if (diffMins < 60) return `${diffMins}m`;
        if (diffHours < 24) return `${diffHours}h`;
        if (diffDays < 7) return `${diffDays}d`;
        return `${Math.floor(diffDays / 7)}w`;
    } catch (error) {
        return '';
    }
};

// ========== STATUS HELPERS ==========
export const getStatusBadgeVariant = (status: string): 'default' | 'destructive' | 'outline' | 'secondary' => {
    switch (status?.toLowerCase()) {
        case 'resolved': return 'default';
        case 'in_progress': return 'outline';
        case 'assigned': return 'secondary';
        case 'under_review': return 'secondary';
        case 'pending': return 'destructive';
        case 'rejected': return 'outline';
        default: return 'outline';
    }
};

export const getStatusIcon = (status: string): React.ReactNode => {
    switch (status) {
        case 'resolved': return <CheckCircle className="h-4 w-4 text-green-500" />;
        case 'in_progress': return <Clock className="h-4 w-4 text-blue-500" />;
        case 'assigned': return <UserCheck className="h-4 w-4 text-amber-500" />;
        case 'under_review': return <Eye className="h-4 w-4 text-amber-500" />;
        case 'pending': return <AlertCircle className="h-4 w-4 text-red-500" />;
        case 'rejected': return <X className="h-4 w-4 text-gray-500" />;
        default: return <AlertCircle className="h-4 w-4" />;
    }
};

// Mobile-optimized status icon
export const getStatusIconMobile = (status: string): React.ReactNode => {
    switch (status) {
        case 'resolved': return <CheckCircle className="h-3 w-3 text-green-500" />;
        case 'in_progress': return <Clock className="h-3 w-3 text-blue-500" />;
        case 'assigned': return <UserCheck className="h-3 w-3 text-amber-500" />;
        case 'under_review': return <Eye className="h-3 w-3 text-amber-500" />;
        case 'pending': return <AlertCircle className="h-3 w-3 text-red-500" />;
        case 'rejected': return <X className="h-3 w-3 text-gray-500" />;
        default: return <AlertCircle className="h-3 w-3" />;
    }
};

// Status color for mobile badges
export const getStatusColor = (status: string): string => {
    switch (status?.toLowerCase()) {
        case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
        case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'assigned': return 'bg-purple-100 text-purple-800 border-purple-200';
        case 'under_review': return 'bg-amber-100 text-amber-800 border-amber-200';
        case 'pending': return 'bg-red-100 text-red-800 border-red-200';
        case 'rejected': return 'bg-gray-100 text-gray-800 border-gray-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

// ========== PRIORITY HELPERS ==========
export const getPriorityBadgeVariant = (priority: string): 'default' | 'destructive' | 'outline' | 'secondary' => {
    switch (priority?.toLowerCase()) {
        case 'critical': return 'destructive';
        case 'high': return 'destructive';
        case 'medium': return 'outline';
        case 'low': return 'secondary';
        default: return 'outline';
    }
};

export const getPriorityIcon = (priority: string): React.ReactNode => {
    switch (priority) {
        case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />;
        case 'high': return <AlertTriangle className="h-4 w-4 text-red-500" />;
        case 'medium': return <AlertCircle className="h-4 w-4 text-amber-500" />;
        case 'low': return <Clock className="h-4 w-4 text-green-500" />;
        default: return <Clock className="h-4 w-4" />;
    }
};

// Mobile-optimized priority icon
export const getPriorityIconMobile = (priority: string): React.ReactNode => {
    switch (priority) {
        case 'critical': return <AlertTriangle className="h-3 w-3 text-red-600" />;
        case 'high': return <AlertTriangle className="h-3 w-3 text-red-500" />;
        case 'medium': return <AlertCircle className="h-3 w-3 text-amber-500" />;
        case 'low': return <Clock className="h-3 w-3 text-green-500" />;
        default: return <Clock className="h-3 w-3" />;
    }
};

// Priority color for mobile badges
export const getPriorityColor = (priority: string): string => {
    switch (priority?.toLowerCase()) {
        case 'critical': return 'bg-red-100 text-red-800 border-red-200';
        case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
        case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'low': return 'bg-green-100 text-green-800 border-green-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

// ========== URGENCY HELPERS ==========
export const getUrgencyIcon = (urgency: string): React.ReactNode => {
    switch (urgency) {
        case 'high': return <Zap className="h-4 w-4 text-red-500" />;
        case 'medium': return <AlertCircle className="h-4 w-4 text-amber-500" />;
        case 'low': return <Clock className="h-4 w-4 text-green-500" />;
        default: return <Clock className="h-4 w-4" />;
    }
};

// Mobile-optimized urgency icon
export const getUrgencyIconMobile = (urgency: string): React.ReactNode => {
    switch (urgency) {
        case 'high': return <Zap className="h-3 w-3 text-red-500" />;
        case 'medium': return <AlertCircle className="h-3 w-3 text-amber-500" />;
        case 'low': return <Clock className="h-3 w-3 text-green-500" />;
        default: return <Clock className="h-3 w-3" />;
    }
};

// Urgency color for mobile badges
export const getUrgencyColor = (urgency: string): string => {
    switch (urgency?.toLowerCase()) {
        case 'high': return 'bg-red-100 text-red-800 border-red-200';
        case 'medium': return 'bg-amber-100 text-amber-800 border-amber-200';
        case 'low': return 'bg-green-100 text-green-800 border-green-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

// ========== IMPACT HELPERS ==========
export const getImpactIcon = (impact: string): React.ReactNode => {
    switch (impact) {
        case 'severe': return <AlertTriangle className="h-4 w-4 text-red-600" />;
        case 'major': return <AlertTriangle className="h-4 w-4 text-red-500" />;
        case 'moderate': return <AlertCircle className="h-4 w-4 text-amber-500" />;
        case 'minor': return <Info className="h-4 w-4 text-blue-500" />;
        default: return <Info className="h-4 w-4" />;
    }
};

// Mobile-optimized impact icon
export const getImpactIconMobile = (impact: string): React.ReactNode => {
    switch (impact) {
        case 'severe': return <AlertTriangle className="h-3 w-3 text-red-600" />;
        case 'major': return <AlertTriangle className="h-3 w-3 text-red-500" />;
        case 'moderate': return <AlertCircle className="h-3 w-3 text-amber-500" />;
        case 'minor': return <Info className="h-3 w-3 text-blue-500" />;
        default: return <Info className="h-3 w-3" />;
    }
};

// ========== AFFECTED PEOPLE HELPERS ==========
export const getAffectedPeopleIcon = (affected: string): React.ReactNode => {
    switch (affected) {
        case 'community': return <Globe className="h-4 w-4 text-blue-500" />;
        case 'multiple': return <UsersIcon className="h-4 w-4 text-purple-500" />;
        case 'group': return <UsersIcon className="h-4 w-4 text-amber-500" />;
        case 'family': return <UsersIcon className="h-4 w-4 text-green-500" />;
        case 'individual': return <User className="h-4 w-4 text-gray-500" />;
        default: return <User className="h-4 w-4" />;
    }
};

// Mobile-optimized affected people icon
export const getAffectedPeopleIconMobile = (affected: string): React.ReactNode => {
    switch (affected) {
        case 'community': return <Globe className="h-3 w-3 text-blue-500" />;
        case 'multiple': return <UsersIcon className="h-3 w-3 text-purple-500" />;
        case 'group': return <UsersIcon className="h-3 w-3 text-amber-500" />;
        case 'family': return <UsersIcon className="h-3 w-3 text-green-500" />;
        case 'individual': return <User className="h-3 w-3 text-gray-500" />;
        default: return <User className="h-3 w-3" />;
    }
};

// ========== MOBILE UTILITIES ==========
// Check if device is mobile
export const isMobileDevice = (windowWidth: number): boolean => {
    return windowWidth < 768;
};

// Get grid columns based on screen size
export const getGridColumns = (windowWidth: number): string => {
    if (windowWidth < 640) return "grid-cols-1";
    if (windowWidth < 1024) return "grid-cols-2";
    return "grid-cols-3";
};

// Get card height class based on screen size
export const getCardHeightClass = (isMobile: boolean): string => {
    return isMobile ? 'min-h-0' : '';
};

// Get compact icon size
export const getIconSize = (isMobile: boolean): string => {
    return isMobile ? 'h-3 w-3' : 'h-4 w-4';
};

// Get compact button size
export const getButtonSizeClass = (isMobile: boolean): string => {
    return isMobile ? 'h-6 w-6 p-0' : 'h-7 w-7 p-0';
};

// Get compact badge class
export const getBadgeClass = (isMobile: boolean): string => {
    return isMobile ? 'text-[10px] px-1.5 py-0 h-4' : 'text-xs px-2 py-0 h-5';
};

// Get compact text class
export const getTextClass = (isMobile: boolean, type: 'title' | 'body' | 'small' = 'body'): string => {
    if (isMobile) {
        switch (type) {
            case 'title': return 'text-sm';
            case 'body': return 'text-xs';
            case 'small': return 'text-[10px]';
        }
    }
    switch (type) {
        case 'title': return 'text-base';
        case 'body': return 'text-sm';
        case 'small': return 'text-xs';
    }
};

// ========== REPORT SUMMARY HELPERS ==========
// Generate a short summary for mobile display
export const getReportSummary = (report: CommunityReport, isMobile: boolean = false): string => {
    const parts = [];
    
    if (report.report_type?.name) {
        parts.push(report.report_type.name);
    }
    
    if (report.location && !isMobile) {
        parts.push(`at ${truncateText(report.location, 15)}`);
    }
    
    if (report.affected_people && !isMobile) {
        parts.push(`(${report.affected_people})`);
    }
    
    return parts.join(' ');
};

// Get priority emoji for quick visual indicator
export const getPriorityEmoji = (priority: string): string => {
    switch (priority?.toLowerCase()) {
        case 'critical': return '🔥';
        case 'high': return '⚠️';
        case 'medium': return '📋';
        case 'low': return '📝';
        default: return '📄';
    }
};

// Get status emoji for quick visual indicator
export const getStatusEmoji = (status: string): string => {
    switch (status?.toLowerCase()) {
        case 'resolved': return '✅';
        case 'in_progress': return '🔄';
        case 'assigned': return '👤';
        case 'under_review': return '👀';
        case 'pending': return '⏳';
        case 'rejected': return '❌';
        default: return '📄';
    }
};

// ========== EXPORT ALL HELPERS ==========
export default {
    // Text formatting
    truncateText,
    truncateTextMobile,
    getTruncationLength,
    
    // Phone number formatting
    formatPhoneNumber,
    formatPhoneNumberMobile,
    
    // File size formatting
    formatFileSize,
    getFileIcon,
    
    // Currency & number formatting
    formatCurrency,
    formatPercentage,
    formatDuration,
    formatAddress,
    getInitials,
    formatDateRange,
    
    // Date formatting
    formatDate,
    formatDateMobile,
    formatDateTime,
    getTimeAgo,
    getTimeAgoMobile,
    
    // Status helpers
    getStatusBadgeVariant,
    getStatusIcon,
    getStatusIconMobile,
    getStatusColor,
    getStatusEmoji,
    
    // Priority helpers
    getPriorityBadgeVariant,
    getPriorityIcon,
    getPriorityIconMobile,
    getPriorityColor,
    getPriorityEmoji,
    
    // Urgency helpers
    getUrgencyIcon,
    getUrgencyIconMobile,
    getUrgencyColor,
    
    // Impact helpers
    getImpactIcon,
    getImpactIconMobile,
    
    // Affected people helpers
    getAffectedPeopleIcon,
    getAffectedPeopleIconMobile,
    
    // Mobile utilities
    isMobileDevice,
    getGridColumns,
    getCardHeightClass,
    getIconSize,
    getButtonSizeClass,
    getBadgeClass,
    getTextClass,
    
    // Report summary
    getReportSummary
};