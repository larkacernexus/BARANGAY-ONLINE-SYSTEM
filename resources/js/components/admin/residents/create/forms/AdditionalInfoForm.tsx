// components/admin/residents/create/forms/AdditionalInfoForm.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Briefcase, GraduationCap, Church, Vote, FileText } from 'lucide-react';
import { ResidentFormData } from '@/components/admin/residents/create/hooks/useResidentForm';

interface Props {
    data: ResidentFormData;
    setData: (key: keyof ResidentFormData, value: any) => void;
    educationOptions: Array<{value: string, label: string}>;
}

export default function AdditionalInfoForm({ data, setData, educationOptions }: Props) {
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
            <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="occupation" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            Occupation
                        </Label>
                        <Input 
                            id="occupation" 
                            placeholder="Farmer/Business Owner/Employee" 
                            value={data.occupation}
                            onChange={(e) => setData('occupation', e.target.value)}
                            className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="education" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                            <GraduationCap className="h-3 w-3" />
                            Highest Education
                        </Label>
                        <select 
                            id="education"
                            value={data.education}
                            onChange={(e) => setData('education', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                        >
                            <option value="">Select education</option>
                            {educationOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="religion" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                        <Church className="h-3 w-3" />
                        Religion
                    </Label>
                    <Input 
                        id="religion" 
                        placeholder="Roman Catholic" 
                        value={data.religion}
                        onChange={(e) => setData('religion', e.target.value)}
                        className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                    />
                </div>

                <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <Checkbox 
                        id="is_voter" 
                        checked={data.is_voter}
                        onCheckedChange={(checked) => setData('is_voter', checked as boolean)}
                        className="dark:border-gray-600"
                    />
                    <Label htmlFor="is_voter" className="text-sm cursor-pointer dark:text-gray-300 flex items-center gap-1">
                        <Vote className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        Registered Voter in this Barangay
                    </Label>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="remarks" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Remarks/Notes
                    </Label>
                    <Textarea 
                        id="remarks" 
                        placeholder="Additional notes about the resident..."
                        rows={3}
                        value={data.remarks}
                        onChange={(e) => setData('remarks', e.target.value)}
                        className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                    />
                </div>
            </CardContent>
        </Card>
    );
}