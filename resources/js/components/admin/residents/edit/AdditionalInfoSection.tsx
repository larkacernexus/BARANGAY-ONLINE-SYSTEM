// components/admin/residents/edit/AdditionalInfoSection.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Briefcase, GraduationCap, Church, FileText } from 'lucide-react';
import { ResidentFormData } from '@/components/admin/residents/edit/resident';

interface Props {
    data: ResidentFormData;
    setData: (key: keyof ResidentFormData, value: any) => void;
    educationOptions: Array<{value: string, label: string}>;
}

export default function AdditionalInfoSection({ data, setData, educationOptions }: Props) {
    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-700 dark:to-orange-700 flex items-center justify-center">
                        <FileText className="h-3 w-3 text-white" />
                    </div>
                    Additional Information
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                    Other relevant details about the resident
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="occupation" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            <Briefcase className="h-4 w-4 text-gray-400 dark:text-gray-500" />
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
                        <Label htmlFor="education" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            <GraduationCap className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                            Highest Education
                        </Label>
                        <Select 
                            value={data.education}
                            onValueChange={(value) => setData('education', value)}
                        >
                            <SelectTrigger className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300">
                                <SelectValue placeholder="Select education" />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                                {educationOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value} className="dark:text-gray-300 dark:focus:bg-gray-700">
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="religion" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <Church className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        Religion
                    </Label>
                    <Input 
                        id="religion" 
                        placeholder="Roman Catholic, Protestant, Muslim, etc." 
                        value={data.religion}
                        onChange={(e) => setData('religion', e.target.value)}
                        className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center space-x-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                        <Checkbox 
                            id="is_voter" 
                            checked={data.is_voter}
                            onCheckedChange={(checked) => setData('is_voter', checked as boolean)}
                            className="dark:border-gray-600"
                        />
                        <Label htmlFor="is_voter" className="cursor-pointer text-sm dark:text-gray-300">
                            Registered Voter
                        </Label>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="remarks" className="text-sm font-medium text-gray-700 dark:text-gray-300">Remarks/Notes</Label>
                    <Textarea 
                        id="remarks" 
                        placeholder="Additional notes about the resident..."
                        rows={3}
                        value={data.remarks}
                        onChange={(e) => setData('remarks', e.target.value)}
                        className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Any additional information or special notes about this resident.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}