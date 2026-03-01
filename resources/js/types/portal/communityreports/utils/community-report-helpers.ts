// utils/community-report-helpers.ts

import {
    AlertCircle,
    Megaphone,
    Volume,
    FileText,
    Users,
    Zap,
    Trash2,
    Droplets,
    Wrench,
    Building,
    Bell,
    Construction,
    Car,
    PawPrint,
    HeartPulse,
    Store,
    UserX,
    Handshake,
    HelpCircle,
    Image as ImageIcon,
    Video,
    File
} from 'lucide-react';
import { ReportType } from '@/types/portal/community-report';

// Helper function to check if an object is a File
export const isFile = (obj: any): obj is File => {
    return obj && 
           typeof obj === 'object' && 
           'name' in obj && 
           'size' in obj && 
           'type' in obj &&
           'lastModified' in obj;
};

// Helper to generate draft ID
export const generateDraftId = () => {
    return 'draft_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

// Local storage keys
export const DRAFT_KEY = 'community_report_draft';
export const DRAFTS_LIST_KEY = 'community_report_drafts_list';

// Icon mapping with HelpCircle for "Other" types
export const iconMap: Record<string, React.ComponentType<any>> = {
    'alert-circle': AlertCircle,
    'megaphone': Megaphone,
    'volume-2': Volume,
    'gavel': FileText,
    'users': Users,
    'zap': Zap,
    'trash-2': Trash2,
    'droplets': Droplets,
    'wrench': Wrench,
    'building': Building,
    'bell': Bell,
    'construction': Construction,
    'car': Car,
    'paw-print': PawPrint,
    'heart-pulse': HeartPulse,
    'store': Store,
    'volume': Volume,
    'user-x': UserX,
    'handshake': Handshake,
    'help-circle': HelpCircle,
    'default': AlertCircle
};

// Function to pair items for display
export const pairItems = <T,>(items: T[]): (T | null)[][] => {
    const pairs: (T | null)[][] = [];
    
    for (let i = 0; i < items.length; i += 2) {
        const pair: (T | null)[] = [items[i], i + 1 < items.length ? items[i + 1] : null];
        pairs.push(pair);
    }
    
    return pairs;
};

// Function to organize report types with "OTHER" at the bottom
export const organizeReportTypes = (types: ReportType[]) => {
    const otherIssues = types.filter(type => type.category === 'issue' && type.code === 'OTHER_ISSUE');
    const otherComplaints = types.filter(type => type.category === 'complaint' && type.code === 'OTHER_COMPLAINT');
    
    const regularIssues = types.filter(type => type.category === 'issue' && type.code !== 'OTHER_ISSUE');
    const regularComplaints = types.filter(type => type.category === 'complaint' && type.code !== 'OTHER_COMPLAINT');
    
    return {
        issues: [...regularIssues.sort((a, b) => a.name.localeCompare(b.name)), ...otherIssues],
        complaints: [...regularComplaints.sort((a, b) => a.name.localeCompare(b.name)), ...otherComplaints]
    };
};

// Check if item is an "Other" type
export const isOtherType = (type: ReportType) => {
    return type.code === 'OTHER_ISSUE' || type.code === 'OTHER_COMPLAINT';
};

// Get file icon based on type
export const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return ImageIcon;
    if (type.startsWith('video/')) return Video;
    if (type === 'application/pdf') return FileText;
    return File;
};

// Format file size
export const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

// Steps
export const steps = [
    { id: 1, title: 'Type', description: 'Select report type', icon: 'AlertCircle' },
    { id: 2, title: 'Details', description: 'Provide information', icon: 'FileText' },
    { id: 3, title: 'Evidence', description: 'Add photos/files', icon: 'Camera' },
    { id: 4, title: 'Review', description: 'Final check', icon: 'CheckCircle' }
];