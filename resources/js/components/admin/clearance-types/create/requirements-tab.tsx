// components/admin/clearance-types/create/requirements-tab.tsx
import { JSX, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Filter, Search, Plus, Trash2, X } from 'lucide-react';

interface DocumentType {
    id: number;
    name: string;
    description: string;
    category: string;
    is_required: boolean;
}

interface EligibilityCriterion {
    field: string;
    operator: string;
    value: string;
}

interface RequirementsTabProps {
    formData: any;
    errors: Record<string, string>;
    documentTypes: DocumentType[];
    filteredDocumentTypes: DocumentType[];
    documentCategories: string[];
    selectedDocumentTypes: number[];
    documentCategory: string;
    searchDocument: string;
    eligibilityCriteria: EligibilityCriterion[];
    eligibilityOperators: Array<{ value: string; label: string }>;
    residentFields: Array<{ value: string; label: string; icon: JSX.Element }>;
    showEligibilityForm: boolean;
    onDocumentCategoryChange: (value: string) => void;
    onSearchDocumentChange: (value: string) => void;
    onDocumentTypeToggle: (id: number) => void;
    onAddEligibilityCriterion: () => void;
    onUpdateEligibilityCriterion: (index: number, field: keyof EligibilityCriterion, value: string) => void;
    onRemoveEligibilityCriterion: (index: number) => void;
    onToggleEligibilityForm: () => void;
    isSubmitting: boolean;
}

export function RequirementsTab({
    formData,
    errors,
    documentTypes,
    filteredDocumentTypes,
    documentCategories,
    selectedDocumentTypes,
    documentCategory,
    searchDocument,
    eligibilityCriteria,
    eligibilityOperators,
    residentFields,
    showEligibilityForm,
    onDocumentCategoryChange,
    onSearchDocumentChange,
    onDocumentTypeToggle,
    onAddEligibilityCriterion,
    onUpdateEligibilityCriterion,
    onRemoveEligibilityCriterion,
    onToggleEligibilityForm,
    isSubmitting
}: RequirementsTabProps) {
    return (
        <div className="space-y-6">
            {/* Document Requirements Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-medium dark:text-gray-300">Document Requirements</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Select required documents for this clearance type
                        </p>
                    </div>
                    <Badge variant="outline" className="dark:border-gray-600">
                        {selectedDocumentTypes.length} selected
                    </Badge>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                            <Input
                                placeholder="Search documents..."
                                value={searchDocument}
                                onChange={(e) => onSearchDocumentChange(e.target.value)}
                                className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>
                    <Select value={documentCategory} onValueChange={onDocumentCategoryChange} disabled={isSubmitting}>
                        <SelectTrigger className="w-full sm:w-[180px] dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300">
                            <SelectValue placeholder="Filter by category" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                            {documentCategories.map(category => (
                                <SelectItem key={category} value={category} className="dark:text-gray-300 dark:focus:bg-gray-700">
                                    {category === 'all' ? 'All Categories' : category}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Selected Documents */}
                {selectedDocumentTypes.length > 0 && (
                    <div className="space-y-2">
                        <Label className="dark:text-gray-300">Selected Documents ({selectedDocumentTypes.length})</Label>
                        <div className="flex flex-wrap gap-2">
                            {selectedDocumentTypes.map(docId => {
                                const doc = documentTypes.find(d => d.id === docId);
                                return doc ? (
                                    <Badge
                                        key={doc.id}
                                        variant="secondary"
                                        className="flex items-center gap-1 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"
                                    >
                                        {doc.name}
                                        <button
                                            type="button"
                                            onClick={() => onDocumentTypeToggle(doc.id)}
                                            className="ml-1 hover:text-red-600 dark:hover:text-red-400"
                                            disabled={isSubmitting}
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ) : null;
                            })}
                        </div>
                    </div>
                )}

                {/* Document List */}
                <div className="border rounded-lg dark:border-gray-700 divide-y dark:divide-gray-700 max-h-[300px] overflow-y-auto">
                    {filteredDocumentTypes.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                            No documents found. Try a different search or category.
                        </div>
                    ) : (
                        filteredDocumentTypes.map((docType) => (
                            <div
                                key={docType.id}
                                className="flex items-start gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                            >
                                <Checkbox
                                    checked={selectedDocumentTypes.includes(docType.id)}
                                    onCheckedChange={() => onDocumentTypeToggle(docType.id)}
                                    id={`doc-${docType.id}`}
                                    className="mt-0.5 dark:border-gray-600"
                                    disabled={isSubmitting}
                                />
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <Label
                                                htmlFor={`doc-${docType.id}`}
                                                className="font-medium cursor-pointer dark:text-gray-200"
                                            >
                                                {docType.name}
                                                {docType.is_required && (
                                                    <Badge className="ml-2 text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800">
                                                        Required
                                                    </Badge>
                                                )}
                                            </Label>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                {docType.description}
                                            </p>
                                        </div>
                                        {docType.category && (
                                            <Badge variant="outline" className="ml-2 dark:border-gray-600 dark:text-gray-300">
                                                {docType.category}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Eligibility Criteria Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-medium dark:text-gray-300">Eligibility Criteria</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Define who can apply for this clearance
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onToggleEligibilityForm}
                        className="dark:text-gray-400 dark:hover:text-white"
                        disabled={isSubmitting}
                    >
                        {showEligibilityForm ? 'Hide' : 'Configure'}
                    </Button>
                </div>

                {showEligibilityForm && (
                    <div className="space-y-4">
                        {eligibilityCriteria.map((criterion, index) => (
                            <div key={index} className="p-3 border rounded-lg dark:border-gray-700 space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm dark:text-gray-300">Criterion {index + 1}</Label>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onRemoveEligibilityCriterion(index)}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/50"
                                        disabled={isSubmitting}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="grid gap-2">
                                    <Select
                                        value={criterion.field}
                                        onValueChange={(value) => onUpdateEligibilityCriterion(index, 'field', value)}
                                        disabled={isSubmitting}
                                    >
                                        <SelectTrigger className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300">
                                            <SelectValue placeholder="Select field" />
                                        </SelectTrigger>
                                        <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                                            {residentFields.map((field) => (
                                                <SelectItem key={field.value} value={field.value} className="dark:text-gray-300 dark:focus:bg-gray-700">
                                                    <div className="flex items-center gap-2">
                                                        {field.icon}
                                                        <span>{field.label}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Select
                                        value={criterion.operator}
                                        onValueChange={(value) => onUpdateEligibilityCriterion(index, 'operator', value)}
                                        disabled={isSubmitting}
                                    >
                                        <SelectTrigger className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300">
                                            <SelectValue placeholder="Select operator" />
                                        </SelectTrigger>
                                        <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                                            {eligibilityOperators.map((operator) => (
                                                <SelectItem key={operator.value} value={operator.value} className="dark:text-gray-300 dark:focus:bg-gray-700">
                                                    {operator.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Input
                                        value={criterion.value}
                                        onChange={(e) => onUpdateEligibilityCriterion(index, 'value', e.target.value)}
                                        placeholder="Value to compare"
                                        className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full dark:border-gray-600 dark:text-gray-300"
                            onClick={onAddEligibilityCriterion}
                            disabled={isSubmitting}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Criterion
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}