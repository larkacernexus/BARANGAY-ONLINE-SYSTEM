import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DesktopHeaderProps {
    isMobile: boolean;
    hasDraft: boolean;
}

export function DesktopHeader({ isMobile, hasDraft }: DesktopHeaderProps) {
    if (isMobile) return null;

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/portal/clearances">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Button>
                    </Link>
                    <div className="flex items-center gap-3">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Request Clearance</h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">
                                Submit a request for barangay clearance or certificate
                            </p>
                        </div>
                        {hasDraft && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                Draft Auto-saved
                            </Badge>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}