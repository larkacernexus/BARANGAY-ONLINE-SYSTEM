// components/admin/households/create/import/ImportHouseholdModal.tsx

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle, Download, Upload, X, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { router } from '@inertiajs/react';

interface Purok {
    id: number;
    name: string;
}

interface Role {
    id: number;
    name: string;
}

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    downloadTemplate: () => void;
    downloadGuide: () => void;
    downloadEmptyTemplate: () => void;
    onImportSuccess: () => void;
    importUrl: string;
    puroks: Purok[];
    roles: Role[];
}

export default function ImportHouseholdModal({
    open,
    onOpenChange,
    downloadTemplate,
    downloadGuide,
    downloadEmptyTemplate,
    onImportSuccess,
    importUrl,
    puroks,
    roles
}: Props) {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (!selectedFile.name.endsWith('.csv')) {
                setError('Please upload a CSV file');
                setFile(null);
                return;
            }
            setFile(selectedFile);
            setError(null);
        }
    };

    const handleSubmit = async () => {
        if (!file) {
            setError('Please select a file to upload');
            return;
        }

        setIsUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        router.post(importUrl, formData, {
            onSuccess: () => {
                toast.success('Households imported successfully');
                onImportSuccess();
                setFile(null);
                setIsUploading(false);
            },
            onError: (errors) => {
                setError(errors.message || 'Failed to import households');
                setIsUploading(false);
            },
        });
    };

    const clearFile = () => {
        setFile(null);
        setError(null);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg dark:bg-gray-900">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 dark:text-gray-100">
                        <Upload className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        Import Households
                    </DialogTitle>
                    <DialogDescription className="dark:text-gray-400">
                        Upload a CSV file to import households in bulk
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Template Downloads */}
                    <div className="space-y-2">
                        <Label className="dark:text-gray-300">Template Files</Label>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={downloadTemplate}
                                className="dark:border-gray-600 dark:text-gray-300"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                With Sample Data
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={downloadEmptyTemplate}
                                className="dark:border-gray-600 dark:text-gray-300"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Empty Template
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={downloadGuide}
                                className="dark:border-gray-600 dark:text-gray-300"
                            >
                                <FileText className="h-4 w-4 mr-2" />
                                Import Guide
                            </Button>
                        </div>
                    </div>

                    {/* File Upload */}
                    <div className="space-y-2">
                        <Label htmlFor="csv-file" className="dark:text-gray-300">
                            CSV File <span className="text-red-500">*</span>
                        </Label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Input
                                    id="csv-file"
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileChange}
                                    className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 cursor-pointer"
                                />
                            </div>
                            {file && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={clearFile}
                                    className="text-red-600 hover:text-red-700"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                        {file && (
                            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                                <CheckCircle className="h-4 w-4" />
                                Selected: {file.name}
                            </div>
                        )}
                        {error && (
                            <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                                <AlertCircle className="h-4 w-4" />
                                {error}
                            </div>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Maximum file size: 10MB. Only CSV files are accepted.
                        </p>
                    </div>

                    {/* Requirements */}
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                            Required Columns:
                        </p>
                        <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1 list-disc list-inside">
                            <li>household_number (optional - auto-generated if empty)</li>
                            <li>head_of_family (required)</li>
                            <li>address (required)</li>
                            <li>purok_name (required - must match existing purok)</li>
                            <li>contact_number (required)</li>
                            <li>email (optional)</li>
                            <li>remarks (optional)</li>
                        </ul>
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="dark:border-gray-600 dark:text-gray-300"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!file || isUploading}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                        {isUploading ? 'Importing...' : 'Import Households'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}