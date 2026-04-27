// components/admin/blotters/create/components/RespondentInfoCard.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { User, MapPin } from 'lucide-react';
import { SearchableResidentSelect } from './SearchableResidentSelect';
import { Resident } from '@/types/admin/blotters/blotter';

interface RespondentInfoCardProps {
    isResident: boolean;
    selectedResident: Resident | null;
    respondentName: string;
    respondentAddress: string;
    onToggle: (checked: boolean) => void;
    onResidentSelect: (resident: Resident) => void;
    onResidentClear: () => void;
    onNameChange: (value: string) => void;
    onAddressChange: (value: string) => void;
}

export const RespondentInfoCard = ({
    isResident,
    selectedResident,
    respondentName,
    respondentAddress,
    onToggle,
    onResidentSelect,
    onResidentClear,
    onNameChange,
    onAddressChange,
}: RespondentInfoCardProps) => {
    return (
        <Card className="dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-700 dark:to-red-700 flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                    </div>
                    Respondent / Subject Information
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                    Details of the person being reported (optional)
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-end space-x-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <Label htmlFor="respondent_is_resident" className="text-sm dark:text-gray-300 cursor-pointer">
                        Respondent is a registered resident
                    </Label>
                    <Checkbox
                        id="respondent_is_resident"
                        checked={isResident}
                        onCheckedChange={(checked) => onToggle(checked as boolean)}
                        className="border-gray-300 dark:border-gray-600"
                    />
                </div>

                {isResident ? (
                    <SearchableResidentSelect
                        label="Select Respondent"
                        selectedResident={selectedResident}
                        onSelect={onResidentSelect}
                        onClear={onResidentClear}
                        placeholder="Search by name, address, or contact number..."
                    />
                ) : (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="respondent_name" className="dark:text-gray-300">
                                Respondent Name
                            </Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                <Input
                                    id="respondent_name"
                                    placeholder="Full name of respondent"
                                    value={respondentName}
                                    onChange={(e) => onNameChange(e.target.value)}
                                    className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="respondent_address" className="dark:text-gray-300">
                                Address
                            </Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                <Input
                                    id="respondent_address"
                                    placeholder="Address of respondent"
                                    value={respondentAddress}
                                    onChange={(e) => onAddressChange(e.target.value)}
                                    className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                />
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
};