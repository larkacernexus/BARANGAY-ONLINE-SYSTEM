// components/admin/residents/edit/PhotoSection.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Upload, X, User } from 'lucide-react';

interface PhotoSectionProps {
    photoPreview: string | null;
    residentName: string;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemovePhoto: (e?: React.MouseEvent) => void;
    onChoosePhotoClick: (e: React.MouseEvent) => void;
    selectedFile: File | null | undefined; // Allow undefined
    fileInputRef: React.RefObject<HTMLInputElement | null>; // Allow null
}

// Helper function to get initials from name
const getInitials = (name: string): string => {
    if (!name) return '?';
    const nameParts = name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
    
    // If only first name is provided, return first letter
    if (!lastName) {
        return firstName.charAt(0).toUpperCase();
    }
    
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

export default function PhotoSection({
    photoPreview,
    residentName,
    onFileChange,
    onRemovePhoto,
    onChoosePhotoClick,
    selectedFile,
    fileInputRef
}: PhotoSectionProps) {
    const displayName = residentName || 'Resident';
    const initials = getInitials(displayName);
    const hasPhoto = !!photoPreview;

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 flex items-center justify-center">
                        <Camera className="h-3 w-3 text-white" />
                    </div>
                    Profile Photo
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                    Upload or update the resident's photo
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex flex-col items-center justify-center gap-4">
                    <Avatar className="h-40 w-40 border-4 border-white dark:border-gray-700 shadow-lg">
                        <AvatarImage 
                            src={photoPreview || undefined} 
                            alt={displayName}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 text-white text-4xl font-medium">
                            {initials}
                        </AvatarFallback>
                    </Avatar>

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={onFileChange}
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        className="hidden"
                    />

                    <div className="flex gap-3">
                        <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={onChoosePhotoClick}
                            className="dark:border-gray-600 dark:text-gray-300"
                        >
                            <Upload className="h-4 w-4 mr-2" />
                            {hasPhoto ? 'Change Photo' : 'Upload Photo'}
                        </Button>
                        
                        {hasPhoto && (
                            <Button 
                                type="button" 
                                variant="outline" 
                                size="sm"
                                onClick={onRemovePhoto}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/50 border-red-200 dark:border-red-800"
                            >
                                <X className="h-4 w-4 mr-2" />
                                Remove
                            </Button>
                        )}
                    </div>

                    {selectedFile && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Selected: {selectedFile.name}
                        </p>
                    )}

                    {!hasPhoto && !selectedFile && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                            No photo uploaded. The resident's initials will be displayed.
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}