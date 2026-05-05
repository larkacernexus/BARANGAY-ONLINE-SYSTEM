import { Head } from '@inertiajs/react';
import { Mail, MessageSquare, Phone, HelpCircle, ArrowLeft, Globe, Clock } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function Support() {
    const channels = [
        { icon: Mail, label: "Email Support", value: "support@barangay.gov.ph", color: "text-blue-400" },
        { icon: Phone, label: "Hotline", value: "+63 (02) 8888-0000", color: "text-emerald-400" },
        { icon: Globe, label: "Web Portal", value: "help.barangay.gov.ph", color: "text-purple-400" }
    ];

    return (
        <div className="min-h-screen bg-[#020617] text-slate-300">
            <Head title="Technical Support | BarangayOS" />
            
            <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 lg:py-24">
                <Link href="/login" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-colors mb-12">
                    <ArrowLeft className="w-4 h-4" /> Return to Entry
                </Link>

                <div className="grid lg:grid-cols-2 gap-16 items-start">
                    {/* Left Column: Branding */}
                    <div className="space-y-8">
                        <div className="inline-flex p-3 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-400">
                            <HelpCircle className="w-8 h-8" />
                        </div>
                        <h1 className="text-4xl lg:text-6xl font-extrabold text-white tracking-tighter leading-none">
                            Technical <br />
                            <span className="text-emerald-500">Assistance</span>
                        </h1>
                        <p className="text-lg text-slate-400 leading-relaxed max-w-sm">
                            Need help accessing your digital residency account or reporting a system glitch? Our team is active 24/7.
                        </p>
                        
                        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                            <Clock className="w-4 h-4 text-emerald-500" />
                            <span className="text-xs font-bold text-slate-300">Avg. Response Time: 12 Minutes</span>
                        </div>
                    </div>

                    {/* Right Column: Contact Channels */}
                    <div className="grid gap-4">
                        {channels.map((channel, i) => (
                            <button key={i} className="group flex items-center justify-between p-6 rounded-[2rem] bg-white/[0.03] border border-white/5 hover:border-emerald-500/30 transition-all text-left">
                                <div className="flex items-center gap-5">
                                    <div className={`p-3 rounded-2xl bg-white/5 ${channel.color}`}>
                                        <channel.icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{channel.label}</p>
                                        <p className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">{channel.value}</p>
                                    </div>
                                </div>
                            </button>
                        ))}
                        
                        {/* Live Chat Action */}
                        <button className="mt-4 w-full p-6 rounded-[2rem] bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold flex items-center justify-center gap-3 shadow-xl shadow-emerald-600/20 transition-all active:scale-[0.98]">
                            <MessageSquare className="w-6 h-6" />
                            Initialize Live Chat
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}