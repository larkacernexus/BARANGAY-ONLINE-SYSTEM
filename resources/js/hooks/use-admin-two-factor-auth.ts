// hooks/use-admin-two-factor-auth.ts
import { useState, useCallback, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';

interface AdminTwoFactorAuthHook {
    qrCodeSvg: string;
    manualSetupKey: string;
    hasSetupData: boolean;
    recoveryCodesList: string[];
    errors: Record<string, string>;
    clearSetupData: () => void;
    fetchSetupData: () => Promise<void>;
    fetchRecoveryCodes: () => Promise<void>;
    regenerateRecoveryCodes: () => Promise<void>;
    confirmSetup: (code: string) => Promise<{ success: boolean; recoveryCodes?: string[] }>;
}

export function useAdminTwoFactorAuth(): AdminTwoFactorAuthHook {
    const [qrCodeSvg, setQrCodeSvg] = useState<string>('');
    const [manualSetupKey, setManualSetupKey] = useState<string>('');
    const [recoveryCodesList, setRecoveryCodesList] = useState<string[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const { props } = usePage();

    // Check for flash data on initial load
    useEffect(() => {
        const flash = (props as any).flash || {};
        
        // Check for qrCodeData in flash (matches resident pattern)
        if (flash.qrCodeData?.qrCodeSvg && flash.qrCodeData?.manualSetupKey) {
            setQrCodeSvg(flash.qrCodeData.qrCodeSvg);
            setManualSetupKey(flash.qrCodeData.manualSetupKey);
        }
        // Fallback to direct flash keys
        else if (flash.qrCodeSvg && flash.manualSetupKey) {
            setQrCodeSvg(flash.qrCodeSvg);
            setManualSetupKey(flash.manualSetupKey);
        }
    }, [props]);

    const fetchSetupData = useCallback(async () => {
        return new Promise<void>((resolve) => {
            router.post(route('admin.security.enable'), {}, {
                preserveScroll: true,
                preserveState: true,
                onSuccess: (page) => {
                    const flash = (page.props as any).flash || {};
                    
                    if (flash.qrCodeData?.qrCodeSvg && flash.qrCodeData?.manualSetupKey) {
                        setQrCodeSvg(flash.qrCodeData.qrCodeSvg);
                        setManualSetupKey(flash.qrCodeData.manualSetupKey);
                        setErrors({});
                    }
                    
                    resolve();
                },
                onError: (errors) => {
                    setErrors(errors);
                    resolve();
                },
            });
        });
    }, []);

    const confirmSetup = useCallback(async (code: string) => {
        return new Promise<{ success: boolean; recoveryCodes?: string[] }>((resolve) => {
            router.post(route('admin.security.confirm'), { code }, {
                preserveScroll: true,
                preserveState: true,
                onSuccess: (page) => {
                    const flash = (page.props as any).flash || {};
                    setErrors({});
                    
                    if (flash.recoveryCodes) {
                        const codes = flash.recoveryCodes as string[];
                        setRecoveryCodesList(codes);
                    }
                    
                    resolve({ 
                        success: true, 
                        recoveryCodes: flash.recoveryCodes as string[] 
                    });
                },
                onError: (errors) => {
                    setErrors(errors);
                    resolve({ success: false });
                },
            });
        });
    }, []);

    const fetchRecoveryCodes = useCallback(async () => {
        return new Promise<void>((resolve) => {
            router.get(route('admin.security.recovery-codes'), {}, {
                preserveScroll: true,
                preserveState: true,
                onSuccess: (page) => {
                    const flash = (page.props as any).flash || {};
                    
                    if (flash.recoveryCodes) {
                        setRecoveryCodesList(flash.recoveryCodes as string[]);
                    }
                    
                    setErrors({});
                    resolve();
                },
                onError: (errors) => {
                    setErrors(errors);
                    resolve();
                },
            });
        });
    }, []);

    const regenerateRecoveryCodes = useCallback(async () => {
        return new Promise<void>((resolve) => {
            router.post(route('admin.security.recovery-codes.regenerate'), {}, {
                preserveScroll: true,
                preserveState: true,
                onSuccess: (page) => {
                    const flash = (page.props as any).flash || {};
                    
                    if (flash.recoveryCodes) {
                        setRecoveryCodesList(flash.recoveryCodes as string[]);
                    }
                    
                    setErrors({});
                    resolve();
                },
                onError: (errors) => {
                    setErrors(errors);
                    resolve();
                },
            });
        });
    }, []);

    const clearSetupData = useCallback(() => {
        setQrCodeSvg('');
        setManualSetupKey('');
        setErrors({});
    }, []);

    return {
        qrCodeSvg,
        manualSetupKey,
        hasSetupData: !!qrCodeSvg && !!manualSetupKey,
        recoveryCodesList,
        errors,
        clearSetupData,
        fetchSetupData,
        fetchRecoveryCodes,
        regenerateRecoveryCodes,
        confirmSetup,
    };
}