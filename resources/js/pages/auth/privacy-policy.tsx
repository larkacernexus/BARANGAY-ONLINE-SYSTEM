import { Head } from '@inertiajs/react';
import { ShieldCheck, Lock, Eye, ArrowLeft, FileText, Fingerprint } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function PrivacyPolicy() {
    const sections = [
        {
            icon: Fingerprint,
            title: "Data Collection",
            content: "We collect essential identifiers including your full name, residency status, and contact details to facilitate government services. Biometric data is stored locally on your device and never transmitted to our servers."
        },
        {
            icon: Eye,
            title: "Information Usage",
            content: "Your data is strictly used for Barangay certification, emergency response, and community notifications. We do not share personal information with third-party advertisers or private entities."
        },
        {
            icon: Lock,
            title: "Security Protocols",
            content: "All data transmissions are encrypted using AES-256 standards. Our database is hosted on secure government-grade infrastructure with 24/7 monitoring for unauthorized access."
        }
    ];

    return (
        <div className="min-h-screen bg-[#020617] text-slate-300 selection:bg-blue-500/30">
            <Head title="Privacy Policy | BarangayOS" />
            
            {/* Background Glows */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-blue-600/5 blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-emerald-600/5 blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-3xl mx-auto px-6 py-12 lg:py-24">
                <Link href="/login" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors mb-12">
                    <ArrowLeft className="w-4 h-4" /> Back to Vault
                </Link>

                <header className="mb-16">
                    <div className="inline-flex p-3 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 mb-6">
                        <ShieldCheck className="w-8 h-8" />
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
                        Privacy <span className="text-blue-500">Protocol</span>
                    </h1>
                    <p className="text-slate-400 font-medium">Last Updated: April 2026 • Version 2.4.0</p>
                </header>

                <div className="space-y-12">
                    {sections.map((section, i) => (
                        <section key={i} className="relative p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 backdrop-blur-sm">
                            <div className="flex items-center gap-4 mb-4">
                                <section.icon className="w-5 h-5 text-blue-500" />
                                <h2 className="text-lg font-bold text-white tracking-tight">{section.title}</h2>
                            </div>
                            <p className="text-slate-400 leading-relaxed">{section.content}</p>
                        </section>
                    ))}
                </div>

                <footer className="mt-16 pt-8 border-t border-white/5 text-center">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                        Barangay Digital Governance Compliance • 2026
                    </p>
                </footer>
            </div>
        </div>
    );
}