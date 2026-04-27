// components/admin/banners/create/basic-info-tab.tsx
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Image, Link2, Type, Hash } from 'lucide-react';

interface BasicInfoTabProps {
    formData: {
        title: string;
        description: string;
        link_url: string;
        button_text: string;
        alt_text: string;
        is_active: boolean;
        sort_order: number;
    };
    errors: Record<string, string>;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onCheckboxChange: (name: string, checked: boolean) => void;
    isSubmitting: boolean;
}

export function BasicInfoTab({ 
    formData, 
    errors, 
    onInputChange, 
    onCheckboxChange, 
    isSubmitting 
}: BasicInfoTabProps) {
    return (
        <div className="space-y-5">
            {/* Title */}
            <div className="space-y-2">
                <Label htmlFor="title" className="dark:text-gray-300">
                    Banner Title <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                    <Type className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <Input
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={onInputChange}
                        placeholder="Enter banner title"
                        className={`pl-10 ${errors.title ? 'border-destructive' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300`}
                        disabled={isSubmitting}
                        maxLength={255}
                    />
                </div>
                {errors.title && <p className="text-sm text-red-600 dark:text-red-400">{errors.title}</p>}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    A descriptive title for internal reference
                </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
                <Label htmlFor="description" className="dark:text-gray-300">
                    Description
                </Label>
                <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={onInputChange}
                    placeholder="Enter banner description (displayed on hover)"
                    rows={3}
                    className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                    disabled={isSubmitting}
                    maxLength={500}
                />
                {errors.description && <p className="text-sm text-red-600 dark:text-red-400">{errors.description}</p>}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    Optional description shown to users
                </p>
            </div>

            {/* Link URL */}
            <div className="space-y-2">
                <Label htmlFor="link_url" className="dark:text-gray-300">
                    Link URL
                </Label>
                <div className="relative">
                    <Link2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <Input
                        id="link_url"
                        name="link_url"
                        value={formData.link_url}
                        onChange={onInputChange}
                        placeholder="https://example.com/page"
                        className={`pl-10 ${errors.link_url ? 'border-destructive' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300`}
                        disabled={isSubmitting}
                    />
                </div>
                {errors.link_url && <p className="text-sm text-red-600 dark:text-red-400">{errors.link_url}</p>}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    Where users go when clicking the banner
                </p>
            </div>

            {/* Button Text */}
            <div className="space-y-2">
                <Label htmlFor="button_text" className="dark:text-gray-300">
                    Button Text
                </Label>
                <Input
                    id="button_text"
                    name="button_text"
                    value={formData.button_text}
                    onChange={onInputChange}
                    placeholder="Learn More"
                    className={`${errors.button_text ? 'border-destructive' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300`}
                    disabled={isSubmitting}
                    maxLength={100}
                />
                {errors.button_text && <p className="text-sm text-red-600 dark:text-red-400">{errors.button_text}</p>}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    Optional call-to-action button text
                </p>
            </div>

            {/* Alt Text */}
            <div className="space-y-2">
                <Label htmlFor="alt_text" className="dark:text-gray-300">
                    Alt Text <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                    <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <Input
                        id="alt_text"
                        name="alt_text"
                        value={formData.alt_text}
                        onChange={onInputChange}
                        placeholder="Describe the banner image"
                        className={`pl-10 ${errors.alt_text ? 'border-destructive' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300`}
                        disabled={isSubmitting}
                        maxLength={255}
                    />
                </div>
                {errors.alt_text && <p className="text-sm text-red-600 dark:text-red-400">{errors.alt_text}</p>}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    Important for accessibility and SEO
                </p>
            </div>

            {/* Sort Order */}
            <div className="space-y-2">
                <Label htmlFor="sort_order" className="dark:text-gray-300">
                    Display Order
                </Label>
                <div className="relative">
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <Input
                        id="sort_order"
                        name="sort_order"
                        type="number"
                        min="0"
                        value={formData.sort_order}
                        onChange={onInputChange}
                        className={`pl-10 ${errors.sort_order ? 'border-destructive' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300`}
                        disabled={isSubmitting}
                    />
                </div>
                {errors.sort_order && <p className="text-sm text-red-600 dark:text-red-400">{errors.sort_order}</p>}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    Lower numbers appear first
                </p>
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between py-2">
                <div className="space-y-1">
                    <Label htmlFor="is_active" className="dark:text-gray-300">
                        Active Status
                    </Label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Enable or disable this banner
                    </p>
                </div>
                <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => onCheckboxChange('is_active', checked)}
                    disabled={isSubmitting}
                />
            </div>
        </div>
    );
}