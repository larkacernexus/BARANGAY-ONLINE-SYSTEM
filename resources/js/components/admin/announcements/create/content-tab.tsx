// components/admin/announcements/create/content-tab.tsx
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Megaphone, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ContentTabProps {
    formData: {
        title: string;
        content: string;
        [key: string]: any;
    };
    errors: Record<string, string>;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    isSubmitting: boolean;
    originalTitle?: string;
    originalContent?: string;
}

export function ContentTab({
    formData,
    errors,
    onInputChange,
    isSubmitting,
    originalTitle,
    originalContent
}: ContentTabProps) {
    const isTitleModified = originalTitle !== undefined && formData.title !== originalTitle;
    const isContentModified = originalContent !== undefined && formData.content !== originalContent;

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="title" className="dark:text-gray-300">
                        Title <span className="text-red-500">*</span>
                    </Label>
                    {isTitleModified && (
                        <Badge variant="outline" className="text-xs text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                            Modified
                        </Badge>
                    )}
                </div>
                <Input
                    id="title"
                    name="title"
                    value={formData.title || ''}
                    onChange={onInputChange}
                    placeholder="e.g., Important: Water Service Interruption"
                    className={`text-lg font-medium ${errors.title ? 'border-destructive' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300`}
                    disabled={isSubmitting}
                    maxLength={255}
                />
                {errors.title && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.title}</p>
                )}
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Make the title clear and attention-grabbing</span>
                    <span>{formData.title?.length || 0}/255 characters</span>
                </div>
                {originalTitle && isTitleModified && (
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                        Original: {originalTitle}
                    </p>
                )}
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="content" className="dark:text-gray-300">
                        Content <span className="text-red-500">*</span>
                    </Label>
                    {isContentModified && (
                        <Badge variant="outline" className="text-xs text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                            Modified
                        </Badge>
                    )}
                </div>
                <Textarea
                    id="content"
                    name="content"
                    value={formData.content || ''}
                    onChange={onInputChange}
                    placeholder="Enter the full announcement details here..."
                    rows={8}
                    className={`min-h-[200px] font-mono ${errors.content ? 'border-destructive' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300`}
                    disabled={isSubmitting}
                />
                {errors.content && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.content}</p>
                )}
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Supports plain text. Keep it clear and concise.</span>
                    <span>{formData.content?.length || 0} characters</span>
                </div>
                {originalContent && isContentModified && (
                    <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Original content:</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap line-clamp-3">
                            {originalContent}
                        </p>
                    </div>
                )}
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                    <Megaphone className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="flex-1">
                        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Writing Tips</h4>
                        <ul className="list-disc list-inside space-y-1 text-xs text-blue-700 dark:text-blue-300">
                            <li><span className="font-semibold">Title:</span> Keep it short (under 100 characters) and descriptive</li>
                            <li><span className="font-semibold">Content:</span> Include who, what, when, where, and why</li>
                            <li><span className="font-semibold">Tone:</span> Be clear, professional, and empathetic</li>
                            <li><span className="font-semibold">Call to Action:</span> Tell residents what they need to do</li>
                            <li><span className="font-semibold">Formatting:</span> Use line breaks to separate sections for readability</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <div className="flex-1">
                        <h4 className="font-medium text-amber-800 dark:text-amber-300 mb-2">Preview Help</h4>
                        <p className="text-xs text-amber-700 dark:text-amber-300">
                            Use the preview panel on the right to see how your announcement will appear to residents.
                            The preview updates in real-time as you type.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}