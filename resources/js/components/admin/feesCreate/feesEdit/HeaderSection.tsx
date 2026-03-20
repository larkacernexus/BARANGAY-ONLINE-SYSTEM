// components/admin/feesEdit/HeaderSection.tsx

import React from 'react';
import { Link } from '@inertiajs/react';
import { ArrowLeft, RotateCcw, XCircle, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface HeaderSectionProps {
    fee: any;
    processing: boolean;
    handleResetForm: () => void;
    onCancel: () => void;
}

export default function HeaderSection({ 
    fee, 
    processing, 
    handleResetForm,
    onCancel 
}: HeaderSectionProps) {
    const getStatusBadgeColor = (status: string) => {
        switch(status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'issued': return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400';
            case 'paid': return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900 dark:text-gray-300';
        }
    };

    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Link href={`/admin/fees/${fee.id}`}>
                    <Button variant="ghost" size="icon" className="dark:text-gray-300 dark:hover:bg-gray-900">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Edit className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight dark:text-white">
                                Edit Fee: {fee.fee_code}
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusBadgeColor(fee.status)}`}>
                                    {fee.status.charAt(0).toUpperCase() + fee.status.slice(1)}
                                </span>
                                <p className="text-sm text-muted-foreground dark:text-gray-400">
                                    Created: {new Date(fee.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleResetForm}
                    disabled={processing}
                    className="dark:border-gray-600 dark:text-gray-300"
                >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset Changes
                </Button>

                {fee.status === 'pending' && (
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={onCancel}
                        disabled={processing}
                    >
                        <XCircle className="mr-2 h-4 w-4" />
                        Cancel Fee
                    </Button>
                )}
            </div>
        </div>
    );
}