// components/admin/officials/shared/photo-upload.tsx
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Camera, Upload, Check, X } from 'lucide-react';
import { Resident } from '@/components/admin/officials/shared/types/official';
interface PhotoUploadProps {
    photoPreview: string | null;
    useResidentPhoto: boolean;
    selectedResident: Resident | null;
    onUseResidentPhotoChange: (checked: boolean) => void;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClearPhoto: () => void;
}

export function PhotoUpload({
    photoPreview,
    useResidentPhoto,
    selectedResident,
    onUseResidentPhotoChange,
    onFileChange,
    onClearPhoto
}: PhotoUploadProps) {
    return (
        <div className="space-y-4">
            {/* Photo Preview */}
            <div className="flex justify-center">
                <div className="relative h-40 w-40 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-lg">
                    {photoPreview ? (
                        <img 
                            src={photoPreview} 
                            alt="Official preview"
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="h-full w-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                            <Camera className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                        </div>
                    )}
                    {photoPreview && (
                        <button
                            type="button"
                            onClick={onClearPhoto}
                            className="absolute top-2 right-2 h-6 w-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors dark:bg-red-600 dark:hover:bg-red-700"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    )}
                </div>
            </div>

            {/* Photo Source Options */}
            <div className="space-y-3">
                {/* Option 1: Use Resident Photo */}
                {selectedResident?.photo_url && (
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2 p-3 border rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                            <Checkbox 
                                id="use_resident_photo" 
                                checked={useResidentPhoto}
                                onCheckedChange={(checked) => onUseResidentPhotoChange(checked as boolean)}
                                className="dark:border-gray-600"
                            />
                            <Label htmlFor="use_resident_photo" className="cursor-pointer dark:text-gray-300">
                                Use resident's existing photo
                            </Label>
                        </div>
                        {useResidentPhoto && (
                            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                                <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                                    <Check className="h-4 w-4" />
                                    <span className="text-sm font-medium">Using resident's photo</span>
                                </div>
                                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                    The photo will be copied from resident record
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Divider */}
                {(selectedResident?.photo_url && !useResidentPhoto) || !selectedResident?.photo_url ? (
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white dark:bg-gray-900 px-2 text-gray-500 dark:text-gray-400">OR</span>
                        </div>
                    </div>
                ) : null}

                {/* Option 2: Upload New Photo */}
                {(!useResidentPhoto || !selectedResident?.photo_url) && (
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-gray-600 transition-colors">
                        <div className="mx-auto h-12 w-12 flex items-center justify-center mb-3">
                            <Upload className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                            Upload a new portrait photo
                        </p>
                        <div className="relative">
                            <input
                                type="file"
                                id="photo"
                                accept=".jpg,.jpeg,.png,.webp"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={onFileChange}
                                disabled={useResidentPhoto}
                            />
                            <Button 
                                variant="outline" 
                                size="sm"
                                disabled={useResidentPhoto}
                                className="dark:border-gray-600 dark:text-gray-300"
                            >
                                <Upload className="h-4 w-4 mr-2" />
                                Upload New Photo
                            </Button>
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                            JPG, PNG, WEBP up to 2MB
                        </p>
                        {!useResidentPhoto && (
                            <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                                <p className="text-xs text-blue-600 dark:text-blue-400">
                                    <span className="font-medium">Selected:</span> Upload new photo
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* No Photo Option */}
                {selectedResident && !selectedResident.photo_url && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
                        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                            <Camera className="h-4 w-4" />
                            <span className="text-sm font-medium">No resident photo available</span>
                        </div>
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                            This resident doesn't have a photo in their record. Please upload one.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}