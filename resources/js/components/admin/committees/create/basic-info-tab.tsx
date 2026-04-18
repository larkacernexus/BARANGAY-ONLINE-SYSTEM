// pages/admin/committees/components/basic-info-tab.tsx
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Hash, RefreshCw, CheckCircle, HelpCircle, Lock, Unlock, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface BasicInfoTabProps {
    formData: any;
    errors: Record<string, string>;
    onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onCodeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onOrderChange: (name: string, value: number) => void;
    onDescriptionChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onResetCode: () => void;
    isSubmitting: boolean;
    nextOrder: number;
    isCodeManuallyEdited: boolean;
}

export function BasicInfoTab({
    formData,
    errors,
    onNameChange,
    onCodeChange,
    onOrderChange,
    onDescriptionChange,
    onResetCode,
    isSubmitting,
    nextOrder,
    isCodeManuallyEdited
}: BasicInfoTabProps) {
    const handleCopy = (text: string, field: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        toast.success(`${field} copied to clipboard`);
    };

    return (
        <TooltipProvider>
            <div className="space-y-4">
                {/* Name Field */}
                <div className="space-y-2">
                    <Label htmlFor="name" className="dark:text-gray-300">
                        Committee Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={onNameChange}
                        placeholder="e.g., Peace and Order Committee"
                        className={`${errors.name ? 'border-destructive' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300`}
                        disabled={isSubmitting}
                        autoFocus
                    />
                    {errors.name && (
                        <p className="text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Enter the committee name first - the code will be auto-generated
                    </p>
                </div>

                {/* Code Field */}
                <div className="space-y-2">
                    <Label htmlFor="code" className="flex items-center gap-1 dark:text-gray-300">
                        Code <span className="text-red-500">*</span>
                        <Tooltip>
                            <TooltipTrigger type="button">
                                <HelpCircle className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                            </TooltipTrigger>
                            <TooltipContent className="dark:bg-gray-900 dark:text-gray-300">
                                <p>Unique identifier (lowercase letters, numbers, underscores)</p>
                            </TooltipContent>
                        </Tooltip>
                    </Label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                            <Input
                                id="code"
                                name="code"
                                value={formData.code}
                                onChange={onCodeChange}
                                placeholder="e.g., peace_and_order"
                                className={`pl-10 font-mono ${errors.code ? 'border-destructive' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 ${
                                    !isCodeManuallyEdited && formData.code ? 'border-green-500 dark:border-green-600' : ''
                                }`}
                                disabled={isSubmitting}
                            />
                            {!isCodeManuallyEdited && formData.code && (
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                </div>
                            )}
                        </div>
                        {isCodeManuallyEdited && (
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={onResetCode}
                                disabled={!formData.name || isSubmitting}
                                title="Reset to auto-generated"
                                className="dark:border-gray-600 dark:text-gray-300"
                            >
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                        )}
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => handleCopy(formData.code, 'Code')}
                            disabled={!formData.code || isSubmitting}
                            title="Copy to clipboard"
                            className="dark:border-gray-600 dark:text-gray-300"
                        >
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                    {errors.code && (
                        <p className="text-sm text-red-600 dark:text-red-400">{errors.code}</p>
                    )}
                    <div className="flex items-center gap-2 text-xs">
                        {isCodeManuallyEdited ? (
                            <>
                                <Unlock className="h-3 w-3 text-amber-500 dark:text-amber-400" />
                                <span className="text-gray-500 dark:text-gray-400">Manually edited</span>
                            </>
                        ) : formData.code ? (
                            <>
                                <Lock className="h-3 w-3 text-green-500 dark:text-green-400" />
                                <span className="text-green-600 dark:text-green-400">Auto-generated from name</span>
                            </>
                        ) : (
                            <span className="text-gray-500 dark:text-gray-400">Will be auto-generated from name</span>
                        )}
                    </div>
                </div>

                {/* Display Order */}
                <div className="space-y-2">
                    <Label htmlFor="order" className="dark:text-gray-300">
                        Display Order
                        <Tooltip>
                            <TooltipTrigger type="button">
                                <HelpCircle className="h-4 w-4 text-gray-400 dark:text-gray-500 ml-1" />
                            </TooltipTrigger>
                            <TooltipContent className="dark:bg-gray-900 dark:text-gray-300">
                                <p>Determines sorting in lists (lower numbers appear first)</p>
                            </TooltipContent>
                        </Tooltip>
                    </Label>
                    <div className="relative">
                        <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <Input
                            id="order"
                            name="order"
                            type="number"
                            min="0"
                            value={formData.order}
                            onChange={(e) => onOrderChange('order', parseInt(e.target.value) || 0)}
                            className={`pl-10 ${errors.order ? 'border-destructive' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300`}
                            disabled={isSubmitting}
                        />
                    </div>
                    {errors.order && (
                        <p className="text-sm text-red-600 dark:text-red-400">{errors.order}</p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Suggested next order: {nextOrder}
                    </p>
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <Label htmlFor="description" className="dark:text-gray-300">Description</Label>
                    <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={onDescriptionChange}
                        placeholder="Describe the committee's responsibilities and purpose..."
                        rows={4}
                        className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                        disabled={isSubmitting}
                    />
                </div>
            </div>
        </TooltipProvider>
    );
}