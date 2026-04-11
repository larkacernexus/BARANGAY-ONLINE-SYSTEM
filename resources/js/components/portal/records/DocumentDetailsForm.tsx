// components/portal/records/DocumentDetailsForm.tsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, ChevronDown, ChevronUp } from 'lucide-react';

// Use a more flexible type that matches the shape
interface DocumentDetailsFormData {
    name: string;
    description: string;
    issue_date: string;
    expiry_date: string;
    reference_number: string;
    [key: string]: any; // Allow other properties
}

interface DocumentDetailsFormProps {
    data: DocumentDetailsFormData;
    setData: (key: string, value: any) => void;
    processing: boolean;
    selectedTags: string[];
    customTags: string;
    onTagSelect: (tag: string) => void;
    onCustomTagChange: (value: string) => void;
    onAddCustomTag: () => void;
    showAdvancedOptions: boolean;
    onToggleAdvancedOptions: () => void;
    ocrEnabled: boolean;
    enableDuplicateCheck: boolean;
    onOcrToggle: (enabled: boolean) => void;
    onDuplicateToggle: (enabled: boolean) => void;
}

export function DocumentDetailsForm({
    data,
    setData,
    processing,
    selectedTags,
    customTags,
    onTagSelect,
    onCustomTagChange,
    onAddCustomTag,
    showAdvancedOptions,
    onToggleAdvancedOptions,
    ocrEnabled,
    enableDuplicateCheck,
    onOcrToggle,
    onDuplicateToggle,
}: DocumentDetailsFormProps) {
    return (
        <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardHeader>
                <CardTitle className="dark:text-white">Document Details</CardTitle>
                <CardDescription className="dark:text-gray-400">
                    Provide information about the document
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="dark:text-gray-300">Document Name *</Label>
                        <Input
                            id="name"
                            value={data.name || ''}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="e.g., Birth Certificate, Passport"
                            required
                            disabled={processing}
                            className="dark:bg-gray-900 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-500"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description" className="dark:text-gray-300">Description</Label>
                        <Textarea
                            id="description"
                            value={data.description || ''}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Brief description of the document..."
                            rows={3}
                            disabled={processing}
                            className="dark:bg-gray-900 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-500"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="issue_date" className="dark:text-gray-300">Issue Date</Label>
                            <Input
                                id="issue_date"
                                type="date"
                                value={data.issue_date || ''}
                                onChange={(e) => setData('issue_date', e.target.value)}
                                disabled={processing}
                                className="dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="expiry_date" className="dark:text-gray-300">Expiry Date</Label>
                            <Input
                                id="expiry_date"
                                type="date"
                                value={data.expiry_date || ''}
                                onChange={(e) => setData('expiry_date', e.target.value)}
                                disabled={processing}
                                className="dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="reference_number" className="dark:text-gray-300">Reference Number</Label>
                        <Input
                            id="reference_number"
                            value={data.reference_number || ''}
                            onChange={(e) => setData('reference_number', e.target.value)}
                            placeholder="Auto-generated if empty"
                            disabled={processing}
                            className="dark:bg-gray-900 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-500"
                        />
                    </div>

                    {/* Tags */}
                    <div className="space-y-2">
                        <Label className="dark:text-gray-300">Tags</Label>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                            {selectedTags.map(tag => (
                                <Badge 
                                    key={tag} 
                                    variant="secondary"
                                    className="text-xs cursor-pointer gap-1 px-2 py-0.5 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700"
                                    onClick={() => onTagSelect(tag)}
                                >
                                    {tag}
                                    <X className="h-2.5 w-2.5" />
                                </Badge>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <Input
                                value={customTags}
                                onChange={(e) => onCustomTagChange(e.target.value)}
                                placeholder="Add tags (comma separated)"
                                disabled={processing}
                                className="text-sm flex-1 dark:bg-gray-900 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-500"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={onAddCustomTag}
                                disabled={processing}
                                className="text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                Add
                            </Button>
                        </div>
                    </div>

                    {/* Advanced Options */}
                    <div className="space-y-3">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="w-full justify-between dark:text-gray-300 dark:hover:bg-gray-900"
                            onClick={onToggleAdvancedOptions}
                        >
                            <span>Advanced Options</span>
                            {showAdvancedOptions ? (
                                <ChevronUp className="h-4 w-4" />
                            ) : (
                                <ChevronDown className="h-4 w-4" />
                            )}
                        </Button>
                        
                        {showAdvancedOptions && (
                            <div className="space-y-4 p-3 border rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-700">
                                <div className="space-y-3">
                                    <Label className="dark:text-gray-300">AI Features</Label>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label className="text-sm dark:text-gray-400">Enable OCR</Label>
                                                <p className="text-xs text-gray-500 dark:text-gray-500">Extract text from images</p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={ocrEnabled}
                                                onChange={(e) => onOcrToggle(e.target.checked)}
                                                className="h-4 w-4 dark:bg-gray-700 dark:border-gray-600"
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label className="text-sm dark:text-gray-400">Duplicate Check</Label>
                                                <p className="text-xs text-gray-500 dark:text-gray-500">Find similar documents</p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={enableDuplicateCheck}
                                                onChange={(e) => onDuplicateToggle(e.target.checked)}
                                                className="h-4 w-4 dark:bg-gray-700 dark:border-gray-600"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}