import { Loader2 } from 'lucide-react';

interface ModernLoadingOverlayProps {
    loading: boolean;
    message?: string;
}

export const ModernLoadingOverlay = ({ loading, message = "Loading..." }: ModernLoadingOverlayProps) => {
    if (!loading) return null;

    return (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl animate-scale-in">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
                <p className="text-sm text-gray-600 dark:text-gray-300">{message}</p>
            </div>
        </div>
    );
};