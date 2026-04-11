// components/admin/feesCreate/HeaderSection.tsx

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Copy, Save, Shield } from 'lucide-react';
import { FeeType } from '@/types/admin/fees/fees';

interface HeaderSectionProps {
    duplicateFrom?: FeeType | null;
    processing: boolean;
    handleResetForm: () => void;
}

export default function HeaderSection({ duplicateFrom, processing, handleResetForm }: HeaderSectionProps) {
    return (
        <div className="space-y-4">
            {/* Duplicate Banner */}
            {duplicateFrom && (
                <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
                    <Copy className="h-4 w-4 dark:text-blue-400" />
                    <AlertDescription>
                        <div className="flex items-center justify-between">
                            <span className="dark:text-blue-400">
                                Duplicating from Fee{' '}
                                <strong className="dark:text-blue-300">
                                    #{duplicateFrom.code || duplicateFrom.fee_code}
                                </strong>{' '}
                                ({duplicateFrom.name})
                            </span>
                            <Link
                                href={`/admin/fees/${duplicateFrom.id}`}
                                className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                                View Original
                            </Link>
                        </div>
                    </AlertDescription>
                </Alert>
            )}

            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin/fees">
                        <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            {duplicateFrom ? (
                                <Copy className="h-5 w-5 text-white" />
                            ) : (
                                <Save className="h-5 w-5 text-white" />
                            )}
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight dark:text-gray-100">
                                {duplicateFrom
                                    ? 'Duplicate Fee'
                                    : 'Create New Fee'}
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {duplicateFrom
                                    ? 'Create a new fee based on an existing one'
                                    : 'Issue a new fee, bill, or certificate'}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleResetForm}
                        className="dark:border-gray-600 dark:text-gray-300"
                    >
                        Reset Form
                    </Button>
                    <Button 
                        type="submit" 
                        disabled={processing}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white dark:from-blue-700 dark:to-indigo-700"
                    >
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
            <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 w-full block">
                <div className="flex flex-row items-start gap-3 w-full">
                    {/* 1. Icon: Prevent shrinking at all costs */}
                    <div className="flex-shrink-0 pt-0.5">
                        <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-2">
                            <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                    
                    {/* 2. Text: flex-1 + min-w-0 is the standard fix for flex-collapsing text */}
                    <div className="flex-1 min-w-0"> 
                        <h4 className="font-semibold text-blue-800 dark:text-blue-300 leading-tight">
                            Philippine Law Compliance
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-400 mt-1 whitespace-normal break-words leading-relaxed">
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