import { emergencyContacts } from '@/data/emergencyContacts';
import { AlertOctagon, ChevronRight, PhoneCall } from 'lucide-react';

interface QuickEmergencyProps {
    onEmergencyCall: (number: string) => void;
    onViewAll: () => void;
}

export function QuickEmergency({ onEmergencyCall, onViewAll }: QuickEmergencyProps) {
    // Select only prime emergency responders
    const quickContacts = emergencyContacts.slice(0, 2);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    Instant Response
                </h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {quickContacts.map((contact) => {
                    const ContactIcon = contact.icon;
                    return (
                        <button
                            key={contact.name}
                            type="button"
                            onClick={() => onEmergencyCall(contact.number)}
                            className={`group relative overflow-hidden p-4 rounded-[2rem] text-white active:scale-95 transition-all duration-300 shadow-lg shadow-slate-200 dark:shadow-none ${contact.lightColor}`}
                        >
                            {/* Decorative background pulse */}
                            <div className="absolute top-0 right-0 -mr-4 -mt-4 w-16 h-16 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
                            
                            <div className="relative z-10 flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <div className="p-2 rounded-2xl bg-white/20 backdrop-blur-md">
                                        <ContactIcon className="w-5 h-5" />
                                    </div>
                                    <PhoneCall className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-black tracking-tight leading-tight">
                                        {contact.name}
                                    </p>
                                    <p className="text-[10px] font-bold opacity-70 uppercase tracking-wider mt-0.5">
                                        {contact.description}
                                    </p>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
            
            {/* View All Button: Modern Glass Action */}
            <button
                onClick={onViewAll}
                className="w-full group p-4 bg-white dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/50 rounded-[1.5rem] hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-between active:scale-[0.99]"
                type="button"
            >
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="absolute inset-0 bg-rose-500 blur-md opacity-20 group-hover:opacity-40 transition-opacity" />
                        <div className="relative p-2.5 rounded-xl bg-rose-500/10 text-rose-600">
                            <AlertOctagon className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
                            Full Directory
                        </p>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">
                            Police • Fire • Medical
                        </p>
                    </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-1 transition-all" />
            </button>
        </div>
    );
}