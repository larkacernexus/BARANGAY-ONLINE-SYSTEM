import InputError from '@/components/input-error';
import AppLayout from '@/layouts/resident-app-layout';
import ResidentSettingsLayout from '@/layouts/settings/residentlayout'; 
import { type BreadcrumbItem } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Eye, EyeOff, Key, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

// Hardcoded URL for RESIDENT password update
const RESIDENT_PASSWORD_UPDATE_URL = '/resident/settings/password';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Settings',
        href: '/residentsettings',
    },
    {
        title: 'Password',
        href: RESIDENT_PASSWORD_UPDATE_URL,
    },
];

// Password strength checker
const checkPasswordStrength = (password: string): {
    score: number;
    message: string;
    color: string;
    criteria: {
        length: boolean;
        uppercase: boolean;
        lowercase: boolean;
        number: boolean;
        special: boolean;
    };
} => {
    if (!password) {
        return {
            score: 0,
            message: 'Enter a password',
            color: 'bg-gray-200',
            criteria: {
                length: false,
                uppercase: false,
                lowercase: false,
                number: false,
                special: false
            }
        };
    }

    const criteria = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    const passed = Object.values(criteria).filter(Boolean).length;
    const score = (passed / 5) * 100;

    let message = '';
    let color = '';
    
    if (score < 40) {
        message = 'Weak';
        color = 'bg-red-500';
    } else if (score < 70) {
        message = 'Fair';
        color = 'bg-yellow-500';
    } else if (score < 90) {
        message = 'Good';
        color = 'bg-blue-500';
    } else {
        message = 'Strong';
        color = 'bg-green-500';
    }

    return { score, message, color, criteria };
};

export default function ResidentPassword() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);
    const confirmPasswordInput = useRef<HTMLInputElement>(null);
    
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState({
        score: 0,
        message: '',
        color: '',
        criteria: {
            length: false,
            uppercase: false,
            lowercase: false,
            number: false,
            special: false
        }
    });

    const { props } = usePage<{ auth: { user: { email?: string } } }>();
    
    const { data, setData, put, processing, errors, recentlySuccessful, reset } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    // Update password strength when password changes
    useEffect(() => {
        setPasswordStrength(checkPasswordStrength(data.password));
    }, [data.password]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(RESIDENT_PASSWORD_UPDATE_URL, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                // Reset visibility states
                setShowCurrentPassword(false);
                setShowNewPassword(false);
                setShowConfirmPassword(false);
            },
            onError: (errors) => {
                if (errors.password) {
                    passwordInput.current?.focus();
                } else if (errors.current_password) {
                    currentPasswordInput.current?.focus();
                } else if (errors.password_confirmation) {
                    confirmPasswordInput.current?.focus();
                }
            },
        });
    };

    const isFormValid = () => {
        return (
            data.current_password.trim() !== '' &&
            data.password.trim() !== '' &&
            data.password_confirmation.trim() !== '' &&
            data.password === data.password_confirmation &&
            passwordStrength.score > 40
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Password Settings" />

            <ResidentSettingsLayout>
                <div className="space-y-6">
                    {/* Header with icon */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                                <Lock className="h-8 w-8 text-primary" />
                                Password Settings
                            </h1>
                            <p className="text-muted-foreground mt-2">
                                Update your account password for enhanced security
                            </p>
                        </div>
                        <div className="hidden sm:block">
                            <Key className="h-10 w-10 text-muted-foreground/50" />
                        </div>
                    </div>

                    {/* Security Alert */}
                    <Alert className="bg-blue-50 border-blue-200">
                        <AlertCircle className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-800">
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="font-medium">Security Recommendation:</span>
                                    <p className="text-sm mt-1">
                                        Use a strong, unique password and update it regularly. Your email: 
                                        <span className="font-medium ml-1">{props.auth.user?.email || 'Unknown'}</span>
                                    </p>
                                </div>
                            </div>
                        </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Guidelines */}
                        <div className="lg:col-span-1">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Password Guidelines</CardTitle>
                                    <CardDescription>
                                        Follow these tips for a secure password
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3">
                                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium">At least 8 characters</p>
                                                <p className="text-xs text-muted-foreground">Longer passwords are more secure</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-start gap-3">
                                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium">Mix uppercase & lowercase</p>
                                                <p className="text-xs text-muted-foreground">Use both capital and small letters</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-start gap-3">
                                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium">Include numbers</p>
                                                <p className="text-xs text-muted-foreground">Add digits for complexity</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-start gap-3">
                                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium">Special characters</p>
                                                <p className="text-xs text-muted-foreground">Use !@#$%^&* etc.</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-start gap-3">
                                            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium">Avoid common patterns</p>
                                                <p className="text-xs text-muted-foreground">Don't use "password123" or personal info</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <Separator />
                                    
                                    <div className="text-xs text-muted-foreground">
                                        <p className="font-medium mb-1">Note:</p>
                                        <p>After changing your password, you'll need to log in again on other devices.</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column - Form */}
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Change Password</CardTitle>
                                    <CardDescription>
                                        Enter your current password and set a new one
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {/* Current Password */}
                                        <div className="space-y-2">
                                            <Label htmlFor="current_password" className="flex items-center gap-2">
                                                <Lock className="h-4 w-4" />
                                                Current Password
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id="current_password"
                                                    ref={currentPasswordInput}
                                                    name="current_password"
                                                    type={showCurrentPassword ? "text" : "password"}
                                                    className="pr-10"
                                                    value={data.current_password}
                                                    onChange={(e) => setData('current_password', e.target.value)}
                                                    autoComplete="current-password"
                                                    placeholder="Enter your current password"
                                                    disabled={processing}
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                    tabIndex={-1}
                                                >
                                                    {showCurrentPassword ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </div>
                                            <InputError message={errors.current_password} />
                                        </div>

                                        <Separator />

                                        {/* New Password */}
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="password" className="flex items-center gap-2">
                                                    <Key className="h-4 w-4" />
                                                    New Password
                                                </Label>
                                                <div className="relative">
                                                    <Input
                                                        id="password"
                                                        ref={passwordInput}
                                                        name="password"
                                                        type={showNewPassword ? "text" : "password"}
                                                        className="pr-10"
                                                        value={data.password}
                                                        onChange={(e) => setData('password', e.target.value)}
                                                        autoComplete="new-password"
                                                        placeholder="Create a new password"
                                                        disabled={processing}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                                        tabIndex={-1}
                                                    >
                                                        {showNewPassword ? (
                                                            <EyeOff className="h-4 w-4" />
                                                        ) : (
                                                            <Eye className="h-4 w-4" />
                                                        )}
                                                    </button>
                                                </div>
                                                <InputError message={errors.password} />
                                            </div>

                                            {/* Password Strength Meter */}
                                            {data.password && (
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-muted-foreground">Password strength:</span>
                                                        <span className={`font-medium ${
                                                            passwordStrength.score < 40 ? 'text-red-600' :
                                                            passwordStrength.score < 70 ? 'text-yellow-600' :
                                                            passwordStrength.score < 90 ? 'text-blue-600' : 'text-green-600'
                                                        }`}>
                                                            {passwordStrength.message}
                                                        </span>
                                                    </div>
                                                    <Progress value={passwordStrength.score} className="h-2" />
                                                    
                                                    {/* Password Criteria */}
                                                    <div className="grid grid-cols-2 gap-2 mt-3">
                                                        <div className={`flex items-center gap-2 text-sm ${passwordStrength.criteria.length ? 'text-green-600' : 'text-muted-foreground'}`}>
                                                            {passwordStrength.criteria.length ? (
                                                                <CheckCircle className="h-4 w-4" />
                                                            ) : (
                                                                <AlertCircle className="h-4 w-4" />
                                                            )}
                                                            <span>8+ characters</span>
                                                        </div>
                                                        <div className={`flex items-center gap-2 text-sm ${passwordStrength.criteria.uppercase ? 'text-green-600' : 'text-muted-foreground'}`}>
                                                            {passwordStrength.criteria.uppercase ? (
                                                                <CheckCircle className="h-4 w-4" />
                                                            ) : (
                                                                <AlertCircle className="h-4 w-4" />
                                                            )}
                                                            <span>Uppercase letter</span>
                                                        </div>
                                                        <div className={`flex items-center gap-2 text-sm ${passwordStrength.criteria.lowercase ? 'text-green-600' : 'text-muted-foreground'}`}>
                                                            {passwordStrength.criteria.lowercase ? (
                                                                <CheckCircle className="h-4 w-4" />
                                                            ) : (
                                                                <AlertCircle className="h-4 w-4" />
                                                            )}
                                                            <span>Lowercase letter</span>
                                                        </div>
                                                        <div className={`flex items-center gap-2 text-sm ${passwordStrength.criteria.number ? 'text-green-600' : 'text-muted-foreground'}`}>
                                                            {passwordStrength.criteria.number ? (
                                                                <CheckCircle className="h-4 w-4" />
                                                            ) : (
                                                                <AlertCircle className="h-4 w-4" />
                                                            )}
                                                            <span>Number</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <Separator />

                                        {/* Confirm Password */}
                                        <div className="space-y-2">
                                            <Label htmlFor="password_confirmation" className="flex items-center gap-2">
                                                <Key className="h-4 w-4" />
                                                Confirm New Password
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id="password_confirmation"
                                                    ref={confirmPasswordInput}
                                                    name="password_confirmation"
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    className="pr-10"
                                                    value={data.password_confirmation}
                                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                                    autoComplete="new-password"
                                                    placeholder="Confirm your new password"
                                                    disabled={processing}
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    tabIndex={-1}
                                                >
                                                    {showConfirmPassword ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </div>
                                            <InputError message={errors.password_confirmation} />
                                            {data.password_confirmation && data.password !== data.password_confirmation && (
                                                <p className="text-sm text-red-600">Passwords do not match</p>
                                            )}
                                            {data.password_confirmation && data.password === data.password_confirmation && (
                                                <p className="text-sm text-green-600 flex items-center gap-1">
                                                    <CheckCircle className="h-4 w-4" />
                                                    Passwords match
                                                </p>
                                            )}
                                        </div>

                                        <Separator />

                                        {/* Submit Button */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <Button
                                                    type="submit"
                                                    disabled={processing || !isFormValid()}
                                                    className="min-w-[140px]"
                                                >
                                                    {processing ? (
                                                        <>
                                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
                                                            Updating...
                                                        </>
                                                    ) : (
                                                        'Update Password'
                                                    )}
                                                </Button>

                                                <Transition
                                                    show={recentlySuccessful}
                                                    enter="transition-opacity duration-300"
                                                    enterFrom="opacity-0"
                                                    enterTo="opacity-100"
                                                    leave="transition-opacity duration-300"
                                                    leaveFrom="opacity-100"
                                                    leaveTo="opacity-0"
                                                >
                                                    <div className="flex items-center gap-2 text-green-600">
                                                        <CheckCircle className="h-5 w-5" />
                                                        <span className="font-medium">Password updated successfully!</span>
                                                    </div>
                                                </Transition>
                                            </div>

                                            <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={() => {
                                                    reset();
                                                    setShowCurrentPassword(false);
                                                    setShowNewPassword(false);
                                                    setShowConfirmPassword(false);
                                                }}
                                                disabled={processing}
                                            >
                                                Reset Form
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </ResidentSettingsLayout>
        </AppLayout>
    );
}