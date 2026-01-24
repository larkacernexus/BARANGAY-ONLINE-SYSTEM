import { useState } from 'react';
import { route } from 'ziggy-js';

interface TwoFactorAuthHook {
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

export function useTwoFactorAuth(): TwoFactorAuthHook {
    const [qrCodeSvg, setQrCodeSvg] = useState<string>('');
    const [manualSetupKey, setManualSetupKey] = useState<string>('');
    const [recoveryCodesList, setRecoveryCodesList] = useState<string[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const fetchSetupData = async () => {
        try {
            setErrors({});
            
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            
            const response = await fetch(route('resident.two-factor.enable'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                setQrCodeSvg(result.data.qrCodeSvg || '');
                setManualSetupKey(result.data.manualSetupKey || '');
                setErrors({});
            } else {
                const errorMessage = result.message || 'Failed to enable 2FA';
                setErrors({ general: errorMessage });
                if (result.errors) {
                    setErrors(result.errors);
                }
            }
        } catch (error) {
            console.error('Error fetching 2FA setup data:', error);
            setErrors({ general: 'Network error occurred' });
        }
    };

    const confirmSetup = async (code: string) => {
        try {
            setErrors({});
            
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            
            const response = await fetch(route('resident.two-factor.confirm'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({ code }),
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                setErrors({});
                if (result.data?.recoveryCodes) {
                    setRecoveryCodesList(result.data.recoveryCodes);
                }
                return { 
                    success: true, 
                    recoveryCodes: result.data?.recoveryCodes 
                };
            } else {
                const errorMessage = result.message || 'Invalid code';
                setErrors({ code: errorMessage });
                if (result.errors) {
                    setErrors(result.errors);
                }
                return { success: false };
            }
        } catch (error) {
            console.error('Error confirming 2FA:', error);
            setErrors({ general: 'Network error occurred' });
            return { success: false };
        }
    };

    const fetchRecoveryCodes = async () => {
        try {
            setErrors({});
            
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            
            const response = await fetch(route('resident.two-factor.recovery-codes'), {
                method: 'GET',
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                setRecoveryCodesList(result.data?.recoveryCodes || []);
                setErrors({});
            } else {
                const errorMessage = result.message || 'Failed to fetch recovery codes';
                setErrors({ general: errorMessage });
            }
        } catch (error) {
            console.error('Error fetching recovery codes:', error);
            setErrors({ general: 'Network error occurred' });
        }
    };

    const regenerateRecoveryCodes = async () => {
        try {
            setErrors({});
            
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            
            const response = await fetch(route('resident.two-factor.regenerate-recovery-codes'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                setRecoveryCodesList(result.data?.recoveryCodes || []);
                setErrors({});
            } else {
                const errorMessage = result.message || 'Failed to regenerate recovery codes';
                setErrors({ general: errorMessage });
            }
        } catch (error) {
            console.error('Error regenerating recovery codes:', error);
            setErrors({ general: 'Network error occurred' });
        }
    };

    const clearSetupData = () => {
        setQrCodeSvg('');
        setManualSetupKey('');
        setErrors({});
    };

    return {
        qrCodeSvg,
        manualSetupKey,
        hasSetupData: !!qrCodeSvg,
        recoveryCodesList,
        errors,
        clearSetupData,
        fetchSetupData,
        fetchRecoveryCodes,
        regenerateRecoveryCodes,
        confirmSetup,
    };
}