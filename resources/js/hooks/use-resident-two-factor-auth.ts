// hooks/use-resident-two-factor-auth.ts
import { useState, useCallback, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';

interface ResidentTwoFactorAuthHook {
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

export function useResidentTwoFactorAuth(): ResidentTwoFactorAuthHook {
    const [qrCodeSvg, setQrCodeSvg] = useState<string>('');
    const [manualSetupKey, setManualSetupKey] = useState<string>('');
    const [recoveryCodesList, setRecoveryCodesList] = useState<string[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const { props } = usePage();

    // Check for flash data on initial load
    useEffect(() => {
        const flash = (props as any).flash || {};
        console.log('📦 [Resident] Initial flash data:', flash);
        
        if (flash.qrCodeSvg && flash.manualSetupKey) {
            console.log('✅ [Resident] Found QR data in flash:', {
                qrCodeSvg: flash.qrCodeSvg ? 'Present' : 'Missing',
                manualSetupKey: flash.manualSetupKey ? 'Present' : 'Missing'
            });
            setQrCodeSvg(flash.qrCodeSvg);
            setManualSetupKey(flash.manualSetupKey);
        }
    }, [props]);

    // Log state changes for debugging
    useEffect(() => {
        console.log('🔐 [Resident] useResidentTwoFactorAuth state:', {
            qrCodeSvg: qrCodeSvg ? '✅ Present' : '❌ Missing',
            manualSetupKey: manualSetupKey ? '✅ Present' : '❌ Missing',
            hasSetupData: !!qrCodeSvg,
            recoveryCodesList: recoveryCodesList.length
        });
    }, [qrCodeSvg, manualSetupKey, recoveryCodesList]);

    const fetchSetupData = useCallback(async () => {
        console.log('📡 [Resident] Fetching setup data...');
        
        return new Promise<void>((resolve) => {
            router.post(route('resident.security.enable'), {}, {
                preserveScroll: true,
                preserveState: true,
                onSuccess: (page) => {
                    console.log('✅ [Resident] Fetch success, page props:', page.props);
                    
                    const flash = (page.props as any).flash || {};
                    console.log('📦 [Resident] Flash data received:', flash);
                    
                    if (flash.qrCodeSvg && flash.manualSetupKey) {
                        console.log('✅ [Resident] Found QR data in flash response');
                        setQrCodeSvg(flash.qrCodeSvg);
                        setManualSetupKey(flash.manualSetupKey);
                        setErrors({});
                    } else {
                        console.warn('⚠️ [Resident] No QR code data in flash response');
                        console.log('Available flash keys:', Object.keys(flash));
                    }
                    
                    resolve();
                },
                onError: (errors) => {
                    console.error('❌ [Resident] Fetch error:', errors);
                    setErrors(errors);
                    resolve();
                },
            });
        });
    }, []);

    const confirmSetup = useCallback(async (code: string) => {
        console.log('📡 [Resident] Confirming setup with code:', code);
        
        return new Promise<{ success: boolean; recoveryCodes?: string[] }>((resolve) => {
            router.post(route('resident.security.confirm'), { code }, {
                preserveScroll: true,
                preserveState: true,
                onSuccess: (page) => {
                    console.log('✅ [Resident] Confirm success, page props:', page.props);
                    
                    const flash = (page.props as any).flash || {};
                    setErrors({});
                    
                    if (flash.recoveryCodes) {
                        const codes = flash.recoveryCodes as string[];
                        console.log('📊 [Resident] Setting recovery codes:', codes.length);
                        setRecoveryCodesList(codes);
                    }
                    
                    resolve({ 
                        success: true, 
                        recoveryCodes: flash.recoveryCodes as string[] 
                    });
                },
                onError: (errors) => {
                    console.error('❌ [Resident] Confirm error:', errors);
                    setErrors(errors);
                    resolve({ success: false });
                },
            });
        });
    }, []);

    const fetchRecoveryCodes = useCallback(async () => {
        console.log('📡 [Resident] Fetching recovery codes...');
        
        return new Promise<void>((resolve) => {
            router.get(route('resident.security.recovery-codes'), {}, {
                preserveScroll: true,
                preserveState: true,
                onSuccess: (page) => {
                    console.log('✅ [Resident] Fetch recovery codes success:', page.props);
                    
                    const flash = (page.props as any).flash || {};
                    
                    if (flash.recoveryCodes) {
                        setRecoveryCodesList(flash.recoveryCodes as string[]);
                    }
                    
                    setErrors({});
                    resolve();
                },
                onError: (errors) => {
                    console.error('❌ [Resident] Fetch recovery codes error:', errors);
                    setErrors(errors);
                    resolve();
                },
            });
        });
    }, []);

    const regenerateRecoveryCodes = useCallback(async () => {
        console.log('📡 [Resident] Regenerating recovery codes...');
        
        return new Promise<void>((resolve) => {
            router.post(route('resident.security.recovery-codes.regenerate'), {}, {
                preserveScroll: true,
                preserveState: true,
                onSuccess: (page) => {
                    console.log('✅ [Resident] Regenerate success:', page.props);
                    
                    const flash = (page.props as any).flash || {};
                    
                    if (flash.recoveryCodes) {
                        setRecoveryCodesList(flash.recoveryCodes as string[]);
                    }
                    
                    setErrors({});
                    resolve();
                },
                onError: (errors) => {
                    console.error('❌ [Resident] Regenerate error:', errors);
                    setErrors(errors);
                    resolve();
                },
            });
        });
    }, []);

    const clearSetupData = useCallback(() => {
        console.log('🧹 [Resident] Clearing setup data');
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