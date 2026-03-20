// components/admin/households/create/AdditionalInfoCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FileText, AlertCircle } from 'lucide-react';

interface Props {
    data: any;
    setData: (key: string, value: any) => void;
    errors: Record<string, string>;
}

export default function AdditionalInfoCard({ data, setData, errors }: Props) {
    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-700 dark:to-orange-700 flex items-center justify-center">
                        <FileText className="h-3 w-3 text-white" />
                    </div>
                    Additional Information
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="remarks" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Remarks/Notes
                    </Label>
                    <Textarea 
                        id="remarks" 
                        placeholder="Any additional information about this household..."
                        rows={4}
                        value={data.remarks}
                        onChange={(e) => setData('remarks', e.target.value)}
                        className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 resize-none"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        Optional: Add any special notes or remarks about this household
                    </p>
                </div>

                {errors.remarks && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5" />
                            <p className="text-xs text-red-600 dark:text-red-400">{errors.remarks}</p>
                        </div>
                    </div>
                )}

                {/* Character Counter */}
                {data.remarks && data.remarks.length > 0 && (
                    <div className="text-right">
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                            {data.remarks.length} characters
                        </span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}