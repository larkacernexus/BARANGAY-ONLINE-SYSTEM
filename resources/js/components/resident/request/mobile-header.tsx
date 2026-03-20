import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, PenSquare, FileText, CheckCircle, AlertCircle } from 'lucide-react';

interface MobileHeaderProps {
    activeTab: 'form' | 'summary';
    onTabChange: (tab: 'form' | 'summary') => void;
    formStatus?: {
        clearanceTypeSelected: boolean;
        purposeSelected: boolean;
        documentsComplete: boolean;
        dateSpecified: boolean;
    };
}

export function MobileHeader({ activeTab, onTabChange, formStatus }: MobileHeaderProps) {
    const getCompletionPercentage = () => {
        if (!formStatus) return 0;
        const items = Object.values(formStatus);
        const completed = items.filter(Boolean).length;
        return Math.round((completed / items.length) * 100);
    };

    return (
        <div className="lg:hidden sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
            <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                    <Link href="/resident/clearances">
                        <Button variant="ghost" size="sm" className="gap-2 px-2 h-10 w-10 rounded-full">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-lg font-bold tracking-tight truncate">Request Clearance</h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            Submit request for barangay clearance
                        </p>
                    </div>
                    {formStatus && (
                        <Badge variant={getCompletionPercentage() === 100 ? "default" : "secondary"}>
                            {getCompletionPercentage()}%
                        </Badge>
                    )}
                </div>

                {/* Progress Indicator */}
                {formStatus && (
                    <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-gray-700">Progress</span>
                            <span className="text-xs font-medium">{getCompletionPercentage()}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-green-500 transition-all duration-300"
                                style={{ width: `${getCompletionPercentage()}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Mobile Tabs */}
                <div className="flex border rounded-lg bg-gray-50 dark:bg-gray-900 p-1">
                    <button
                        type="button"
                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'form' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => onTabChange('form')}
                    >
                        <PenSquare className="h-4 w-4" />
                        <span>Form</span>
                        {formStatus && (
                            <Badge 
                                variant={formStatus.clearanceTypeSelected && formStatus.purposeSelected && formStatus.dateSpecified ? "default" : "secondary"} 
                                className="h-4 px-1 ml-1 text-xs"
                            >
                                {[formStatus.clearanceTypeSelected, formStatus.purposeSelected, formStatus.dateSpecified].filter(Boolean).length}/3
                            </Badge>
                        )}
                    </button>
                    <button
                        type="button"
                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'summary' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => onTabChange('summary')}
                    >
                        <FileText className="h-4 w-4" />
                        <span>Summary</span>
                        {formStatus?.documentsComplete && (
                            <CheckCircle className="h-4 w-4 text-green-500 ml-1" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}