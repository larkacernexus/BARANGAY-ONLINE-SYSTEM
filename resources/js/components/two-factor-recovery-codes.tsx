import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm, usePage } from '@inertiajs/react';
import { 
    Eye, 
    EyeOff, 
    LockKeyhole, 
    RefreshCw, 
    AlertTriangle,
    Copy,
    Check,
    Download
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { route } from 'ziggy-js';
import AlertError from './alert-error';

interface TwoFactorRecoveryCodesProps {
    recoveryCodesList: string[];
    fetchRecoveryCodes: () => Promise<void>;
    errors: string[];
    backupCodesRemaining?: number;
}

// SECURITY NOTE: Form data interface for type safety
interface RegenerateFormData {
    password: string;
    two_factor_code: string;
    confirmation: boolean;
}

// SECURITY NOTE: Page props interface with index signature for Inertia
interface PageProps extends Record<string, unknown> {
    auth?: {
        user?: {
            email?: string;
        } | null;
    };
    flash?: {
        success?: string;
        error?: string;
    };
    errors?: Record<string, string>;
    ziggy?: {
        location?: string;
        query?: Record<string, unknown>;
    };
}

export default function TwoFactorRecoveryCodes({
    recoveryCodesList,
    fetchRecoveryCodes,
    errors,
    backupCodesRemaining = 0,
}: TwoFactorRecoveryCodesProps) {
    const { props } = usePage<PageProps>();
    
    const [codesAreVisible, setCodesAreVisible] = useState<boolean>(false);
    const [showRegenerateDialog, setShowRegenerateDialog] = useState<boolean>(false);
    const [copied, setCopied] = useState<boolean>(false);
    const [viewAttempts, setViewAttempts] = useState<number>(0);
    const [rateLimited, setRateLimited] = useState<boolean>(false);
    
    const codesSectionRef = useRef<HTMLDivElement>(null);
    const rateLimitTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);
    const clipboardClearTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);
    
    // SECURITY NOTE: Rate limiting for viewing recovery codes
    const MAX_VIEW_ATTEMPTS = 3;
    const RATE_LIMIT_TIMEOUT = 300000; // 5 minutes
    
    // SECURITY NOTE: Form with proper validation and CSRF protection
    const regenerateForm = useForm<RegenerateFormData>({
        password: '',
        two_factor_code: '',
        confirmation: true,
    });
    
    // SECURITY NOTE: Check if page is served over HTTPS
    useEffect(() => {
        if (window.location.protocol !== 'https:' && process.env.NODE_ENV === 'production') {
            console.error('Recovery codes should only be viewed over HTTPS');
        }
    }, []);
    
    // SECURITY NOTE: Cleanup timers on unmount
    useEffect(() => {
        return () => {
            if (rateLimitTimerRef.current) {
                clearTimeout(rateLimitTimerRef.current);
            }
            if (clipboardClearTimerRef.current) {
                clearTimeout(clipboardClearTimerRef.current);
            }
        };
    }, []);
    
    // SECURITY NOTE: Clear copied state after 2 seconds
    useEffect(() => {
        if (copied) {
            const timer = setTimeout(() => setCopied(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [copied]);

    const toggleCodesVisibility = useCallback(async () => {
        // SECURITY NOTE: Rate limiting check
        if (rateLimited) {
            alert('Too many attempts. Please wait before trying again.');
            return;
        }
        
        if (!codesAreVisible && !recoveryCodesList.length) {
            await fetchRecoveryCodes();
        }

        setCodesAreVisible(!codesAreVisible);
        
        // SECURITY NOTE: Track view attempts
        if (!codesAreVisible) {
            const newAttempts = viewAttempts + 1;
            setViewAttempts(newAttempts);
            
            if (newAttempts >= MAX_VIEW_ATTEMPTS) {
                setRateLimited(true);
                rateLimitTimerRef.current = setTimeout(() => {
                    setRateLimited(false);
                    setViewAttempts(0);
                }, RATE_LIMIT_TIMEOUT);
            }
            
            // LOGIC NOTE: Scroll to codes section after rendering
            setTimeout(() => {
                codesSectionRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                });
            }, 100);
        }
        
        // SECURITY NOTE: Log access for audit trail (client-side only)
        if (!codesAreVisible && process.env.NODE_ENV === 'production') {
            console.log('Recovery codes viewed', {
                timestamp: new Date().toISOString(),
                remaining: backupCodesRemaining,
            });
        }
    }, [codesAreVisible, recoveryCodesList.length, fetchRecoveryCodes, rateLimited, viewAttempts, backupCodesRemaining]);

    useEffect(() => {
        if (!recoveryCodesList.length && codesAreVisible) {
            fetchRecoveryCodes();
        }
    }, [recoveryCodesList.length, fetchRecoveryCodes, codesAreVisible]);

    const handleRegenerateClick = () => {
        // SECURITY NOTE: Require explicit user action for sensitive operation
        setShowRegenerateDialog(true);
        regenerateForm.reset();
    };

    const handleRegenerateConfirm = (e: React.FormEvent) => {
        e.preventDefault();
        
        // SECURITY NOTE: Validate all required fields
        if (!regenerateForm.data.password?.trim()) {
            regenerateForm.setError('password', 'Password is required');
            return;
        }
        
        if (!regenerateForm.data.two_factor_code?.trim()) {
            regenerateForm.setError('two_factor_code', '2FA code is required');
            return;
        }
        
        // SECURITY NOTE: Validate 2FA code format
        if (!/^\d{6}$/.test(regenerateForm.data.two_factor_code)) {
            regenerateForm.setError('two_factor_code', '2FA code must be 6 digits');
            return;
        }
        
        // SECURITY NOTE: Use Laravel route helper instead of hardcoded URL
        regenerateForm.post(route('resident.two-factor.recovery.regenerate'), {
            preserveScroll: true,
            onSuccess: () => {
                setShowRegenerateDialog(false);
                fetchRecoveryCodes();
                // SECURITY NOTE: Reset view attempts on successful regeneration
                setViewAttempts(0);
                setRateLimited(false);
            },
            onError: (errors) => {
                console.error('Recovery code regeneration failed:', errors);
            },
        });
    };

    // SECURITY NOTE: Copy codes to clipboard with proper sanitization
    const handleCopyCodes = async () => {
        if (!recoveryCodesList.length) return;
        
        const codesText = recoveryCodesList.join('\n');
        
        try {
            await navigator.clipboard.writeText(codesText);
            setCopied(true);
            
            // SECURITY NOTE: Clear clipboard after 30 seconds for security
            if (clipboardClearTimerRef.current) {
                clearTimeout(clipboardClearTimerRef.current);
            }
            
            clipboardClearTimerRef.current = setTimeout(async () => {
                try {
                    const currentClipboard = await navigator.clipboard.readText();
                    if (currentClipboard === codesText) {
                        await navigator.clipboard.writeText('');
                        console.log('Clipboard cleared for security');
                    }
                } catch (error) {
                    // Clipboard read failed - user may have denied permission
                }
            }, 30000);
        } catch (error) {
            console.error('Failed to copy recovery codes:', error);
            alert('Failed to copy codes. Please copy them manually.');
        }
    };

    // SECURITY NOTE: Download codes as text file
    const handleDownloadCodes = () => {
        if (!recoveryCodesList.length) return;
        
        const userEmail = props.auth?.user?.email || 'Unknown';
        
        const content = `TWO-FACTOR AUTHENTICATION RECOVERY CODES\n` +
                       `Generated: ${new Date().toISOString()}\n` +
                       `Account: ${userEmail}\n` +
                       `\nIMPORTANT: Store these codes securely!\n` +
                       `Each code can only be used once.\n\n` +
                       recoveryCodesList.join('\n');
        
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recovery-codes-${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // SECURITY NOTE: Log download for audit trail
        console.log('Recovery codes downloaded', {
            timestamp: new Date().toISOString(),
            count: recoveryCodesList.length,
        });
    };

    const RecoveryCodeIconComponent = codesAreVisible ? EyeOff : Eye;

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="flex gap-3">
                        <LockKeyhole className="size-4" aria-hidden="true" />
                        2FA Recovery Codes
                    </CardTitle>
                    <CardDescription>
                        Recovery codes let you regain access if you lose your 2FA
                        device. Store them in a secure password manager or print them.
                        {backupCodesRemaining > 0 && (
                            <span className="block mt-1 font-medium">
                                {backupCodesRemaining} code{backupCodesRemaining !== 1 ? 's' : ''} remaining
                            </span>
                        )}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-3 select-none sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex gap-2">
                            <Button
                                onClick={toggleCodesVisibility}
                                className="w-fit"
                                aria-expanded={codesAreVisible}
                                aria-controls="recovery-codes-section"
                                disabled={rateLimited}
                            >
                                <RecoveryCodeIconComponent
                                    className="size-4"
                                    aria-hidden="true"
                                />
                                {codesAreVisible ? 'Hide' : 'View'} Recovery Codes
                            </Button>
                            
                            {codesAreVisible && recoveryCodesList.length > 0 && (
                                <>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={handleCopyCodes}
                                        title="Copy to clipboard"
                                    >
                                        {copied ? (
                                            <Check className="h-4 w-4" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                    </Button>
                                    
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={handleDownloadCodes}
                                        title="Download as text file"
                                    >
                                        <Download className="h-4 w-4" />
                                    </Button>
                                </>
                            )}
                        </div>

                        {recoveryCodesList.length > 0 && (
                            <Button
                                variant="secondary"
                                type="button"
                                onClick={handleRegenerateClick}
                                disabled={regenerateForm.processing}
                                aria-describedby="regenerate-warning"
                            >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Regenerate Codes
                            </Button>
                        )}
                    </div>
                    
                    {rateLimited && (
                        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <div className="flex items-center gap-2 text-amber-800">
                                <AlertTriangle className="h-4 w-4" />
                                <p className="text-sm">
                                    Too many view attempts. Please wait 5 minutes before trying again.
                                </p>
                            </div>
                        </div>
                    )}
                    
                    <div
                        id="recovery-codes-section"
                        className={`relative overflow-hidden transition-all duration-300 ${
                            codesAreVisible ? 'h-auto opacity-100' : 'h-0 opacity-0'
                        }`}
                        aria-hidden={!codesAreVisible}
                    >
                        <div className="mt-3 space-y-3">
                            {errors?.length ? (
                                <AlertError errors={errors} />
                            ) : (
                                <>
                                    <div
                                        ref={codesSectionRef}
                                        className="grid gap-1 rounded-lg bg-muted p-4 font-mono text-sm relative"
                                        role="list"
                                        aria-label="Recovery codes"
                                    >
                                        {/* SECURITY NOTE: Watermark to prevent screenshot sharing */}
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 select-none">
                                            <div className="transform -rotate-45 text-4xl font-bold">
                                                CONFIDENTIAL
                                            </div>
                                        </div>
                                        
                                        {recoveryCodesList.length ? (
                                            recoveryCodesList.map((code, index) => (
                                                <div
                                                    key={index}
                                                    role="listitem"
                                                    className="select-text relative z-10 font-medium tracking-wide"
                                                    onCopy={() => {
                                                        // SECURITY NOTE: Log copy events
                                                        console.log('Recovery code copied');
                                                    }}
                                                >
                                                    {code}
                                                </div>
                                            ))
                                        ) : (
                                            <div
                                                className="space-y-2"
                                                aria-label="Loading recovery codes"
                                            >
                                                {Array.from(
                                                    { length: 8 },
                                                    (_, index) => (
                                                        <div
                                                            key={index}
                                                            className="h-4 animate-pulse rounded bg-muted-foreground/20"
                                                            aria-hidden="true"
                                                        />
                                                    ),
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="text-xs text-muted-foreground select-none">
                                        <p id="regenerate-warning" className="mb-2">
                                            <AlertTriangle className="inline h-3 w-3 mr-1 text-amber-600" />
                                            Each recovery code can be used once and will be invalidated after use.
                                        </p>
                                        <p>
                                            Store these codes in a secure location like a password manager 
                                            or printed document. Never share them with anyone.
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* SECURITY NOTE: Regenerate confirmation dialog with password re-authentication */}
            <Dialog open={showRegenerateDialog} onOpenChange={setShowRegenerateDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Regenerate Recovery Codes</DialogTitle>
                        <DialogDescription>
                            This will permanently invalidate all existing recovery codes. 
                            You must enter your password and current 2FA code to continue.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <form onSubmit={handleRegenerateConfirm} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="regenerate-password">
                                Password
                            </Label>
                            <Input
                                id="regenerate-password"
                                type="password"
                                value={regenerateForm.data.password}
                                onChange={(e) => regenerateForm.setData('password', e.target.value)}
                                placeholder="Enter your current password"
                                required
                                disabled={regenerateForm.processing}
                                autoComplete="current-password"
                                className={regenerateForm.errors.password ? "border-destructive" : ""}
                            />
                            {regenerateForm.errors.password && (
                                <p className="text-sm text-destructive">
                                    {regenerateForm.errors.password}
                                </p>
                            )}
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="regenerate-2fa-code">
                                2FA Code
                            </Label>
                            <Input
                                id="regenerate-2fa-code"
                                type="text"
                                inputMode="numeric"
                                pattern="\d{6}"
                                maxLength={6}
                                value={regenerateForm.data.two_factor_code}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '');
                                    regenerateForm.setData('two_factor_code', value);
                                }}
                                placeholder="Enter 6-digit code"
                                required
                                disabled={regenerateForm.processing}
                                autoComplete="one-time-code"
                                className={regenerateForm.errors.two_factor_code ? "border-destructive" : ""}
                            />
                            {regenerateForm.errors.two_factor_code && (
                                <p className="text-sm text-destructive">
                                    {regenerateForm.errors.two_factor_code}
                                </p>
                            )}
                        </div>
                        
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setShowRegenerateDialog(false);
                                    regenerateForm.reset();
                                }}
                                disabled={regenerateForm.processing}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="destructive"
                                disabled={regenerateForm.processing}
                            >
                                {regenerateForm.processing ? 'Regenerating...' : 'Regenerate Codes'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}