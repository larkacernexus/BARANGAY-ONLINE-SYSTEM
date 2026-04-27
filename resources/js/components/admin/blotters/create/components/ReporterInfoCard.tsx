// components/admin/blotters/create/components/ReporterInfoCard.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { User, Phone, MapPin } from 'lucide-react';
import { SearchableResidentSelect } from './SearchableResidentSelect';
import { Resident } from '@/types/admin/blotters/blotter';

interface ReporterInfoCardProps {
    isResident: boolean;
    selectedResident: Resident | null;
    reporterName: string;
    reporterContact: string;
    reporterAddress: string;
    onToggle: (checked: boolean) => void;
    onResidentSelect: (resident: Resident) => void;
    onResidentClear: () => void;
    onNameChange: (value: string) => void;
    onContactChange: (value: string) => void;
    onAddressChange: (value: string) => void;
    errors: Record<string, string>;
}

export const ReporterInfoCard = ({
    isResident,
    selectedResident,
    reporterName,
    reporterContact,
    reporterAddress,
    onToggle,
    onResidentSelect,
    onResidentClear,
    onNameChange,
    onContactChange,
    onAddressChange,
    errors
}: ReporterInfoCardProps) => {
    return (
        <Card className="dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                    </div>
                    Reporter Information
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                    Details of the person reporting the incident
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-end space-x-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <Label htmlFor="reporter_is_resident" className="text-sm dark:text-gray-300 cursor-pointer">
                        Reporter is a registered resident
                    </Label>
                    <Checkbox
                        id="reporter_is_resident"
                        checked={isResident}
                        onCheckedChange={(checked) => onToggle(checked as boolean)}
                        className="border-gray-300 dark:border-gray-600"
                    />
                </div>

                {isResident ? (
                    <SearchableResidentSelect
                        label="Select Resident"
                        selectedResident={selectedResident}
                        onSelect={onResidentSelect}
                        onClear={onResidentClear}
                        required={true}
                        error={errors.reporter_resident_id}
                        showContact={true}
                        placeholder="Search by name, address, or contact number..."
                    />
                ) : (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="reporter_name" className="dark:text-gray-300">
                                Reporter Name <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                <Input
                                    id="reporter_name"
                                    placeholder="Full name of reporter"
                                    value={reporterName}
                                    onChange={(e) => onNameChange(e.target.value)}
                                    className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                />
                            </div>
                            {errors.reporter_name && (
                                <p className="text-sm text-red-600 dark:text-red-400">{errors.reporter_name}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="reporter_contact" className="dark:text-gray-300">
                                    Contact Number
                                </Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                    <Input
                                        id="reporter_contact"
                                        placeholder="09123456789"
                                        value={reporterContact}
                                        onChange={(e) => onContactChange(e.target.value)}
                                        className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="reporter_address" className="dark:text-gray-300">
                                    Address
                                </Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                    <Input
                                        id="reporter_address"
                                        placeholder="Address of reporter"
                                        value={reporterAddress}
                                        onChange={(e) => onAddressChange(e.target.value)}
                                        className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                    />
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
};