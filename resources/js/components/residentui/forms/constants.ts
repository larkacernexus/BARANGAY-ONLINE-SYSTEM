// /components/residentui/forms/constants.ts
import { FileText, Download, Clock, Tag, Building, Users, AlertTriangle, BarChart, Shield } from 'lucide-react';

export const FORM_TABS = [
    { id: 'all', label: 'All Forms', icon: FileText },
    { id: 'popular', label: 'Most Downloaded', icon: Download },
    { id: 'recent', label: 'Recently Added', icon: Clock },
];

export const SORT_OPTIONS = [
    { value: 'title', label: 'Title (A-Z)' },
    { value: 'created_at', label: 'Newest First' },
    { value: 'download_count', label: 'Most Downloaded' },
    { value: 'category', label: 'Category' },
    { value: 'issuing_agency', label: 'Agency' },
];

export const CATEGORY_COLORS: Record<string, string> = {
    'Social Services': 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300',
    'Permits & Licenses': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300',
    'Health & Medical': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300',
    'Education': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300',
    'Legal & Police': 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300',
    'Employment': 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300',
    'Housing': 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300',
    'Business': 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300',
    'Agriculture': 'bg-lime-100 text-lime-800 border-lime-200 dark:bg-lime-900/30 dark:text-lime-300',
    'Transportation': 'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300',
    'Other': 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300',
};

export const getCategoryColor = (category: string): string => {
    return CATEGORY_COLORS[category] || CATEGORY_COLORS['Other'];
};

export const getAgencyIcon = (agency: string) => {
    if (!agency) return Building;
    if (agency.includes('Mayor')) return Building;
    if (agency.includes('DSWD')) return Users;
    if (agency.includes('PNP') || agency.includes('Police')) return Shield;
    if (agency.includes('Health')) return AlertTriangle;
    return Building;
};

export const getFileTypeIcon = (fileType: string) => {
    if (!fileType) return FileText;
    if (fileType.includes('pdf')) return FileText;
    if (fileType.includes('word') || fileType.includes('doc')) return FileText;
    if (fileType.includes('excel') || fileType.includes('sheet')) return BarChart;
    return FileText;
};

export const getFileTypeColor = (fileType: string): string => {
    if (!fileType) return 'text-gray-500 dark:text-gray-400';
    if (fileType.includes('pdf')) return 'text-red-500 dark:text-red-400';
    if (fileType.includes('word') || fileType.includes('doc')) return 'text-blue-500 dark:text-blue-400';
    if (fileType.includes('excel') || fileType.includes('sheet')) return 'text-green-500 dark:text-green-400';
    return 'text-gray-500 dark:text-gray-400';
};