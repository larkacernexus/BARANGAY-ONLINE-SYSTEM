import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface MobileHeaderProps {
    isMobile: boolean;
    hasDraft: boolean;
    activeStep: number;
}

export function MobileHeader({ isMobile, hasDraft, activeStep }: MobileHeaderProps) {
    if (!isMobile) return null;

    return (
        <div className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
            <div className="p-4">
                <div className="flex items-center gap-3">
                    <Link href="/resident/clearances" className="flex-shrink-0">
                        <Button type="button" variant="ghost" size="icon" className="h-10 w-10 rounded-full">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                            <h1 className="text-lg font-bold truncate">Request Clearance</h1>
                            {hasDraft && (
                                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                    Draft Saved
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <Progress value={(activeStep / 4) * 100} className="h-1.5 flex-1" />
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                Step {activeStep} of 4
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}