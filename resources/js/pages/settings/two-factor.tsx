import HeadingSmall from '@/components/heading-small';
import TwoFactorRecoveryCodes from '@/components/two-factor-recovery-codes';
import TwoFactorSetupModal from '@/components/two-factor-setup-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTwoFactorAuth } from '@/hooks/use-two-factor-auth';
import AppLayout from '@/layouts/admin-app-layout';
import ResidentSettingsLayout from '@/layouts/settings/layout'; // Use resident layout
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { ShieldBan, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

interface ResidentTwoFactorProps {
    requiresConfirmation?: boolean;
    twoFactorEnabled?: boolean;
}

// Hardcoded URLs for RESIDENT two-factor authentication
const RESIDENT_TWO_FACTOR_URL = '/resident/settings/security';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Two-Factor Authentication',
        href: RESIDENT_TWO_FACTOR_URL,
    },
];

export default function ResidentTwoFactor({
    requiresConfirmation = false,
    twoFactorEnabled = false,
}: ResidentTwoFactorProps) {
    const {
        qrCodeSvg,
        hasSetupData,
        manualSetupKey,
        clearSetupData,
        fetchSetupData,
        recoveryCodesList,
        fetchRecoveryCodes,
        errors,
    } = useTwoFactorAuth();
    
    const [showSetupModal, setShowSetupModal] = useState<boolean>(false);
    
    const enableForm = useForm({});
    const disableForm = useForm({});

    const handleEnableSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        enableForm.post(RESIDENT_TWO_FACTOR_URL, {
            preserveScroll: true,
            onSuccess: () => {
                setShowSetupModal(true);
            },
        });
    };

    const handleDisableSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (confirm('Are you sure you want to disable two-factor authentication?')) {
            disableForm.delete(RESIDENT_TWO_FACTOR_URL, {
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Resident Two-Factor Authentication" />
            {/* Use ResidentSettingsLayout for resident pages */}
            <ResidentSettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title="Two-Factor Authentication"
                        description="Secure your resident account with two-factor authentication"
                    />
                    {twoFactorEnabled ? (
                        <div className="flex flex-col items-start justify-start space-y-4">
                            <Badge variant="default">Enabled</Badge>
                            <p className="text-muted-foreground">
                                Your resident account is protected with two-factor authentication.
                            </p>

                            <TwoFactorRecoveryCodes
                                recoveryCodesList={recoveryCodesList}
                                fetchRecoveryCodes={fetchRecoveryCodes}
                                errors={errors}
                            />

                            <div className="relative inline">
                                <form onSubmit={handleDisableSubmit}>
                                    <Button
                                        variant="destructive"
                                        type="submit"
                                        disabled={disableForm.processing}
                                    >
                                        <ShieldBan className="mr-2 h-4 w-4" /> Disable 2FA
                                    </Button>
                                </form>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-start justify-start space-y-4">
                            <Badge variant="destructive">Disabled</Badge>
                            <p className="text-muted-foreground">
                                Add an extra layer of security to your resident account.
                            </p>

                            <div>
                                {hasSetupData ? (
                                    <Button
                                        onClick={() => setShowSetupModal(true)}
                                    >
                                        <ShieldCheck className="mr-2 h-4 w-4" />
                                        Continue Setup
                                    </Button>
                                ) : (
                                    <form onSubmit={handleEnableSubmit}>
                                        <Button
                                            type="submit"
                                            disabled={enableForm.processing}
                                        >
                                            <ShieldCheck className="mr-2 h-4 w-4" />
                                            Enable 2FA
                                        </Button>
                                    </form>
                                )}
                            </div>
                        </div>
                    )}

                    <TwoFactorSetupModal
                        isOpen={showSetupModal}
                        onClose={() => setShowSetupModal(false)}
                        requiresConfirmation={requiresConfirmation}
                        twoFactorEnabled={twoFactorEnabled}
                        qrCodeSvg={qrCodeSvg}
                        manualSetupKey={manualSetupKey}
                        clearSetupData={clearSetupData}
                        fetchSetupData={fetchSetupData}
                        errors={errors}
                    />
                </div>
            </ResidentSettingsLayout>
        </AppLayout>
    );
}