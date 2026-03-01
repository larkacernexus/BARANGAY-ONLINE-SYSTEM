import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Copy, Save, Shield } from 'lucide-react';

interface HeaderSectionProps {
    duplicateFrom?: {
        id: number;
        fee_code: string;
        fee_type_name: string;
    };
    processing: boolean;
    handleResetForm: () => void;
}

export default function HeaderSection({ duplicateFrom, processing, handleResetForm }: HeaderSectionProps) {
    return (
        <div className="space-y-4">
            {/* Duplicate Banner */}
            {duplicateFrom && (
                <Alert className="border-blue-200 bg-blue-50">
                    <Copy className="h-4 w-4" />
                    <AlertDescription>
                        <div className="flex items-center justify-between">
                            <span>
                                Duplicating from Fee{' '}
                                <strong>
                                    #{duplicateFrom.fee_code}
                                </strong>{' '}
                                ({duplicateFrom.fee_type_name})
                            </span>
                            <Link
                                href={`/admin/fees/${duplicateFrom.id}`}
                                className="text-sm font-medium text-blue-600 hover:text-blue-800"
                            >
                                View Original
                            </Link>
                        </div>
                    </AlertDescription>
                </Alert>
            )}

            {/* Header Actions */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/fees">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {duplicateFrom
                                ? 'Duplicate Fee'
                                : 'Create New Fee'}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            {duplicateFrom
                                ? 'Create a new fee based on an existing one'
                                : 'Issue a new fee, bill, or certificate'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleResetForm}
                    >
                        Reset Form
                    </Button>
                    <Button type="submit" disabled={processing}>
                        <Save className="mr-2 h-4 w-4" />
                        {processing
                            ? 'Creating...'
                            : duplicateFrom
                              ? 'Create Duplicate'
                              : 'Create Fee'}
                    </Button>
                </div>
            </div>

          {/* Philippine Law Compliance Banner - Forced Horizontal */}
<Alert className="border-blue-200 bg-blue-50 w-full block"> {/* Added block to override internal flex */}
    <div className="flex flex-row items-start gap-3 w-full">
        {/* 1. Icon: Prevent shrinking at all costs */}
        <div className="flex-shrink-0 pt-0.5">
            <div className="rounded-full bg-blue-100 p-2">
                <Shield className="h-4 w-4 text-blue-600" />
            </div>
        </div>
        
        {/* 2. Text: flex-1 + min-w-0 is the standard fix for flex-collapsing text */}
        <div className="flex-1 min-w-0"> 
            <h4 className="font-semibold text-blue-800 leading-tight">
                Philippine Law Compliance
            </h4>
            <p className="text-sm text-blue-700 mt-1 whitespace-normal break-words leading-relaxed">
                Statutory discounts (Senior Citizens, PWDs, Solo Parents, Indigents) are 
                applied during payment processing upon presentation of valid government-issued IDs. 
                This ensures compliance with RA 9994, RA 10754, and RA 8972.
            </p>
        </div>
    </div>
</Alert>
        </div>
    );
}