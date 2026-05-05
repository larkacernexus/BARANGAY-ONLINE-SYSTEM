// resources/js/Components/ResidentPageLoader.tsx
import { useEffect, useState, useMemo, useRef } from 'react';
import {
    Home,
    ShieldCheck,
    Users,
    FileText,
    CreditCard,
    Settings,
    User,
    Megaphone,
    Lock,
    Bell,
    Calendar,
    Clock,
    type LucideIcon
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────

interface PageLoaderProps {
    visible: boolean;
    slowThreshold?: number;
}

interface RouteInfo {
    icon: LucideIcon;
    label: string;
    description: string;
}

// ─── Route Pattern to Loading Message Map ───────────────────────────────

const ROUTE_PATTERNS: { pattern: RegExp; info: RouteInfo }[] = [
    {
        pattern: /^\/dashboard/i,
        info: { icon: Home, label: 'Loading Dashboard', description: 'Preparing your household overview...' }
    },
    {
        pattern: /^\/clearances/i,
        info: { icon: FileText, label: 'Loading Clearances', description: 'Retrieving your clearance records...' }
    },
    {
        pattern: /^\/profile/i,
        info: { icon: User, label: 'Loading Profile', description: 'Retrieving your profile information...' }
    },
    {
        pattern: /^\/household-members/i,
        info: { icon: Users, label: 'Loading Family Members', description: 'Retrieving household member data...' }
    },
    {
        pattern: /^\/announcements/i,
        info: { icon: Megaphone, label: 'Loading Announcements', description: 'Retrieving latest announcements...' }
    },
    {
        pattern: /^\/settings/i,
        info: { icon: Settings, label: 'Loading Settings', description: 'Retrieving your preferences...' }
    },
    {
        pattern: /^\/change-password/i,
        info: { icon: Lock, label: 'Loading Security Settings', description: 'Preparing security options...' }
    },
    {
        pattern: /^\/notifications/i,
        info: { icon: Bell, label: 'Loading Notifications', description: 'Retrieving your notifications...' }
    },
];

const DEFAULT_ROUTE_INFO: RouteInfo = {
    icon: Home,
    label: 'Loading Page...',
    description: 'Please wait while we prepare your content...'
};

// ─── Helper ────────────────────────────────────────────────────────────

function resolveRouteInfo(pathname: string): RouteInfo {
    for (const { pattern, info } of ROUTE_PATTERNS) {
        if (pattern.test(pathname)) {
            return info;
        }
    }
    return DEFAULT_ROUTE_INFO;
}

// ─── Component ─────────────────────────────────────────────────────────

export default function ResidentPageLoader({ visible, slowThreshold = 1000 }: PageLoaderProps) {
    const [isSlow, setIsSlow] = useState(false);
    const [shouldRenderOverlay, setShouldRenderOverlay] = useState(false);
    const [targetUrl, setTargetUrl] = useState<string | null>(null);

    const isListeningRef = useRef(false);

    // Track Inertia navigation to get the target URL before navigation completes
    useEffect(() => {
        if (isListeningRef.current) return;
        isListeningRef.current = true;

        const handleStart = (event: Event) => {
            const customEvent = event as CustomEvent<{ visit: { url: string } }>;
            if (customEvent.detail?.visit?.url) {
                setTargetUrl(customEvent.detail.visit.url);
            }
        };

        const handleFinish = () => {
            setTargetUrl(null);
        };

        document.addEventListener('inertia:start', handleStart);
        document.addEventListener('inertia:finish', handleFinish);

        return () => {
            document.removeEventListener('inertia:start', handleStart);
            document.removeEventListener('inertia:finish', handleFinish);
            isListeningRef.current = false;
        };
    }, []);

    // Resolve route info based on navigation target
    const { icon: Icon, label, description } = useMemo(() => {
        if (targetUrl) {
            return resolveRouteInfo(targetUrl);
        }
        return DEFAULT_ROUTE_INFO;
    }, [targetUrl]);

    // Handle slow threshold timer
    useEffect(() => {
        let slowTimer: ReturnType<typeof setTimeout>;
        let unmountTimer: ReturnType<typeof setTimeout>;

        if (visible) {
            slowTimer = setTimeout(() => {
                setIsSlow(true);
                setShouldRenderOverlay(true);
            }, slowThreshold);
        } else {
            setIsSlow(false);
            unmountTimer = setTimeout(() => {
                setShouldRenderOverlay(false);
                setTargetUrl(null);
            }, 300);
        }

        return () => {
            clearTimeout(slowTimer);
            clearTimeout(unmountTimer);
        };
    }, [visible, slowThreshold]);

    if (!visible && !shouldRenderOverlay) return null;

    return (
        <>
            {/* Tier 1: Fast Progress Bar */}
            <div
                className={`fixed top-0 left-0 right-0 z-[110] h-1 transition-opacity duration-300 ${
                    visible ? 'opacity-100' : 'opacity-0'
                }`}
                aria-hidden="true"
            >
                <div className="h-full bg-emerald-600 shadow-[0_0_10px_#059669] animate-progress-fast" />
            </div>

            {/* Tier 2: Slow Overlay */}
            {shouldRenderOverlay && (
                <div
                    className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md transition-all duration-500 ${
                        isSlow ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                    }`}
                    role="status"
                    aria-live="polite"
                    aria-label={label}
                >
                    <div className="relative">
                        <div className="absolute inset-0 -m-6 animate-[ping_2s_infinite] rounded-full border border-emerald-500/20" />
                        <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-white dark:bg-zinc-900 shadow-2xl border border-slate-200 dark:border-zinc-800">
                            <Icon className="h-12 w-12 text-emerald-700 dark:text-emerald-500" />
                            <div className="absolute -bottom-2 -right-2 rounded-full bg-blue-600 p-2 text-white shadow-lg ring-4 ring-white dark:ring-zinc-950">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 flex flex-col items-center gap-2 text-center px-6">
                        <h2 className="text-sm font-bold uppercase tracking-[0.25em] text-slate-900 dark:text-zinc-100">
                            Barangay Kibawe
                        </h2>
                        <p className="text-base font-semibold text-emerald-700 dark:text-emerald-400">
                            {label}
                        </p>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-700/70 dark:text-emerald-400/70 animate-pulse">
                            {description}
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}