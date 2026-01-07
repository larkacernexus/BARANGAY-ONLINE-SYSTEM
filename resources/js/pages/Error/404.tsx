import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';

export default function Error404() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
            <Head title="Page Not Found" />
            
            <div className="max-w-md w-full text-center">
                <div className="mb-8">
                    <div className="text-9xl font-bold text-gray-300 dark:text-gray-700 mb-4">
                        404
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                        Page Not Found
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">
                        The page you're looking for doesn't exist or has been moved.
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