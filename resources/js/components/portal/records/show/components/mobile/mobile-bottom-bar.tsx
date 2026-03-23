// components/document/mobile/mobile-bottom-bar.tsx
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Download, Maximize2, Printer, ArrowLeft } from 'lucide-react';
import { Document } from '@/types/portal/records/document.types';

interface MobileBottomBarProps {
    document: Document;
    onDownload: () => void;
    onFullscreen: () => void;
    canDownload: boolean;
}

export function MobileBottomBar({ document, onDownload, onFullscreen, canDownload }: MobileBottomBarProps) {
    const securityOptions = document.security_options || {};

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 safe-bottom">
            <div className="flex items-center justify-around py-3 px-4">
                {canDownload && !securityOptions.restrict_download && (
                    <Button variant="ghost" onClick={onDownload} className="flex flex-col items-center gap-1 h-auto py-1 px-3">
                        <Download className="h-5 w-5" />
                        <span className="text-[10px]">Download</span>
                    </Button>
                )}
                
                <Button variant="ghost" onClick={onFullscreen} className="flex flex-col items-center gap-1 h-auto py-1 px-3">
                    <Maximize2 className="h-5 w-5" />
                    <span className="text-[10px]">Fullscreen</span>
                </Button>
                
                {!securityOptions.restrict_print && (
                    <Button variant="ghost" onClick={() => window.print()} className="flex flex-col items-center gap-1 h-auto py-1 px-3">
                        <Printer className="h-5 w-5" />
                        <span className="text-[10px]">Print</span>
                    </Button>
                )}
                
                <Link href="/portal/my-records" className="flex flex-col items-center gap-1 py-1 px-3">
                    <Button variant="ghost" className="h-auto p-0 flex flex-col items-center gap-1">
                        <ArrowLeft className="h-5 w-5" />
                        <span className="text-[10px]">Back</span>
                    </Button>
                </Link>
            </div>
        </div>
    );
}