// components/admin/officials/create/details-tab.tsx
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Resident } from '@/types/admin/officials/officials';
import { Phone, Mail, Camera, X, User as UserIcon } from 'lucide-react';
import { useState, useEffect } from 'react';

interface DetailsTabProps {
    formData: any;
    errors: Record<string, string>;
    selectedResident: Resident | null;
    existingPhotoUrl?: string; // Add this prop
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onContactNumberChange: (value: string) => void;
    onEmailChange: (value: string) => void;
    onAchievementsChange: (value: string) => void;
    onPhotoChange: (file: File | null) => void;
    onUseResidentPhotoChange: (checked: boolean) => void;
    onClearPhoto: () => void;
    isSubmitting: boolean;
}

export function DetailsTab({
    formData,
    errors,
    selectedResident,
    existingPhotoUrl, // Add this parameter
    onInputChange,
    onContactNumberChange,
    onEmailChange,
    onAchievementsChange,
    onPhotoChange,
    onUseResidentPhotoChange,
    onClearPhoto,
    isSubmitting
}: DetailsTabProps) {
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    useEffect(() => {
        // Check for existing photo from the official record
        if (existingPhotoUrl && !formData.use_resident_photo && !formData.photo) {
            setPhotoPreview(existingPhotoUrl);
        } else if (selectedResident?.photo_url && formData.use_resident_photo) {
            setPhotoPreview(selectedResident.photo_url);
        } else if (!formData.use_resident_photo && !formData.photo) {
            setPhotoPreview(null);
        }
    }, [selectedResident, formData.use_resident_photo, formData.photo, existingPhotoUrl]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        onPhotoChange(file);
        if (file) {
            onUseResidentPhotoChange(false);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setPhotoPreview(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Contact Information */}
            <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Contact Information</h3>
                
                <div className="space-y-2">
                    <Label htmlFor="contact_number" className="dark:text-gray-300 flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Contact Number
                    </Label>
                    <Input
                        id="contact_number"
                        name="contact_number"
                        value={formData.contact_number || ''}
                        onChange={(e) => onContactNumberChange(e.target.value)}
                        placeholder="e.g., 09123456789"
                        className={`${errors.contact_number ? 'border-destructive' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300`}
                        disabled={isSubmitting}
                    />
                    {selectedResident?.contact_number && !formData.contact_number && (
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                            Resident's contact number: {selectedResident.contact_number}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email" className="dark:text-gray-300 flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email Address
                    </Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => onEmailChange(e.target.value)}
                        placeholder="official@barangay.gov.ph"
                        className={`${errors.email ? 'border-destructive' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300`}
                        disabled={isSubmitting}
                    />
                    {selectedResident?.email && !formData.email && (
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                            Resident's email: {selectedResident.email}
                        </p>
                    )}
                </div>
            </div>

            {/* Achievements */}
            <div className="space-y-2">
                <Label htmlFor="achievements" className="dark:text-gray-300">
                    Achievements & Recognition
                </Label>
                <Textarea
                    id="achievements"
                    name="achievements"
                    value={formData.achievements || ''}
                    onChange={(e) => onAchievementsChange(e.target.value)}
                    placeholder="List any achievements, awards, or recognition received..."
                    rows={3}
                    className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                    disabled={isSubmitting}
                />
            </div>

            {/* Photo Upload */}
            <div className="space-y-3">
                <Label className="dark:text-gray-300">Official Photo</Label>
                <div className="flex items-center gap-4">
                    {photoPreview ? (
                        <div className="relative">
                            <img
                                src={photoPreview}
                                alt="Preview"
                                className="h-20 w-20 rounded-lg object-cover border dark:border-gray-700"
                            />
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={onClearPhoto}
                                className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                                disabled={isSubmitting}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </div>
                    ) : (
                        <div className="h-20 w-20 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center border dark:border-gray-700">
                            <Camera className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                        </div>
                    )}
                    <div className="flex-1">
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                            disabled={isSubmitting}
                        />
                        {(selectedResident?.photo_url || existingPhotoUrl) && (
                            <div className="flex items-center gap-2 mt-2">
                                <Checkbox
                                    id="use_resident_photo"
                                    checked={formData.use_resident_photo}
                                    onCheckedChange={(checked) => onUseResidentPhotoChange(checked as boolean)}
                                    disabled={isSubmitting}
                                />
                                <Label htmlFor="use_resident_photo" className="text-sm cursor-pointer dark:text-gray-300">
                                    Use {existingPhotoUrl && !selectedResident?.photo_url ? 'existing' : "resident's"} photo
                                </Label>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Info Card */}
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border dark:border-gray-700">
                <div className="flex items-start gap-3">
                    <UserIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        <p className="font-medium mb-1">About this information:</p>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                            <li>Contact information will be displayed on the official's public profile</li>
                            <li>Achievements help showcase the official's contributions to the community</li>
                            <li>Photos should be clear and professional (recommended size: 400x400px)</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}