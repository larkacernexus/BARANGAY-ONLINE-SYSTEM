// components/two-factor-setup-modal.tsx
import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShieldAlert, Copy, Check } from 'lucide-react';

interface TwoFactorSetupModalProps {
    isOpen: boolean;
    onClose: () => void;
    requiresConfirmation: boolean;
    twoFactorEnabled: boolean;
    qrCodeSvg: string;
    manualSetupKey: string;
    clearSetupData: () => void;
    fetchSetupData: () => void;
    confirmSetup: (code: string) => Promise<{ success: boolean; recoveryCodes?: string[] }>;
    errors: Record<string, string>;
    onSuccess: () => void;
}

export default function TwoFactorSetupModal({
    isOpen,
    onClose,
    requiresConfirmation,
    twoFactorEnabled,
    qrCodeSvg,
    manualSetupKey,
    clearSetupData,
    fetchSetupData,
    confirmSetup,
    errors,
    onSuccess,
}: TwoFactorSetupModalProps) {
    const [verificationCode, setVerificationCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [copied, setCopied] = useState(false);
    const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
    const [step, setStep] = useState<'setup' | 'verify' | 'recovery'>('setup');

    const handleCopyKey = () => {
        navigator.clipboard.writeText(manualSetupKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!verificationCode.trim()) return;
        
        setIsSubmitting(true);
        const result = await confirmSetup(verificationCode);
        setIsSubmitting(false);
        
        if (result.success) {
            if (result.recoveryCodes) {
                setRecoveryCodes(result.recoveryCodes);
                setStep('recovery');
            } else {
                onSuccess();
            }
        }
    };

    const handleRetry = () => {
        clearSetupData();
        fetchSetupData();
        setVerificationCode('');
        setStep('setup');
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Set up Two-Factor Authentication</DialogTitle>
                    <DialogDescription>
                        Scan the QR code or enter the setup key in your authenticator app
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {errors.general && (
                        <Alert variant="destructive">
                            <ShieldAlert className="h-4 w-4" />
                            <AlertDescription>{errors.general}</AlertDescription>
                        </Alert>
                    )}
                    
                    {step === 'setup' && (
                        <div className="space-y-4">
                            <div className="flex flex-col items-center space-y-4">
                                {qrCodeSvg ? (
                                    <div 
                                        className="p-4 border rounded-lg bg-white"
                                        dangerouslySetInnerHTML={{ __html: qrCodeSvg }}
                                    />
                                ) : (
                                    <div className="w-48 h-48 border rounded-lg flex items-center justify-center bg-muted">
                                        <p className="text-muted-foreground">Loading QR code...</p>
                                    </div>
                                )}
                                
                                <div className="text-center space-y-2">
                                    <p className="text-sm font-medium">Or enter this key manually:</p>
                                    <div className="flex items-center gap-2 justify-center">
                                        <code className="px-3 py-2 bg-muted rounded text-sm font-mono">
                                            {manualSetupKey}
                                        </code>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleCopyKey}
                                        >
                                            {copied ? (
                                                <Check className="h-4 w-4" />
                                            ) : (
                                                <Copy className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="text-sm text-muted-foreground">
                                <p>1. Install an authenticator app like Google Authenticator, Authy, or Microsoft Authenticator</p>
                                <p>2. Scan the QR code or enter the key manually</p>
                                <p>3. Enter the 6-digit code from the app below</p>
                            </div>
                            
                            <Button
                                onClick={() => setStep('verify')}
                                className="w-full"
                            >
                                I've scanned the QR code
                            </Button>
                        </div>
                    )}
                    
                    {step === 'verify' && (
                        <form onSubmit={handleVerify} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="code">Enter verification code</Label>
                                <Input
                                    id="code"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="000000"
                                    maxLength={6}
                                    className="text-center text-lg tracking-widest"
                                    autoComplete="off"
                                />
                                {errors.code && (
                                    <p className="text-sm text-destructive">{errors.code}</p>
                                )}
                            </div>
                            
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setStep('setup')}
                                    className="flex-1"
                                >
                                    Back
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting || verificationCode.length !== 6}
                                    className="flex-1"
                                >
                                    {isSubmitting ? 'Verifying...' : 'Verify'}
                                </Button>
                            </div>
                        </form>
                    )}
                    
                    {step === 'recovery' && recoveryCodes.length > 0 && (
                        <div className="space-y-4">
                            <Alert>
                                <ShieldAlert className="h-4 w-4" />
                                <AlertDescription>
                                    Save these recovery codes in a secure place. You can use them to access your account if you lose your device.
                                </AlertDescription>
                            </Alert>
                            
                            <div className="grid grid-cols-2 gap-2">
                                {recoveryCodes.map((code, index) => (
                                    <code
                                        key={index}
                                        className="p-2 bg-muted rounded text-sm font-mono text-center"
                                    >
                                        {code}
                                    </code>
                                ))}
                            </div>
                            
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        navigator.clipboard.writeText(recoveryCodes.join('\n'));
                                        setCopied(true);
                                        setTimeout(() => setCopied(false), 2000);
                                    }}
                                >
                                    {copied ? 'Copied!' : 'Copy All'}
                                </Button>
                                <Button
                                    type="button"
                                    onClick={onSuccess}
                                    className="flex-1"
                                >
                                    I've saved my codes
                                </Button>
                            </div>
                        </div>
                    )}
                    
                    {errors.code && step !== 'verify' && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleRetry}
                            className="w-full"
                        >
                            Retry Setup
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}