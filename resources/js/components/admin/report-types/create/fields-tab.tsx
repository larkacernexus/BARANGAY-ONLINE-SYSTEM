// components/admin/report-types/create/fields-tab.tsx
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Card,
    CardContent,
} from '@/components/ui/card';
import { Plus, Trash2, GripVertical, ChevronUp, ChevronDown, Settings, X, ListChecks } from 'lucide-react';

interface RequiredField {
    key: string;
    label: string;
    type: string;
    required: boolean;
    placeholder?: string;
    options?: string[];
    rows?: number;
}

interface FieldsTabProps {
    formData: any;
    errors: Record<string, string>;
    requiredFields: RequiredField[];
    newField: RequiredField;
    newOption: string;
    showCustomFieldForm: boolean;
    editingFieldIndex: number | null;
    fieldTypes: Record<string, string>;
    onAddField: () => void;
    onUpdateField: () => void;
    onEditField: (index: number) => void;
    onRemoveField: (index: number) => void;
    onMoveFieldUp: (index: number) => void;
    onMoveFieldDown: (index: number) => void;
    onCancelFieldForm: () => void;
    onNewFieldChange: (field: keyof RequiredField, value: any) => void;
    onAddOption: () => void;
    onRemoveOption: (index: number) => void;
    onNewOptionChange: (value: string) => void;
    isSubmitting: boolean;
}

export function FieldsTab({
    formData,
    errors,
    requiredFields,
    newField,
    newOption,
    showCustomFieldForm,
    editingFieldIndex,
    fieldTypes,
    onAddField,
    onUpdateField,
    onEditField,
    onRemoveField,
    onMoveFieldUp,
    onMoveFieldDown,
    onCancelFieldForm,
    onNewFieldChange,
    onAddOption,
    onRemoveOption,
    onNewOptionChange,
    isSubmitting
}: FieldsTabProps) {
    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-medium dark:text-gray-300">Custom Fields</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Configure the fields required for this report type
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        onNewFieldChange('key', '');
                        onNewFieldChange('label', '');
                        onNewFieldChange('type', 'text');
                        onNewFieldChange('required', true);
                        onNewFieldChange('placeholder', '');
                        onNewFieldChange('options', []);
                        onCancelFieldForm();
                        // This would need to be handled by parent - for now just call a function
                    }}
                    disabled={isSubmitting}
                    className="dark:border-gray-600 dark:text-gray-300"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Field
                </Button>
            </div>

            {/* Custom Field Form */}
            {showCustomFieldForm && (
                <Card className="border border-orange-200 bg-orange-50/50 dark:bg-orange-900/10 dark:border-orange-800">
                    <CardContent className="pt-6 space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="field_key" className="dark:text-gray-300">Field Key *</Label>
                                <Input
                                    id="field_key"
                                    value={newField.key}
                                    onChange={(e) => onNewFieldChange('key', e.target.value)}
                                    placeholder="e.g., complainant_name"
                                    className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="field_label" className="dark:text-gray-300">Field Label *</Label>
                                <Input
                                    id="field_label"
                                    value={newField.label}
                                    onChange={(e) => onNewFieldChange('label', e.target.value)}
                                    placeholder="e.g., Full Name"
                                    className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="field_type" className="dark:text-gray-300">Field Type</Label>
                                <Select
                                    value={newField.type}
                                    onValueChange={(value) => onNewFieldChange('type', value)}
                                    disabled={isSubmitting}
                                >
                                    <SelectTrigger className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300">
                                        <SelectValue placeholder="Select field type" />
                                    </SelectTrigger>
                                    <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                                        {Object.entries(fieldTypes).map(([value, label]) => (
                                            <SelectItem key={value} value={value} className="dark:text-gray-300">
                                                {label as string}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="field_required" className="dark:text-gray-300">Required</Label>
                                <div className="flex items-center gap-2 pt-2">
                                    <input
                                        type="checkbox"
                                        checked={newField.required}
                                        onChange={(e) => onNewFieldChange('required', e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 dark:border-gray-600"
                                        disabled={isSubmitting}
                                    />
                                    <span className="text-sm dark:text-gray-300">Make this field required</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="field_placeholder" className="dark:text-gray-300">Placeholder (Optional)</Label>
                            <Input
                                id="field_placeholder"
                                value={newField.placeholder || ''}
                                onChange={(e) => onNewFieldChange('placeholder', e.target.value)}
                                placeholder="e.g., Enter your full name"
                                className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                disabled={isSubmitting}
                            />
                        </div>

                        {newField.type === 'textarea' && (
                            <div className="space-y-2">
                                <Label htmlFor="field_rows" className="dark:text-gray-300">Number of Rows</Label>
                                <Input
                                    id="field_rows"
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={newField.rows || 3}
                                    onChange={(e) => onNewFieldChange('rows', parseInt(e.target.value))}
                                    className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                    disabled={isSubmitting}
                                />
                            </div>
                        )}

                        {newField.type === 'select' && (
                            <div className="space-y-2">
                                <Label className="dark:text-gray-300">Options</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={newOption}
                                        onChange={(e) => onNewOptionChange(e.target.value)}
                                        placeholder="Enter an option"
                                        className="flex-1 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                onAddOption();
                                            }
                                        }}
                                        disabled={isSubmitting}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={onAddOption}
                                        disabled={isSubmitting}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {newField.options?.map((opt, idx) => (
                                        <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                                            {opt}
                                            <button
                                                type="button"
                                                onClick={() => onRemoveOption(idx)}
                                                className="hover:text-red-600"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-end gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={onCancelFieldForm}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                variant="default"
                                size="sm"
                                onClick={editingFieldIndex !== null ? onUpdateField : onAddField}
                                disabled={isSubmitting}
                                className="bg-gradient-to-r from-orange-600 to-red-600 text-white"
                            >
                                {editingFieldIndex !== null ? 'Update' : 'Add'} Field
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Fields List */}
            {requiredFields.length > 0 ? (
                <div className="space-y-2">
                    {requiredFields.map((field, index) => (
                        <Card key={index} className="border dark:bg-gray-900 dark:border-gray-700">
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <GripVertical className="h-4 w-4 text-gray-500 dark:text-gray-400 cursor-move" />
                                            <span className="font-medium dark:text-gray-200">{field.label}</span>
                                            {field.required && (
                                                <Badge className="text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Required</Badge>
                                            )}
                                            <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-300">
                                                {field.type}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400 ml-6">
                                            <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">
                                                {field.key}
                                            </code>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 dark:text-gray-400 dark:hover:text-white"
                                            onClick={() => onMoveFieldUp(index)}
                                            disabled={index === 0 || isSubmitting}
                                        >
                                            <ChevronUp className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 dark:text-gray-400 dark:hover:text-white"
                                            onClick={() => onMoveFieldDown(index)}
                                            disabled={index === requiredFields.length - 1 || isSubmitting}
                                        >
                                            <ChevronDown className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 dark:text-gray-400 dark:hover:text-white"
                                            onClick={() => onEditField(index)}
                                            disabled={isSubmitting}
                                        >
                                            <Settings className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                            onClick={() => onRemoveField(index)}
                                            disabled={isSubmitting}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 border-2 border-dashed rounded-lg dark:border-gray-700">
                    <ListChecks className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400">No custom fields added</p>
                    <p className="text-xs text-gray-400 mt-1">This report type will use default fields</p>
                </div>
            )}

            {/* Help text */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                    <ListChecks className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="flex-1">
                        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">📋 About Custom Fields</h4>
                        <ul className="list-disc list-inside space-y-1 text-xs text-blue-700 dark:text-blue-300">
                            <li>Custom fields collect specific information from residents</li>
                            <li>Drag to reorder fields (coming soon)</li>
                            <li>Required fields must be filled before submission</li>
                            <li>Different field types available: text, textarea, select, checkbox, date</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}