import { FormEvent, useState, useCallback } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import InputError from '@/components/input-error';
import { 
    Eye, EyeOff, Mail, Key, Fingerprint, Lock, AlertTriangle, X, 
    ArrowLeft, ShieldCheck, Send, CheckCircle2, UserCheck 
} from 'lucide-react';

interface LoginFormProps {
    isLocked: boolean;
    isRateLimited: boolean;
    canResetPassword: boolean;
    processing: boolean;
    idPrefix: string;
    status?: string;
}

export function LoginForm({ 
    isLocked, 
    isRateLimited, 
    canResetPassword, 
    processing, 
    idPrefix,
    status 
}: LoginFormProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [showResetForm, setShowResetForm] = useState(false);
    const [requestSubmitted, setRequestSubmitted] = useState(false);

    const { data, setData, post, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const resetRequestForm = useForm({
        email: '',
    });

    const isDisabled = isLocked || isRateLimited || processing;

    const handleSubmit = useCallback((e: FormEvent) => {
        e.preventDefault();
        if (isDisabled) return;
        post('/login', {
            onFinish: () => reset('password'),
        });
    }, [isDisabled, post, reset]);

    const handleResetRequest = useCallback((e: FormEvent) => {
        e.preventDefault();
        resetRequestForm.post('/password/forgot', {
            onSuccess: () => {
                setRequestSubmitted(true);
                resetRequestForm.reset();
            },
        });
    }, [resetRequestForm]);

    const handleClearEmail = useCallback(() => {
        setData('email', '');
    }, [setData]);

    const togglePasswordVisibility = useCallback(() => {
        setShowPassword((prev) => !prev);
    }, []);

    const goBackToLogin = useCallback(() => {
        setShowResetForm(false);
        setRequestSubmitted(false);
        resetRequestForm.reset();
    }, [resetRequestForm]);

    const getButtonContent = () => {
        if (processing) return <><Spinner className="mr-2" /> Signing in...</>;
        if (isLocked) return <><Lock className="w-5 h-5 mr-2" /> Account Locked</>;
        if (isRateLimited) return <><AlertTriangle className="w-5 h-5 mr-2" /> Too Many Attempts</>;
        return <><Fingerprint className="w-5 h-5 mr-2" /> Sign In</>;
    };

    if (showResetForm) {
        if (requestSubmitted) {
            return (
                <div className="space-y-6">
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center justify-center p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-2">
                            <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            Request Sent
                        </h2>
                        
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Barangay officials will review your request and assist you shortly.
                        </p>

                        <Button
                            type="button"
                            onClick={goBackToLogin}
                            variant="outline"
                            className="w-full h-12 rounded-xl"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Login
                        </Button>
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                <button
                    type="button"
                    onClick={goBackToLogin}
                    className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Login
                </button>

                <div className="text-center">
                    <div className="inline-flex items-center justify-center p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
                        <ShieldCheck className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                        Forgot Password
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Enter your email and barangay staff will assist you.
                    </p>
                </div>

                <form onSubmit={handleResetRequest} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor={`reset-email-${idPrefix}`} className="text-xs font-bold text-slate-600">
                            Registered Email
                        </Label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                <Mail className="w-5 h-5" />
                            </div>
                            <Input
                                id={`reset-email-${idPrefix}`}
                                type="email"
                                value={resetRequestForm.data.email}
                                onChange={(e) => resetRequestForm.setData('email', e.target.value)}
                                required
                                placeholder="Enter your registered email"
                                className="h-12 pl-12 rounded-xl bg-slate-50 dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800"
                                disabled={resetRequestForm.processing}
                            />
                        </div>
                        <InputError message={resetRequestForm.errors.email} />
                    </div>

                    {status && (
                        <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                            <p className="text-sm text-blue-700 dark:text-blue-300">{status}</p>
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={resetRequestForm.processing}
                        className="w-full h-12 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                    >
                        {resetRequestForm.processing ? (
                            <><Spinner className="mr-2" /> Submitting...</>
                        ) : (
                            <><Send className="w-4 h-4 mr-2" /> Submit Request</>
                        )}
                    </Button>
                </form>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className={`space-y-5 transition-opacity ${isDisabled ? 'opacity-60' : 'opacity-100'}`}>
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor={`email-${idPrefix}`} className="text-xs font-bold text-slate-600">
                        Email Address
                    </Label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                            <Mail className="w-5 h-5" />
                        </div>
                        <Input
                            id={`email-${idPrefix}`}
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoComplete="username"
                            placeholder="Enter your email"
                            className="h-12 pl-12 pr-12 rounded-xl bg-slate-50 dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 focus:ring-2 focus:ring-blue-500/50"
                            disabled={isDisabled}
                        />
                        {data.email && !isDisabled && (
                            <button
                                type="button"
                                onClick={handleClearEmail}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                                aria-label="Clear email"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <InputError message={errors.email} />
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <Label htmlFor={`password-${idPrefix}`} className="text-xs font-bold text-slate-600">
                            Password
                        </Label>
                        {!isDisabled && (
                            <button
                                type="button"
                                onClick={() => setShowResetForm(true)}
                                className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
                            >
                                Forgot Password?
                            </button>
                        )}
                    </div>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                            <Key className="w-5 h-5" />
                        </div>
                        <Input
                            id={`password-${idPrefix}`}
                            type={showPassword ? "text" : "password"}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            required
                            autoComplete="current-password"
                            placeholder="Enter your password"
                            className="h-12 pl-12 pr-12 rounded-xl bg-slate-50 dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 focus:ring-2 focus:ring-blue-500/50"
                            disabled={isDisabled}
                        />
                        <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            disabled={isDisabled}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                    <InputError message={errors.password} />
                </div>

                <div className="flex items-center space-x-3">
                    <Checkbox
                        id={`remember-${idPrefix}`}
                        checked={data.remember}
                        onCheckedChange={(checked) => setData('remember', !!checked)}
                        disabled={isDisabled}
                        className="border-slate-300"
                    />
                    <Label htmlFor={`remember-${idPrefix}`} className="text-xs text-slate-600 cursor-pointer select-none">
                        Remember me
                    </Label>
                </div>

                <Button
                    type="submit"
                    disabled={isDisabled}
                    className="w-full h-12 rounded-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-lg disabled:bg-slate-300 disabled:text-slate-500"
                >
                    {getButtonContent()}
                </Button>
            </div>
        </form>
    );
}