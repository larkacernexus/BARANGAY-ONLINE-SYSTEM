// components/admin/community-reports/create/components/ComplainantInfoCard.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { UserPlus, CheckCircle } from 'lucide-react';
import { SearchableResidentDropdown } from './SearchableResidentDropdown';
import { Resident } from '@/types/admin/reports/community-report';

interface ComplainantInfoCardProps {
    selectedResident: Resident | null;
    formData: {
        user_id: number | null;
        is_anonymous: boolean;
        reporter_name: string;
        reporter_contact: string;
        reporter_address: string;
    };
    onResidentSelect: (resident: Resident) => void;
    onClearResident: () => void;
    onCheckboxChange: (name: string, checked: boolean) => void;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const ComplainantInfoCard = ({
    selectedResident,
    formData,
    onResidentSelect,
    onClearResident,
    onCheckboxChange,
    onInputChange
}: ComplainantInfoCardProps) => {
    return (
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                    <UserPlus className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                    Complainant Information
                </CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400">
                    Select an existing resident or enter complainant details manually. 
                    Search by name, email, phone, or address.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Searchable Resident Dropdown */}
                <div className="space-y-2">
                    <Label className="text-gray-700 dark:text-gray-300">
                        Search Resident
                    </Label>
                    <SearchableResidentDropdown
                        onSelect={onResidentSelect}
                        selectedResident={selectedResident}
                        onClear={onClearResident}
                        placeholder="Search by name, email, phone, or address..."
                    />
                </div>

                <Separator className="bg-gray-200 dark:bg-gray-700" />

                {/* Manual Entry */}
                <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="is_anonymous"
                            checked={formData.is_anonymous}
                            onCheckedChange={(checked) => 
                                onCheckboxChange('is_anonymous', checked as boolean)
                            }
                            disabled={!!selectedResident}
                            className="border-gray-300 dark:border-gray-600"
                        />
                        <Label 
                            htmlFor="is_anonymous" 
                            className={`text-gray-700 dark:text-gray-300 ${selectedResident ? 'opacity-50' : ''}`}
                        >
                            Report anonymously
                        </Label>
                    </div>

                    {!formData.is_anonymous && !selectedResident && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="reporter_name" className="text-gray-700 dark:text-gray-300">
                                        Full Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="reporter_name"
                                        name="reporter_name"
                                        value={formData.reporter_name}
                                        onChange={onInputChange}
                                        placeholder="Enter complainant's full name"
                                        className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="reporter_contact" className="text-gray-700 dark:text-gray-300">
                                        Contact Number <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="reporter_contact"
                                        name="reporter_contact"
                                        value={formData.reporter_contact}
                                        onChange={onInputChange}
                                        placeholder="Phone number or email"
                                        className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="reporter_address" className="text-gray-700 dark:text-gray-300">
                                    Address
                                </Label>
                                <Textarea
                                    id="reporter_address"
                                    name="reporter_address"
                                    value={formData.reporter_address}
                                    onChange={onInputChange}
                                    placeholder="Complete address"
                                    rows={2}
                                    className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600"
                                />
                            </div>
                        </>
                    )}

                    {/* Show message when resident is selected */}
                    {selectedResident && !formData.is_anonymous && (
                        <div className="p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                                <p className="text-sm text-green-700 dark:text-green-300">
                                    Resident information will be used for this report. 
                                    Clear the selection to enter details manually.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Show message when anonymous */}
                    {formData.is_anonymous && (
                        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                    This report will be submitted anonymously. 
                                    No complainant information will be recorded.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};