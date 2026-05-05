import { useEffect, useCallback } from 'react';
import { EmergencyContact } from '@/types/login/login';
import { emergencyContacts, additionalHotlines } from '@/data/emergencyContacts';
import { 
    X, PhoneCall, Siren, AlertOctagon, AlertTriangle, 
    ShieldAlert, ChevronRight, Info
} from 'lucide-react';

interface EmergencyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onEmergencyCall: (number: string) => void;
}

const NATIONAL_EMERGENCY_NUMBER = '911';

export function EmergencyModal({ isOpen, onClose, onEmergencyCall }: EmergencyModalProps) {
    const handleEscapeKey = useCallback((event: KeyboardEvent) => {
        if (event.key === 'Escape') onClose();
    }, [onClose]);

    useEffect(() => {
        if (!isOpen) return;
        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', handleEscapeKey);
        return () => {
            document.body.style.overflow = 'unset';
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [isOpen, handleEscapeKey]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
            {/* Ultra-dark backdrop with heavy blur */}
            <div 
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" 
                onClick={onClose}
            />
            
            <div className="relative w-full max-w-lg bg-white dark:bg-[#020617] rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-300 border border-white/10">
                
                {/* Visual Handle for Mobile */}
                <div className="sm:hidden flex justify-center pt-3 pb-1">
                    <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full" />
                </div>

                <div className="flex flex-col max-h-[90vh]">
                    {/* Hero Header */}
                    <div className="relative p-6 sm:p-8 overflow-hidden">
                        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-rose-600/10 rounded-full blur-3xl" />
                        
                        <div className="relative z-10 flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-rose-600 shadow-lg shadow-rose-600/30">
                                    <ShieldAlert className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                                        Emergency <span className="text-rose-600">Hub</span>
                                    </h2>
                                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">
                                        Immediate Response 24/7
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all active:scale-90"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Priority Action: 911 */}
                        <button
                            onClick={() => onEmergencyCall(NATIONAL_EMERGENCY_NUMBER)}
                            className="group mt-8 w-full p-1 rounded-3xl bg-rose-600 active:scale-[0.98] transition-all shadow-xl shadow-rose-600/20"
                        >
                            <div className="bg-rose-600 p-4 rounded-[1.4rem] border border-white/20 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                                        <Siren className="w-6 h-6 text-rose-600 animate-pulse" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] font-bold text-rose-100 uppercase tracking-widest">Global Priority</p>
                                        <p className="text-2xl font-black text-white leading-none mt-1">Dial {NATIONAL_EMERGENCY_NUMBER}</p>
                                    </div>
                                </div>
                                <div className="p-3 rounded-full bg-white/10">
                                    <PhoneCall className="w-5 h-5 text-white" />
                                </div>
                            </div>
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto px-6 sm:px-8 pb-8 space-y-8 no-scrollbar">
                        
                        {/* Service Grid */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Main Departments</span>
                                <span className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {emergencyContacts.map((contact) => {
                                    const Icon = contact.icon;
                                    return (
                                        <button
                                            key={contact.name}
                                            onClick={() => onEmergencyCall(contact.number)}
                                            className="group flex flex-col p-4 rounded-[2rem] bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 active:scale-95 transition-all text-left"
                                        >
                                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-3 shadow-sm ${contact.lightColor.replace('bg-', 'bg-opacity-20 bg-')}`}>
                                                <Icon className={`w-5 h-5 ${contact.lightColor.replace('bg-', 'text-')}`} />
                                            </div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{contact.name}</p>
                                            <p className="text-lg font-black text-slate-400 dark:text-slate-600 group-hover:text-rose-500 transition-colors">{contact.number}</p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Additional Hotlines - List Style */}
                        {additionalHotlines.length > 0 && (
                            <div>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Support Hotlines</h3>
                                <div className="space-y-3">
                                    {additionalHotlines.map((hotline) => (
                                        <button
                                            key={hotline.name}
                                            onClick={() => onEmergencyCall(hotline.number)}
                                            className="w-full flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-blue-500/50 transition-all active:scale-[0.99]"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                                    <hotline.icon className="w-5 h-5" />
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{hotline.name}</p>
                                                    <p className="text-xs text-slate-500">{hotline.description}</p>
                                                </div>
                                            </div>
                                            <span className="text-sm font-black text-blue-600">{hotline.number}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Instructional Alert */}
                        <div className="p-5 rounded-3xl bg-amber-500/5 border border-amber-500/20 flex gap-4">
                            <div className="shrink-0 p-2 h-fit rounded-lg bg-amber-500/10 text-amber-600">
                                <Info className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest mb-1">Safety Protocol</h4>
                                <ul className="text-xs text-amber-800/80 dark:text-amber-500/80 space-y-1 font-medium">
                                    <li>• Provide your exact Landmarks</li>
                                    <li>• Keep the line open until help arrives</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Minimal Footer */}
                    <div className="p-6 text-center bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                            System Connected to Local Dispatch
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}