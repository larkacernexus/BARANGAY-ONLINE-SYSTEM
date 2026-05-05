import { Shield, Building2, Clock, AlertOctagon, PhoneCall, ArrowRight } from 'lucide-react';
import { barangayServices, emergencyContacts } from '@/data/emergencyContacts';
import { ScreenSize } from '@/types/login/login';

interface HeroSectionProps {
    screenSize: ScreenSize;
    onEmergencyCall: (number: string) => void;
}

export function HeroSection({ screenSize, onEmergencyCall }: HeroSectionProps) {
    return (
        <div className="relative lg:w-5/12 xl:w-2/5 bg-[#030712] text-white overflow-hidden flex flex-col">
            {/* Modern Background Accents */}
            <div className="absolute inset-0">
                <img 
                    src="https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=2070&auto=format&fit=crop" 
                    className="w-full h-full object-cover opacity-20 grayscale"
                    alt="Background"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-[#030712]/80 to-transparent" />
                <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full" />
                <div className="absolute bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-emerald-600/10 blur-[100px] rounded-full" />
            </div>
            
            <div className="relative z-10 h-full flex flex-col p-6 sm:p-8 lg:p-12">
                {/* Brand Header */}
                <header className="mb-10 lg:mb-16">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-500 blur-md opacity-20" />
                            <div className="relative p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
                                <Shield className="w-6 h-6 lg:w-8 lg:h-8 text-blue-400" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-xl lg:text-2xl font-bold tracking-tight">
                                Barangay<span className="text-blue-400">OS</span>
                            </h1>
                            <div className="flex items-center gap-2 text-white/50 text-xs uppercase tracking-widest font-semibold">
                                <span className="w-4 h-[1px] bg-white/20" />
                                Digital Governance
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <div className="flex-1 space-y-10 overflow-y-auto no-scrollbar">
                    <section>
                        <h2 className="text-3xl lg:text-4xl xl:text-5xl font-extrabold tracking-tight leading-[1.1] mb-4">
                            Smart Access to <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                                Community Care
                            </span>
                        </h2>
                        <p className="text-white/60 text-base lg:text-lg max-w-md leading-relaxed">
                            A unified ecosystem for government services, real-time safety updates, and resident resources.
                        </p>
                    </section>

                    {/* Quick Services Grid */}
                    <section>
                        <div className="flex items-center gap-2 mb-4 text-white/80">
                            <Building2 className="w-4 h-4 text-blue-400" />
                            <span className="text-sm font-semibold uppercase tracking-wider">Department Portals</span>
                        </div>
                        <div className={`grid ${screenSize === 'xs' ? 'grid-cols-1' : 'grid-cols-2'} gap-3`}>
                            {barangayServices.map((service) => {
                                const ServiceIcon = service.icon;
                                return (
                                    <div key={service.name} 
                                         className="group flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] transition-all cursor-pointer">
                                        <div className={`p-2 rounded-lg bg-white/5 ${service.color.replace('text-', 'bg-')}/10`}>
                                            <ServiceIcon className={`w-4 h-4 ${service.color}`} />
                                        </div>
                                        <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">
                                            {service.name}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* Emergency Contacts - Focus on High Visibility */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2 text-rose-400">
                                <AlertOctagon className="w-4 h-4" />
                                <span className="text-sm font-semibold uppercase tracking-wider">Hotlines</span>
                            </div>
                        </div>
                        
                        <div className={`grid ${screenSize === 'xs' ? 'grid-cols-1' : 'grid-cols-2'} gap-3`}>
                            {emergencyContacts.map((contact) => {
                                const ContactIcon = contact.icon;
                                return (
                                    <button
                                        key={contact.name}
                                        onClick={() => onEmergencyCall(contact.number)}
                                        className="group relative flex flex-col text-left p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-rose-500/50 transition-all overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-100 group-hover:text-rose-400 transition-all">
                                            <PhoneCall className="w-5 h-5" />
                                        </div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <ContactIcon className="w-3.5 h-3.5 text-rose-400" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                                                {contact.name}
                                            </span>
                                        </div>
                                        <span className="text-lg font-bold tracking-tight group-hover:text-rose-400 transition-colors">
                                            {contact.number}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </section>
                </div>

                {/* Status Footer */}
                <footer className="mt-8 pt-6 border-t border-white/5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-white/40 text-xs">
                            <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                <span>Response: 24/7</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-tighter text-emerald-400">
                                Nodes Encrypted
                            </span>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}