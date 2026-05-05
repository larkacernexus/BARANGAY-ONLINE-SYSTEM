import { useState } from 'react';
import { 
    AlertCircle, AlertOctagon, ChevronRight, Eye, HelpCircle, 
    Shield, ShieldCheck, User, Globe, Mail, Fingerprint 
} from 'lucide-react';
import { LoginProps } from '@/types/login/login';
import { LoginForm } from './LoginForm';
import { RateLimitWarning, AccountLockedAlert } from './SecurityAlerts';
import { LastLoginInfo } from './LastLoginInfo';
import { EmergencyModal } from './EmergencyModal';
import { QuickEmergency } from './QuickEmergency';

interface MobileLoginProps extends LoginProps {
    onEmergencyCall: (number: string) => void;
}

export function MobileLogin(props: MobileLoginProps) {
    const [showEmergencyContacts, setShowEmergencyContacts] = useState(false);
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
        onEmergencyCall,
    } = props;

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] pb-32 transition-colors duration-500 overflow-x-hidden">
            {/* Mesh Gradient Background Accents */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] -z-10 rounded-full" />
            <div className="absolute top-1/2 left-0 w-48 h-48 bg-emerald-500/5 blur-[80px] -z-10 rounded-full" />

            {/* Header: Refined Glassmorphism */}
            <header className="sticky top-0 z-30 bg-white/70 dark:bg-[#020617]/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="absolute inset-0 bg-blue-500 blur-md opacity-20" />
                                <div className="relative p-2.5 rounded-2xl bg-blue-600 shadow-lg shadow-blue-500/30">
                                    <Fingerprint className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
                                    Barangay<span className="text-blue-600 dark:text-blue-400">OS</span>
                                </h1>
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1.5">
                                    Secure Gateway
                                </p>
                            </div>
                        </div>
                        
                        <button
                            onClick={() => setShowEmergencyContacts(true)}
                            className="active:scale-90 transition-transform p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 shadow-sm"
                            aria-label="Emergency Contacts"
                        >
                            <AlertOctagon className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="px-6 pt-8 space-y-8">
                {/* Emergency Quick Action: High-Contrast Pill */}
                <button
                    onClick={() => setShowEmergencyContacts(true)}
                    className="group w-full p-4 rounded-[2rem] bg-slate-900 dark:bg-white flex items-center justify-between active:scale-[0.98] transition-all shadow-xl shadow-slate-200 dark:shadow-none"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 rounded-full bg-rose-500 shadow-lg shadow-rose-500/40">
                            <AlertCircle className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-black text-white dark:text-slate-900">Emergency Services</p>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Tap for instant help</p>
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-500" />
                </button>

                {/* Main Auth Card: Elevated Workspace */}
                <section className="bg-white dark:bg-slate-900/40 rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60 dark:border-slate-800/50 backdrop-blur-sm">
                    <div className="flex flex-col items-center mb-10">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full scale-0 group-hover:scale-100 transition-transform duration-500" />
                            <div className="relative w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6 ring-[12px] ring-slate-100/50 dark:ring-slate-900/30">
                                <User className="w-8 h-8 text-slate-400" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            Identity Verification
                        </h2>
                        <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-2">
                            Authorized Access Only
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-3">
                            <RateLimitWarning
                                isRateLimited={isRateLimited}
                                rateLimitReset={rateLimitReset}
                                failedLoginCount={failedLoginCount}
                                canResetPassword={canResetPassword}
                                isMobileView={true}
                            />
                            <AccountLockedAlert
                                isLocked={isLocked}
                                unlockTime={unlockTime}
                                canResetPassword={canResetPassword}
                                isMobileView={true}
                            />
                            {showSecurityAlert && lastLoginInfo && !isLocked && !isRateLimited && (
                                <LastLoginInfo
                                    lastLoginInfo={lastLoginInfo}
                                    onDismiss={() => setShowSecurityAlert(false)}
                                    isMobileView={true}
                                />
                            )}
                        </div>

                        <LoginForm
                            isLocked={isLocked}
                            isRateLimited={isRateLimited}
                            canResetPassword={canResetPassword}
                            processing={false}
                            idPrefix="mobile"
                        />
                    </div>

                    {status && (
                        <div className="mt-8 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex items-center gap-3">
                            <ShieldCheck className="w-5 h-5 text-emerald-500" />
                            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tight">{status}</span>
                        </div>
                    )}

                    <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800 flex justify-center gap-8">
                        <button 
                            onClick={() => setShowSecurityAlert(!showSecurityAlert)}
                            className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-[0.2em]"
                        >
                            <Eye className="w-3.5 h-3.5" />
                            {showSecurityAlert ? 'Hide' : 'Show'} Info
                        </button>
                        <a href="/help" className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-[0.2em]">
                            <HelpCircle className="w-3.5 h-3.5" />
                            Portal Help
                        </a>
                    </div>
                </section>

                {/* Contextual Actions Section */}
                <section className="space-y-6">
                    <QuickEmergency 
                        onEmergencyCall={onEmergencyCall} 
                        onViewAll={() => setShowEmergencyContacts(true)} 
                    />

                    {/* Security Protocol List */}
                    <div className="p-8 rounded-[2.5rem] bg-blue-600/5 border border-blue-600/10 shadow-inner">
                        <h4 className="text-[11px] font-black text-blue-600 dark:text-blue-400 mb-6 flex items-center gap-2 uppercase tracking-[0.25em]">
                            <Shield className="w-4 h-4" />
                            System Protocols
                        </h4>
                        <div className="space-y-5">
                            {[
                                { color: 'bg-blue-500', text: "Verification of .gov domain required" },
                                { color: 'bg-emerald-500', text: "Session timeout active for safety" },
                                { color: 'bg-amber-500', text: "Credential sharing is prohibited" }
                            ].map((tip, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <div className={`w-1.5 h-1.5 rounded-full ${tip.color} shadow-[0_0_8px_rgba(0,0,0,0.1)]`} />
                                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 tracking-tight leading-none">{tip.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <EmergencyModal
                isOpen={showEmergencyContacts}
                onClose={() => setShowEmergencyContacts(false)}
                onEmergencyCall={onEmergencyCall}
            />

            {/* Bottom Nav: The "Floating Island" */}
            <div className="fixed bottom-8 left-6 right-6 z-40">
                <div className="bg-slate-900/95 dark:bg-white/95 backdrop-blur-2xl rounded-[2rem] p-4 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center justify-between">
                    <div className="flex items-center gap-3 pl-3">
                        <div className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </div>
                        <span className="text-[10px] font-black text-white dark:text-slate-900 uppercase tracking-widest">
                            Secure Network
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <button className="p-2.5 rounded-2xl bg-white/5 dark:bg-slate-900/5 hover:bg-white/10 text-white/50 dark:text-slate-500 active:scale-90 transition-all">
                            <Globe className="w-4.5 h-4.5" />
                        </button>
                        <button className="p-2.5 rounded-2xl bg-white/5 dark:bg-slate-900/5 hover:bg-white/10 text-white/50 dark:text-slate-500 active:scale-90 transition-all">
                            <Mail className="w-4.5 h-4.5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}