import { useState, useRef } from 'react';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
    AlertCircle, 
    CheckCircle2, 
    Download, 
    FileText, 
    Upload 
} from 'lucide-react';
import { router } from '@inertiajs/react';

interface ImportResult {
    success: number;
    failed: number;
    errors: Array<{
        row: number;
        errors: Record<string, string[]>;
    }>;
}

interface ImportModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    downloadTemplate: () => void;
    downloadGuide: () => void;
    downloadEmptyTemplate: () => void;
    onImportSuccess?: () => void;
    importUrl: string;
}

export default function ImportModal({ 
    open, 
    onOpenChange,
    downloadTemplate,
    downloadGuide,
    downloadEmptyTemplate,
    onImportSuccess,
    importUrl
}: ImportModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [importing, setImporting] = useState(false);
    const [result, setResult] = useState<ImportResult | null>(null);
    const [error, setError] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] || null;
        if (selectedFile) {
            setFile(selectedFile);
            setError('');
            setResult(null);
        }
    };

    const handleImport = async () => {
        if (!file) return;

        setImporting(true);
        setError('');
        
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('file', file);

        try {
            // Use axios or fetch to make the POST request
            const response = await fetch(importUrl, {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                setResult(data);
                if (onImportSuccess) {
                    onImportSuccess();
                }
            } else {
                setError(data.message || 'Import failed. Please try again.');
            }
        } catch (err) {
            setError('An error occurred during import.');
            console.error('Import error:', err);
        } finally {
            setImporting(false);
        }
    };

    const handleReset = () => {
        setFile(null);
        setResult(null);
        setError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleClose = () => {
        handleReset();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Upload className="h-5 w-5" />
                        Import Residents
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {!result ? (
                        <>
                            {/* File Upload Section */}
                            <div className="space-y-4">
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                    <Upload className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                                    <p className="text-sm text-gray-600 mb-4">
                                        Upload CSV file
                                    </p>
                                    <div className="relative">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".csv"
                                            onChange={handleFileChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        <Button variant="outline">
                                            Select File
                                        </Button>
                                    </div>
                                    {file && (
                                        <p className="text-sm text-gray-700 mt-3">
                                            Selected: {file.name}
                                        </p>
                                    )}
                                </div>

                                {/* Error Display */}
                                {error && (
                                    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded">
                                        <AlertCircle className="h-4 w-4" />
                                        {error}
                                    </div>
                                )}

                                {/* Template Download Options */}
                                <div className="space-y-2">
                                    <div className="text-sm text-gray-600">
                                        Download resources:
                                    </div>
                                    <div className="grid gap-2">
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={downloadTemplate}
                                            className="justify-start"
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            Template with Samples
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={downloadEmptyTemplate}
                                            className="justify-start"
                                        >
                                            <FileText className="h-4 w-4 mr-2" />
                                            Empty Template
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={downloadGuide}
                                            className="justify-start"
                                        >
                                            <FileText className="h-4 w-4 mr-2" />
                                            Import Guide
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        /* Results Section */
                        <div className="space-y-4">
                            <div className="text-center">
                                {result.failed === 0 ? (
                                    <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                                    </div>
                                ) : (
                                    <div className="mx-auto h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center mb-3">
                                        <AlertCircle className="h-6 w-6 text-amber-600" />
                                    </div>
                                )}

                                <h3 className="font-medium text-lg">
                                    {result.failed === 0 ? 'Import Successful' : 'Import Completed'}
                                </h3>
                                <p className="text-gray-600 mt-1">
                                    {result.success} residents imported successfully
                                    {result.failed > 0 && `, ${result.failed} rows failed`}
                                </p>
                            </div>

                            {result.failed > 0 && result.errors.length > 0 && (
                                <div className="border rounded-lg p-3 max-h-40 overflow-y-auto">
                                    <h4 className="font-medium text-sm text-red-700 mb-2">
                                        Errors ({result.failed})
                                    </h4>
                                    <div className="space-y-2">
                                        {result.errors.slice(0, 3).map((error, index) => (
                                            <div key={index} className="text-sm">
                                                <span className="font-medium">Row {error.row + 1}:</span>
                                                {Object.entries(error.errors).map(([field, messages]) => (
                                                    messages.map((message, msgIndex) => (
                                                        <div key={msgIndex} className="text-red-600 ml-2">
                                                            • {field}: {message}
                                                        </div>
                                                    ))
                                                ))}
                                            </div>
                                        ))}
                                        {result.errors.length > 3 && (
                                            <p className="text-xs text-gray-500">
                                                ... and {result.errors.length - 3} more errors
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3">
                    {result ? (
                        <>
                            <Button variant="outline" onClick={handleReset}>
                                Import Another
                            </Button>
                            <Button onClick={handleClose}>
                                Close
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="outline" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button 
                                onClick={handleImport} 
                                disabled={!file || importing}
                            >
                                {importing ? 'Importing...' : 'Import'}
                            </Button>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}