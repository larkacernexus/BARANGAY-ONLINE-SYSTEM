// /components/residentui/records/PasswordModal.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, Lock } from 'lucide-react';
import { Document } from '@/types/portal/records/records';

interface PasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    document: Document | null;
    password: string;
    setPassword: (value: string) => void;
    passwordError: string;
    verifying: boolean;
    onVerify: () => void;
}

export const PasswordModal: React.FC<PasswordModalProps> = ({
    isOpen,
    onClose,
    document,
    password,
    setPassword,
    passwordError,
    verifying,
    onVerify
}) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="dark:bg-gray-900 dark:border-gray-700">
                <DialogHeader>
                    <DialogTitle className="dark:text-gray-100">Password Required</DialogTitle>
                    <DialogDescription className="dark:text-gray-400">
                        This document is password protected. Please enter the password to {document?.requires_password ? 'view or download' : 'access'} it.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="password" className="dark:text-gray-300">Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter document password"
                                className="pl-10 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                                onKeyDown={(e) => e.key === 'Enter' && onVerify()}
                                autoFocus
                            />
                        </div>
                        {passwordError && (
                            <p className="text-sm text-red-600 dark:text-red-400">{passwordError}</p>
                        )}
                    </div>
                </div>
                
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={verifying}
                        className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={onVerify}
                        disabled={verifying || !password}
                        className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                    >
                        {verifying ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            'Verify Password'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};