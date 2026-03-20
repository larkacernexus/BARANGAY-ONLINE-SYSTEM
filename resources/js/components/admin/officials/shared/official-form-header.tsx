// components/admin/officials/shared/official-form-header.tsx
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, UserPlus, Loader2 } from 'lucide-react';

interface OfficialFormHeaderProps {
    title: string;
    subtitle: string;
    processing: boolean;
    onSave?: () => void;
    submitButtonText?: string;
}

export function OfficialFormHeader({ 
    title, 
    subtitle, 
    processing, 
    onSave,
    submitButtonText = 'Save Official'
}: OfficialFormHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <Link href="/admin/officials">
                    <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                </Link>
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-700 dark:to-orange-700 flex items-center justify-center shadow-lg shadow-amber-500/20">
                        <UserPlus className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight dark:text-gray-100">
                            {title}
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {subtitle}
                        </p>
                    </div>
                </div>
            </div>
            {onSave && (
                <Button 
                    type="submit" 
                    disabled={processing}
                    onClick={onSave}
                    className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white dark:from-amber-700 dark:to-orange-700"
                >
                    {processing ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                        <Save className="h-4 w-4 mr-2" />
                    )}
                    {processing ? 'Saving...' : submitButtonText}
                </Button>
            )}
        </div>
    );
}