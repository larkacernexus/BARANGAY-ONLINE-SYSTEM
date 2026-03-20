// pages/admin/settings.tsx (or wherever your admin settings page is)
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppearanceToggleTab from '@/components/appearance-tabs';
import TwoFactorRecoveryCodes from '@/components/two-factor-recovery-codes';
import TwoFactorSetupModal from '@/components/two-factor-setup-modal';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAdminTwoFactorAuth } from '@/hooks/use-admin-two-factor-auth';
import { 
    ShieldBan, 
    ShieldCheck, 
    ShieldAlert, 
    XCircle, 
    CheckCircle, 
    AlertTriangle,
    Info,
    Smartphone,
    Key,
    Download,
    Printer,
    Lock,
    RefreshCw
} from 'lucide-react';
import AppLayout from '@/layouts/admin-app-layout';
import { useRef, useState, useEffect } from 'react';
import { route } from 'ziggy-js';

interface PageProps extends SharedData {
    qrCodeSvg?: string;
    manualSetupKey?: string;
    flash?: {
        qrCodeData?: {
            qrCodeSvg: string;
            manualSetupKey: string;
        };
        qrCodeSvg?: string;
        manualSetupKey?: string;
        success?: string;
        error?: string;
        recoveryCodes?: string[];
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Settings',
        href: '/admin/settings',
    },
];

interface TwoFactorProps {
    requiresConfirmation?: boolean;
    twoFactorEnabled?: boolean;
}

export default function Settings({
    mustVerifyEmail,
    status,
    requiresConfirmation = false,
    twoFactorEnabled = false,
}: {
    mustVerifyEmail: boolean;
    status?: string;
} & TwoFactorProps) {
    const { auth, qrCodeSvg: propQrCodeSvg, manualSetupKey: propManualSetupKey, flash } = usePage<PageProps>().props;
    
    // Debug: Log what's coming from the server
    console.log('📦 [Admin Page] Server props:', {
        flash,
        propQrCodeSvg: propQrCodeSvg ? 'present' : 'missing',
        propManualSetupKey: propManualSetupKey ? 'present' : 'missing',
        requiresConfirmation,
        twoFactorEnabled
    });
    
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);
    
    // Two-factor auth hook
    const {
        qrCodeSvg: hookQrCodeSvg,
        hasSetupData,
        manualSetupKey: hookManualSetupKey,
        clearSetupData,
        fetchSetupData,
        recoveryCodesList,
        fetchRecoveryCodes,
        regenerateRecoveryCodes,
        confirmSetup,
        errors: twoFactorErrors,
    } = useAdminTwoFactorAuth();
    
    const [showSetupModal, setShowSetupModal] = useState<boolean>(false);
    const [showDisableModal, setShowDisableModal] = useState<boolean>(false);
    const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
    const [disablePassword, setDisablePassword] = useState<string>('');
    const [cancelPassword, setCancelPassword] = useState<string>('');
    const [isEnabling, setIsEnabling] = useState<boolean>(false);
    const [showFlashMessages, setShowFlashMessages] = useState<boolean>(true);
    
    // Get initial QR data from props or flash - PRIORITIZE FLASH DATA FIRST
    const initialQrCodeSvg = flash?.qrCodeData?.qrCodeSvg || flash?.qrCodeSvg || propQrCodeSvg || '';
    const initialManualSetupKey = flash?.qrCodeData?.manualSetupKey || flash?.manualSetupKey || propManualSetupKey || '';
    
    // Use either hook data or initial data
    const displayQrCodeSvg = hookQrCodeSvg || initialQrCodeSvg;
    const displayManualSetupKey = hookManualSetupKey || initialManualSetupKey;
    
    // Debug: Log what we're displaying
    console.log('🎯 [Admin Page] Display data:', {
        displayQrCodeSvg: displayQrCodeSvg ? '✅ Present' : '❌ Missing',
        displayManualSetupKey: displayManualSetupKey ? '✅ Present' : '❌ Missing',
        hookQrCodeSvg: hookQrCodeSvg ? '✅ Present' : '❌ Missing',
        initialQrCodeSvg: initialQrCodeSvg ? '✅ Present' : '❌ Missing'
    });
    
    // Show flash messages from backend
    useEffect(() => {
        if (flash?.success || flash?.error) {
            setShowFlashMessages(true);
            const timer = setTimeout(() => {
                setShowFlashMessages(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [flash]);
    
    // Show setup modal if confirmation is required or if we have initial data
    useEffect(() => {
        if (requiresConfirmation && !twoFactorEnabled) {
            setShowSetupModal(true);
        }
        if (displayQrCodeSvg && displayManualSetupKey && !twoFactorEnabled) {
            setShowSetupModal(true);
        }
    }, [requiresConfirmation, twoFactorEnabled, displayQrCodeSvg, displayManualSetupKey]);

    // Automatically fetch setup data if modal is open but no QR code
    useEffect(() => {
        if (showSetupModal && !displayQrCodeSvg && !hasSetupData) {
            console.log('🔄 [Admin Page] No QR data, fetching...');
            fetchSetupData();
        }
    }, [showSetupModal, displayQrCodeSvg, hasSetupData, fetchSetupData]);

    // Safely extract user data with proper fallbacks
    const user = auth.user;
    
    // Get username from user object with proper fallback
    let initialUsername = '';
    if (user && typeof user === 'object') {
        initialUsername = (user as any).username || (user as any).name || '';
    }
    
    const initialEmail = (user && typeof user === 'object' && (user as any).email) || '';
    
    // Profile form
    const profileForm = useForm({
        username: initialUsername,
        email: initialEmail,
    });

    // Password form
    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    // Two-factor forms
    const enableForm = useForm({});
    const disableForm = useForm({
        password: '',
    });
    const cancelForm = useForm({
        password: '',
    });

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        profileForm.patch(route('profile.update'), {
            preserveScroll: true,
        });
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        passwordForm.put(route('admin.password.update'), {
            preserveScroll: true,
            onSuccess: () => {
                passwordForm.reset();
            },
            onError: (errors) => {
                if (errors.password) {
                    passwordInput.current?.focus();
                }
                if (errors.current_password) {
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    const handleEnableSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsEnabling(true);
        
        // Open modal immediately to show loading state
        setShowSetupModal(true);
        
        enableForm.post(route('admin.security.enable'), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setIsEnabling(false);
                // The hook will update with the new QR data from flash
            },
            onError: (errors) => {
                console.error('Enable error:', errors);
                setShowSetupModal(false);
                setIsEnabling(false);
            },
        });
    };

    const handleDisableClick = () => {
        setShowDisableModal(true);
        disableForm.reset();
        setDisablePassword('');
    };

    const handleDisableConfirm = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!disablePassword.trim()) {
            return;
        }
        
        disableForm.setData('password', disablePassword);
        disableForm.delete(route('admin.security.disable'), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setShowDisableModal(false);
                setDisablePassword('');
                disableForm.reset();
                window.location.reload();
            },
            onError: (errors) => {
                console.error('Disable error:', errors);
            },
        });
    };

    const handleCancelClick = () => {
        setShowCancelModal(true);
        cancelForm.reset();
        setCancelPassword('');
    };

    const handleCancelConfirm = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!cancelPassword.trim()) {
            return;
        }
        
        cancelForm.setData('password', cancelPassword);
        cancelForm.post(route('admin.security.cancel-setup'), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setShowCancelModal(false);
                setCancelPassword('');
                cancelForm.reset();
                clearSetupData();
            },
            onError: (errors) => {
                console.error('Cancel error:', errors);
            },
        });
    };

    // Update form data when password changes
    useEffect(() => {
        if (showDisableModal) {
            disableForm.setData('password', disablePassword);
        }
    }, [disablePassword, showDisableModal]);

    useEffect(() => {
        if (showCancelModal) {
            cancelForm.setData('password', cancelPassword);
        }
    }, [cancelPassword, showCancelModal]);

    // If no user is logged in, don't render the form
    if (!user || typeof user !== 'object' || Object.keys(user).length === 0) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Settings" />
                <div className="p-4 text-center">
                    <p className="text-gray-600 dark:text-gray-400">Please log in to access settings.</p>
                </div>
            </AppLayout>
        );
    }

    // Convert errors object to array if needed
    const errorArray = twoFactorErrors ? Object.values(twoFactorErrors) : [];

    // Determine which state to show
    const isFullyEnabled = twoFactorEnabled;
    const isPartiallySetup = requiresConfirmation && !twoFactorEnabled;

    // Helper function to get error message
    const getErrorMessage = (field: string, errors: any) => {
        if (errors && errors[field]) {
            return Array.isArray(errors[field]) ? errors[field][0] : errors[field];
        }
        return null;
    };

    // Helper function to render modal
    const renderModal = (
        title: string, 
        description: string, 
        icon: React.ReactNode, 
        variant: 'default' | 'destructive' | 'warning',
        children: React.ReactNode, 
        onClose: () => void
    ) => (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
                <div className="space-y-4">
                    <div className={`flex items-center gap-3 p-3 rounded-lg ${
                        variant === 'destructive' ? 'bg-red-50 border border-red-200' :
                        variant === 'warning' ? 'bg-amber-50 border border-amber-200' :
                        'bg-blue-50 border border-blue-200'
                    }`}>
                        <div className={`p-2 rounded-full ${
                            variant === 'destructive' ? 'bg-red-100 text-red-600' :
                            variant === 'warning' ? 'bg-amber-100 text-amber-600' :
                            'bg-blue-100 text-blue-600'
                        }`}>
                            {icon}
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold">{title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                {description}
                            </p>
                        </div>
                    </div>
                    
                    {children}
                </div>
            </div>
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Settings" />

            <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-[2000px] mx-auto w-full">
                <div className="space-y-8">
                    {/* Header Section */}
                    <div className="bg-gradient-to-r from-primary-500/5 via-primary-500/5 to-transparent rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                        <HeadingSmall
                            title="Account Settings"
                            description="Manage your account settings and preferences"
                        />
                    </div>

                    {/* Flash Messages */}
                    <div className="space-y-3">
                        {showFlashMessages && flash?.success && (
                            <Alert className="bg-green-50 border-green-200 animate-in fade-in slide-in-from-top-2 duration-300">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <AlertDescription className="text-green-700">
                                    {flash.success}
                                </AlertDescription>
                            </Alert>
                        )}
                        
                        {showFlashMessages && flash?.error && (
                            <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <XCircle className="h-4 w-4" />
                                <AlertDescription>
                                    {flash.error}
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>

                    {/* Two-column grid layout */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* Left Column - Profile Information */}
                        <div className="space-y-6">
                            {/* Profile Information Card */}
                            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
                                <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-6 py-4">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Profile Information</h3>
                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                        Update your username and email address
                                    </p>
                                </div>
                                
                                <div className="p-6">
                                    <form onSubmit={handleProfileSubmit} className="space-y-6">
                                        <div className="space-y-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="username" className="text-gray-700 dark:text-gray-300">Username</Label>
                                                <Input
                                                    id="username"
                                                    className="mt-1 block w-full bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                                                    value={profileForm.data.username}
                                                    onChange={(e) => profileForm.setData('username', e.target.value)}
                                                    name="username"
                                                    required
                                                    autoComplete="username"
                                                    placeholder="Username"
                                                />
                                                <InputError
                                                    className="mt-2"
                                                    message={profileForm.errors.username}
                                                />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email address</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    className="mt-1 block w-full bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                                                    value={profileForm.data.email}
                                                    onChange={(e) => profileForm.setData('email', e.target.value)}
                                                    name="email"
                                                    required
                                                    autoComplete="email"
                                                    placeholder="Email address"
                                                />
                                                <InputError
                                                    className="mt-2"
                                                    message={profileForm.errors.email}
                                                />
                                            </div>

                                            {mustVerifyEmail && (user as any).email_verified_at === null && (
                                                <div className="rounded-md bg-yellow-50 dark:bg-yellow-900/30 p-4">
                                                    <p className="text-sm text-yellow-800 dark:text-yellow-300">
                                                        Your email address is unverified.{' '}
                                                        <Link
                                                            href={route('verification.send')}
                                                            method="post"
                                                            as="button"
                                                            className="font-medium underline underline-offset-4 hover:text-yellow-900 dark:hover:text-yellow-200 transition-colors"
                                                        >
                                                            Click here to resend the verification email.
                                                        </Link>
                                                    </p>

                                                    {status === 'verification-link-sent' && (
                                                        <div className="mt-2 text-sm font-medium text-green-600 dark:text-green-400">
                                                            A new verification link has been sent to your email address.
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                            <Button
                                                type="submit"
                                                disabled={profileForm.processing}
                                                data-test="update-profile-button"
                                                className="bg-gray-900 hover:bg-gray-900 text-white dark:bg-gray-700 dark:hover:bg-gray-600"
                                            >
                                                Save Profile
                                            </Button>

                                            <Transition
                                                show={profileForm.recentlySuccessful}
                                                enter="transition ease-in-out"
                                                enterFrom="opacity-0"
                                                leave="transition ease-in-out"
                                                leaveTo="opacity-0"
                                            >
                                                <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                                                    Saved
                                                </p>
                                            </Transition>
                                        </div>
                                    </form>
                                </div>
                            </div>

                            {/* Appearance Settings Card */}
                            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
                                <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-6 py-4">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Appearance</h3>
                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                        Customize your theme preferences
                                    </p>
                                </div>
                                <div className="p-6">
                                    <AppearanceToggleTab />
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Password and Security */}
                        <div className="space-y-6">
                            {/* Password Update Card */}
                            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
                                <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-6 py-4">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Update Password</h3>
                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                        Change your account password
                                    </p>
                                </div>
                                
                                <div className="p-6">
                                    <form onSubmit={handlePasswordSubmit} className="space-y-6">
                                        <div className="space-y-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="current_password" className="text-gray-700 dark:text-gray-300">Current password</Label>
                                                <Input
                                                    id="current_password"
                                                    ref={currentPasswordInput}
                                                    name="current_password"
                                                    type="password"
                                                    className="mt-1 block w-full bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                                                    value={passwordForm.data.current_password}
                                                    onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                                    autoComplete="current-password"
                                                    placeholder="Current password"
                                                />
                                                <InputError message={passwordForm.errors.current_password} />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">New password</Label>
                                                <Input
                                                    id="password"
                                                    ref={passwordInput}
                                                    name="password"
                                                    type="password"
                                                    className="mt-1 block w-full bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                                                    value={passwordForm.data.password}
                                                    onChange={(e) => passwordForm.setData('password', e.target.value)}
                                                    autoComplete="new-password"
                                                    placeholder="New password"
                                                />
                                                <InputError message={passwordForm.errors.password} />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="password_confirmation" className="text-gray-700 dark:text-gray-300">Confirm password</Label>
                                                <Input
                                                    id="password_confirmation"
                                                    name="password_confirmation"
                                                    type="password"
                                                    className="mt-1 block w-full bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                                                    value={passwordForm.data.password_confirmation}
                                                    onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                                    autoComplete="new-password"
                                                    placeholder="Confirm password"
                                                />
                                                <InputError message={passwordForm.errors.password_confirmation} />
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                            <Button
                                                type="submit"
                                                disabled={passwordForm.processing}
                                                data-test="update-password-button"
                                                className="bg-gray-900 hover:bg-gray-900 text-white dark:bg-gray-700 dark:hover:bg-gray-600"
                                            >
                                                Update Password
                                            </Button>

                                            <Transition
                                                show={passwordForm.recentlySuccessful}
                                                enter="transition ease-in-out"
                                                enterFrom="opacity-0"
                                                leave="transition ease-in-out"
                                                leaveTo="opacity-0"
                                            >
                                                <p className="text-sm text-green-600 dark:text-green-400 font-medium">Saved</p>
                                            </Transition>
                                        </div>
                                    </form>
                                </div>
                            </div>

                            {/* Two-Factor Authentication Card */}
                            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
                                <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-6 py-4">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Two-Factor Authentication</h3>
                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                        Secure your account with two-factor authentication
                                    </p>
                                </div>
                                
                                <div className="p-6">
                                    {isFullyEnabled ? (
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                                <ShieldCheck className="h-5 w-5 text-green-600" />
                                                <div>
                                                    <p className="font-medium text-green-800">Two-factor authentication is enabled</p>
                                                    <p className="text-sm text-green-600">
                                                        Your account is protected with an extra layer of security
                                                    </p>
                                                </div>
                                            </div>

                                            <TwoFactorRecoveryCodes
                                                recoveryCodesList={recoveryCodesList}
                                                fetchRecoveryCodes={fetchRecoveryCodes}
                                                errors={errorArray}
                                            />

                                            <Separator />

                                            <div className="flex flex-col sm:flex-row gap-2 pt-2">
                                                <Button
                                                    onClick={handleDisableClick}
                                                    variant="destructive"
                                                    disabled={disableForm.processing}
                                                    className="flex-1"
                                                >
                                                    <ShieldBan className="mr-2 h-4 w-4" />
                                                    {disableForm.processing ? 'Disabling...' : 'Disable 2FA'}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="flex-1"
                                                    onClick={fetchRecoveryCodes}
                                                >
                                                    <RefreshCw className="mr-2 h-4 w-4" />
                                                    Refresh Recovery Codes
                                                </Button>
                                            </div>
                                        </div>
                                    ) : isPartiallySetup ? (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                                <ShieldAlert className="h-5 w-5 text-amber-600" />
                                                <div>
                                                    <p className="font-medium text-amber-800">Setup Incomplete</p>
                                                    <p className="text-sm text-amber-600">
                                                        Please complete your two-factor authentication setup
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex flex-col sm:flex-row gap-2">
                                                <Button
                                                    onClick={() => setShowSetupModal(true)}
                                                    disabled={cancelForm.processing}
                                                    className="flex-1"
                                                >
                                                    <ShieldCheck className="mr-2 h-4 w-4" />
                                                    Continue Setup
                                                </Button>
                                                <Button
                                                    onClick={handleCancelClick}
                                                    variant="outline"
                                                    disabled={cancelForm.processing}
                                                    className="flex-1"
                                                >
                                                    <XCircle className="mr-2 h-4 w-4" />
                                                    {cancelForm.processing ? 'Cancelling...' : 'Cancel Setup'}
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                <Info className="h-5 w-5 text-blue-600" />
                                                <div>
                                                    <p className="font-medium text-blue-800">Two-factor authentication is disabled</p>
                                                    <p className="text-sm text-blue-600">
                                                        Add an extra layer of security to your account
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                                <div className="flex items-start gap-3">
                                                    <ShieldCheck className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                                                    <div className="space-y-2">
                                                        <p className="font-medium text-gray-800">Why enable 2FA?</p>
                                                        <ul className="text-sm text-gray-600 space-y-1">
                                                            <li>• Protects against unauthorized access</li>
                                                            <li>• Required for sensitive admin operations</li>
                                                            <li>• Industry-standard security practice</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-2">
                                                {hasSetupData || (displayQrCodeSvg && displayManualSetupKey) ? (
                                                    <Button
                                                        onClick={() => setShowSetupModal(true)}
                                                        className="w-full bg-gray-900 hover:bg-gray-900 text-white dark:bg-gray-700 dark:hover:bg-gray-600"
                                                    >
                                                        <ShieldCheck className="mr-2 h-4 w-4" />
                                                        Continue Setup
                                                    </Button>
                                                ) : (
                                                    <form onSubmit={handleEnableSubmit}>
                                                        <Button
                                                            type="submit"
                                                            disabled={isEnabling}
                                                            className="w-full bg-gray-900 hover:bg-gray-900 text-white dark:bg-gray-700 dark:hover:bg-gray-600"
                                                        >
                                                            <ShieldCheck className="mr-2 h-4 w-4" />
                                                            {isEnabling ? 'Setting up...' : 'Enable Two-Factor Authentication'}
                                                        </Button>
                                                    </form>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Delete Account Section */}
                    <div className="mt-6">
                        <div className="rounded-lg border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-950/20 overflow-hidden">
                            <div className="p-6">
                                <DeleteUser />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <TwoFactorSetupModal
                isOpen={showSetupModal}
                onClose={() => {
                    setShowSetupModal(false);
                    if (!requiresConfirmation && !initialQrCodeSvg) {
                        clearSetupData();
                    }
                }}
                requiresConfirmation={requiresConfirmation}
                twoFactorEnabled={twoFactorEnabled}
                qrCodeSvg={displayQrCodeSvg}
                manualSetupKey={displayManualSetupKey}
                clearSetupData={clearSetupData}
                fetchSetupData={fetchSetupData}
                errors={twoFactorErrors}
                confirmSetup={confirmSetup}
                onSuccess={() => {
                    setShowSetupModal(false);
                    window.location.reload();
                }}
            />

            {/* Disable Confirmation Modal */}
            {showDisableModal && renderModal(
                "Disable Two-Factor Authentication",
                "Enter your password to confirm you want to disable 2FA. This will remove all your recovery codes and make your account less secure.",
                <ShieldBan className="h-5 w-5" />,
                'destructive',
                <form onSubmit={handleDisableConfirm} className="space-y-4 pt-2">
                    <div className="space-y-2">
                        <Label htmlFor="disable-password" className="text-sm font-medium">
                            Confirm Password
                        </Label>
                        <Input
                            id="disable-password"
                            type="password"
                            value={disablePassword}
                            onChange={(e) => setDisablePassword(e.target.value)}
                            placeholder="Enter your current password"
                            required
                            disabled={disableForm.processing}
                            autoFocus
                            className={getErrorMessage('password', disableForm.errors) ? "border-destructive" : ""}
                        />
                        {getErrorMessage('password', disableForm.errors) && (
                            <p className="text-sm text-destructive">
                                {getErrorMessage('password', disableForm.errors)}
                            </p>
                        )}
                    </div>
                    
                    <div className="flex gap-2 justify-end pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setShowDisableModal(false);
                                setDisablePassword('');
                                disableForm.reset();
                            }}
                            disabled={disableForm.processing}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="destructive"
                            disabled={disableForm.processing || !disablePassword.trim()}
                            className="flex-1"
                        >
                            {disableForm.processing ? 'Disabling...' : 'Disable 2FA'}
                        </Button>
                    </div>
                </form>,
                () => {
                    setShowDisableModal(false);
                    setDisablePassword('');
                    disableForm.reset();
                }
            )}

            {/* Cancel Setup Confirmation Modal */}
            {showCancelModal && renderModal(
                "Cancel Setup",
                "Enter your password to confirm you want to cancel the 2FA setup process. All progress will be lost.",
                <XCircle className="h-5 w-5" />,
                'warning',
                <form onSubmit={handleCancelConfirm} className="space-y-4 pt-2">
                    <div className="space-y-2">
                        <Label htmlFor="cancel-password" className="text-sm font-medium">
                            Confirm Password
                        </Label>
                        <Input
                            id="cancel-password"
                            type="password"
                            value={cancelPassword}
                            onChange={(e) => setCancelPassword(e.target.value)}
                            placeholder="Enter your current password"
                            required
                            disabled={cancelForm.processing}
                            autoFocus
                            className={getErrorMessage('password', cancelForm.errors) ? "border-destructive" : ""}
                        />
                        {getErrorMessage('password', cancelForm.errors) && (
                            <p className="text-sm text-destructive">
                                {getErrorMessage('password', cancelForm.errors)}
                            </p>
                        )}
                    </div>
                    
                    <div className="flex gap-2 justify-end pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setShowCancelModal(false);
                                setCancelPassword('');
                                cancelForm.reset();
                            }}
                            disabled={cancelForm.processing}
                            className="flex-1"
                        >
                            Keep Setup
                        </Button>
                        <Button
                            type="submit"
                            variant="destructive"
                            disabled={cancelForm.processing || !cancelPassword.trim()}
                            className="flex-1"
                        >
                            {cancelForm.processing ? 'Cancelling...' : 'Confirm Cancel'}
                        </Button>
                    </div>
                </form>,
                () => {
                    setShowCancelModal(false);
                    setCancelPassword('');
                    cancelForm.reset();
                }
            )}
        </AppLayout>
    );
}