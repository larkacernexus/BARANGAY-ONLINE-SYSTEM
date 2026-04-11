// /components/portal/community-report/show/MobileHeader.tsx
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Link } from '@inertiajs/react';
import { ArrowLeft, MoreVertical, FileText, Printer, Share2, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface MobileHeaderProps {
    reportNumber: string;
    title: string;
    canEdit: boolean;
    reportId: number;
    onPrint: () => void;
    onShare: () => void;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export const MobileHeader = ({
    reportNumber,
    title,
    canEdit,
    reportId,
    onPrint,
    onShare,
    isOpen,
    onOpenChange
}: MobileHeaderProps) => {
    const [copied, setCopied] = useState(false);

    const handleCopyReportNumber = async () => {
        try {
            await navigator.clipboard.writeText(reportNumber);
            setCopied(true);
            toast.success(`Copied: ${reportNumber}`);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            toast.error('Failed to copy');
        }
    };

    return (
        <>
            <div className="flex items-center justify-between sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl z-10 py-3 px-4 -mx-4 border-b border-gray-200 dark:border-gray-800 safe-top">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Link href="/portal/community-reports">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 rounded-xl shrink-0"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <h1 className="text-base font-bold truncate">
                                #{reportNumber}
                            </h1>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 rounded-lg shrink-0"
                                onClick={handleCopyReportNumber}
                            >
                                {copied ? (
                                    <Check className="h-3 w-3 text-green-500" />
                                ) : (
                                    <Copy className="h-3 w-3 text-gray-400" />
                                )}
                            </Button>
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                            {title}
                        </p>
                    </div>
                </div>
                
                <Sheet open={isOpen} onOpenChange={onOpenChange}>
                    <SheetTrigger asChild>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 w-8 p-0 rounded-xl shrink-0 ml-2"
                        >
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent 
                        side="bottom" 
                        className="rounded-t-xl p-0 animate-slide-up"
                    >
                        <div className="p-4 pb-6">
                            <SheetHeader className="mb-4">
                                <SheetTitle>Report Actions</SheetTitle>
                                <p className="text-xs text-gray-500">
                                    Choose an action for report #{reportNumber}
                                </p>
                            </SheetHeader>
                            <div className="space-y-2">
                                {canEdit && (
                                    <Button 
                                        variant="outline" 
                                        className="w-full justify-start gap-3 rounded-xl h-11"
                                        asChild
                                    >
                                        <Link href={`/portal/community-reports/${reportId}/edit`}>
                                            <FileText className="h-4 w-4" />
                                            Edit Report
                                        </Link>
                                    </Button>
                                )}
                                <Button 
                                    variant="outline" 
                                    className="w-full justify-start gap-3 rounded-xl h-11" 
                                    onClick={() => {
                                        onPrint();
                                        onOpenChange(false);
                                    }}
                                >
                                    <Printer className="h-4 w-4" />
                                    Print Report
                                </Button>
                                <Button 
                                    variant="outline" 
                                    className="w-full justify-start gap-3 rounded-xl h-11" 
                                    onClick={() => {
                                        onShare();
                                        onOpenChange(false);
                                    }}
                                >
                                    <Share2 className="h-4 w-4" />
                                    Share Report
                                </Button>
                                <Button 
                                    variant="outline" 
                                    className="w-full justify-start gap-3 rounded-xl h-11" 
                                    onClick={handleCopyReportNumber}
                                >
                                    <Copy className="h-4 w-4" />
                                    Copy Report Number
                                </Button>
                                <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                                    <Link href="/portal/community-reports">
                                        <Button 
                                            variant="ghost" 
                                            className="w-full justify-start gap-3 rounded-xl h-11 text-gray-500"
                                        >
                                            <ArrowLeft className="h-4 w-4" />
                                            Back to Reports
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                        
                        {/* Safe area spacer for notches */}
                        <div className="h-safe-bottom" />
                    </SheetContent>
                </Sheet>
            </div>
            
            {/* Add styles for safe areas */}
            <style>{`
                .safe-top {
                    padding-top: env(safe-area-inset-top);
                }
                .safe-bottom {
                    padding-bottom: env(safe-area-inset-bottom);
                }
                .h-safe-bottom {
                    height: env(safe-area-inset-bottom);
                }
                @keyframes slide-up {
                    from {
                        transform: translateY(100%);
                    }
                    to {
                        transform: translateY(0);
                    }
                }
                .animate-slide-up {
                    animation: slide-up 0.3s ease-out;
                }
            `}</style>
        </>
    );
};