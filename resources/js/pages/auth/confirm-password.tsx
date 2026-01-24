import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';

// Hardcoded URL for RESIDENT password confirmation
const RESIDENT_CONFIRM_PASSWORD_URL = route('resident.password.confirm.store');

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(RESIDENT_CONFIRM_PASSWORD_URL, {
            preserveScroll: true,
            onSuccess: () => {
                reset('password');
            },
        });
    };

    return (
        <AuthLayout
            title="Confirm your password"
            description="This is a secure area of the resident portal. Please confirm your password before continuing."
        >
            <Head title="Confirm password - Resident" />

            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Enter your resident password"
                            autoComplete="current-password"
                            autoFocus
                        />

                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center">
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={processing}
                            data-test="confirm-password-button"
                        >
                            {processing && <Spinner />}
                            Confirm password
                        </Button>
                    </div>
                </div>
            </form>
        </AuthLayout>
    );
}