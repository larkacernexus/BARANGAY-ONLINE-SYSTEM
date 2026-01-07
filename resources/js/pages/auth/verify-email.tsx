// Components
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { Head, useForm } from '@inertiajs/react';

// Hardcoded URLs
const VERIFICATION_SEND_URL = '/email/verification-notification';
const LOGOUT_URL = '/logout';

export default function VerifyEmail({ status }: { status?: string }) {
    // Use the useForm hook
    const { data, setData, post, processing, errors } = useForm({});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(VERIFICATION_SEND_URL);
    };

    return (
        <AuthLayout
            title="Verify email"
            description="Please verify your email address by clicking on the link we just emailed to you."
        >
            <Head title="Email verification" />

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    A new verification link has been sent to the email address
                    you provided during registration.
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 text-center">
                <Button type="submit" disabled={processing} variant="secondary">
                    {processing && <Spinner />}
                    Resend verification email
                </Button>

                <TextLink
                    href={LOGOUT_URL}
                    className="mx-auto block text-sm"
                >
                    Log out
                </TextLink>
            </form>
        </AuthLayout>
    );
}