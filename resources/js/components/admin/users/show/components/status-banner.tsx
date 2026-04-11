// resources/js/Pages/Admin/Users/components/status-banner.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    AlertTriangle,
    RefreshCw,
    Key,
    CheckCircle,
    Shield,
    Clock,
    XCircle,
} from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { User } from '@/types/admin/users/user-types';

interface StatusBannerProps {
    user: User;
    onResetPassword: () => void;
    isResettingPassword: boolean;
    variant?: 'password_change' | 'email_unverified' | 'inactive' | 'suspended' | 'pending';
    onAction?: () => void;
    actionLabel?: string;
}

interface BannerConfig {
    icon: React.ComponentType<{ className?: string }>;
    iconColor: string;
    borderColor: string;
    bgColor: string;
    title: string;
    description: string;
    defaultActionLabel: string;
}

const getBannerConfig = (variant: StatusBannerProps['variant'] = 'password_change'): BannerConfig => {
    const configs: Record<NonNullable<StatusBannerProps['variant']>, BannerConfig> = {
        password_change: {
            icon: AlertTriangle,
            iconColor: 'text-amber-500 dark:text-amber-400',
            borderColor: 'border-l-amber-500',
            bgColor: 'bg-amber-50 dark:bg-amber-950/20',
            title: 'Password Change Required',
            description: 'This user must change their password on next login.',
            defaultActionLabel: 'Reset Password',
        },
        email_unverified: {
            icon: Shield,
            iconColor: 'text-blue-500 dark:text-blue-400',
            borderColor: 'border-l-blue-500',
            bgColor: 'bg-blue-50 dark:bg-blue-950/20',
            title: 'Email Not Verified',
            description: 'This user has not verified their email address yet.',
            defaultActionLabel: 'Send Verification',
        },
        inactive: {
            icon: Clock,
            iconColor: 'text-gray-500 dark:text-gray-400',
            borderColor: 'border-l-gray-500',
            bgColor: 'bg-gray-50 dark:bg-gray-900/50',
            title: 'Inactive Account',
            description: 'This account is currently inactive and cannot log in.',
            defaultActionLabel: 'Activate Account',
        },
        suspended: {
            icon: XCircle,
            iconColor: 'text-red-500 dark:text-red-400',
            borderColor: 'border-l-red-500',
            bgColor: 'bg-red-50 dark:bg-red-950/20',
            title: 'Account Suspended',
            description: 'This account has been suspended due to policy violations.',
            defaultActionLabel: 'Unsuspend Account',
        },
        pending: {
            icon: Clock,
            iconColor: 'text-yellow-500 dark:text-yellow-400',
            borderColor: 'border-l-yellow-500',
            bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
            title: 'Pending Approval',
            description: 'This account is awaiting administrative approval.',
            defaultActionLabel: 'Approve Account',
        },
    };
    
    return configs[variant];
};

export const StatusBanner = ({ 
    user, 
    onResetPassword, 
    isResettingPassword,
    variant = 'password_change',
    onAction,
    actionLabel,
}: StatusBannerProps) => {
    const config = getBannerConfig(variant);
    const IconComponent = config.icon;
    
    // Determine if we should show the banner based on user state
    const shouldShowBanner = (): boolean => {
        switch (variant) {
            case 'password_change':
                return !!user.require_password_change;
            case 'email_unverified':
                return !user.email_verified_at;
            case 'inactive':
                return user.status === 'inactive';
            case 'suspended':
                return user.status === 'suspended';
            case 'pending':
                return user.status === 'pending';
            default:
                return false;
        }
    };
    
    const handleAction = () => {
        if (onAction) {
            onAction();
        } else if (variant === 'password_change') {
            onResetPassword();
        }
    };
    
    const getActionButtonText = (): string => {
        if (isResettingPassword) return 'Sending...';
        if (actionLabel) return actionLabel;
        return config.defaultActionLabel;
    };
    
    const isActionDisabled = (): boolean => {
        if (variant === 'password_change') return isResettingPassword;
        return false;
    };
    
    if (!shouldShowBanner()) {
        return null;
    }
    
    return (
        <Card className={`border-l-4 ${config.borderColor} ${config.bgColor} dark:bg-gray-900 overflow-hidden`}>
            <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                            <IconComponent className={`h-5 w-5 ${config.iconColor}`} />
                        </div>
                        <div>
                            <p className="font-medium dark:text-gray-100">
                                {config.title}
                            </p>
                            <p className={`text-sm ${config.iconColor}`}>
                                {config.description}
                            </p>
                        </div>
                    </div>
                    
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={handleAction}
                                    disabled={isActionDisabled()}
                                    className="shrink-0 dark:border-gray-600 dark:text-gray-300"
                                >
                                    {isResettingPassword ? (
                                        <>
                                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                            {getActionButtonText()}
                                        </>
                                    ) : (
                                        <>
                                            <Key className="h-4 w-4 mr-2" />
                                            {getActionButtonText()}
                                        </>
                                    )}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Click to {getActionButtonText().toLowerCase()}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </CardContent>
        </Card>
    );
};