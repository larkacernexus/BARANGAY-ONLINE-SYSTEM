// components/admin/residents/create/forms/PhotoUploadCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, Upload, Image, CheckCircle, X } from 'lucide-react';
import { useState } from 'react';

interface Props {
    photo: File | null;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function PhotoUploadCard({ photo, onFileChange }: Props) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onFileChange(e);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        const file = e.dataTransfer.files?.[0];
        if (file && (file.type.startsWith('image/') || file.name.match(/\.(jpg|jpeg|png)$/i))) {
            const input = document.getElementById('photo') as HTMLInputElement;
            if (input) {
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                input.files = dataTransfer.files;
                
                const event = new Event('change', { bubbles: true });
                input.dispatchEvent(event);
                
                const url = URL.createObjectURL(file);
                setPreviewUrl(url);
            }
        }
    };

    const clearPhoto = () => {
        const input = document.getElementById('photo') as HTMLInputElement;
        if (input) {
            input.value = '';
            const event = new Event('change', { bubbles: true });
            input.dispatchEvent(event);
        }
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
    };

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700 flex items-center justify-center">
                        <Camera className="h-3 w-3 text-white" />
                    </div>
                    Resident Photo
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Photo Upload Area */}
                <div 
                    className={`
                        relative border-2 border-dashed rounded-lg p-6 text-center transition-all
                        ${dragActive 
                            ? 'border-blue-500 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20' 
                            : photo 
                                ? 'border-green-500 bg-green-50 dark:border-green-600 dark:bg-green-900/20' 
                                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                        }
                    `}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        id="photo"
                        name="photo"
                        accept=".jpg,.jpeg,.png,image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        onChange={handleFileChange}
                    />
                    
                    {previewUrl ? (
                        <div className="space-y-4">
                            <div className="relative inline-block">
                                <img 
                                    src={previewUrl} 
                                    alt="Preview" 
                                    className="h-32 w-32 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-lg mx-auto"
                                />
                                <button
                                    type="button"
                                    onClick={clearPhoto}
                                    className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors z-20"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="flex items-center justify-center gap-2 text-sm text-green-600 dark:text-green-400">
                                <CheckCircle className="h-4 w-4" />
                                <span>{photo?.name || 'Photo ready'}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="mx-auto h-24 w-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                                <Image className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                            </div>
                            
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Upload resident's photo
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    2x2 ID size recommended (max 2MB)
                                </p>
                            </div>

                            <Button 
                                variant="outline" 
                                size="sm" 
                                type="button"
                                className="relative z-20 dark:border-gray-600 dark:text-gray-300"
                            >
                                <Upload className="h-4 w-4 mr-2" />
                                Choose Photo
                            </Button>

                            <p className="text-xs text-gray-400 dark:text-gray-500">
                                JPG, PNG up to 2MB
                            </p>
                        </div>
                    )}
                </div>

                {/* Drag & Drop Hint */}
                {!photo && (
                    <p className="text-xs text-center text-gray-400 dark:text-gray-500">
                        or drag and drop a photo here
                    </p>
                )}

                {/* Resident ID Preview */}
                <div className="space-y-2 pt-4 border-t dark:border-gray-700">
                    <Label htmlFor="resident_id" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Resident ID Number
                    </Label>
                    <div className="relative">
                        <Input 
                            id="resident_id" 
                            placeholder="BRGY-2024-001" 
                            readOnly
                            value="Auto-generated upon save"
                            className="bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-400 dark:placeholder-gray-500 cursor-not-allowed"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            <span className="text-xs text-gray-400 dark:text-gray-500">(auto)</span>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        ID number will be automatically generated when you save
                    </p>
                </div>

                {/* Photo Requirements */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-2">Photo Requirements:</h4>
                    <ul className="space-y-1 text-xs text-blue-600 dark:text-blue-400">
                        <li className="flex items-center gap-1">
                            <div className="h-1 w-1 rounded-full bg-blue-600 dark:bg-blue-400"></div>
                            Recent passport-sized photo (2x2 inches)
                        </li>
                        <li className="flex items-center gap-1">
                            <div className="h-1 w-1 rounded-full bg-blue-600 dark:bg-blue-400"></div>
                            White or plain background
                        </li>
                        <li className="flex items-center gap-1">
                            <div className="h-1 w-1 rounded-full bg-blue-600 dark:bg-blue-400"></div>
                            JPG or PNG format, max 2MB
                        </li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
}