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
        console.log('📦 [Admin] Initial flash data:', flash);
        
        // Check for qrCodeData in flash (matches resident pattern)
        if (flash.qrCodeData?.qrCodeSvg && flash.qrCodeData?.manualSetupKey) {
            console.log('✅ [Admin] Found QR data in flash.qrCodeData');
            setQrCodeSvg(flash.qrCodeData.qrCodeSvg);
            setManualSetupKey(flash.qrCodeData.manualSetupKey);
        }
        // Fallback to direct flash keys
        else if (flash.qrCodeSvg && flash.manualSetupKey) {
            console.log('✅ [Admin] Found QR data directly in flash');
            setQrCodeSvg(flash.qrCodeSvg);
            setManualSetupKey(flash.manualSetupKey);
        }
    }, [props]);

    // Log state changes for debugging
    useEffect(() => {
        console.log('🔐 [Admin] Current state:', {
            qrCodeSvg: qrCodeSvg ? '✅ Present' : '❌ Missing',
            manualSetupKey: manualSetupKey ? '✅ Present' : '❌ Missing',
            hasSetupData: !!qrCodeSvg,
            recoveryCodesList: recoveryCodesList.length
        });
    }, [qrCodeSvg, manualSetupKey, recoveryCodesList]);

    const fetchSetupData = useCallback(async () => {
        console.log('📡 [Admin] Fetching setup data...');
        
        return new Promise<void>((resolve) => {
            router.post(route('admin.security.enable'), {}, {
                preserveScroll: true,
                preserveState: true,
                onSuccess: (page) => {
                    console.log('✅ [Admin] Fetch success, page props:', page.props);
                    
                    const flash = (page.props as any).flash || {};
                    console.log('📦 [Admin] Response flash data:', flash);
                    
                    if (flash.qrCodeData?.qrCodeSvg && flash.qrCodeData?.manualSetupKey) {
                        console.log('✅ [Admin] Found QR data in flash.qrCodeData');
                        setQrCodeSvg(flash.qrCodeData.qrCodeSvg);
                        setManualSetupKey(flash.qrCodeData.manualSetupKey);
                        setErrors({});
                    } else {
                        console.warn('⚠️ [Admin] No QR data in response');
                    }
                    
                    resolve();
                },
                onError: (errors) => {
                    console.error('❌ [Admin] Fetch error:', errors);
                    setErrors(errors);
                    resolve();
                },
            });
        });
    }, []);

    const confirmSetup = useCallback(async (code: string) => {
        console.log('📡 [Admin] Confirming setup with code:', code);
        
        return new Promise<{ success: boolean; recoveryCodes?: string[] }>((resolve) => {
            router.post(route('admin.security.confirm'), { code }, {
                preserveScroll: true,
                preserveState: true,
                onSuccess: (page) => {
                    console.log('✅ [Admin] Confirm success:', page.props);
                    
                    const flash = (page.props as any).flash || {};
                    setErrors({});
                    
                    if (flash.recoveryCodes) {
                        const codes = flash.recoveryCodes as string[];
                        console.log('📊 [Admin] Setting recovery codes:', codes.length);
                        setRecoveryCodesList(codes);
                    }
                    
                    resolve({ 
                        success: true, 
                        recoveryCodes: flash.recoveryCodes as string[] 
                    });
                },
                onError: (errors) => {
                    console.error('❌ [Admin] Confirm error:', errors);
                    setErrors(errors);
                    resolve({ success: false });
                },
            });
        });
    }, []);

    const fetchRecoveryCodes = useCallback(async () => {
        console.log('📡 [Admin] Fetching recovery codes...');
        
        return new Promise<void>((resolve) => {
            router.get(route('admin.security.recovery-codes'), {}, {
                preserveScroll: true,
                preserveState: true,
                onSuccess: (page) => {
                    console.log('✅ [Admin] Fetch recovery codes success:', page.props);
                    
                    const flash = (page.props as any).flash || {};
                    
                    if (flash.recoveryCodes) {
                        setRecoveryCodesList(flash.recoveryCodes as string[]);
                    }
                    
                    setErrors({});
                    resolve();
                },
                onError: (errors) => {
                    console.error('❌ [Admin] Fetch recovery codes error:', errors);
                    setErrors(errors);
                    resolve();
                },
            });
        });
    }, []);

    const regenerateRecoveryCodes = useCallback(async () => {
        console.log('📡 [Admin] Regenerating recovery codes...');
        
        return new Promise<void>((resolve) => {
            router.post(route('admin.security.recovery-codes.regenerate'), {}, {
                preserveScroll: true,
                preserveState: true,
                onSuccess: (page) => {
                    console.log('✅ [Admin] Regenerate success:', page.props);
                    
                    const flash = (page.props as any).flash || {};
                    
                    if (flash.recoveryCodes) {
                        setRecoveryCodesList(flash.recoveryCodes as string[]);
                    }
                    
                    setErrors({});
                    resolve();
                },
                onError: (errors) => {
                    console.error('❌ [Admin] Regenerate error:', errors);
                    setErrors(errors);
                    resolve();
                },
            });
        });
    }, []);

    const clearSetupData = useCallback(() => {
        console.log('🧹 [Admin] Clearing setup data');
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