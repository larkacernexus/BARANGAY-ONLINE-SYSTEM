import HeadingSmall from '@/components/heading-small';
import TwoFactorRecoveryCodes from '@/components/two-factor-recovery-codes';
import TwoFactorSetupModal from '@/components/two-factor-setup-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTwoFactorAuth } from '@/hooks/use-two-factor-auth';
import AppLayout from '@/layouts/resident-app-layout';
import SettingsLayout from '@/layouts/settings/residentlayout';
import { type BreadcrumbItem } from '@/types';
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
import { useState, useEffect } from 'react';
import { route } from 'ziggy-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface TwoFactorProps {
    twoFactorEnabled?: boolean;
    requiresConfirmation?: boolean;
    initialSetupData?: {
        qrCodeSvg: string;
        manualSetupKey: string;
    } | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Two-Factor Authentication',
        href: route('resident.two-factor.show'),
    },
];

export default function TwoFactor({
    twoFactorEnabled = false,
    requiresConfirmation = false,
    initialSetupData = null,
}: TwoFactorProps) {
    const { flash, errors: pageErrors } = usePage().props as any;
    
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
        errors,
    } = useTwoFactorAuth();
    
    const [showSetupModal, setShowSetupModal] = useState<boolean>(false);
    const [showDisableModal, setShowDisableModal] = useState<boolean>(false);
    const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
    const [disablePassword, setDisablePassword] = useState<string>('');
    const [cancelPassword, setCancelPassword] = useState<string>('');
    const [showFlashMessages, setShowFlashMessages] = useState<boolean>(true);

    // Initialize setup data from props
    useEffect(() => {
        if (requiresConfirmation && !twoFactorEnabled) {
            setShowSetupModal(true);
        }
    }, [requiresConfirmation, twoFactorEnabled]);

    // Show flash messages from backend
    useEffect(() => {
        if (flash?.success || flash?.error) {
            const timer = setTimeout(() => {
                setShowFlashMessages(false);
            }, 5000);
            
            return () => clearTimeout(timer);
        }
    }, [flash]);

    // Use Inertia forms with proper error handling
    const { post: enablePost, processing: enabling } = useForm();
    const { 
        post: disablePost, 
        processing: disabling, 
        errors: disableErrors, 
        reset: resetDisableForm,
        setData: setDisableData,
    } = useForm({
        password: '',
    });
    const { 
        post: cancelPost, 
        processing: cancelling, 
        errors: cancelErrors,
        reset: resetCancelForm,
        setData: setCancelData,
    } = useForm({
        password: '',
    });

    const handleEnable = (e: React.FormEvent) => {
        e.preventDefault();
        enablePost(route('resident.two-factor.enable'), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setShowSetupModal(true);
            },
        });
    };

    const handleDisableClick = () => {
        setShowDisableModal(true);
        resetDisableForm();
    };

    const handleDisableConfirm = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!disablePassword.trim()) {
            return;
        }
        
        setDisableData('password', disablePassword);
        disablePost(route('resident.two-factor.disable'), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setShowDisableModal(false);
                setDisablePassword('');
                resetDisableForm();
            },
        });
    };

    const handleCancelClick = () => {
        setShowCancelModal(true);
        resetCancelForm();
    };

    const handleCancelConfirm = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!cancelPassword.trim()) {
            return;
        }
        
        setCancelData('password', cancelPassword);
        cancelPost(route('resident.two-factor.cancel-setup'), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setShowCancelModal(false);
                setCancelPassword('');
                resetCancelForm();
            },
        });
    };

    // Update form data when password changes
    useEffect(() => {
        if (showDisableModal) {
            setDisableData('password', disablePassword);
        }
    }, [disablePassword, showDisableModal]);

    useEffect(() => {
        if (showCancelModal) {
            setCancelData('password', cancelPassword);
        }
    }, [cancelPassword, showCancelModal]);

    // Determine which state to show
    const isFullyEnabled = twoFactorEnabled;
    const isPartiallySetup = requiresConfirmation && !twoFactorEnabled;

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

    // Helper to get error message
    const getErrorMessage = (field: string, inertiaErrors: any) => {
        if (inertiaErrors && inertiaErrors[field]) {
            return Array.isArray(inertiaErrors[field]) ? inertiaErrors[field][0] : inertiaErrors[field];
        }
        return null;
    };

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
                                            </div>
                                            
                                            <Separator />
                                            
                                            <TwoFactorRecoveryCodes
                                                recoveryCodesList={recoveryCodesList}
                                                fetchRecoveryCodes={fetchRecoveryCodes}
                                                errors={errors.recoveryCodes ? [errors.recoveryCodes] : []}
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

                            {/* Best Practices & Recovery Tips Section - Below Security Status Card */}
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
                                                    <RefreshCw className="h-3 w-3 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">Generate new recovery codes periodically</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Refresh your recovery codes every 3-6 months for enhanced security
                                                    </p>
                                                </div>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                    <AlertTriangle className="h-3 w-3 text-amber-500" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">Avoid sharing screenshots</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Don't share screenshots of QR codes or recovery codes digitally
                                                    </p>
                                                </div>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                    <Smartphone className="h-3 w-3 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">Setup on a regular device</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Set up 2FA on a device you regularly carry with you
                                                    </p>
                                                </div>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">Test immediately after setup</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Always test your setup immediately after enabling 2FA
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
                                            <Download className="h-5 w-5" />
                                            Recovery Tips
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                                                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                                    <Printer className="h-4 w-4 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">Print recovery codes and store securely</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Store printed codes in a safe, physical location like a locked drawer
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                                                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                                    <Key className="h-4 w-4 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">Use one recovery code per login attempt</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Each recovery code can only be used once for account access
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                                                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                                    <RefreshCw className="h-4 w-4 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">Regenerate if you suspect compromise</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Immediately generate new codes if you suspect your codes have been seen by others
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
                                    <CardDescription>
                                        Keep this information in mind
                                    </CardDescription>
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
                                        
                                        <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                            <Key className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium text-green-800">Secure Backup</p>
                                                <p className="text-xs text-green-700">
                                                    Consider printing or writing down recovery codes. Don't store them digitally unless encrypted.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Quick Actions Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <ShieldCheck className="h-5 w-5" />
                                        Quick Actions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <Button 
                                            variant="outline" 
                                            className="w-full justify-start"
                                            onClick={fetchRecoveryCodes}
                                        >
                                            <Download className="mr-2 h-4 w-4" />
                                            Download Recovery Codes
                                        </Button>
                                        {isFullyEnabled && (
                                            <Button 
                                                variant="outline" 
                                                className="w-full justify-start"
                                                onClick={() => fetchRecoveryCodes()}
                                            >
                                                <RefreshCw className="mr-2 h-4 w-4" />
                                                Regenerate Recovery Codes
                                            </Button>
                                        )}
                                        <Button 
                                            variant="outline" 
                                            className="w-full justify-start"
                                            onClick={() => {
                                                if (isPartiallySetup || isFullyEnabled) {
                                                    setShowSetupModal(true);
                                                } else {
                                                    handleEnable({ preventDefault: () => {} } as React.FormEvent);
                                                }
                                            }}
                                        >
                                            <ShieldCheck className="mr-2 h-4 w-4" />
                                            {isFullyEnabled ? 'View Setup' : 'Enable 2FA'}
                                        </Button>
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
                        errors={errors}
                        onSuccess={() => {
                            setShowSetupModal(false);
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
                                    disabled={disabling}
                                    autoFocus
                                    className={getErrorMessage('password', disableErrors) ? "border-destructive" : ""}
                                />
                                {getErrorMessage('password', disableErrors) && (
                                    <p className="text-sm text-destructive">
                                        {getErrorMessage('password', disableErrors)}
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
                                        resetDisableForm();
                                    }}
                                    disabled={disabling}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="destructive"
                                    disabled={disabling || !disablePassword.trim()}
                                    className="flex-1"
                                >
                                    {disabling ? 'Disabling...' : 'Disable 2FA'}
                                </Button>
                            </div>
                        </form>,
                        () => {
                            setShowDisableModal(false);
                            setDisablePassword('');
                            resetDisableForm();
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
                                    disabled={cancelling}
                                    autoFocus
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
                                        setCancelPassword('');
                                        resetCancelForm();
                                    }}
                                    disabled={cancelling}
                                    className="flex-1"
                                >
                                    Keep Setup
                                </Button>
                                <Button
                                    type="submit"
                                    variant="destructive"
                                    disabled={cancelling || !cancelPassword.trim()}
                                    className="flex-1"
                                >
                                    {cancelling ? 'Cancelling...' : 'Confirm Cancel'}
                                </Button>
                            </div>
                        </form>,
                        () => {
                            setShowCancelModal(false);
                            setCancelPassword('');
                            resetCancelForm();
                        }
                    )}
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}