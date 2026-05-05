import { Shield, Lock, ExternalLink, UserMinus } from 'lucide-react';

const securityTips = [
    { 
        title: 'Network Integrity', 
        description: 'Verify HTTPS & Official .gov domain', 
        icon: ExternalLink,
        accent: 'text-blue-500' 
    },
    { 
        title: 'Session Control', 
        description: 'Automatic logout on shared hardware', 
        icon: UserMinus,
        accent: 'text-emerald-500' 
    },
    { 
        title: 'Vault Privacy', 
        description: 'Credential sharing is strictly prohibited', 
        icon: Lock,
        accent: 'text-amber-500' 
    },
];

export function SecurityTips() {
    return (
        <div className="mt-10 pt-8 border-t border-slate-200/60 dark:border-slate-800/50">
            <div className="flex items-center gap-2 mb-6">
                <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h5 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                    Active Security Protocols
                </h5>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {securityTips.map((tip) => {
                    const Icon = tip.icon;
                    return (
                        <div 
                            key={tip.title} 
                            className="group relative p-4 rounded-2xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm ring-1 ring-slate-200/50 dark:ring-slate-800/50 hover:ring-blue-500/30 transition-all duration-300"
                        >
                            <div className="flex flex-col gap-3">
                                <div className={`w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center shadow-sm ${tip.accent}`}>
                                    <Icon className="w-4 h-4" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-extrabold text-slate-900 dark:text-slate-200 tracking-tight">
                                        {tip.title}
                                    </p>
                                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-500 leading-relaxed">
                                        {tip.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            {/* System Status Footer */}
            <div className="mt-6 flex justify-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 ring-1 ring-slate-200/50 dark:ring-slate-800/50">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        Standard Encryption Level: AES-256
                    </span>
                </div>
            </div>
        </div>
    );
}