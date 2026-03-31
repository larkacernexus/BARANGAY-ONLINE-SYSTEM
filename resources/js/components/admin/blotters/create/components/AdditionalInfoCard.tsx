// components/admin/blotters/create/components/AdditionalInfoCard.tsx

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, FileText, Plus, X, AlertCircle, CheckCircle, HelpCircle } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface AdditionalInfoCardProps {
    witnesses: string;
    evidence: string;
    onWitnessesChange: (value: string) => void;
    onEvidenceChange: (value: string) => void;
    showTips?: boolean;
}

// Helper function to count witnesses
const countWitnesses = (witnessesText: string): number => {
    if (!witnessesText.trim()) return 0;
    const lines = witnessesText.split('\n').filter(line => line.trim());
    const commas = witnessesText.split(',').filter(item => item.trim());
    return Math.max(lines.length, commas.length);
};

// Helper function to check if evidence description is sufficient
const isEvidenceSufficient = (evidenceText: string): boolean => {
    return evidenceText.trim().length > 20;
};

export const AdditionalInfoCard = ({
    witnesses,
    evidence,
    onWitnessesChange,
    onEvidenceChange,
    showTips = true
}: AdditionalInfoCardProps) => {
    const [showWitnessTips, setShowWitnessTips] = useState(false);
    const [showEvidenceTips, setShowEvidenceTips] = useState(false);

    const witnessCount = countWitnesses(witnesses);
    const evidenceSufficient = isEvidenceSufficient(evidence);

    // Helper to add witness template
    const addWitnessTemplate = (): void => {
        const template = `Name: \nContact: \nStatement: \n---\n`;
        onWitnessesChange(witnesses + (witnesses ? '\n' : '') + template);
    };

    // Helper to add evidence template
    const addEvidenceTemplate = (): void => {
        const template = `Type: \nDescription: \nSource: \nLocation: \n---\n`;
        onEvidenceChange(evidence + (evidence ? '\n' : '') + template);
    };

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <Users className="h-5 w-5" />
                        Additional Information
                    </CardTitle>
                    {showTips && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="text-xs text-blue-600 dark:text-blue-400 cursor-help">
                                        <HelpCircle className="h-4 w-4" />
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="text-xs">Include as much detail as possible for better investigation</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
                <CardDescription className="dark:text-gray-400">
                    Additional information that may help in the investigation and resolution
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Witnesses Section */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Label htmlFor="witnesses" className="dark:text-gray-300 font-medium">
                                Witnesses
                            </Label>
                            {witnessCount > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                    {witnessCount} witness{witnessCount !== 1 ? 'es' : ''}
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowWitnessTips(!showWitnessTips)}
                                className="h-7 px-2 text-xs dark:text-gray-400"
                            >
                                {showWitnessTips ? 'Hide Tips' : 'Show Tips'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addWitnessTemplate}
                                className="h-7 px-2 text-xs dark:border-gray-600 dark:text-gray-300"
                            >
                                <Plus className="h-3 w-3 mr-1" />
                                Add Template
                            </Button>
                        </div>
                    </div>

                    {showWitnessTips && (
                        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-xs">
                            <p className="font-medium text-blue-800 dark:text-blue-300 mb-2">Tips for listing witnesses:</p>
                            <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-400">
                                <li>Include full name and contact number</li>
                                <li>Add relationship to the incident (if any)</li>
                                <li>Summarize their statement or testimony</li>
                                <li>Note if they have supporting evidence</li>
                                <li>Separate multiple witnesses with blank lines</li>
                            </ul>
                        </div>
                    )}

                    <Textarea
                        id="witnesses"
                        rows={5}
                        value={witnesses}
                        onChange={(e) => onWitnessesChange(e.target.value)}
                        placeholder="Example:&#10;Name: Juan Dela Cruz&#10;Contact: 09123456789&#10;Statement: Saw the incident from his house&#10;&#10;Name: Maria Santos&#10;Contact: 09876543210&#10;Statement: Heard shouting and saw the altercation"
                        className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 font-mono text-sm"
                    />
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            List all witnesses with their contact information if available
                        </p>
                        {witnessCount > 0 && (
                            <span className="text-xs text-green-600 dark:text-green-400">
                                {witnessCount} witness{witnessCount !== 1 ? 'es' : ''} recorded
                            </span>
                        )}
                    </div>
                </div>

                {/* Evidence Section */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Label htmlFor="evidence" className="dark:text-gray-300 font-medium">
                                Evidence Description
                            </Label>
                            {evidenceSufficient && (
                                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Detailed
                                </Badge>
                            )}
                            {evidence.trim() && !evidenceSufficient && (
                                <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    Add More Detail
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowEvidenceTips(!showEvidenceTips)}
                                className="h-7 px-2 text-xs dark:text-gray-400"
                            >
                                {showEvidenceTips ? 'Hide Tips' : 'Show Tips'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addEvidenceTemplate}
                                className="h-7 px-2 text-xs dark:border-gray-600 dark:text-gray-300"
                            >
                                <Plus className="h-3 w-3 mr-1" />
                                Add Template
                            </Button>
                        </div>
                    </div>

                    {showEvidenceTips && (
                        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-xs">
                            <p className="font-medium text-blue-800 dark:text-blue-300 mb-2">Tips for describing evidence:</p>
                            <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-400">
                                <li>Specify the type of evidence (photo, video, document, etc.)</li>
                                <li>Describe what the evidence shows or contains</li>
                                <li>Note where the evidence is stored or located</li>
                                <li>Mention who has custody of the evidence</li>
                                <li>Include timestamps or dates if relevant</li>
                            </ul>
                        </div>
                    )}

                    <Textarea
                        id="evidence"
                        rows={5}
                        value={evidence}
                        onChange={(e) => onEvidenceChange(e.target.value)}
                        placeholder="Example:&#10;Type: CCTV Footage&#10;Description: Shows the incident clearly from 2:30 PM to 2:45 PM&#10;Source: Barangay Hall Security Camera&#10;Location: Saved in Barangay Hall computer&#10;&#10;Type: Photos&#10;Description: 5 photos showing damage to property&#10;Source: Complainant&#10;Location: Attached to this blotter"
                        className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 font-mono text-sm"
                    />
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Describe any physical evidence, documents, or digital evidence available
                        </p>
                        {evidence.trim() && (
                            <span className={`text-xs ${evidenceSufficient ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                                {evidenceSufficient ? '✓ Detailed description' : '⚠️ Add more details'}
                            </span>
                        )}
                    </div>
                </div>

                {/* Combined Stats Card */}
                {(witnessCount > 0 || evidence.trim()) && (
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border dark:border-gray-700">
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Summary</p>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                                <span className="text-gray-500 dark:text-gray-400">Witnesses:</span>
                                <span className="ml-2 font-medium dark:text-gray-200">{witnessCount}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 dark:text-gray-400">Evidence Description:</span>
                                <span className="ml-2 font-medium dark:text-gray-200">
                                    {evidence.trim().length} characters
                                </span>
                            </div>
                            <div className="col-span-2">
                                <span className="text-gray-500 dark:text-gray-400">Status:</span>
                                <span className={`ml-2 font-medium ${witnessCount > 0 || evidence.trim() ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                                    {witnessCount > 0 || evidence.trim() ? 'Information provided' : 'No additional information'}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};