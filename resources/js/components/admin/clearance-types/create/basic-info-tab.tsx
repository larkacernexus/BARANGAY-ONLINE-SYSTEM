// components/admin/clearance-types/create/basic-info-tab.tsx
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
import { Hash, Sparkles, Copy, Check, HelpCircle } from 'lucide-react';

interface BasicInfoTabProps {
    formData: any;
    errors: Record<string, string>;
    originalName?: string;
    originalCode?: string;
    originalDescription?: string;
    copiedField?: string | null;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onGenerateCode: () => void;
    onCopy?: (text: string, field: string) => void;
    isSubmitting: boolean;
}

export function BasicInfoTab({
    formData,
    errors,
    originalName,
    originalCode,
    originalDescription,
    copiedField,
    onInputChange,
    onGenerateCode,
    onCopy,
    isSubmitting
}: BasicInfoTabProps) {
    return (
        <div className="space-y-4">
            {/* Name Field */}
            <div className="space-y-2">
                <Label htmlFor="name" className="dark:text-gray-300">
                    Name <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={onInputChange}
                    placeholder="e.g., Business Clearance"
                    className={`${errors.name ? 'border-destructive' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300`}
                    disabled={isSubmitting}
                    autoFocus
                />
                {errors.name && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                )}
                {originalName && formData.name !== originalName && (
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                        Was: {originalName}
                    </p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    Enter the clearance type name first - the code can be auto-generated
                </p>
            </div>

            {/* Code Field */}
            <div className="space-y-2">
                <Label htmlFor="code" className="flex items-center gap-1 dark:text-gray-300">
                    Code <span className="text-red-500">*</span>
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
                            placeholder="e.g., BUSINESS_CLEARANCE"
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
                    {onCopy && (
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
                    )}
                </div>
                {errors.code && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.code}</p>
                )}
                {originalCode && formData.code !== originalCode && (
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                        Was: {originalCode}
                    </p>
                )}
            </div>

            {/* Description */}
            <div className="space-y-2">
                <Label htmlFor="description" className="dark:text-gray-300">Description</Label>
                <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={onInputChange}
                    placeholder="Enter a description for this clearance type"
                    rows={4}
                    className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                    disabled={isSubmitting}
                />
                {originalDescription !== undefined && formData.description !== originalDescription && (
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                        Description has been modified
                    </p>
                )}
            </div>

            {/* Help text */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                    <div className="flex-1">
                        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">📝 About Clearance Types</h4>
                        <ul className="list-disc list-inside space-y-1 text-xs text-blue-700 dark:text-blue-300">
                            <li>Clearance types define what certificates residents can request</li>
                            <li>The code is used internally for system identification</li>
                            <li>Add a clear description to help residents understand the purpose</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}