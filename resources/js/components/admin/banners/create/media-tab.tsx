// components/admin/banners/create/media-tab.tsx
import { useState, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Upload, X, Image as ImageIcon, Smartphone, Monitor } from 'lucide-react';

interface MediaTabProps {
    formData: {
        image_path: string;
        mobile_image_path: string;
    };
    errors: Record<string, string>;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isSubmitting: boolean;
}

export function MediaTab({ formData, errors, onInputChange, isSubmitting }: MediaTabProps) {
    const [desktopPreview, setDesktopPreview] = useState<string | null>(
        formData.image_path?.startsWith('data:') ? formData.image_path : 
        formData.image_path ? `/storage/${formData.image_path}` : null
    );
    const [mobilePreview, setMobilePreview] = useState<string | null>(
        formData.mobile_image_path?.startsWith('data:') ? formData.mobile_image_path :
        formData.mobile_image_path ? `/storage/${formData.mobile_image_path}` : null
    );
    
    const desktopInputRef = useRef<HTMLInputElement>(null);
    const mobileInputRef = useRef<HTMLInputElement>(null);

    const handleDesktopImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setDesktopPreview(reader.result as string);
                // Create a custom event to pass the base64 data
                const customEvent = {
                    target: {
                        name: 'image_path',
                        value: reader.result
                    }
                } as React.ChangeEvent<HTMLInputElement>;
                onInputChange(customEvent);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleMobileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setMobilePreview(reader.result as string);
                const customEvent = {
                    target: {
                        name: 'mobile_image_path',
                        value: reader.result
                    }
                } as React.ChangeEvent<HTMLInputElement>;
                onInputChange(customEvent);
            };
            reader.readAsDataURL(file);
        }
    };

    const clearDesktopImage = () => {
        setDesktopPreview(null);
        const customEvent = {
            target: {
                name: 'image_path',
                value: ''
            }
        } as React.ChangeEvent<HTMLInputElement>;
        onInputChange(customEvent);
        if (desktopInputRef.current) {
            desktopInputRef.current.value = '';
        }
    };

    const clearMobileImage = () => {
        setMobilePreview(null);
        const customEvent = {
            target: {
                name: 'mobile_image_path',
                value: ''
            }
        } as React.ChangeEvent<HTMLInputElement>;
        onInputChange(customEvent);
        if (mobileInputRef.current) {
            mobileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-6">
            {/* Desktop Banner */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Monitor className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <Label className="dark:text-gray-300 text-base font-medium">
                        Desktop Banner <span className="text-red-500">*</span>
                    </Label>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Recommended size: 1920x600px (16:9 ratio)
                </p>

                {desktopPreview ? (
                    <div className="relative rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                        <img 
                            src={desktopPreview} 
                            alt="Desktop banner preview" 
                            className="w-full h-48 object-cover"
                        />
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-lg"
                            onClick={clearDesktopImage}
                            disabled={isSubmitting}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <div 
                        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer"
                        onClick={() => desktopInputRef.current?.click()}
                    >
                        <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                            PNG, JPG, GIF up to 5MB
                        </p>
                    </div>
                )}

                <input
                    ref={desktopInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleDesktopImageChange}
                    className="hidden"
                    disabled={isSubmitting}
                />

                {!desktopPreview && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => desktopInputRef.current?.click()}
                        disabled={isSubmitting}
                        className="w-full dark:border-gray-600 dark:text-gray-300"
                    >
                        <Upload className="h-4 w-4 mr-2" />
                        Choose Desktop Image
                    </Button>
                )}

                {errors.image_path && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.image_path}</p>
                )}
            </div>

            {/* Mobile Banner */}
            <div className="space-y-3 pt-4 border-t dark:border-gray-700">
                <div className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <Label className="dark:text-gray-300 text-base font-medium">
                        Mobile Banner (Optional)
                    </Label>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Recommended size: 750x1000px (3:4 ratio)
                </p>

                {mobilePreview ? (
                    <div className="relative rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 max-w-[200px] mx-auto">
                        <img 
                            src={mobilePreview} 
                            alt="Mobile banner preview" 
                            className="w-full h-64 object-cover"
                        />
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-lg"
                            onClick={clearMobileImage}
                            disabled={isSubmitting}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <div 
                        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer max-w-[200px] mx-auto"
                        onClick={() => mobileInputRef.current?.click()}
                    >
                        <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            Click to upload mobile image
                        </p>
                    </div>
                )}

                <input
                    ref={mobileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleMobileImageChange}
                    className="hidden"
                    disabled={isSubmitting}
                />

                {!mobilePreview && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => mobileInputRef.current?.click()}
                        disabled={isSubmitting}
                        className="w-full dark:border-gray-600 dark:text-gray-300"
                    >
                        <Upload className="h-3 w-3 mr-2" />
                        Choose Mobile Image
                    </Button>
                )}

                <p className="text-xs text-gray-500 dark:text-gray-400">
                    If not set, the desktop banner will be used on mobile
                </p>
            </div>
        </div>
    );
}