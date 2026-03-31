// components/admin/community-reports/create/components/IncidentDetailsCard.tsx

import { useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, Camera, Upload, Search, X, ImageIcon, Video, File, Trash2 } from 'lucide-react';

// Import types
import type { FileWithPreview, ReportType } from '@/components/admin/community-reports/create//types/community-report';

interface ExistingFile {
    id: number;
    file_name: string;
    file_path: string;
    file_type: string;
    file_size: number;
}

interface FormData {
    title: string;
    description: string;
    detailed_description: string;
    incident_date: string;
    incident_time: string;
    location: string;
    recurring_issue: boolean;
    safety_concern: boolean;
    environmental_impact: boolean;
    perpetrator_details: string;
    preferred_resolution: string;
}

const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return ImageIcon;
    if (type.startsWith('video/')) return Video;
    if (type === 'application/pdf') return FileText;
    return File;
};

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

interface IncidentDetailsCardProps {
    formData: FormData;
    files?: FileWithPreview[];
    newFiles?: FileWithPreview[];
    existingFiles?: ExistingFile[];
    selectedType: ReportType | null;
    puroks: string[];
    today: string;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onCheckboxChange: (name: string, checked: boolean) => void;
    onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemoveNewFile?: (id: string) => void;
    onRemoveExistingFile?: (fileId: number) => void;
    onClearAllNewFiles?: () => void;
    onClearAllFiles?: () => void;
    onOpenPreview: (file: FileWithPreview | ExistingFile) => void;
    isEditMode?: boolean;
}

export const IncidentDetailsCard = ({
    formData,
    newFiles = [],
    existingFiles = [],
    selectedType,
    puroks,
    today,
    onInputChange,
    onCheckboxChange,
    onFileSelect,
    onRemoveNewFile,
    onRemoveExistingFile,
    onClearAllNewFiles,
    onClearAllFiles,
    onOpenPreview,
    isEditMode = false
}: IncidentDetailsCardProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const totalFilesCount = newFiles.length + existingFiles.length;

    const handleRemoveNewFile = (id: string) => {
        if (onRemoveNewFile) {
            onRemoveNewFile(id);
        }
    };

    const handleRemoveExistingFile = (fileId: number) => {
        if (onRemoveExistingFile) {
            onRemoveExistingFile(fileId);
        }
    };

    const handleClearAllFiles = () => {
        if (onClearAllNewFiles) {
            onClearAllNewFiles();
        }
        if (onClearAllFiles) {
            onClearAllFiles();
        }
    };

    return (
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                    <FileText className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                    Incident Details
                </CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400">
                    Provide detailed information about the incident
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Title */}
                <div className="space-y-2">
                    <Label htmlFor="title" className="text-gray-700 dark:text-gray-300">Title *</Label>
                    <Input
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={onInputChange}
                        placeholder="Brief title of the incident"
                        required
                        className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600"
                    />
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <Label htmlFor="description" className="text-gray-700 dark:text-gray-300">Description *</Label>
                    <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={onInputChange}
                        placeholder="Describe what happened"
                        rows={4}
                        required
                        className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600"
                    />
                </div>

                {/* Detailed Description */}
                <div className="space-y-2">
                    <Label htmlFor="detailed_description" className="text-gray-700 dark:text-gray-300">Detailed Description</Label>
                    <Textarea
                        id="detailed_description"
                        name="detailed_description"
                        value={formData.detailed_description}
                        onChange={onInputChange}
                        placeholder="Provide more details about the incident"
                        rows={4}
                        className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600"
                    />
                </div>

                {/* Date and Time */}
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="incident_date" className="text-gray-700 dark:text-gray-300">Incident Date *</Label>
                        <Input
                            id="incident_date"
                            name="incident_date"
                            type="date"
                            value={formData.incident_date}
                            onChange={onInputChange}
                            max={today}
                            required
                            className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="incident_time" className="text-gray-700 dark:text-gray-300">Incident Time</Label>
                        <Input
                            id="incident_time"
                            name="incident_time"
                            type="time"
                            value={formData.incident_time}
                            onChange={onInputChange}
                            className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                        />
                    </div>
                </div>

                {/* Location */}
                <div className="space-y-2">
                    <Label htmlFor="location" className="text-gray-700 dark:text-gray-300">Location *</Label>
                    <Input
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={onInputChange}
                        placeholder="Where did it happen?"
                        list="purok-suggestions"
                        required
                        className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600"
                    />
                    <datalist id="purok-suggestions">
                        {puroks.map((purok) => (
                            <option key={purok} value={purok} />
                        ))}
                    </datalist>
                </div>

                {/* Evidence Upload Section */}
                <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div>
                        <Label className="text-gray-700 dark:text-gray-300">Evidence Upload</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Upload supporting documents, photos, or videos
                            {selectedType?.requires_evidence && (
                                <span className="text-red-500 dark:text-red-400 ml-1">* Required</span>
                            )}
                        </p>
                    </div>

                    {/* Upload Area */}
                    <div
                        className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors bg-white dark:bg-gray-900"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={onFileSelect}
                            multiple
                            accept="image/*,.pdf,video/mp4,video/mov,video/avi"
                            className="hidden"
                        />
                        <div className="space-y-2">
                            <div className="mx-auto h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                                <Camera className="h-8 w-8 text-blue-500 dark:text-blue-400" />
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                Click to upload evidence files
                            </p>
                            <Button variant="outline" type="button" className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                                <Upload className="h-4 w-4 mr-2" />
                                Select Files
                            </Button>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                                JPG, PNG, GIF, PDF, MP4, MOV, AVI • Max 10MB per file
                            </p>
                        </div>
                    </div>

                    {/* Existing Files (for edit mode) */}
                    {isEditMode && existingFiles.length > 0 && (
                        <div className="mt-6 space-y-3">
                            <div className="flex items-center justify-between">
                                <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">
                                    Existing Files ({existingFiles.length})
                                </h4>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                                {existingFiles.map((file) => (
                                    <div key={file.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
                                        <div className="p-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <div className="w-10 h-10 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                                                        <FileText className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                                                            {file.file_name}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            {formatFileSize(file.file_size)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => onOpenPreview(file)}
                                                        className="h-8 w-8 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                                    >
                                                        <Search className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleRemoveExistingFile(file.id)}
                                                        className="h-8 w-8 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-500"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* New Files */}
                    {newFiles.length > 0 && (
                        <div className="mt-6 space-y-3">
                            <div className="flex items-center justify-between">
                                <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">
                                    New Files ({newFiles.length})
                                </h4>
                                {(onClearAllNewFiles || onClearAllFiles) && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleClearAllFiles}
                                        className="text-xs h-7 px-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                                    >
                                        Clear All
                                    </Button>
                                )}
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                                {newFiles.map((file) => {
                                    const FileIcon = getFileIcon(file.type);
                                    const isImage = file.type.startsWith('image/');
                                    return (
                                        <div key={file.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
                                            <div className="p-3">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                        <div className={`w-10 h-10 rounded flex items-center justify-center flex-shrink-0 ${
                                                            isImage ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-800'
                                                        }`}>
                                                            <FileIcon className={`h-5 w-5 ${
                                                                isImage ? 'text-blue-500 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
                                                            }`} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">{file.name}</p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                {formatFileSize(file.size)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => onOpenPreview(file)}
                                                            className="h-8 w-8 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                                        >
                                                            <Search className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleRemoveNewFile(file.id)}
                                                            className="h-8 w-8 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-500"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                {isImage && file.preview && (
                                                    <div className="mt-3">
                                                        <div 
                                                            className="relative aspect-video rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-pointer"
                                                            onClick={() => onOpenPreview(file)}
                                                        >
                                                            <img 
                                                                src={file.preview} 
                                                                alt={file.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* No Files Message */}
                    {totalFilesCount === 0 && (
                        <div className="mt-4 p-4 text-center text-gray-500 dark:text-gray-400 text-sm border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                            No files uploaded yet. Click above to add evidence.
                        </div>
                    )}
                </div>

                {/* Additional Details */}
                <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">Additional Details</h3>
                    
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="recurring_issue"
                            checked={formData.recurring_issue}
                            onCheckedChange={(checked) => 
                                onCheckboxChange('recurring_issue', checked as boolean)
                            }
                            className="border-gray-300 dark:border-gray-600"
                        />
                        <Label htmlFor="recurring_issue" className="text-gray-700 dark:text-gray-300 cursor-pointer">This is a recurring issue</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="safety_concern"
                            checked={formData.safety_concern}
                            onCheckedChange={(checked) => 
                                onCheckboxChange('safety_concern', checked as boolean)
                            }
                            className="border-gray-300 dark:border-gray-600"
                        />
                        <Label htmlFor="safety_concern" className="text-gray-700 dark:text-gray-300 cursor-pointer">This is a safety concern</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="environmental_impact"
                            checked={formData.environmental_impact}
                            onCheckedChange={(checked) => 
                                onCheckboxChange('environmental_impact', checked as boolean)
                            }
                            className="border-gray-300 dark:border-gray-600"
                        />
                        <Label htmlFor="environmental_impact" className="text-gray-700 dark:text-gray-300 cursor-pointer">This has environmental impact</Label>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="perpetrator_details" className="text-gray-700 dark:text-gray-300">Perpetrator Details (if applicable)</Label>
                        <Textarea
                            id="perpetrator_details"
                            name="perpetrator_details"
                            value={formData.perpetrator_details}
                            onChange={onInputChange}
                            placeholder="Information about the person(s) involved"
                            rows={3}
                            className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="preferred_resolution" className="text-gray-700 dark:text-gray-300">Preferred Resolution</Label>
                        <Textarea
                            id="preferred_resolution"
                            name="preferred_resolution"
                            value={formData.preferred_resolution}
                            onChange={onInputChange}
                            placeholder="What resolution does the complainant prefer?"
                            rows={3}
                            className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600"
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};