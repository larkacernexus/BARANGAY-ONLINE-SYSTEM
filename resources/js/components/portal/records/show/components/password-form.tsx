// components/document/password-form.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ModernCard } from '@/components/residentui/modern-card';
import { Lock, ShieldCheck, Eye, EyeOff, ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';
import {  Document } from '@/types/portal/records/records';

interface PasswordFormProps {
    document: Document;
    error?: string;
    onSubmit: (e: React.FormEvent) => void;
    isVerifying: boolean;
}

export function PasswordForm({ document, error, onSubmit, isVerifying }: PasswordFormProps) {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="min-h-[80vh] flex items-center justify-center px-4 py-8">
            <ModernCard
                title="Protected Document"
                description={`Enter the password to access "${document.name}"`}
                icon={Lock}
                iconColor="from-blue-500 to-indigo-600"
                className="w-full max-w-md"
            >
                {error && (
                    <Alert variant="destructive" className="border-rose-200 bg-rose-50 dark:bg-rose-950/20 dark:border-rose-900">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle className="text-sm font-medium">Access Denied</AlertTitle>
                        <AlertDescription className="text-sm">{error}</AlertDescription>
                    </Alert>
                )}
                
                <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4 border border-blue-100 dark:border-blue-900">
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                            <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1">Secure Access</h4>
                            <p className="text-xs text-blue-700 dark:text-blue-400">Your session will remain active for 30 minutes</p>
                        </div>
                    </div>
                </div>
                
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">Document Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full pl-10 pr-12 py-3 text-base border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                placeholder="Enter document password"
                                disabled={isVerifying}
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex gap-3 pt-2">
                        <Link href="/portal/my-records" className="flex-1">
                            <Button type="button" variant="outline" className="w-full border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900 py-6">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                        </Link>
                        <Button type="submit" disabled={isVerifying} className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-6">
                            {isVerifying ? (
                                <>
                                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                                    Verifying...
                                </>
                            ) : (
                                <>
                                    <ArrowRight className="h-4 w-4 mr-2" />
                                    Access
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </ModernCard>
        </motion.div>
    );
}