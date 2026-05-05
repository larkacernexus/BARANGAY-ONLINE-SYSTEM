import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import TextLink from '@/components/text-link';
import { useCountdown, formatCountdown } from '@/hooks/login/useCountdown';
import { Lock, RefreshCw, AlertTriangle, ShieldAlert, Timer } from 'lucide-react';
import { router } from '@inertiajs/react';

interface SecurityAlertsProps {
    isLocked: boolean;
    unlockTime?: string;
    isRateLimited: boolean;
    rateLimitReset?: number;
    failedLoginCount: number;
    canResetPassword: boolean;
    isMobileView?: boolean;
}

export function RateLimitWarning({ 
    isRateLimited, 
    rateLimitReset, 
    failedLoginCount,
    canResetPassword,
    isMobileView = false 
}: Omit<SecurityAlertsProps, 'isLocked' | 'unlockTime'>) {
    const [showGenericWarning, setShowGenericWarning] = useState(false);
    const rateLimitCountdown = useCountdown(rateLimitReset, isRateLimited);

    useEffect(() => {
        if (failedLoginCount >= 3) setShowGenericWarning(true);
    }, [failedLoginCount]);

    const handleRefresh = useCallback(() => {
        router.reload({ only: ['failedLoginCount', 'isLocked', 'unlockTime', 'isRateLimited', 'rateLimitReset'] });
    }, []);

    const getStyles = () => {
        if (isRateLimited) return {
            base: 'bg-rose-500/5 dark:bg-rose-500/10 border-rose-500/20',
            icon: 'text-rose-600 dark:text-rose-400',
            title: 'text-rose-900 dark:text-rose-200',
            accent: 'rose',
            label: 'Critial: Cooldown'
        };
        if (showGenericWarning) return {
            base: 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/20',
            icon: 'text-amber-600 dark:text-amber-400',
            title: 'text-amber-900 dark:text-amber-200',
            accent: 'amber',
            label: 'Warning: Failed Attempts'
        };
        return {
            base: 'bg-blue-500/5 dark:bg-blue-500/10 border-blue-500/20',
            icon: 'text-blue-600 dark:text-blue-400',
            title: 'text-blue-900 dark:text-blue-200',
            accent: 'blue',
            label: 'Security Advisory'
        };
    };

    const styles = getStyles();

    if (!isRateLimited && !showGenericWarning && failedLoginCount === 0) return null;

    return (
        <div className={`relative overflow-hidden rounded-[1.5rem] border backdrop-blur-md transition-all duration-500 ${styles.base}`}>
            <div className={`flex items-start gap-4 p-4 sm:p-5`}>
                <div className={`p-2.5 rounded-xl bg-white dark:bg-slate-900 shadow-sm ${styles.icon}`}>
                    <AlertTriangle className="w-5 h-5" />
                </div>
                
                <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                        <h4 className={`text-sm font-black tracking-tight uppercase ${styles.title}`}>
                            {styles.label}
                        </h4>
                    </div>
                    
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed max-w-[90%]">
                        {isRateLimited 
                            ? `Protocol restriction active. Please resume in ${formatCountdown(rateLimitCountdown)}.`
                            : showGenericWarning 
                                ? `Threshold approached. Account lock will initiate after further failures.`
                                : `Security monitoring active. Please verify your credentials.`
                        }
                    </p>
                    
                    <div className="flex items-center gap-4 pt-3">
                        <button 
                            onClick={handleRefresh}
                            className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${styles.icon} hover:opacity-70 transition-opacity`}
                        >
                            <RefreshCw className="w-3 h-3" />
                            Sync Status
                        </button>
                        {isRateLimited && canResetPassword && (
                            <TextLink 
                                href="/forgot-password"
                                className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-blue-500 transition-colors"
                            >
                                Reset Vault Access
                            </TextLink>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export function AccountLockedAlert({ 
    isLocked, 
    unlockTime, 
    canResetPassword, 
    isMobileView = false 
}: Pick<SecurityAlertsProps, 'isLocked' | 'unlockTime' | 'canResetPassword' | 'isMobileView'>) {
    const countdown = useCountdown(unlockTime, isLocked);

    const handleRefresh = useCallback(() => {
        router.reload({ only: ['failedLoginCount', 'isLocked', 'unlockTime', 'isRateLimited', 'rateLimitReset'] });
    }, []);

    if (!isLocked) return null;

    return (
        <div className="relative overflow-hidden rounded-[1.5rem] border border-rose-500/30 bg-rose-500/5 dark:bg-rose-500/10 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300">
            {/* Urgent Pulse Background */}
            <div className="absolute top-0 left-0 w-1 h-full bg-rose-600 animate-pulse" />

            <div className="flex items-start gap-4 p-5">
                <div className="p-3 rounded-2xl bg-rose-600 shadow-lg shadow-rose-600/20 text-white">
                    <Lock className="w-6 h-6" />
                </div>
                
                <div className="flex-1 space-y-2">
                    <div className="flex flex-col">
                        <h4 className="text-sm font-black text-rose-900 dark:text-rose-100 uppercase tracking-tight">
                            Vault Lockdown Active
                        </h4>
                        <div className="flex items-center gap-1.5 mt-1">
                            <Timer className="w-3.5 h-3.5 text-rose-600" />
                            <span className="text-[11px] font-black text-rose-600 uppercase">
                                Resuming in: {formatCountdown(countdown)}
                            </span>
                        </div>
                    </div>

                    <p className="text-xs font-medium text-rose-800/70 dark:text-rose-400/70 leading-relaxed">
                        Too many authentication failures. The system has paused login requests for this account to prevent unauthorized access.
                    </p>
                    
                    <div className="flex items-center gap-6 pt-2">
                        <button 
                            onClick={handleRefresh}
                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-rose-600 hover:text-rose-700 transition-colors"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Force Sync
                        </button>
                        {canResetPassword && (
                            <TextLink 
                                href="/forgot-password"
                                className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-500 transition-colors"
                            >
                                Identify Self to Unlock
                            </TextLink>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}