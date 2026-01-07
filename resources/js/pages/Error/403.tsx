import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Shield, Home, ArrowLeft } from 'lucide-react';

export default function Error403() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
            <Head title="Access Denied" />
            
            <div className="max-w-md w-full text-center">
                <div className="mb-8">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-100 dark:bg-red-900/20 mb-6">
                        <Shield className="h-12 w-12 text-red-600 dark:text-red-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                        Access Denied
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">
                        You don't have permission to access this page.
                    </p>
                </div>
                
                <div className="space-y-4">
                    <Button asChild className="w-full">
                        <a href="/">
                            <Home className="mr-2 h-4 w-4" />
                            Go to Homepage
                        </a>
                    </Button>
                    <Button variant="outline" asChild className="w-full">
                        <a href="#" onClick={() => window.history.back()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Go Back
                        </a>
                    </Button>
                </div>
            </div>
        </div>
    );
}