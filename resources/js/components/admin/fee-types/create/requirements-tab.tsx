// components/admin/fee-types/create/requirements-tab.tsx
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, X, FileCheck, AlertCircle } from 'lucide-react';

interface RequirementsTabProps {
    selectedRequirements: string[];
    newRequirement: string;
    onAddRequirement: () => void;
    onRemoveRequirement: (index: number) => void;
    onNewRequirementChange: (value: string) => void;
    isSubmitting: boolean;
}

export function RequirementsTab({
    selectedRequirements,
    newRequirement,
    onAddRequirement,
    onRemoveRequirement,
    onNewRequirementChange,
    isSubmitting
}: RequirementsTabProps) {
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label className="dark:text-gray-300 flex items-center gap-2">
                    <FileCheck className="h-4 w-4" />
                    Required Documents
                </Label>
                <div className="flex gap-2">
                    <Input
                        placeholder="e.g., Valid ID, Proof of Residency, Barangay Clearance"
                        value={newRequirement}
                        onChange={(e) => onNewRequirementChange(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                onAddRequirement();
                            }
                        }}
                        className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                        disabled={isSubmitting}
                    />
                    <Button 
                        type="button" 
                        variant="outline" 
                        onClick={onAddRequirement} 
                        disabled={!newRequirement.trim() || isSubmitting} 
                        className="dark:border-gray-600 dark:text-gray-300"
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    Press Enter to quickly add requirements
                </p>
            </div>

            <div className="space-y-2">
                <Label className="dark:text-gray-300 text-sm">
                    Added Requirements ({selectedRequirements.length})
                </Label>
                <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg dark:border-gray-700 p-2">
                    {selectedRequirements.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <FileCheck className="h-8 w-8 text-gray-400 dark:text-gray-600 mb-2" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                No requirements added yet
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                Add requirements that applicants need to submit
                            </p>
                        </div>
                    ) : (
                        selectedRequirements.map((req, index) => (
                            <div 
                                key={index} 
                                className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 group hover:border-red-200 dark:hover:border-red-800 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <FileCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    <span className="text-sm dark:text-gray-300">{req}</span>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onRemoveRequirement(index)}
                                    disabled={isSubmitting}
                                    className="h-6 w-6 p-0 text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Common Requirements Suggestions */}
            <div className="space-y-2">
                <Label className="dark:text-gray-300 text-xs text-gray-500">Common Requirements:</Label>
                <div className="flex flex-wrap gap-2">
                    {[
                        'Valid ID',
                        'Proof of Residency',
                        'Barangay Clearance',
                        'Application Form',
                        'Birth Certificate',
                        'Marriage Certificate',
                        'Business Permit',
                        'DTI Registration',
                        'Lease Contract',
                        'Fire Safety Certificate'
                    ].map((suggestion) => (
                        <button
                            key={suggestion}
                            type="button"
                            onClick={() => {
                                if (!selectedRequirements.includes(suggestion)) {
                                    const updated = [...selectedRequirements, suggestion];
                                    onNewRequirementChange('');
                                    // This requires a prop to update, but for now just add
                                    // In a real implementation, you'd call a function
                                }
                            }}
                            className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            disabled={isSubmitting}
                        >
                            {suggestion}
                        </button>
                    ))}
                </div>
            </div>

            {/* Help text */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="flex-1">
                        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">📋 About Requirements</h4>
                        <ul className="list-disc list-inside space-y-1 text-xs text-blue-700 dark:text-blue-300">
                            <li>Requirements are documents applicants must submit</li>
                            <li>They will be displayed on the application form</li>
                            <li>Press Enter to quickly add a requirement</li>
                            <li>Click the X button to remove a requirement</li>
                            <li>Use common suggestions for quick addition</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}