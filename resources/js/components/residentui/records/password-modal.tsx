import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface PasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    document: any | null;
    password: string;
    setPassword: (value: string) => void;
    passwordError: string;
    verifying: boolean;
    onVerify: () => void;
}

export const PasswordModal = ({
    isOpen,
    onClose,
    document,
    password,
    setPassword,
    passwordError,
    verifying,
    onVerify,
}: PasswordModalProps) => {
    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto dark:bg-gray-900 dark:border-gray-800">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg dark:text-white">
                        <Lock className="h-5 w-5 flex-shrink-0 text-amber-500 dark:text-amber-400" />
                        Enter Document Password
                    </DialogTitle>
                    <DialogDescription className="text-sm dark:text-gray-400">
                        This document is password protected. Please enter the password to access it.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-2">
                    {document && (
                        <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border dark:border-gray-700">
                            <div className="font-medium text-sm truncate dark:text-white">{document.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                                {document.file_name}
                            </div>
                            <div className="text-xs text-blue-500 dark:text-blue-400 mt-1">
                                You will be redirected to the document details page
                            </div>
                        </div>
                    )}
                    
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm dark:text-gray-300">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !verifying) {
                                    onVerify();
                                }
                            }}
                            disabled={verifying}
                            className="text-sm sm:text-base dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                        />
                        {passwordError && (
                            <Alert variant="destructive" className="py-2 dark:bg-red-900/20 dark:border-red-800">
                                <AlertCircle className="h-4 w-4 flex-shrink-0 dark:text-red-400" />
                                <AlertDescription className="text-sm dark:text-red-300">
                                    {passwordError}
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                </div>
                
                <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
                    <Button
                        variant="outline"
                        type="button"
                        onClick={onClose}
                        disabled={verifying}
                        className="w-full sm:w-auto dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={onVerify}
                        disabled={verifying || !password.trim()}
                        className="w-full sm:w-auto"
                    >
                        {verifying ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin flex-shrink-0" />
                                Verifying...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                                Verify & Continue
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};