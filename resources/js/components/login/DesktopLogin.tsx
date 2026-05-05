import { useState } from 'react';
import { ShieldCheck, User, ExternalLink, Eye, HelpCircle, LockKeyhole } from 'lucide-react';
import { LoginProps } from '@/types/login/login';
import { LoginForm } from './LoginForm';
import { RateLimitWarning, AccountLockedAlert } from './SecurityAlerts';
import { LastLoginInfo } from './LastLoginInfo';
import { SecurityTips } from './SecurityTips';

interface DesktopLoginProps extends LoginProps {
    onEmergencyCall: (number: string) => void;
}

export function DesktopLogin(props: DesktopLoginProps) {
    const [showSecurityAlert, setShowSecurityAlert] = useState(true);
    const {
        status,
        canResetPassword,
        lastLoginInfo,
        failedLoginCount,
        isLocked,
        unlockTime,
        isRateLimited,
        rateLimitReset,
    } = props;

    return (
        <div className="relative lg:w-7/12 xl:w-3/5 p-8 lg:p-16 xl:p-24 bg-[#FAFBFF] dark:bg-[#020617] flex flex-col justify-center overflow-hidden transition-colors duration-500">
            {/* Sophisticated Mesh Gradient Background */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-500/10 via-emerald-500/5 to-transparent rounded-full blur-[100px] -mr-32 -mt-32" />
            
            <div className="relative z-10 w-full max-w-[440px] mx-auto">
                {/* Brand & Header */}
                <div className="mb-10 text-left">
                    <div className="inline-flex items-center gap-3 mb-6">
                        <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
                            <LockKeyhole className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800" />
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                            Identity Vault
                        </span>
                    </div>
                    
                    <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
                        Sign in to <span className="text-blue-600">Portal</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                        Secure access to community governance and essential digital services.
                    </p>
                </div>

                {/* Authentication Layer */}
                <div className="space-y-6">
                    {/* Alerts Container */}
                    <div className="space-y-4">
                        <RateLimitWarning
                            isRateLimited={isRateLimited}
                            rateLimitReset={rateLimitReset}
                            failedLoginCount={failedLoginCount}
                            canResetPassword={canResetPassword}
                        />
                        <AccountLockedAlert
                            isLocked={isLocked}
                            unlockTime={unlockTime}
                            canResetPassword={canResetPassword}
                        />
                        {showSecurityAlert && lastLoginInfo && !isLocked && !isRateLimited && (
                            <LastLoginInfo
                                lastLoginInfo={lastLoginInfo}
                                onDismiss={() => setShowSecurityAlert(false)}
                            />
                        )}
                    </div>

                    {/* The Form Surface */}
                    <div className="p-1 rounded-[2rem] bg-white dark:bg-slate-900 shadow-xl shadow-blue-900/5 ring-1 ring-slate-200/60 dark:ring-slate-800">
                        <div className="p-6 lg:p-8">
                            <LoginForm
                                isLocked={isLocked}
                                isRateLimited={isRateLimited}
                                canResetPassword={canResetPassword}
                                processing={false}
                                idPrefix="desktop"
                            />
                        </div>
                    </div>

                    {/* Success Message */}
                    {status && (
                        <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                            <div className="flex items-center gap-3 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                <ShieldCheck className="w-5 h-5 shrink-0" />
                                <span>{status}</span>
                            </div>
                        </div>
                    )}

                    {/* Contextual Security Info */}
                    {!isLocked && !isRateLimited && (
                        <div className="opacity-80 hover:opacity-100 transition-opacity">
                            <SecurityTips />
                        </div>
                    )}
                </div>

                {/* Refined Footer Navigation */}
                <footer className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex flex-wrap items-center justify-between gap-6 text-xs font-bold uppercase tracking-widest text-slate-400">
                        <div className="flex items-center gap-6">
                            <button
                                onClick={() => setShowSecurityAlert(!showSecurityAlert)}
                                className="hover:text-blue-600 transition-colors flex items-center gap-2 group"
                                type="button"
                            >
                                <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                {showSecurityAlert ? 'Hide Logs' : 'Show Logs'}
                            </button>
                            <a href="/help" className="hover:text-blue-600 transition-colors flex items-center gap-2 group">
                                <HelpCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                Support
                            </a>
                        </div>
                        
                        <a href="/privacy" className="hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5 underline decoration-slate-200 underline-offset-4">
                            Privacy Policy
                            <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                </footer>
            </div>
        </div>
    );
}