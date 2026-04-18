// pages/admin/puroks/components/basic-info-tab.tsx
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { MapPin, Sparkles, CheckCircle, XCircle } from 'lucide-react';

interface BasicInfoTabProps {
    formData: any;
    errors: Record<string, string>;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onSelectChange: (name: string, value: string) => void;
    isSubmitting: boolean;
    onGenerateCode?: () => void;
}

export function BasicInfoTab({ formData, errors, onInputChange, onSelectChange, isSubmitting, onGenerateCode }: BasicInfoTabProps) {
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name" className="dark:text-gray-300">
                    Name <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={onInputChange}
                            placeholder="Enter name"
                            className={`pl-10 ${errors.name ? 'border-destructive' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300`}
                            disabled={isSubmitting}
                        />
                    </div>
                    {onGenerateCode && (
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={onGenerateCode}
                            disabled={!formData.name || isSubmitting}
                            className="dark:border-gray-600 dark:text-gray-300"
                        >
                            <Sparkles className="h-4 w-4" />
                        </Button>
                    )}
                </div>
                {errors.name && <p className="text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="status" className="dark:text-gray-300">
                    Status <span className="text-red-500">*</span>
                </Label>
                <Select
                    value={formData.status}
                    onValueChange={(value) => onSelectChange('status', value)}
                    disabled={isSubmitting}
                >
                    <SelectTrigger className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300">
                        <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                        <SelectItem value="active" className="dark:text-gray-300">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                Active
                            </div>
                        </SelectItem>
                        <SelectItem value="inactive" className="dark:text-gray-300">
                            <div className="flex items-center gap-2">
                                <XCircle className="h-4 w-4 text-gray-600" />
                                Inactive
                            </div>
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="description" className="dark:text-gray-300">Description</Label>
                <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={onInputChange}
                    placeholder="Enter description"
                    rows={4}
                    className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                    disabled={isSubmitting}
                />
            </div>
        </div>
    );
}