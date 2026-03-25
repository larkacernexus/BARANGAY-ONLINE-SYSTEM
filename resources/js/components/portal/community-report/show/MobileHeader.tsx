// components/MobileHeader.tsx
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Link } from '@inertiajs/react';
import { ArrowLeft, MoreVertical, FileText, Printer, Share2 } from 'lucide-react';

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
    return (
        <div className="flex items-center justify-between sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl z-10 py-3 px-4 -mx-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2">
                <Link href="/portal/community-reports">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-xl">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-lg font-bold truncate max-w-[180px]">
                        #{reportNumber}
                    </h1>
                    <p className="text-xs text-gray-500 truncate max-w-[180px]">
                        {title}
                    </p>
                </div>
            </div>
            <Sheet open={isOpen} onOpenChange={onOpenChange}>
                <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-xl">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="rounded-t-xl">
                    <SheetHeader className="mb-4">
                        <SheetTitle>Actions</SheetTitle>
                    </SheetHeader>
                    <div className="space-y-2">
                        {canEdit && (
                            <Button 
                                variant="outline" 
                                className="w-full justify-start gap-2 rounded-xl"
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
                            className="w-full justify-start gap-2 rounded-xl" 
                            onClick={onPrint}
                        >
                            <Printer className="h-4 w-4" />
                            Print
                        </Button>
                        <Button 
                            variant="outline" 
                            className="w-full justify-start gap-2 rounded-xl" 
                            onClick={onShare}
                        >
                            <Share2 className="h-4 w-4" />
                            Share
                        </Button>
                        <Link href="/portal/community-reports">
                            <Button variant="outline" className="w-full justify-start gap-2 rounded-xl">
                                <ArrowLeft className="h-4 w-4" />
                                Back to Reports
                            </Button>
                        </Link>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
};