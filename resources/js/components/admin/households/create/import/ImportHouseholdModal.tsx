// components/admin/households/import/ImportHouseholdModal.tsx
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    AlertCircle, 
    CheckCircle2, 
    Download, 
    FileText, 
    Upload,
    AlertTriangle,
    Info
} from 'lucide-react';
import { useState, useRef } from 'react';
import { router } from '@inertiajs/react';

interface Purok {
    id: number;
    name: string;
}

interface Role {
    id: number;
    name: string;
}

interface ImportResult {
    success: number;
    failed: number;
    total: number;
    errors: Array<{
        row: number;
        errors: Record<string, string[]>;
    }>;
    warnings?: Array<{
        row: number;
        message: string;
    }>;
}

interface ImportHouseholdModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    downloadTemplate: () => void;
    downloadGuide: () => void;
    downloadEmptyTemplate: () => void;
    onImportSuccess?: () => void;
    importUrl: string;
    puroks?: Purok[];
    roles?: Role[];
}

export default function ImportHouseholdModal({ 
    open, 
    onOpenChange,
    downloadTemplate,
    downloadGuide,
    downloadEmptyTemplate,
    onImportSuccess,
    importUrl,
    puroks = [],
    roles = []
}: ImportHouseholdModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [importing, setImporting] = useState(false);
    const [result, setResult] = useState<ImportResult | null>(null);
    const [error, setError] = useState<string>('');
    const [createUserAccounts, setCreateUserAccounts] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] || null;
        if (selectedFile) {
            // Validate file type
            if (!selectedFile.name.endsWith('.csv')) {
                setError('Please select a CSV file.');
                return;
            }
            
            // Validate file size (10MB max)
            if (selectedFile.size > 10 * 1024 * 1024) {
                setError('File size must be less than 10MB.');
                return;
            }
            
            setFile(selectedFile);
            setError('');
            setResult(null);
        }
    };

    const handleImport = async () => {
        if (!file) return;

        setImporting(true);
        setError('');
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('create_user_accounts', createUserAccounts ? '1' : '0');

        try {
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
                
                // If there are no errors, auto-close after 3 seconds
                if (data.failed === 0) {
                    setTimeout(() => {
                        handleClose();
                    }, 3000);
                }
            } else {
                setError(data.message || 'Import failed. Please check your file format.');
            }
        } catch (err) {
            setError('An error occurred during import. Please try again.');
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

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Upload className="h-5 w-5" />
                        Import Households
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {!result ? (
                        <>
                            {/* File Upload Section */}
                            <div className="space-y-4">
                                <div 
                                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                                        file ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                >
                                    <Upload className={`mx-auto h-12 w-12 mb-4 ${
                                        file ? 'text-green-500' : 'text-gray-400'
                                    }`} />
                                    
                                    {file ? (
                                        <div className="space-y-2">
                                            <p className="font-medium text-green-700">
                                                File selected: {file.name}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Size: {formatFileSize(file.size)}
                                            </p>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setFile(null);
                                                    if (fileInputRef.current) {
                                                        fileInputRef.current.value = '';
                                                    }
                                                }}
                                            >
                                                Choose Another File
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            <p className="text-sm text-gray-600 mb-4">
                                                Drag and drop your CSV file here, or click to browse
                                            </p>
                                            <div className="relative inline-block">
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept=".csv"
                                                    onChange={handleFileChange}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                />
                                                <Button variant="outline">
                                                    Select CSV File
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Import Options */}
                                <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                                    <h4 className="font-medium text-sm flex items-center gap-2">
                                        <Info className="h-4 w-4 text-blue-500" />
                                        Import Options
                                    </h4>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="createUserAccounts"
                                            checked={createUserAccounts}
                                            onChange={(e) => setCreateUserAccounts(e.target.checked)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <Label htmlFor="createUserAccounts" className="text-sm">
                                            Create user accounts for household heads (if email/contact provided)
                                        </Label>
                                    </div>
                                </div>

                                {/* Template Download Options */}
                                <div className="space-y-3">
                                    <h4 className="font-medium text-sm">Download Resources:</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
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

                                {/* Error Display */}
                                {error && (
                                    <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 p-3 rounded">
                                        <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-medium">Import Error</p>
                                            <p>{error}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Purok Info */}
                                {puroks.length === 0 && (
                                    <div className="flex items-start gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded">
                                        <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-medium">No Puroks Found</p>
                                            <p>Please create puroks first before importing households.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        /* Results Section */
                        <div className="space-y-6">
                            <div className="text-center">
                                {result.failed === 0 ? (
                                    <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                                    </div>
                                ) : (
                                    <div className="mx-auto h-16 w-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                                        <AlertCircle className="h-8 w-8 text-amber-600" />
                                    </div>
                                )}

                                <h3 className="font-semibold text-lg mb-2">
                                    {result.failed === 0 ? 'Import Successful!' : 'Import Completed with Issues'}
                                </h3>
                                
                                <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto mt-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-gray-800">{result.total}</div>
                                        <div className="text-xs text-gray-500">Total</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600">{result.success}</div>
                                        <div className="text-xs text-gray-500">Success</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-red-600">{result.failed}</div>
                                        <div className="text-xs text-gray-500">Failed</div>
                                    </div>
                                </div>
                            </div>

                            {/* Warnings */}
                            {result.warnings && result.warnings.length > 0 && (
                                <div className="border rounded-lg p-4">
                                    <h4 className="font-medium text-sm text-amber-700 mb-3 flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4" />
                                        Warnings ({result.warnings.length})
                                    </h4>
                                    <div className="space-y-2 max-h-32 overflow-y-auto">
                                        {result.warnings.map((warning, index) => (
                                            <div key={index} className="text-sm text-amber-600">
                                                Row {warning.row + 1}: {warning.message}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Errors */}
                            {result.failed > 0 && result.errors.length > 0 && (
                                <div className="border rounded-lg p-4">
                                    <h4 className="font-medium text-sm text-red-700 mb-3 flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4" />
                                        Error Details ({result.failed} rows)
                                    </h4>
                                    <div className="space-y-3 max-h-40 overflow-y-auto">
                                        {result.errors.slice(0, 5).map((error, index) => (
                                            <div key={index} className="text-sm border-l-2 border-red-200 pl-3">
                                                <span className="font-medium text-red-700">Row {error.row + 1}:</span>
                                                <div className="mt-1 space-y-1">
                                                    {Object.entries(error.errors).map(([field, messages]) => (
                                                        messages.map((message, msgIndex) => (
                                                            <div key={msgIndex} className="text-red-600 text-xs">
                                                                • {field}: {message}
                                                            </div>
                                                        ))
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                        {result.errors.length > 5 && (
                                            <p className="text-xs text-gray-500 text-center pt-2">
                                                ... and {result.errors.length - 5} more errors
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Next Steps */}
                            {result.failed === 0 && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <p className="text-sm text-green-700 text-center">
                                        ✓ All households have been imported successfully. 
                                        You can now view them in the households list.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    {result ? (
                        <>
                            <Button variant="outline" onClick={handleReset}>
                                Import Another File
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
                                disabled={!file || importing || puroks.length === 0}
                                className="min-w-[100px]"
                            >
                                {importing ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Importing...
                                    </>
                                ) : (
                                    'Import'
                                )}
                            </Button>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}