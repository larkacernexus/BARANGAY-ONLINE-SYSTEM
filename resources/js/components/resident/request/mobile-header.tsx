import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { ArrowLeft, PenSquare, FileText, Menu } from 'lucide-react';

interface MobileHeaderProps {
    activeTab: 'form' | 'summary';
    onTabChange: (tab: 'form' | 'summary') => void;
}

export function MobileHeader({ activeTab, onTabChange }: MobileHeaderProps) {
    return (
        <div className="lg:hidden">
            <div className="flex items-center gap-3 mb-4">
                <Link href="/resident/clearances">
                    <Button variant="ghost" size="sm" className="gap-2 px-2">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only sm:not-sr-only">Back</span>
                    </Button>
                </Link>
                <div className="flex-1">
                    <h1 className="text-xl font-bold tracking-tight">Request Clearance</h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        Submit a request for barangay clearance or certificate
                    </p>
                </div>
            </div>

            {/* Mobile Tabs */}
            <div className="flex border-b">
                <button
                    type="button"
                    className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors ${activeTab === 'form' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    onClick={() => onTabChange('form')}
                >
                    <div className="flex items-center justify-center gap-2">
                        <PenSquare className="h-4 w-4" />
                        <span>Form</span>
                    </div>
                </button>
                <button
                    type="button"
                    className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors ${activeTab === 'summary' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    onClick={() => onTabChange('summary')}
                >
                    <div className="flex items-center justify-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span>Summary</span>
                    </div>
                </button>
            </div>
        </div>
    );
}