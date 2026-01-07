import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
    Upload, 
    FileText, 
    Trash2, 
    AlertCircle,
    CheckCircle,
    XCircle,
    ChevronDown,
    Check
} from 'lucide-react';

interface DocumentType {
    id: number;
    name: string;
    description: string;
    is_required: boolean;
    sort_order: number;
}

interface UploadedFileWithMetadata {
    file: File;
    description: string;
    document_type_id?: number;
}

interface DocumentUploadProps {
    documentTypes: DocumentType[];
    uploadedFiles: UploadedFileWithMetadata[];
    selectedDocumentTypes: Set<number>;
    onFileSelect: (files: File[]) => void;
    onFileRemove: (index: number) => void;
    onDescriptionChange: (index: number, description: string) => void;
    onDocumentTypeSelect: (fileIndex: number, documentTypeId: number) => void;
    onClearAll: () => void;
    maxSizeMB?: number;
    allowedTypes?: string[];
}

export function DocumentUpload({
    documentTypes,
    uploadedFiles,
    selectedDocumentTypes,
    onFileSelect,
    onFileRemove,
    onDescriptionChange,
    onDocumentTypeSelect,
    onClearAll,
    maxSizeMB = 5,
    allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx']
}: DocumentUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);
    const [dragOver, setDragOver] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            onFileSelect(Array.from(e.target.files));
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);
        
        if (e.dataTransfer.files) {
            onFileSelect(Array.from(e.dataTransfer.files));
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (fileName: string) => {
        const extension = fileName.split('.').pop()?.toLowerCase();
        switch (extension) {
            case 'pdf':
                return <FileText className="h-5 w-5 text-red-500" />;
            case 'jpg':
            case 'jpeg':
            case 'png':
                return <FileText className="h-5 w-5 text-green-500" />;
            case 'doc':
            case 'docx':
                return <FileText className="h-5 w-5 text-blue-500" />;
            default:
                return <FileText className="h-5 w-5 text-gray-500" />;
        }
    };

    const getAvailableDocumentTypes = (fileIndex: number) => {
        const currentFile = uploadedFiles[fileIndex];
        const currentDocumentTypeId = currentFile?.document_type_id;
        
        return documentTypes.filter(docType => {
            const isSelectedByOtherFile = Array.from(selectedDocumentTypes).some(typeId => 
                typeId === docType.id && 
                (!currentDocumentTypeId || typeId !== currentDocumentTypeId)
            );
            return !isSelectedByOtherFile;
        });
    };

    const getSelectedDocumentTypeName = (fileIndex: number) => {
        const file = uploadedFiles[fileIndex];
        if (!file.document_type_id) return 'Select document type';
        
        const docType = documentTypes.find(doc => doc.id === file.document_type_id);
        return docType?.name || 'Unknown document type';
    };

    return (
        <div className="space-y-4 lg:space-y-6">
            {/* Drop Zone */}
            <div
                className={`border-2 border-dashed rounded-xl p-6 lg:p-8 text-center transition-colors cursor-pointer ${
                    dragOver 
                        ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/10' 
                        : 'border-gray-300 dark:border-gray-700 hover:border-blue-400 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900/50 dark:to-gray-900'
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                <div className="w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-3 lg:mb-4 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 flex items-center justify-center">
                    <Upload className="h-6 w-6 lg:h-8 lg:w-8 text-blue-500 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-sm lg:text-base text-gray-900 dark:text-white mb-1 lg:mb-2">
                    Drop files or tap to upload
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 lg:mb-4">
                    Max {maxSizeMB}MB per file • {allowedTypes.join(', ')}
                </p>
                <Button variant="outline" type="button" className="gap-2 h-9 lg:h-10 text-xs lg:text-sm">
                    <Upload className="h-3 w-3 lg:h-4 lg:w-4" />
                    Browse Files
                </Button>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={allowedTypes.join(',')}
                    onChange={handleFileChange}
                    className="hidden"
                />
            </div>

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
                <div className="space-y-3 lg:space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-sm lg:text-base text-gray-900 dark:text-white">
                                Uploaded ({uploadedFiles.length})
                            </h3>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            type="button"
                            onClick={onClearAll}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 text-xs h-8"
                        >
                            <Trash2 className="h-3 w-3 mr-1 lg:mr-2" />
                            <span className="hidden sm:inline">Clear All</span>
                        </Button>
                    </div>
                    
                    <div className="space-y-2 lg:space-y-3">
                        {uploadedFiles.map((uploadedFile, index) => (
                            <div key={index} className="border rounded-lg lg:rounded-xl p-3 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors bg-white dark:bg-gray-800/50">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                                            {getFileIcon(uploadedFile.file.name)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-medium text-xs lg:text-sm text-gray-900 dark:text-white truncate">
                                                {uploadedFile.file.name}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {formatFileSize(uploadedFile.file.size)}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        type="button"
                                        onClick={() => onFileRemove(index)}
                                        className="text-gray-500 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/20 flex-shrink-0 ml-1 h-8 w-8 p-0"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                                
                                {/* Document Type Selector */}
                                {documentTypes.length > 0 && (
                                    <div className="mb-2">
                                        <Label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
                                            Document Requirement *
                                        </Label>
                                        <div className="relative">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="w-full justify-between h-8 lg:h-9 text-xs"
                                                onClick={() => setOpenDropdownIndex(openDropdownIndex === index ? null : index)}
                                            >
                                                <div className="flex items-center truncate">
                                                    <FileText className="h-3 w-3 mr-1 lg:mr-2" />
                                                    <span className="truncate text-xs">
                                                        {getSelectedDocumentTypeName(index)}
                                                    </span>
                                                </div>
                                                <ChevronDown className="ml-2 h-3 w-3 lg:h-4 lg:w-4 shrink-0 opacity-50" />
                                            </Button>
                                            
                                            {openDropdownIndex === index && (
                                                <div className="absolute z-50 mt-1 w-full rounded-md border bg-white dark:bg-gray-900 shadow-lg max-h-40 overflow-y-auto">
                                                    {getAvailableDocumentTypes(index).map((docType) => {
                                                        const isSelected = uploadedFile.document_type_id === docType.id;
                                                        return (
                                                            <button
                                                                key={docType.id}
                                                                type="button"
                                                                className={`w-full flex items-center gap-2 px-2 lg:px-3 py-1.5 lg:py-2 text-xs hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left ${
                                                                    isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                                                }`}
                                                                onClick={() => {
                                                                    onDocumentTypeSelect(index, docType.id);
                                                                    setOpenDropdownIndex(null);
                                                                }}
                                                            >
                                                                {isSelected ? (
                                                                    <CheckCircle className="h-3 w-3 text-emerald-500 flex-shrink-0" />
                                                                ) : (
                                                                    <div className="h-3 w-3 rounded-full border-2 border-gray-300 flex-shrink-0" />
                                                                )}
                                                                <div className="flex-1 text-left">
                                                                    <div className="font-medium text-xs">{docType.name}</div>
                                                                    {docType.is_required && (
                                                                        <div className="text-xs text-red-600 dark:text-red-400 mt-0.5">Required</div>
                                                                    )}
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                                
                                <Input
                                    placeholder="Add description (optional)"
                                    value={uploadedFile.description}
                                    onChange={(e) => onDescriptionChange(index, e.target.value)}
                                    className="text-xs h-8"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* File Size Warning */}
            {uploadedFiles.some(file => file.file.size > maxSizeMB * 1024 * 1024) && (
                <Alert variant="destructive" className="p-3">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle className="text-sm">File too large</AlertTitle>
                    <AlertDescription className="text-xs">
                        Some files exceed the {maxSizeMB}MB limit. Please upload smaller files.
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}