// components/admin/roles/create/basic-info-tab.tsx
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
import { Hash, Copy, Check, HelpCircle, Shield } from 'lucide-react';

interface BasicInfoTabProps {
    formData: any;
    errors: Record<string, string>;
    copiedField: string | null;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onCopy: (text: string, field: string) => void;
    isSubmitting: boolean;
    isSystemRole?: boolean;
    originalName?: string;
    originalDescription?: string;
}

export function BasicInfoTab({
    formData,
    errors,
    copiedField,
    onInputChange,
    onCopy,
    isSubmitting,
    isSystemRole = false,
    originalName,
    originalDescription
}: BasicInfoTabProps) {
    return (
        <div className="space-y-4">
            {/* Name Field */}
            <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-1 dark:text-gray-300">
                    Role Name <span className="text-red-500">*</span>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger type="button">
                                <HelpCircle className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                            </TooltipTrigger>
                            <TooltipContent className="dark:bg-gray-900 dark:text-gray-300">
                                <p>Technical name used in code (lowercase, underscores only)</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </Label>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={onInputChange}
                            placeholder="e.g., content_editor"
                            className={`pl-10 font-mono ${errors.name ? 'border-destructive' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300`}
                            disabled={isSubmitting || isSystemRole}
                        />
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => onCopy(formData.name, 'Role name')}
                        disabled={!formData.name || isSubmitting}
                        title="Copy to clipboard"
                        className="dark:border-gray-600 dark:text-gray-300"
                    >
                        {copiedField === 'Role name' ? (
                            <Check className="h-4 w-4 text-green-600" />
                        ) : (
                            <Copy className="h-4 w-4" />
                        )}
                    </Button>
                </div>
                {errors.name && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                )}
                {isSystemRole && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        System role name cannot be changed
                    </p>
                )}
                {originalName && formData.name !== originalName && !isSystemRole && (
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                        Was: {originalName}
                    </p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    Use lowercase letters and underscores only. Example: content_editor
                </p>
            </div>

            {/* Description Field */}
            <div className="space-y-2">
                <Label htmlFor="description" className="dark:text-gray-300">
                    Description
                </Label>
                <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={onInputChange}
                    placeholder="Describe what this role can do and who should have it..."
                    rows={4}
                    className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                    disabled={isSubmitting || isSystemRole}
                />
                {isSystemRole && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        System role description cannot be changed
                    </p>
                )}
                {originalDescription !== undefined && formData.description !== originalDescription && !isSystemRole && (
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                        Description has been modified
                    </p>
                )}
            </div>

            {/* Help text */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="flex-1">
                        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">📝 About Roles</h4>
                        <ul className="list-disc list-inside space-y-1 text-xs text-blue-700 dark:text-blue-300">
                            <li>Roles define what users can do in the system</li>
                            <li>The role name is used internally in the code</li>
                            <li>System roles are protected and cannot be deleted</li>
                            <li>Add a clear description to help other administrators</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}