import HeadingSmall from '@/components/heading-small';
import TwoFactorRecoveryCodes from '@/components/two-factor-recovery-codes';
import TwoFactorSetupModal from '@/components/two-factor-setup-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useResidentTwoFactorAuth } from '@/hooks/use-resident-two-factor-auth';
import AppLayout from '@/layouts/resident-app-layout';
import SettingsLayout from '@/layouts/settings/residentlayout';
import { type BreadcrumbItem } from '@/types/breadcrumbs';
import { Head, useForm, usePage } from '@inertiajs/react';
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
import { useState, useEffect, useCallback, useRef } from 'react';
import { route } from 'ziggy-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
// SECURITY NOTE: Import DOMPurify for SVG sanitization
import DOMPurify from 'dompurify';

interface TwoFactorProps {
    twoFactorEnabled?: boolean;
    requiresConfirmation?: boolean;
    initialSetupData?: {
        qrCodeSvg: string;
        manualSetupKey: string;
    } | null;
    requiresTwoFactor?: boolean;
    userNeedsToSetup?: boolean;
    lastUsedAt?: string | null;
    backupCodesRemaining?: number;
}

// Form data interfaces for type safety
interface DisableFormData {
    password: string;
    two_factor_code: string;
    confirmation: boolean;
}

interface CancelFormData {
    password: string;
}

interface RegenerateFormData {
    password: string;
    two_factor_code: string;
    confirmation: boolean;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Two-Factor Authentication',
        href: '/residentsettings/security/two-factor',
    },
];

export default function TwoFactor({
    twoFactorEnabled = false,
    requiresConfirmation = false,
    initialSetupData = null,
    requiresTwoFactor = false,
    userNeedsToSetup = false,
    lastUsedAt = null,
    backupCodesRemaining = 0,
}: TwoFactorProps) {
    const { flash, errors: pageErrors } = usePage().props as any;
    
    // SECURITY NOTE: Use refs for sensitive data that shouldn't trigger re-renders
    const sensitiveDataRef = useRef<{
        recoveryCodes?: string[];
        qrSecret?: string;
    }>({});
    
    const {
        qrCodeSvg,
        manualSetupKey,
        hasSetupData,
        clearSetupData,
        fetchSetupData,
        recoveryCodesList,
        fetchRecoveryCodes,
        regenerateRecoveryCodes,
        confirmSetup,
        errors: hookErrors,
    } = useResidentTwoFactorAuth();
    
    const [showSetupModal, setShowSetupModal] = useState<boolean>(false);
    const [showDisableModal, setShowDisableModal] = useState<boolean>(false);
    const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
    const [showRegenerateModal, setShowRegenerateModal] = useState<boolean>(false);
    const [showFlashMessages, setShowFlashMessages] = useState<boolean>(true);
    
    // SECURITY NOTE: Form state with proper validation
    const [twoFactorCode, setTwoFactorCode] = useState<string>('');
    const [codeError, setCodeError] = useState<string>('');

    // Initialize setup data from props
    useEffect(() => {
        if (requiresConfirmation && !twoFactorEnabled) {
            setShowSetupModal(true);
        }
    }, [requiresConfirmation, twoFactorEnabled]);

    // SECURITY NOTE: Clear sensitive data on unmount
    useEffect(() => {
        return () => {
            sensitiveDataRef.current = {};
            clearSetupData();
        };
    }, [clearSetupData]);

    // Show flash messages from backend with auto-dismiss
    useEffect(() => {
        if (flash?.success || flash?.error) {
            setShowFlashMessages(true);
            const timer = setTimeout(() => {
                setShowFlashMessages(false);
            }, 5000);
            
            return () => clearTimeout(timer);
        }
    }, [flash]);

    // SECURITY NOTE: Validate 2FA code format
    const validateTwoFactorCode = useCallback((code: string): boolean => {
        const isValid = /^\d{6}$/.test(code);
        setCodeError(isValid ? '' : 'Code must be exactly 6 digits');
        return isValid;
    }, []);

    // Use Inertia forms with proper error handling and types
    const { post: enablePost, processing: enabling } = useForm();
    
    const { 
        post: disablePost, 
        processing: disabling, 
        errors: disableErrors, 
        reset: resetDisableForm,
        data: disableFormData,
        setData: setDisableData,
    } = useForm<DisableFormData>({
        password: '',
        two_factor_code: '',
        confirmation: true,
    });
    
    const { 
        post: cancelPost, 
        processing: cancelling, 
        errors: cancelErrors,
        reset: resetCancelForm,
        data: cancelFormData,
        setData: setCancelData,
    } = useForm<CancelFormData>({
        password: '',
    });
    
    const { 
        post: regeneratePost, 
        processing: regenerating, 
        errors: regenerateErrors,
        reset: resetRegenerateForm,
        data: regenerateFormData,
        setData: setRegenerateData,
    } = useForm<RegenerateFormData>({
        password: '',
        two_factor_code: '',
        confirmation: true,
    });

    const handleEnable = (e: React.FormEvent) => {
        e.preventDefault();
        
        // LOGIC NOTE: Clear any existing setup data before enabling
        clearSetupData();
        
        enablePost(route('resident.two-factor.enable'), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setShowSetupModal(true);
            },
            onError: (errors) => {
                console.error('Enable 2FA failed:', errors);
            },
        });
    };

    const handleDisableClick = () => {
        // SECURITY NOTE: Require re-authentication for sensitive operation
        if (!twoFactorEnabled) return;
        
        setShowDisableModal(true);
        resetDisableForm();
        setTwoFactorCode('');
        setCodeError('');
    };

    const handleDisableConfirm = (e: React.FormEvent) => {
        e.preventDefault();
        
        // SECURITY NOTE: Validate all required fields
        if (!disableFormData.password?.trim()) {
            return;
        }
        
        if (!validateTwoFactorCode(disableFormData.two_factor_code || '')) {
            return;
        }
        
        disablePost(route('resident.two-factor.disable'), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setShowDisableModal(false);
                resetDisableForm();
                setTwoFactorCode('');
                // SECURITY NOTE: Clear sensitive data on success
                sensitiveDataRef.current = {};
                clearSetupData();
            },
        });
    };

    const handleCancelClick = () => {
        setShowCancelModal(true);
        resetCancelForm();
    };

    const handleCancelConfirm = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!cancelFormData.password?.trim()) {
            return;
        }
        
        // SECURITY NOTE: Use the correct route name
        cancelPost(route('resident.two-factor.cancel'), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setShowCancelModal(false);
                resetCancelForm();
                setShowSetupModal(false);
                clearSetupData();
            },
        });
    };

    const handleRegenerateClick = () => {
        setShowRegenerateModal(true);
        resetRegenerateForm();
        setTwoFactorCode('');
        setCodeError('');
    };

    const handleRegenerateConfirm = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!regenerateFormData.password?.trim()) {
            return;
        }
        
        if (!validateTwoFactorCode(regenerateFormData.two_factor_code || '')) {
            return;
        }
        
        regeneratePost(route('resident.two-factor.recovery.regenerate'), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setShowRegenerateModal(false);
                resetRegenerateForm();
                setTwoFactorCode('');
                // SECURITY NOTE: Refresh recovery codes after regeneration
                fetchRecoveryCodes();
            },
        });
    };

    // SECURITY NOTE: Sanitize QR code SVG before rendering
    const sanitizedQrCode = useCallback((svg: string): string => {
        return DOMPurify.sanitize(svg, {
            USE_PROFILES: { svg: true, svgFilters: true },
            ADD_TAGS: ['path', 'circle', 'rect', 'svg'],
            ADD_ATTR: ['viewBox', 'width', 'height', 'xmlns'],
        });
    }, []);

    // Determine which state to show
    const isFullyEnabled = twoFactorEnabled;
    const isPartiallySetup = requiresConfirmation && !twoFactorEnabled;

    // SECURITY NOTE: Helper function to render modal with proper keyboard handling
    const renderSecureModal = (
        title: string, 
        description: string, 
        icon: React.ReactNode, 
        variant: 'default' | 'destructive' | 'warning',
        children: React.ReactNode, 
        onClose: () => void
    ) => (
        <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" 
            onClick={onClose}
            onKeyDown={(e) => {
                if (e.key === 'Escape') {
                    onClose();
                }
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div 
                className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl" 
                onClick={(e) => e.stopPropagation()}
            >
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
                            <h3 id="modal-title" className="text-lg font-semibold">{title}</h3>
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

    // Helper to get error message
    const getErrorMessage = (field: string, inertiaErrors: Record<string, string> | undefined) => {
        if (inertiaErrors && inertiaErrors[field]) {
            return inertiaErrors[field];
        }
        return null;
    };

    // SECURITY NOTE: Check if user is required to set up 2FA
    if (requiresTwoFactor && userNeedsToSetup && !isFullyEnabled && !isPartiallySetup) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Security Setup Required" />
                <SettingsLayout>
                    <div className="space-y-6">
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                Two-factor authentication is required for your account. Please set it up to continue.
                            </AlertDescription>
                        </Alert>
                        
                        <Card>
                            <CardHeader>
                                <CardTitle>Required Security Setup</CardTitle>
                                <CardDescription>
                                    You must enable two-factor authentication to access all features
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleEnable}>
                                    <Button type="submit" disabled={enabling} className="w-full">
                                        <ShieldCheck className="mr-2 h-4 w-4" />
                                        {enabling ? 'Setting up...' : 'Set Up Two-Factor Authentication'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </SettingsLayout>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Two-Factor Authentication" />
            <SettingsLayout>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <ShieldCheck className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold tracking-tight">Two-Factor Authentication</h1>
                                    <p className="text-muted-foreground">
                                        Add an extra layer of security to your account
                                    </p>
                                </div>
                            </div>
                            <Badge 
                                variant={isFullyEnabled ? "default" : "destructive"} 
                                className={`${
                                    isFullyEnabled 
                                        ? "bg-green-100 text-green-800 hover:bg-green-100 border-green-200" 
                                        : "bg-red-100 text-red-800 hover:bg-red-100 border-red-200"
                                }`}
                            >
                                {isFullyEnabled ? "Active" : "Inactive"}
                            </Badge>
                        </div>
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

                        {pageErrors && Object.keys(pageErrors).length > 0 && (
                            <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>
                                    {Object.values(pageErrors).map((error: any, index) => (
                                        <div key={index}>{error}</div>
                                    ))}
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Status Card & Guidelines */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Status Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Lock className="h-5 w-5" />
                                        Security Status
                                    </CardTitle>
                                    <CardDescription>
                                        Current state of your two-factor authentication
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {isFullyEnabled ? (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                                <ShieldCheck className="h-5 w-5 text-green-600" />
                                                <div>
                                                    <p className="font-medium text-green-800">Two-factor authentication is enabled</p>
                                                    <p className="text-sm text-green-600">
                                                        Your account is protected with an extra layer of security
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-3">
                                                <p className="text-sm text-muted-foreground">
                                                    When logging in, you'll need to enter both your password and a verification code from your authenticator app.
                                                </p>
                                                
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                                                    <span>Use authenticator apps like Google Authenticator, Authy, or Microsoft Authenticator</span>
                                                </div>
                                                
                                                {lastUsedAt && (
                                                    <p className="text-xs text-muted-foreground">
                                                        Last used: {lastUsedAt}
                                                    </p>
                                                )}
                                            </div>
                                            
                                            <Separator />
                                            
                                            <TwoFactorRecoveryCodes
                                                recoveryCodesList={recoveryCodesList}
                                                fetchRecoveryCodes={fetchRecoveryCodes}
                                                errors={hookErrors.recoveryCodes ? [hookErrors.recoveryCodes] : []}
                                                backupCodesRemaining={backupCodesRemaining}
                                            />
                                            
                                            <Separator />
                                            
                                            <div className="flex flex-col sm:flex-row gap-2 pt-2">
                                                <Button
                                                    onClick={handleDisableClick}
                                                    variant="destructive"
                                                    disabled={disabling}
                                                    className="flex-1"
                                                >
                                                    <ShieldBan className="mr-2 h-4 w-4" />
                                                    {disabling ? 'Disabling...' : 'Disable 2FA'}
                                                </Button>
                                                <Button
                                                    onClick={handleRegenerateClick}
                                                    variant="outline"
                                                    className="flex-1"
                                                >
                                                    <RefreshCw className="mr-2 h-4 w-4" />
                                                    Regenerate Codes
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
                                            
                                            <p className="text-sm text-muted-foreground">
                                                You have started setting up two-factor authentication but haven't completed it.
                                                Click "Continue Setup" to finish, or "Cancel Setup" to remove the partial setup.
                                            </p>
                                            
                                            <div className="flex flex-col sm:flex-row gap-2">
                                                <Button
                                                    onClick={() => setShowSetupModal(true)}
                                                    disabled={cancelling}
                                                    className="flex-1"
                                                >
                                                    <ShieldCheck className="mr-2 h-4 w-4" />
                                                    Continue Setup
                                                </Button>
                                                <Button
                                                    onClick={handleCancelClick}
                                                    variant="outline"
                                                    disabled={cancelling}
                                                    className="flex-1"
                                                >
                                                    <XCircle className="mr-2 h-4 w-4" />
                                                    {cancelling ? 'Cancelling...' : 'Cancel Setup'}
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                                <ShieldBan className="h-5 w-5 text-red-600" />
                                                <div>
                                                    <p className="font-medium text-red-800">Two-factor authentication is disabled</p>
                                                    <p className="text-sm text-red-600">
                                                        Your account is not protected with two-factor authentication
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <p className="text-sm text-muted-foreground">
                                                Two-factor authentication adds an extra layer of security to your account by requiring more than just a password to sign in.
                                            </p>
                                            
                                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                                <div className="flex items-start gap-3">
                                                    <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                                    <div className="space-y-2">
                                                        <p className="font-medium text-blue-800">Why enable 2FA?</p>
                                                        <ul className="text-sm text-blue-700 space-y-1">
                                                            <li>• Protects against password theft</li>
                                                            <li>• Required for sensitive operations</li>
                                                            <li>• Industry-standard security practice</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <form onSubmit={handleEnable} className="pt-2">
                                                <Button
                                                    type="submit"
                                                    disabled={enabling}
                                                    className="w-full"
                                                >
                                                    <ShieldCheck className="mr-2 h-4 w-4" />
                                                    {enabling ? 'Setting up...' : 'Enable Two-Factor Authentication'}
                                                </Button>
                                            </form>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Best Practices & Recovery Tips Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Best Practices Card */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <ShieldCheck className="h-5 w-5" />
                                            Best Practices
                                        </CardTitle>
                                        <CardDescription>
                                            Tips for secure 2FA usage
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <ul className="space-y-3">
                                            <li className="flex items-start gap-3">
                                                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                    <Smartphone className="h-3 w-3 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">Use dedicated authenticator apps</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Instead of SMS codes, use apps like Google Authenticator or Authy for better security
                                                    </p>
                                                </div>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                    <Key className="h-3 w-3 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">Store recovery codes securely</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Keep recovery codes in a password manager or printed in a secure location
                                                    </p>
                                                </div>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                    <AlertTriangle className="h-3 w-3 text-amber-500" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">Never share verification codes</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Legitimate services will never ask for your 2FA codes
                                                    </p>
                                                </div>
                                            </li>
                                        </ul>
                                    </CardContent>
                                </Card>

                                {/* Recovery Tips Card */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Printer className="h-5 w-5" />
                                            Recovery Tips
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                                                <Download className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <p className="text-sm font-medium">Download recovery codes</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Save recovery codes as a text file and store it in a secure location
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                                                <Key className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <p className="text-sm font-medium">One-time use only</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Each recovery code can only be used once. Generate new ones after use
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Right Column - Notes & Additional Information */}
                        <div className="space-y-6">
                            {/* Important Notes Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Info className="h-5 w-5" />
                                        Important Notes
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium text-amber-800">Save Your Recovery Codes</p>
                                                <p className="text-xs text-amber-700">
                                                    Store recovery codes in a safe place. You'll need them if you lose access to your authenticator app.
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                            <Smartphone className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium text-blue-800">Authenticator App Required</p>
                                                <p className="text-xs text-blue-700">
                                                    You'll need an authenticator app like Google Authenticator or Authy installed on your mobile device.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                    
                    {/* Setup Modal */}
                    <TwoFactorSetupModal
                        isOpen={showSetupModal}
                        onClose={() => {
                            setShowSetupModal(false);
                            if (!isPartiallySetup) {
                                clearSetupData();
                            }
                        }}
                        requiresConfirmation={requiresConfirmation}
                        twoFactorEnabled={twoFactorEnabled}
                        qrCodeSvg={initialSetupData?.qrCodeSvg || qrCodeSvg}
                        manualSetupKey={initialSetupData?.manualSetupKey || manualSetupKey}
                        clearSetupData={clearSetupData}
                        fetchSetupData={fetchSetupData}
                        confirmSetup={confirmSetup}
                        errors={hookErrors}
                        onSuccess={() => {
                            setShowSetupModal(false);
                            // SECURITY NOTE: Clear sensitive data after successful setup
                            sensitiveDataRef.current = {};
                        }}
                    />
                    
                    {/* Disable Confirmation Modal */}
                    {showDisableModal && renderSecureModal(
                        "Disable Two-Factor Authentication",
                        "This action will remove 2FA protection from your account. You'll need to enter your password and current 2FA code to confirm.",
                        <ShieldBan className="h-5 w-5" />,
                        'destructive',
                        <form onSubmit={handleDisableConfirm} className="space-y-4 pt-2">
                            <div className="space-y-2">
                                <Label htmlFor="disable-password">Password</Label>
                                <Input
                                    id="disable-password"
                                    type="password"
                                    value={disableFormData.password}
                                    onChange={(e) => setDisableData('password', e.target.value)}
                                    placeholder="Enter your current password"
                                    required
                                    disabled={disabling}
                                    autoComplete="current-password"
                                    className={getErrorMessage('password', disableErrors) ? "border-destructive" : ""}
                                />
                                {getErrorMessage('password', disableErrors) && (
                                    <p className="text-sm text-destructive">
                                        {getErrorMessage('password', disableErrors)}
                                    </p>
                                )}
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="disable-2fa-code">2FA Code</Label>
                                <Input
                                    id="disable-2fa-code"
                                    type="text"
                                    inputMode="numeric"
                                    pattern="\d{6}"
                                    maxLength={6}
                                    value={disableFormData.two_factor_code}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '');
                                        setDisableData('two_factor_code', value);
                                        validateTwoFactorCode(value);
                                    }}
                                    placeholder="Enter 6-digit code"
                                    required
                                    disabled={disabling}
                                    autoComplete="one-time-code"
                                    className={codeError ? "border-destructive" : ""}
                                />
                                {codeError && (
                                    <p className="text-sm text-destructive">{codeError}</p>
                                )}
                            </div>
                            
                            <div className="flex gap-2 justify-end pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowDisableModal(false);
                                        resetDisableForm();
                                        setTwoFactorCode('');
                                        setCodeError('');
                                    }}
                                    disabled={disabling}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="destructive"
                                    disabled={disabling || !disableFormData.password || !validateTwoFactorCode(disableFormData.two_factor_code || '')}
                                >
                                    {disabling ? 'Disabling...' : 'Disable 2FA'}
                                </Button>
                            </div>
                        </form>,
                        () => {
                            setShowDisableModal(false);
                            resetDisableForm();
                            setTwoFactorCode('');
                            setCodeError('');
                        }
                    )}
                    
                    {/* Cancel Setup Modal */}
                    {showCancelModal && renderSecureModal(
                        "Cancel Setup",
                        "Enter your password to confirm you want to cancel the 2FA setup process. All progress will be lost.",
                        <XCircle className="h-5 w-5" />,
                        'warning',
                        <form onSubmit={handleCancelConfirm} className="space-y-4 pt-2">
                            <div className="space-y-2">
                                <Label htmlFor="cancel-password">Confirm Password</Label>
                                <Input
                                    id="cancel-password"
                                    type="password"
                                    value={cancelFormData.password}
                                    onChange={(e) => setCancelData('password', e.target.value)}
                                    placeholder="Enter your current password"
                                    required
                                    disabled={cancelling}
                                    autoComplete="current-password"
                                    className={getErrorMessage('password', cancelErrors) ? "border-destructive" : ""}
                                />
                                {getErrorMessage('password', cancelErrors) && (
                                    <p className="text-sm text-destructive">
                                        {getErrorMessage('password', cancelErrors)}
                                    </p>
                                )}
                            </div>
                            
                            <div className="flex gap-2 justify-end pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowCancelModal(false);
                                        resetCancelForm();
                                    }}
                                    disabled={cancelling}
                                >
                                    Keep Setup
                                </Button>
                                <Button
                                    type="submit"
                                    variant="destructive"
                                    disabled={cancelling || !cancelFormData.password}
                                >
                                    {cancelling ? 'Cancelling...' : 'Confirm Cancel'}
                                </Button>
                            </div>
                        </form>,
                        () => {
                            setShowCancelModal(false);
                            resetCancelForm();
                        }
                    )}
                    
                    {/* Regenerate Recovery Codes Modal */}
                    {showRegenerateModal && renderSecureModal(
                        "Regenerate Recovery Codes",
                        "This will invalidate all existing recovery codes. Enter your password and 2FA code to confirm.",
                        <RefreshCw className="h-5 w-5" />,
                        'warning',
                        <form onSubmit={handleRegenerateConfirm} className="space-y-4 pt-2">
                            <div className="space-y-2">
                                <Label htmlFor="regenerate-password">Password</Label>
                                <Input
                                    id="regenerate-password"
                                    type="password"
                                    value={regenerateFormData.password}
                                    onChange={(e) => setRegenerateData('password', e.target.value)}
                                    placeholder="Enter your current password"
                                    required
                                    disabled={regenerating}
                                    autoComplete="current-password"
                                    className={getErrorMessage('password', regenerateErrors) ? "border-destructive" : ""}
                                />
                                {getErrorMessage('password', regenerateErrors) && (
                                    <p className="text-sm text-destructive">
                                        {getErrorMessage('password', regenerateErrors)}
                                    </p>
                                )}
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="regenerate-2fa-code">2FA Code</Label>
                                <Input
                                    id="regenerate-2fa-code"
                                    type="text"
                                    inputMode="numeric"
                                    pattern="\d{6}"
                                    maxLength={6}
                                    value={regenerateFormData.two_factor_code}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '');
                                        setRegenerateData('two_factor_code', value);
                                        validateTwoFactorCode(value);
                                    }}
                                    placeholder="Enter 6-digit code"
                                    required
                                    disabled={regenerating}
                                    autoComplete="one-time-code"
                                    className={codeError ? "border-destructive" : ""}
                                />
                                {codeError && (
                                    <p className="text-sm text-destructive">{codeError}</p>
                                )}
                            </div>
                            
                            <div className="flex gap-2 justify-end pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowRegenerateModal(false);
                                        resetRegenerateForm();
                                        setTwoFactorCode('');
                                        setCodeError('');
                                    }}
                                    disabled={regenerating}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={regenerating || !regenerateFormData.password || !validateTwoFactorCode(regenerateFormData.two_factor_code || '')}
                                >
                                    {regenerating ? 'Regenerating...' : 'Regenerate Codes'}
                                </Button>
                            </div>
                        </form>,
                        () => {
                            setShowRegenerateModal(false);
                            resetRegenerateForm();
                            setTwoFactorCode('');
                            setCodeError('');
                        }
                    )}
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}