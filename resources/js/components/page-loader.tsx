import { Home, ShieldCheck, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';

interface PageLoaderProps {
    visible: boolean;
    slowThreshold?: number;
}

export default function PageLoader({ visible, slowThreshold = 1000 }: PageLoaderProps) {
    const [isSlow, setIsSlow] = useState(false);
    const [shouldRenderOverlay, setShouldRenderOverlay] = useState(false);
    const [pendingUrl, setPendingUrl] = useState<string>('');

    const getLoadingMessage = (url: string) => {
        const path = url ? url.split('?')[0] : '';

        if (!path || path === '/' || path === '/index.php' || path.includes('/home')) 
            return "Welcome to Barangay Portal...";
        
        if (path.includes('/admin')) {
            if (path.includes('/dashboard')) return "Preparing Analytics Overview...";
            if (path.includes('/residents')) return "Loading Residents Database...";
            if (path.includes('/payments')) return "Processing Payment Records...";
            return "Loading Admin Panel...";
        }

        if (path.includes('/clearance')) return "Preparing Clearance Form...";
        if (path.includes('/services')) return "Loading Available Services...";
        
        return "Please wait, processing request...";
    };

    useEffect(() => {
        const handleRouterStart = (event: any) => {
            const url = event?.detail?.visit?.url?.pathname;
            if (url) setPendingUrl(url);
        };

        const unbindRouter = router.on('start', handleRouterStart);
        let timer: ReturnType<typeof setTimeout>;

        if (visible) {
            timer = setTimeout(() => {
                setIsSlow(true);
                setShouldRenderOverlay(true);
            }, slowThreshold);
        } else {
            setIsSlow(false);
            timer = setTimeout(() => {
                setShouldRenderOverlay(false);
                setPendingUrl('');
            }, 300);
        }

        return () => {
            unbindRouter();
            if (timer) clearTimeout(timer);
        };
    }, [visible, slowThreshold]);

    if (!visible && !shouldRenderOverlay) return null;

    return (
        <>
            {/* Top Progress Bar */}
            <div 
                className={`fixed top-0 left-0 right-0 z-[110] h-1 transition-opacity duration-300 ${
                    visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
            >
                <div className="h-full bg-blue-600 shadow-[0_0_10px_#2563eb] animate-progress-fast" />
            </div>

            {/* Content-Centric Loader - Transparent fixed container */}
            {shouldRenderOverlay && (
                <div 
                    className={`fixed inset-0 z-[100] flex items-center justify-center p-6 pointer-events-none transition-all duration-500 ${
                        isSlow ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                    }`}
                >
                    {/* The Pill: Increased transparency and stronger background blur */}
                    <div className="flex items-center gap-5 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xl p-4 pr-6 rounded-2xl shadow-xl border border-white/10 dark:border-zinc-800/20 pointer-events-auto">
                        
                        {/* Logo and Status Indicator */}
                        <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50/50 dark:bg-blue-900/20">
                            <Home className="h-6 w-6 text-blue-700 dark:text-blue-400" />
                            <div className="absolute -bottom-1 -right-1 rounded-full bg-emerald-600 p-0.5 text-white shadow-md ring-2 ring-white/50 dark:ring-zinc-900/50">
                                <ShieldCheck className="h-3 w-3" />
                            </div>
                        </div>

                        {/* Branding and Dynamic Message */}
                        <div className="flex flex-col">
                            <h2 className="text-[12px] font-black uppercase tracking-[0.1em] text-slate-900 dark:text-white">
                                Barangay Information System
                            </h2>
                            <div className="mt-0.5 flex items-center gap-2">
                                <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
                                <span className="text-[10px] font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-tighter">
                                    {getLoadingMessage(pendingUrl)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}