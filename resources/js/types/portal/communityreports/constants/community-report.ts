// constants/community-report.ts
import { 
    AlertCircle, 
    FileText, 
    Camera, 
    CheckCircle, 
    HelpCircle,
    Megaphone,
    Volume2,
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
    Volume,
    UserX,
    Handshake,
    Image as ImageIcon,
    Video,
    File,
    MapPin,
    Calendar,
    Clock,
    Shield,
    Save,
    Upload,
    X,
    Phone,
    ShieldAlert,
    ArrowRight,
    Loader2,
    Info,
    Search,
    Check,
    Badge,
    ArrowLeft,
    Send,
    AlertTriangle,
    Eye
} from 'lucide-react';

export const STORAGE_KEYS = {
    DRAFT: 'community_report_draft',
    DRAFTS_LIST: 'community_report_drafts_list'
};

export const STEPS = [
    { id: 1, title: 'Type', description: 'Select report type', icon: AlertCircle },
    { id: 2, title: 'Details', description: 'Provide information', icon: FileText },
    { id: 3, title: 'Evidence', description: 'Add photos/files', icon: Camera },
    { id: 4, title: 'Review', description: 'Final check', icon: CheckCircle }
];

export const ICON_MAP: Record<string, React.ComponentType<any>> = {
    'alert-circle': AlertCircle,
    'megaphone': Megaphone,
    'volume-2': Volume2,
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

export const URGENCY_OPTIONS = [
    { value: 'low', label: 'Low', description: 'Can wait' },
    { value: 'medium', label: 'Medium', description: 'Normal' },
    { value: 'high', label: 'High', description: 'Urgent' }
] as const;

export const FILE_CONFIG = {
    MAX_FILES: 10,
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ACCEPTED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'video/mp4', 'video/mov', 'video/avi']
} as const;

// Helper functions
export const generateDraftId = () => {
    return 'draft_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

export const isFile = (obj: any): obj is File => {
    return obj && 
           typeof obj === 'object' && 
           'name' in obj && 
           'size' in obj && 
           'type' in obj &&
           'lastModified' in obj;
};

export const pairItems = <T,>(items: T[]): (T | null)[][] => {
    const pairs: (T | null)[][] = [];
    for (let i = 0; i < items.length; i += 2) {
        const pair: (T | null)[] = [items[i], i + 1 < items.length ? items[i + 1] : null];
        pairs.push(pair);
    }
    return pairs;
};

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

export const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return ImageIcon;
    if (type.startsWith('video/')) return Video;
    if (type === 'application/pdf') return FileText;
    return File;
};

export const isOtherType = (type: ReportType) => {
    return type.code === 'OTHER_ISSUE' || type.code === 'OTHER_COMPLAINT';
};

// Need to import ReportType here or define it locally
import { ReportType } from '@/types/portal/community-report';