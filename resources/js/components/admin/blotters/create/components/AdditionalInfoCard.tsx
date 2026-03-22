// components/blotter/AdditionalInfoCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Users, FileText } from 'lucide-react';

interface AdditionalInfoCardProps {
    witnesses: string;
    evidence: string;
    onWitnessesChange: (value: string) => void;
    onEvidenceChange: (value: string) => void;
}

export const AdditionalInfoCard = ({
    witnesses,
    evidence,
    onWitnessesChange,
    onEvidenceChange
}: AdditionalInfoCardProps) => {
    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <Users className="h-5 w-5" />
                    Additional Information
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="witnesses" className="dark:text-gray-300">Witnesses</Label>
                    <Textarea
                        id="witnesses"
                        rows={3}
                        value={witnesses}
                        onChange={(e) => onWitnessesChange(e.target.value)}
                        placeholder="Names and statements of witnesses"
                        className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        List all witnesses with their contact information if available
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="evidence" className="dark:text-gray-300">Evidence Description</Label>
                    <Textarea
                        id="evidence"
                        rows={3}
                        value={evidence}
                        onChange={(e) => onEvidenceChange(e.target.value)}
                        placeholder="Description of evidence (photos, documents, CCTV footage, etc.)"
                        className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Describe any physical evidence, documents, or digital evidence available
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};