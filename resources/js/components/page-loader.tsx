import { Home, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PageLoaderProps {
    visible: boolean;
    slowThreshold?: number; 
}

export default function PageLoader({ visible, slowThreshold = 1000 }: PageLoaderProps) {
    const [isSlow, setIsSlow] = useState(false);
    const [shouldRenderOverlay, setShouldRenderOverlay] = useState(false);

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;

        if (visible) {
            // Start timing the "Slow" threshold
            timer = setTimeout(() => {
                setIsSlow(true);
                setShouldRenderOverlay(true);
            }, slowThreshold);
        } else {
            // Reset everything immediately when loading finishes
            setIsSlow(false);
            // Small delay before unmounting overlay to allow fade-out
            timer = setTimeout(() => setShouldRenderOverlay(false), 300);
        }

        return () => clearTimeout(timer);
    }, [visible, slowThreshold]);

    if (!visible && !shouldRenderOverlay) return null;

    return (
        <>
            {/* TIER 1: THE FAST TRANSITION (Always shows immediately) */}
            <div 
                className={`fixed top-0 left-0 right-0 z-[110] h-1 transition-opacity duration-300 ${
                    visible ? 'opacity-100' : 'opacity-0'
                }`}
            >
                <div className="h-full bg-blue-600 shadow-[0_0_10px_#2563eb] animate-progress-fast" />
            </div>

            {/* TIER 2: THE SLOW OVERLAY (Only shows after threshold) */}
            {shouldRenderOverlay && (
                <div 
                    className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md transition-all duration-500 ${
                        isSlow ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                    }`}
                >
                    <div className="relative">
                        <div className="absolute inset-0 -m-6 animate-[ping_2s_infinite] rounded-full border border-blue-500/20" />
                        <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-white dark:bg-zinc-900 shadow-2xl border border-slate-200 dark:border-zinc-800">
                            <Home className="h-12 w-12 text-blue-700 dark:text-blue-500" />
                            <div className="absolute -bottom-2 -right-2 rounded-full bg-emerald-600 p-2 text-white shadow-lg ring-4 ring-white dark:ring-zinc-950">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 flex flex-col items-center gap-2 text-center px-6">
                        <h2 className="text-sm font-bold uppercase tracking-[0.25em] text-slate-900 dark:text-zinc-100">
                            Barangay Information System
                        </h2>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-700 dark:text-blue-400 animate-pulse">
                            Processing Official Records...
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}