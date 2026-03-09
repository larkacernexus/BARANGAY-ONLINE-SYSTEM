import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Layers, MousePointer, Plus, Bell } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { FeesReminderButton } from './FeesReminderButton';

interface FeesHeaderProps {
    isBulkMode: boolean;
    setIsBulkMode: (value: boolean) => void;
    isMobile?: boolean;
    selectedFees?: any[];
    onRemindersSent?: () => void;
    paginatedFees?: any[];
}

export default function FeesHeader({ 
    isBulkMode, 
    setIsBulkMode, 
    isMobile = false,
    selectedFees = [],
    onRemindersSent,
    paginatedFees = []
}: FeesHeaderProps) {
    
    const hasFeesForReminders = () => {
        // If in bulk mode and fees are selected
        if (isBulkMode && selectedFees.length > 0) {
            return true;
        }
        
        // If not in bulk mode, check if there are any unpaid fees in the list
        if (!isBulkMode) {
            return paginatedFees.some(fee => fee.status !== 'paid');
        }
        
        return false;
    };
    
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Fees Management</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                    Manage and track barangay fees, bills, and certificates
                </p>
            </div>
            
            <div className="flex items-center gap-2">
                {/* Reminder Button - Only show when there are fees to remind */}
                {hasFeesForReminders() && (
                    <FeesReminderButton 
                        selectedFees={selectedFees}
                        onRemindersSent={onRemindersSent}
                    />
                )}
                
                {/* Bulk Mode Toggle */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsBulkMode(!isBulkMode)}
                            className={`h-9 ${isBulkMode ? 'bg-blue-50 border-blue-200 text-blue-700' : ''}`}
                        >
                            {isBulkMode ? (
                                <>
                                    <Layers className="h-4 w-4 mr-2" />
                                    {!isMobile && 'Bulk Mode'}
                                    {isMobile && 'Bulk'}
                                </>
                            ) : (
                                <>
                                    <MousePointer className="h-4 w-4 mr-2" />
                                    {!isMobile && 'Bulk Select'}
                                    {isMobile && 'Select'}
                                </>
                            )}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Toggle Bulk Mode (Ctrl+Shift+B)</p>
                        <p className="text-xs text-gray-500">Select multiple fees for batch operations</p>
                    </TooltipContent>
                </Tooltip>
                
                {/* New Fee Button */}
                <Link href={route('admin.fees.create')}>
                    <Button size="sm" className="h-9">
                        <Plus className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">New Fee</span>
                        <span className="sm:hidden">New</span>
                    </Button>
                </Link>
            </div>
        </div>
    );
}