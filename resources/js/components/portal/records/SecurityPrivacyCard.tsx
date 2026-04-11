// components/portal/records/SecurityPrivacyCard.tsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Shield, X } from 'lucide-react';

// Use a more flexible type that matches the shape
interface SecurityPrivacyFormData {
    is_public: boolean;
    requires_password: boolean;
    password: string;
    confirm_password: string;
    [key: string]: any; // Allow other properties
}

interface SecurityPrivacyCardProps {
    data: SecurityPrivacyFormData;
    setData: (key: string, value: any) => void;
    processing: boolean;
    errors: Record<string, string>;
}

export function SecurityPrivacyCard({ data, setData, processing, errors }: SecurityPrivacyCardProps) {
    return (
        <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-white">
                    <Shield className="h-5 w-5" />
                    Security & Privacy
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="block font-medium dark:text-gray-300">Make Document Public</Label>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Anyone can view this document</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={data.is_public ?? true} // Default to true if undefined
                            onChange={(e) => setData('is_public', e.target.checked)}
                            disabled={processing}
                            className="h-5 w-5 dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>
                    
                    <Separator className="dark:bg-gray-700" />
                    
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="block font-medium dark:text-gray-300">Password Protect</Label>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Require password to view</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={data.requires_password ?? false}
                                onChange={(e) => {
                                    setData('requires_password', e.target.checked);
                                    // Clear password fields when turning OFF
                                    if (!e.target.checked) {
                                        setData('password', '');
                                        setData('confirm_password', '');
                                    }
                                }}
                                disabled={processing}
                                className="h-5 w-5 dark:bg-gray-700 dark:border-gray-600"
                            />
                        </div>
                        
                        {data.requires_password && (
                            <div className="space-y-3 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="dark:text-gray-300">Password *</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type="password"
                                            value={data.password || ''}
                                            onChange={(e) => setData('password', e.target.value)}
                                            placeholder="Enter password"
                                            disabled={processing}
                                            className="dark:bg-gray-900 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-500"
                                        />
                                        {data.password && (
                                            <button
                                                type="button"
                                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                                onClick={() => setData('password', '')}
                                                tabIndex={-1}
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                    {errors.password && (
                                        <p className="text-sm text-red-600 dark:text-red-400">{errors.password}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirm_password" className="dark:text-gray-300">Confirm Password *</Label>
                                    <div className="relative">
                                        <Input
                                            id="confirm_password"
                                            type="password"
                                            value={data.confirm_password || ''}
                                            onChange={(e) => setData('confirm_password', e.target.value)}
                                            placeholder="Confirm password"
                                            disabled={processing}
                                            className="dark:bg-gray-900 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-500"
                                        />
                                        {data.confirm_password && (
                                            <button
                                                type="button"
                                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                                onClick={() => setData('confirm_password', '')}
                                                tabIndex={-1}
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                    {errors.confirm_password && (
                                        <p className="text-sm text-red-600 dark:text-red-400">{errors.confirm_password}</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}