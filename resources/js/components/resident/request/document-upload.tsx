import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
    Upload, 
    FileText, 
    File, 
    Image as ImageIcon, 
    Trash2, 
    AlertCircle,
    CheckCircle,
    ChevronDown,
    X,
    XCircle,
    Smartphone,
    Eye,
    X as CloseIcon
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
    const [isMobile, setIsMobile] = useState(false);
    const [imagePreviews, setImagePreviews] = useState<{ [key: number]: string }>({});
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    // Check if there's only one required document type
    const requiredDocuments = documentTypes.filter(doc => doc.is_required);
    const hasSingleRequiredDocument = requiredDocuments.length === 1;
    const singleRequiredDocument = hasSingleRequiredDocument ? requiredDocuments[0] : null;

    // Detect mobile
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Generate image previews when files are uploaded
    useEffect(() => {
        const newPreviews: { [key: number]: string } = {};
        
        uploadedFiles.forEach((uploadedFile, index) => {
            if (isImageFile(uploadedFile.file)) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImagePreviews(prev => ({
                        ...prev,
                        [index]: reader.result as string
                    }));
                };
                reader.readAsDataURL(uploadedFile.file);
            }
        });

        return () => {
            // Clean up object URLs when component unmounts
            Object.values(imagePreviews).forEach(preview => {
                if (preview.startsWith('blob:')) {
                    URL.revokeObjectURL(preview);
                }
            });
        };
    }, [uploadedFiles]);

    // Close dropdowns on outside click/touch
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent | TouchEvent) => {
            if (openDropdownIndex !== null) {
                const dropdown = document.getElementById(`dropdown-${openDropdownIndex}`);
                if (dropdown && !dropdown.contains(e.target as Node)) {
                    setOpenDropdownIndex(null);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [openDropdownIndex]);

    // Auto-select single required document for newly uploaded files
    useEffect(() => {
        if (hasSingleRequiredDocument && singleRequiredDocument) {
            uploadedFiles.forEach((file, index) => {
                if (!file.document_type_id && !selectedDocumentTypes.has(singleRequiredDocument.id)) {
                    onDocumentTypeSelect(index, singleRequiredDocument.id);
                }
            });
        }
    }, [uploadedFiles, hasSingleRequiredDocument, singleRequiredDocument]);

    const isImageFile = (file: File): boolean => {
        return file.type.startsWith('image/');
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            
            const validFiles = filesArray.filter(file => {
                const isValidType = allowedTypes.some(type => 
                    file.name.toLowerCase().endsWith(type.replace('.', ''))
                );
                const isValidSize = file.size <= maxSizeMB * 1024 * 1024;
                
                return isValidType && isValidSize;
            });
            
            onFileSelect(validFiles);
            
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
            const filesArray = Array.from(e.dataTransfer.files);
            
            const validFiles = filesArray.filter(file => {
                const isValidType = allowedTypes.some(type => 
                    file.name.toLowerCase().endsWith(type.replace('.', ''))
                );
                const isValidSize = file.size <= maxSizeMB * 1024 * 1024;
                
                return isValidType && isValidSize;
            });
            
            onFileSelect(validFiles);
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
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const getFileIcon = (fileName: string) => {
        const extension = fileName.split('.').pop()?.toLowerCase();
        switch (extension) {
            case 'pdf':
                return <File className="h-4 w-4 text-red-500" />;
            case 'jpg':
            case 'jpeg':
            case 'png':
                return <ImageIcon className="h-4 w-4 text-green-500" />;
            case 'doc':
            case 'docx':
                return <FileText className="h-4 w-4 text-blue-500" />;
            default:
                return <FileText className="h-4 w-4 text-gray-500" />;
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

    const isAutoSelected = (fileIndex: number) => {
        if (!hasSingleRequiredDocument || !singleRequiredDocument) return false;
        
        const file = uploadedFiles[fileIndex];
        return file.document_type_id === singleRequiredDocument.id;
    };

    const getAutoDescription = (documentTypeName: string) => {
        if (documentTypeName.includes('ID')) {
            return 'Valid government-issued ID';
        } else if (documentTypeName.includes('Proof')) {
            return 'Proof of requirement';
        } else if (documentTypeName.includes('Certificate')) {
            return 'Official certificate document';
        } else if (documentTypeName.includes('Photo')) {
            return 'Recent photograph';
        }
        return '';
    };

    const handleFileRemove = (index: number) => {
        // Clean up image preview if it exists
        if (imagePreviews[index]) {
            setImagePreviews(prev => {
                const newPreviews = { ...prev };
                delete newPreviews[index];
                return newPreviews;
            });
        }
        
        if (previewImage === imagePreviews[index]) {
            setPreviewImage(null);
        }
        
        onFileRemove(index);
    };

    const handleClearAll = () => {
        setImagePreviews({});
        setPreviewImage(null);
        onClearAll();
    };

    return (
        <div className="space-y-4">
            {/* Image Preview Modal */}
            {previewImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                    <div className="relative max-w-4xl max-h-[90vh] w-full">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute -top-10 right-0 text-white hover:text-gray-300 z-10"
                            onClick={() => setPreviewImage(null)}
                        >
                            <CloseIcon className="h-6 w-6" />
                        </Button>
                        <img 
                            src={previewImage} 
                            alt="Preview" 
                            className="w-full h-full object-contain rounded-lg"
                        />
                    </div>
                </div>
            )}

            {/* Mobile Notice */}
            {isMobile && (
                <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 p-3 mb-4">
                    <Smartphone className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="text-blue-800 dark:text-blue-300 text-sm">
                        Mobile Upload
                    </AlertTitle>
                    <AlertDescription className="text-blue-700 dark:text-blue-400 text-xs">
                        Use the Choose Files button below
                    </AlertDescription>
                </Alert>
            )}

            {/* Single Required Document Notice */}
            {hasSingleRequiredDocument && (
                <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 p-3">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="text-blue-800 dark:text-blue-300 text-sm">
                        Auto-Selection Enabled
                    </AlertTitle>
                    <AlertDescription className="text-blue-700 dark:text-blue-400 text-xs">
                        Uploaded files will be auto-assigned to: <strong>{singleRequiredDocument?.name}</strong>
                    </AlertDescription>
                </Alert>
            )}

            {/* Drop Zone */}
            <div
                className={`border-2 border-dashed rounded-xl p-4 sm:p-6 text-center transition-colors ${isMobile ? '' : 'cursor-pointer hover:bg-blue-50'} ${
                    dragOver 
                        ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/10' 
                        : 'border-gray-300 dark:border-gray-700'
                }`}
                onClick={() => !isMobile && fileInputRef.current?.click()}
                onDrop={!isMobile ? handleDrop : undefined}
                onDragOver={!isMobile ? handleDragOver : undefined}
                onDragLeave={!isMobile ? handleDragLeave : undefined}
            >
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 flex items-center justify-center">
                    <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white mb-1 sm:mb-2">
                    {isMobile ? 'Tap button below to upload' : 'Drop files or tap to upload'}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-3 sm:mb-4">
                    {hasSingleRequiredDocument 
                        ? `Upload ${singleRequiredDocument?.name}`
                        : isMobile ? 'Select files from your device' : 'Drag & drop or browse files'
                    }
                </p>
                <Button 
                    variant="default" 
                    type="button" 
                    className="gap-2 h-10 w-full sm:w-auto"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Upload className="h-4 w-4" />
                    {hasSingleRequiredDocument ? `Upload ${singleRequiredDocument?.name}` : 'Choose Files'}
                </Button>
                <p className="text-xs text-gray-500 mt-3">
                    Max {maxSizeMB}MB • {allowedTypes.join(', ')}
                </p>
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
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-base text-gray-900 dark:text-white">
                                Uploaded Files
                            </h3>
                            <Badge variant="secondary" className="h-5 px-1.5">
                                {uploadedFiles.length}
                            </Badge>
                            {hasSingleRequiredDocument && (
                                <Badge variant="outline" className="h-5 px-1.5 text-xs bg-blue-50 text-blue-700 border-blue-200">
                                    Auto: {singleRequiredDocument?.name}
                                </Badge>
                            )}
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            type="button"
                            onClick={handleClearAll}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 gap-1.5 h-8 px-2.5 text-sm"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            Clear
                        </Button>
                    </div>
                    
                    <div className="space-y-3">
                        {uploadedFiles.map((uploadedFile, index) => {
                            const isLargeFile = uploadedFile.file.size > maxSizeMB * 1024 * 1024;
                            const selectedDocType = documentTypes.find(doc => doc.id === uploadedFile.document_type_id);
                            const isRequired = selectedDocType?.is_required || false;
                            const isAutoSelectedFile = isAutoSelected(index);
                            const isImage = isImageFile(uploadedFile.file);
                            const preview = imagePreviews[index];
                            
                            return (
                                <div key={index} className={`border rounded-lg p-3 sm:p-4 ${
                                    isLargeFile 
                                        ? 'border-red-300 bg-red-50 dark:bg-red-900/10' 
                                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50'
                                }`}>
                                    {/* File Header */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-start gap-3 flex-1 min-w-0">
                                            {isImage && preview ? (
                                                <div 
                                                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden cursor-pointer bg-gray-100 dark:bg-gray-700"
                                                    onClick={() => setPreviewImage(preview)}
                                                >
                                                    <img 
                                                        src={preview} 
                                                        alt={`Preview of ${uploadedFile.file.name}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                                    isLargeFile 
                                                        ? 'bg-red-100 dark:bg-red-900/30' 
                                                        : 'bg-gray-100 dark:bg-gray-700'
                                                }`}>
                                                    {getFileIcon(uploadedFile.file.name)}
                                                </div>
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                    <p className="font-medium text-sm text-gray-900 dark:text-white break-all">
                                                        {uploadedFile.file.name}
                                                    </p>
                                                    {isRequired && (
                                                        <Badge variant="destructive" className="h-4 text-[10px] px-1">
                                                            Required
                                                        </Badge>
                                                    )}
                                                    {isAutoSelectedFile && (
                                                        <Badge variant="outline" className="h-4 text-[10px] px-1 bg-blue-50 text-blue-700 border-blue-200">
                                                            Auto
                                                        </Badge>
                                                    )}
                                                    {isImage && (
                                                        <Badge variant="outline" className="h-4 text-[10px] px-1 bg-green-50 text-green-700 border-green-200">
                                                            Image
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                                    <span>{formatFileSize(uploadedFile.file.size)}</span>
                                                    {isLargeFile && (
                                                        <span className="text-red-600 flex items-center gap-1">
                                                            <AlertCircle className="h-3 w-3" />
                                                            Too large
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            {isImage && preview && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    type="button"
                                                    onClick={() => setPreviewImage(preview)}
                                                    className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-400 h-8 w-8 p-0"
                                                    title="Preview image"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                type="button"
                                                onClick={() => handleFileRemove(index)}
                                                className="text-gray-500 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 h-8 w-8 p-0"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    
                                    
                                    {/* Document Type Selector */}
                                    {documentTypes.length > 0 && (
                                        <div className="mb-3" id={`dropdown-${index}`}>
                                            <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                                Document Type *
                                            </Label>
                                            <div className="relative">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className={`w-full justify-between h-9 text-sm ${
                                                        isAutoSelectedFile 
                                                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700' 
                                                            : ''
                                                    }`}
                                                    onClick={() => {
                                                        if (!hasSingleRequiredDocument) {
                                                            setOpenDropdownIndex(openDropdownIndex === index ? null : index);
                                                        }
                                                    }}
                                                >
                                                    <div className="flex items-center gap-2 truncate">
                                                        <FileText className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                                        <span className="truncate">
                                                            {getSelectedDocumentTypeName(index)}
                                                        </span>
                                                        {isAutoSelectedFile && (
                                                            <Badge variant="outline" className="ml-2 h-4 text-[10px] px-1 bg-blue-100 text-blue-700 border-blue-300">
                                                                Auto
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    {hasSingleRequiredDocument ? (
                                                        <CheckCircle className="ml-2 h-4 w-4 text-green-500 flex-shrink-0" />
                                                    ) : (
                                                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    )}
                                                </Button>
                                                
                                                {!hasSingleRequiredDocument && openDropdownIndex === index && (
                                                    <>
                                                        {/* Mobile overlay */}
                                                        {isMobile && (
                                                            <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setOpenDropdownIndex(null)} />
                                                        )}
                                                        <div className={`${isMobile ? 'fixed inset-x-0 bottom-0 max-h-[70vh] rounded-t-xl z-50' : 'absolute mt-1 w-full rounded-lg border shadow-lg max-h-48'} bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 overflow-y-auto`}>
                                                            {isMobile && (
                                                                <div className="sticky top-0 bg-white dark:bg-gray-900 border-b p-3 flex items-center justify-between">
                                                                    <h3 className="font-semibold">Select Type</h3>
                                                                    <Button variant="ghost" size="sm" onClick={() => setOpenDropdownIndex(null)}>
                                                                        <X className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            )}
                                                            {getAvailableDocumentTypes(index).map((docType) => {
                                                                const isSelected = uploadedFile.document_type_id === docType.id;
                                                                const isAssignedToOther = selectedDocumentTypes.has(docType.id) && uploadedFile.document_type_id !== docType.id;
                                                                
                                                                return (
                                                                    <button
                                                                        key={docType.id}
                                                                        type="button"
                                                                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors text-left ${
                                                                            isSelected 
                                                                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                                                                                : isAssignedToOther
                                                                                ? 'bg-gray-50 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                                                                                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                                                                        }`}
                                                                        onClick={() => {
                                                                            if (!isAssignedToOther) {
                                                                                onDocumentTypeSelect(index, docType.id);
                                                                                setOpenDropdownIndex(null);
                                                                            }
                                                                        }}
                                                                        disabled={isAssignedToOther}
                                                                    >
                                                                        {isSelected ? (
                                                                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                                                                        ) : (
                                                                            <div className="h-4 w-4 rounded-full border-2 border-gray-300 flex-shrink-0" />
                                                                        )}
                                                                        <div className="flex-1 text-left">
                                                                            <div className="font-medium">{docType.name}</div>
                                                                            {docType.is_required && (
                                                                                <div className="text-xs text-red-600 dark:text-red-400 mt-0.5">Required</div>
                                                                            )}
                                                                        </div>
                                                                        {isAssignedToOther && (
                                                                            <span className="text-xs text-gray-500">Used</span>
                                                                        )}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Auto-fill description button */}
                                    {hasSingleRequiredDocument && !uploadedFile.description && (
                                        <div className="mb-2">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="text-xs h-7 px-2"
                                                onClick={() => {
                                                    const autoDesc = getAutoDescription(singleRequiredDocument?.name || '');
                                                    if (autoDesc) {
                                                        onDescriptionChange(index, autoDesc);
                                                    }
                                                }}
                                            >
                                                Auto-fill description
                                            </Button>
                                        </div>
                                    )}
                                    
                                    <Input
                                        placeholder={hasSingleRequiredDocument 
                                            ? `Description for ${singleRequiredDocument?.name} (optional)` 
                                            : "Description (optional)"
                                        }
                                        value={uploadedFile.description}
                                        onChange={(e) => onDescriptionChange(index, e.target.value)}
                                        className="text-sm h-9"
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* File Size Warning */}
            {uploadedFiles.some(file => file.file.size > maxSizeMB * 1024 * 1024) && (
                <Alert variant="destructive" className="p-3">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle className="text-sm">File too large</AlertTitle>
                    <AlertDescription className="text-xs">
                        Some files exceed {maxSizeMB}MB limit
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}