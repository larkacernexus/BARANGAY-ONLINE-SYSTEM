import { Spinner } from '@/components/ui/spinner';

interface LoadingOverlayProps {
    isLoading: boolean;
    message?: string;
}

export function LoadingOverlay({ isLoading, message = 'Loading...' }: LoadingOverlayProps) {
    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-background p-6 rounded-lg shadow-lg border">
                <Spinner className="h-8 w-8 mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">{message}</p>
            </div>
        </div>
    );
}