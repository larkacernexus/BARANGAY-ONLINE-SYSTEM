import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Database, Download } from 'lucide-react';
import { BackupType } from '@/types/admin/backup/backup';
import { route } from 'ziggy-js';

interface BackupButtonProps {
    type?: BackupType;
    description?: string;
    className?: string;
    size?: 'default' | 'sm' | 'lg' | 'icon';
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

const BackupButton: React.FC<BackupButtonProps> = ({
    type = 'full',
    description = '',
    className = '',
    size = 'default',
    variant = 'default',
}) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = async () => {
        if (isLoading) return;

        setIsLoading(true);
        
        try {
            await router.post(route('backup.create'), {
                type,
                description,
            }, {
                onSuccess: () => {
                    setIsLoading(false);
                    // The download will start automatically via the response
                },
                onError: () => {
                    setIsLoading(false);
                    alert('Failed to create backup');
                },
            });
        } catch (error) {
            setIsLoading(false);
            console.error('Backup error:', error);
        }
    };

    return (
        <Button
            onClick={handleClick}
            disabled={isLoading}
            className={`gap-2 ${className}`}
            size={size}
            variant={variant}
        >
            {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
                <Download className="h-4 w-4" />
            )}
            {size !== 'icon' && (
                <span>
                    {isLoading ? 'Creating Backup...' : 'Download Backup'}
                </span>
            )}
        </Button>
    );
};

export default BackupButton;