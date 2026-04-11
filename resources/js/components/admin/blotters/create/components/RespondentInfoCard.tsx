// components/blotter/RespondentInfoCard.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Shield } from 'lucide-react';
import { SearchableResidentSelect } from './SearchableResidentSelect';
import { Resident } from '@/types/admin/blotters/blotter';

interface RespondentInfoCardProps {
    residents: Resident[];
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
    residents,
    isResident,
    selectedResident,
    respondentName,
    respondentAddress,
    onToggle,
    onResidentSelect,
    onResidentClear,
    onNameChange,
    onAddressChange
}: RespondentInfoCardProps) => {
    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <Shield className="h-5 w-5" />
                    Respondent Information
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                    Details of the person being complained against (if known)
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-end space-x-2">
                    <Label htmlFor="respondent_is_resident" className="text-sm dark:text-gray-300">
                        Respondent is a registered resident
                    </Label>
                    <Checkbox
                        id="respondent_is_resident"
                        checked={isResident}
                        onCheckedChange={(checked) => onToggle(checked as boolean)}
                    />
                </div>

                {isResident ? (
                    <SearchableResidentSelect
                        residents={residents}
                        label="Select Resident"
                        selectedResident={selectedResident}
                        onSelect={onResidentSelect}
                        onClear={onResidentClear}
                        showContact={false}
                    />
                ) : (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="respondent_name" className="dark:text-gray-300">Respondent Name</Label>
                            <Input
                                id="respondent_name"
                                placeholder="Full name of respondent"
                                value={respondentName}
                                onChange={(e) => onNameChange(e.target.value)}
                                className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="respondent_address" className="dark:text-gray-300">Address</Label>
                            <Input
                                id="respondent_address"
                                placeholder="Address of respondent"
                                value={respondentAddress}
                                onChange={(e) => onAddressChange(e.target.value)}
                                className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                            />
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
};