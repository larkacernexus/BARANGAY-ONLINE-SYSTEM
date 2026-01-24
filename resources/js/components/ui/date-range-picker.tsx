// components/ui/date-range-picker.tsx
import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DateRangePickerProps {
    startDate?: Date;
    endDate?: Date;
    onDateChange: (start?: Date, end?: Date) => void;
    className?: string;
    disabled?: boolean;
}

export function DateRangePicker({
    startDate,
    endDate,
    onDateChange,
    className = '',
    disabled = false
}: DateRangePickerProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (range: { from?: Date; to?: Date } | undefined) => {
        onDateChange(range?.from, range?.to);
        if (range?.from && range?.to) {
            setIsOpen(false);
        }
    };

    return (
        <div className={cn('grid gap-2', className)}>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={cn(
                            'w-full justify-start text-left font-normal',
                            !startDate && 'text-muted-foreground'
                        )}
                        disabled={disabled}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? (
                            endDate ? (
                                <>
                                    {format(startDate, 'LLL dd, y')} -{' '}
                                    {format(endDate, 'LLL dd, y')}
                                </>
                            ) : (
                                format(startDate, 'LLL dd, y')
                            )
                        ) : (
                            <span>Pick a date range</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="range"
                        selected={{ from: startDate, to: endDate }}
                        onSelect={handleSelect}
                        numberOfMonths={2}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}