// components/ui/confirm-action.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { AlertCircle, Trash2 } from 'lucide-react';

interface ConfirmActionProps {
    onConfirm: () => Promise<void> | void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'destructive' | 'default';
    trigger?: React.ReactNode;
    isLoading?: boolean;
}

export function ConfirmAction({
    onConfirm,
    title,
    description,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'destructive',
    trigger,
    isLoading = false
}: ConfirmActionProps) {
    const [isOpen, setIsOpen] = useState(false);

    const defaultTrigger = (
        <Button 
            variant={variant === 'destructive' ? 'destructive' : 'outline'}
            size="sm"
            onClick={() => setIsOpen(true)}
            disabled={isLoading}
        >
            {variant === 'destructive' ? (
                <Trash2 className="h-4 w-4 mr-2" />
            ) : (
                <AlertCircle className="h-4 w-4 mr-2" />
            )}
            {confirmText}
        </Button>
    );

    return (
        <>
            {trigger ? (
                <div onClick={() => setIsOpen(true)}>
                    {trigger}
                </div>
            ) : (
                defaultTrigger
            )}
            
            <ConfirmDialog
                open={isOpen}
                onOpenChange={setIsOpen}
                title={title}
                description={description}
                onConfirm={onConfirm}
                confirmText={confirmText}
                cancelText={cancelText}
                variant={variant}
                isLoading={isLoading}
            />
        </>
    );
}