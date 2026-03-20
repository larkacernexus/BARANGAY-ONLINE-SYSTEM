import { 
    CheckCircle, 
    XCircle, 
    ShieldAlert, 
    Timer, 
    AlertCircle,
    FileText,
    File,
    Video,
    Volume2,
    Lock,
    Globe,
    Eye,
    Download,
    HardDrive,
    Calendar,
    Clock,
    Fingerprint,
    FileLock,
    History,
    Printer,
    Maximize2,
    RotateCw,
    ZoomIn,
    ZoomOut,
    RefreshCw,
    Copy,
    Trash2,
    Share,
    Bookmark,
    Tag,
    Folder,
    User,
    Info,
    Shield,
    Link2,
    Scan,
    Wifi,
    WifiOff,
    Cloud,
    CloudOff,
    QrCode,
    BarChart3,
    PieChart,
    TrendingUp,
    Activity,
    Settings,
    Palette,
    PenTool,
    Move,
    Scale,
    VolumeX,
    Mic,
    MicOff,
    Camera,
    CameraOff,
    VideoOff,
    Home,
    Bell,
    Menu,
    Sparkles,
    Verified,
    Zap,
    Layers,
    Clock3,
    BadgeCheck,
    ShieldQuestion,
    Key
} from 'lucide-react';

export const DOCUMENT_STATUS_CONFIG = {
    active: { 
        label: 'Active', 
        color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
        icon: CheckCircle,
        gradient: 'from-emerald-500 to-teal-500',
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800'
    },
    expired: { 
        label: 'Expired', 
        color: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400',
        icon: XCircle,
        gradient: 'from-rose-500 to-pink-500',
        badge: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800'
    },
    revoked: { 
        label: 'Revoked', 
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-400',
        icon: ShieldAlert,
        gradient: 'from-gray-500 to-slate-500',
        badge: 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-800'
    },
    pending: { 
        label: 'Pending', 
        color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
        icon: Timer,
        gradient: 'from-amber-500 to-orange-500',
        badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800'
    },
};

export const FILE_TYPE_CONFIG = {
    pdf: {
        icon: FileText,
        color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/30 dark:text-rose-400',
        gradient: 'from-rose-500 to-pink-500'
    },
    doc: {
        icon: FileText,
        color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-400',
        gradient: 'from-blue-500 to-indigo-500'
    },
    docx: {
        icon: FileText,
        color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-400',
        gradient: 'from-blue-500 to-indigo-500'
    },
    xls: {
        icon: FileText,
        color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400',
        gradient: 'from-emerald-500 to-teal-500'
    },
    xlsx: {
        icon: FileText,
        color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400',
        gradient: 'from-emerald-500 to-teal-500'
    },
    jpg: {
        icon: File,
        color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/30 dark:text-purple-400',
        gradient: 'from-purple-500 to-pink-500'
    },
    jpeg: {
        icon: File,
        color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/30 dark:text-purple-400',
        gradient: 'from-purple-500 to-pink-500'
    },
    png: {
        icon: File,
        color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/30 dark:text-purple-400',
        gradient: 'from-purple-500 to-pink-500'
    },
    gif: {
        icon: File,
        color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400',
        gradient: 'from-amber-500 to-orange-500'
    },
    txt: {
        icon: FileText,
        color: 'text-gray-600 bg-gray-50 dark:bg-gray-900 dark:text-gray-400',
        gradient: 'from-gray-500 to-slate-500'
    },
    csv: {
        icon: FileText,
        color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400',
        gradient: 'from-emerald-500 to-teal-500'
    },
    zip: {
        icon: File,
        color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400',
        gradient: 'from-amber-500 to-orange-500'
    },
    rar: {
        icon: File,
        color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400',
        gradient: 'from-amber-500 to-orange-500'
    },
    mp4: {
        icon: Video,
        color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 dark:text-indigo-400',
        gradient: 'from-indigo-500 to-purple-500'
    },
    mp3: {
        icon: Volume2,
        color: 'text-pink-600 bg-pink-50 dark:bg-pink-950/30 dark:text-pink-400',
        gradient: 'from-pink-500 to-rose-500'
    },
};

export const getFileTypeConfig = (extension: string = '') => {
    const ext = extension.toLowerCase();
    return FILE_TYPE_CONFIG[ext as keyof typeof FILE_TYPE_CONFIG] || {
        icon: File,
        color: 'text-gray-600 bg-gray-50 dark:bg-gray-900 dark:text-gray-400',
        gradient: 'from-gray-500 to-slate-500'
    };
};