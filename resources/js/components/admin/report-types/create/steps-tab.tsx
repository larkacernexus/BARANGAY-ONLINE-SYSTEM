// components/admin/report-types/create/steps-tab.tsx
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
} from '@/components/ui/card';
import { Plus, Trash2, Activity } from 'lucide-react';

interface ResolutionStep {
    step: number;
    action: string;
    description: string;
}

interface StepsTabProps {
    resolutionSteps: ResolutionStep[];
    onAddStep: () => void;
    onUpdateStep: (index: number, field: keyof ResolutionStep, value: string) => void;
    onRemoveStep: (index: number) => void;
    isSubmitting: boolean;
}

export function StepsTab({
    resolutionSteps,
    onAddStep,
    onUpdateStep,
    onRemoveStep,
    isSubmitting
}: StepsTabProps) {
    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-medium dark:text-gray-300">Resolution Steps</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Define the steps to resolve this type of report
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onAddStep}
                    disabled={isSubmitting}
                    className="dark:border-gray-600 dark:text-gray-300"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Step
                </Button>
            </div>

            {/* Steps List */}
            {resolutionSteps.length > 0 ? (
                <div className="space-y-3">
                    {resolutionSteps.map((step, index) => (
                        <Card key={index} className="border dark:bg-gray-900 dark:border-gray-700">
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                                        <span className="text-xs font-bold text-orange-600 dark:text-orange-400">{step.step}</span>
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <Input
                                            value={step.action}
                                            onChange={(e) => onUpdateStep(index, 'action', e.target.value)}
                                            placeholder="Action title"
                                            className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                            disabled={isSubmitting}
                                        />
                                        <Textarea
                                            value={step.description}
                                            onChange={(e) => onUpdateStep(index, 'description', e.target.value)}
                                            placeholder="Step description"
                                            rows={2}
                                            className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                        onClick={() => onRemoveStep(index)}
                                        disabled={isSubmitting}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 border-2 border-dashed rounded-lg dark:border-gray-700">
                    <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400">No resolution steps defined</p>
                    <p className="text-xs text-gray-400 mt-1">Click "Add Step" to create resolution workflow</p>
                </div>
            )}

            {/* Help text */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                    <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="flex-1">
                        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">🔄 About Resolution Steps</h4>
                        <ul className="list-disc list-inside space-y-1 text-xs text-blue-700 dark:text-blue-300">
                            <li>Define the workflow for handling this report type</li>
                            <li>Steps guide barangay officials through resolution process</li>
                            <li>Steps are displayed in order of execution</li>
                            <li>Each step should have a clear action and description</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}