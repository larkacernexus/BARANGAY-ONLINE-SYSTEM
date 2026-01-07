import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Home } from 'lucide-react';

export default function Error500() {
    const handleRefresh = () => {
        window.location.reload();
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
            <Head title="Server Error" />
            
            <div className="max-w-md w-full text-center">
                <div className="mb-8">
                    <div className="text-9xl font-bold text-gray-300 dark:text-gray-700 mb-4">
                        500
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                        Server Error
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">
                        Something went wrong on our servers. Please try again later.
                    </p>
                </div>
                
                <div className="space-y-4">
                    <Button onClick={handleRefresh} className="w-full">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh Page
                    </Button>
                    <Button variant="outline" asChild className="w-full">
                        <a href="/">
                            <Home className="mr-2 h-4 w-4" />
                            Go to Homepage
                        </a>
                    </Button>
                </div>
            </div>
        </div>
    );
}