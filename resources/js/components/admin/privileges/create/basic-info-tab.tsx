// components/admin/privileges/create/basic-info-tab.tsx
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Hash, Sparkles, Copy, HelpCircle, Award, Check } from 'lucide-react';

interface BasicInfoTabProps {
    formData: any;
    errors: Record<string, string>;
    copiedField: string | null;
    originalName?: string;
    originalCode?: string;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onGenerateCode: () => void;
    onCopy: (text: string, field: string) => void;
    isSubmitting: boolean;
    isEdit?: boolean;
}

export function BasicInfoTab({
    formData,
    errors,
    copiedField,
    originalName,
    originalCode,
    onInputChange,
    onGenerateCode,
    onCopy,
    isSubmitting,
    isEdit = false
}: BasicInfoTabProps) {
    return (
        <div className="space-y-4">
            {/* Code and Name */}
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="code" className="flex items-center gap-1 dark:text-gray-300">
                        Code
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger type="button">
                                    <HelpCircle className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                </TooltipTrigger>
                                <TooltipContent className="dark:bg-gray-900 dark:text-gray-300">
                                    <p>Unique identifier (uppercase letters, numbers, underscores)</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </Label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                            <Input
                                id="code"
                                name="code"
                                value={formData.code}
                                onChange={onInputChange}
                                placeholder="e.g., SENIOR_CITIZEN"
                                className={`pl-10 font-mono ${errors.code ? 'border-destructive' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300`}
                                disabled={isSubmitting}
                            />
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={onGenerateCode}
                            disabled={!formData.name || isSubmitting}
                            title="Generate from name"
                            className="dark:border-gray-600 dark:text-gray-300"
                        >
                            <Sparkles className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => onCopy(formData.code, 'Code')}
                            disabled={!formData.code || isSubmitting}
                            title="Copy to clipboard"
                            className="dark:border-gray-600 dark:text-gray-300"
                        >
                            {copiedField === 'Code' ? (
                                <Check className="h-4 w-4 text-green-600" />
                            ) : (
                                <Copy className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                    {errors.code && (
                        <p className="text-sm text-red-600 dark:text-red-400">{errors.code}</p>
                    )}
                    {isEdit && originalCode && formData.code !== originalCode && (
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                            Was: {originalCode}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="name" className="dark:text-gray-300">
                        Privilege Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={onInputChange}
                        placeholder="e.g., Senior Citizen Discount"
                        className={`${errors.name ? 'border-destructive' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300`}
                        disabled={isSubmitting}
                    />
                    {errors.name && (
                        <p className="text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                    )}
                    {isEdit && originalName && formData.name !== originalName && (
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                            Was: {originalName}
                        </p>
                    )}
                </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
                <Label htmlFor="description" className="dark:text-gray-300">Description</Label>
                <Textarea
                    id="description"
                    name="description"
                    value={formData.description || ''}
                    onChange={onInputChange}
                    placeholder="Describe the privilege, eligibility criteria, and benefits..."
                    rows={4}
                    className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                    disabled={isSubmitting}
                />
            </div>

            {/* Help text */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                    <Award className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="flex-1">
                        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">📝 About Privileges</h4>
                        <ul className="list-disc list-inside space-y-1 text-xs text-blue-700 dark:text-blue-300">
                            <li>Privileges define special benefits for specific resident groups</li>
                            <li>The code is used internally for system identification</li>
                            <li>Clear descriptions help residents understand eligibility</li>
                            <li>Set appropriate discount percentages based on legal requirements</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}