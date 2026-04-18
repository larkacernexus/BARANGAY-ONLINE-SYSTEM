// components/admin/households/create/CredentialsModal.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';

interface Credentials {
    username: string;
    password: string;
    name: string;
    email?: string;
    user_id?: number;
}

interface PageProps extends Record<string, any> {
    flash?: {
        user_credentials?: Credentials;
    };
}

export default function CredentialsModal() {
    const { flash } = usePage<PageProps>().props;
    const [open, setOpen] = useState(false);
    const [credentials, setCredentials] = useState<Credentials | null>(null);

    useEffect(() => {
        if (flash?.user_credentials) {
            setCredentials(flash.user_credentials);
            setOpen(true);
        }
    }, [flash]);

    if (!credentials) return null;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-blue-600" />
                        User Account Created
                    </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                        A user account has been created for the household head.
                    </p>
                    
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">Name:</span>
                            <span className="font-mono text-sm bg-gray-100 px-3 py-1 rounded">
                                {credentials.name}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">Username:</span>
                            <span className="font-mono text-sm bg-gray-100 px-3 py-1 rounded">
                                {credentials.username}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">Initial Password:</span>
                            <span className="font-mono text-sm bg-gray-100 px-3 py-1 rounded">
                                {credentials.password}
                            </span>
                        </div>
                    </div>
                    
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-amber-800 mb-1">
                                    Important Security Notice
                                </p>
                                <ul className="text-xs text-amber-700 space-y-1 list-disc list-inside">
                                    <li>User must change password on first login</li>
                                    <li>Credentials are only shown once</li>
                                    <li>Store this information securely</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="flex justify-end">
                    <Button onClick={() => setOpen(false)}>
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}