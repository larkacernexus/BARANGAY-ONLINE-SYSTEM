import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Bell, Loader2, Mail, Calendar, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { router } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';

interface FeesReminderButtonProps {
    selectedFees?: any[];
    onRemindersSent?: () => void;
    className?: string;
}

export function FeesReminderButton({ 
    selectedFees = [], 
    onRemindersSent,
    className 
}: FeesReminderButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [reminderDays, setReminderDays] = useState(7);
    const [dueStats, setDueStats] = useState<any>(null);
    const toast = useToast();

const fetchDueStats = () => {
    router.visit(window.location.pathname, {  // Stay on current URL
        method: 'get',
        data: { days: reminderDays },
        preserveState: true,
        preserveScroll: true,
        replace: true,  // Replace current history entry instead of pushing new one
        only: ['dueStats'],
        onSuccess: (page) => {
            if (page.props.dueStats) {
                setDueStats(page.props.dueStats);
            }
        },
        onError: (errors) => {
            console.error('Failed to fetch due stats:', errors);
            toast.error('Failed to fetch due statistics');
        }
    });
};

    const handleSendReminders = () => {
        setIsLoading(true);
        
        const payload: any = {
            days: reminderDays,
        };

        if (selectedFees.length > 0) {
            payload.fee_ids = selectedFees.map(fee => fee.id);
        }

        router.post('/admin/fees/reminders/send', payload, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: (page) => {
                toast.success(
                    typeof page.props.message === 'string' && page.props.message.trim().length > 0
                        ? page.props.message
                        : 'Reminders sent successfully'
                );
                setShowConfirmDialog(false);
                
                if (onRemindersSent) {
                    onRemindersSent();
                }
            },
            onError: (errors) => {
                console.error('Failed to send reminders:', errors);
                
                if (typeof errors === 'object') {
                    const errorMessage = Object.values(errors)[0] || 'Failed to send reminders';
                    toast.error(errorMessage);
                } else {
                    toast.error('Failed to send reminders');
                }
            },
            onFinish: () => {
                setIsLoading(false);
            }
        });
    };

    const handleOpenDialog = () => {
        fetchDueStats();
        setShowConfirmDialog(true);
    };

    const getReminderLabel = () => {
        if (selectedFees.length > 0) {
            return `Send Reminders (${selectedFees.length} selected)`;
        }
        return 'Send Due Reminders';
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className={className}>
                        <Bell className="mr-2 h-4 w-4" />
                        {getReminderLabel()}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Reminder Options</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => {
                        setReminderDays(1);
                        handleOpenDialog();
                    }}>
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>Due Tomorrow</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                        setReminderDays(3);
                        handleOpenDialog();
                    }}>
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>Due in 3 Days</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                        setReminderDays(7);
                        handleOpenDialog();
                    }}>
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>Due in 7 Days</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => {
                        setReminderDays(0);
                        handleOpenDialog();
                    }}>
                        <AlertCircle className="mr-2 h-4 w-4" />
                        <span>Overdue Fees</span>
                    </DropdownMenuItem>
                    {selectedFees.length > 0 && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleOpenDialog}>
                                <Mail className="mr-2 h-4 w-4" />
                                <span>Send to Selected ({selectedFees.length})</span>
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Send Fee Reminders</DialogTitle>
                        <DialogDescription>
                            {selectedFees.length > 0 
                                ? `Send reminders to ${selectedFees.length} selected fee(s)`
                                : `Send reminders for fees due within ${reminderDays === 0 ? 'today' : reminderDays + ' days'}`
                            }
                        </DialogDescription>
                    </DialogHeader>

                    {dueStats && (
                        <div className="grid grid-cols-2 gap-4 py-4">
                            <div className="rounded-lg border p-3">
                                <p className="text-sm text-muted-foreground">Due Today</p>
                                <p className="text-2xl font-bold">{dueStats.due_today}</p>
                            </div>
                            <div className="rounded-lg border p-3">
                                <p className="text-sm text-muted-foreground">Due Tomorrow</p>
                                <p className="text-2xl font-bold">{dueStats.due_tomorrow}</p>
                            </div>
                            <div className="rounded-lg border p-3">
                                <p className="text-sm text-muted-foreground">This Week</p>
                                <p className="text-2xl font-bold">{dueStats.due_this_week}</p>
                            </div>
                            <div className="rounded-lg border p-3">
                                <p className="text-sm text-muted-foreground">Overdue</p>
                                <p className="text-2xl font-bold text-destructive">{dueStats.overdue}</p>
                            </div>
                        </div>
                    )}

                    {selectedFees.length > 0 && (
                        <div className="py-2">
                            <Badge variant="secondary">
                                {selectedFees.length} fee(s) selected
                            </Badge>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowConfirmDialog(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSendReminders}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Mail className="mr-2 h-4 w-4" />
                                    Send Reminders
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}