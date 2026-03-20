// components/admin/households/create/HousingInfoCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Building, Zap, Wifi, Car, Droplets, TrendingUp } from 'lucide-react';

interface Props {
    data: any;
    setData: (key: string, value: any) => void;
    errors: Record<string, string>;
}

const housingTypes = [
    'Concrete', 'Semi-concrete', 'Wood', 'Nipa/Bamboo', 'Mixed Materials', 'Others'
];

const ownershipStatuses = [
    'Owned', 'Rented', 'Free Use', 'With Consent', 'Government Housing'
];

const waterSources = [
    'Level I (Point Source)', 'Level II (Communal Faucet)',
    'Level III (Waterworks System)', 'Deep Well', 'Shallow Well', 'Spring', 'Others'
];

const incomeRanges = [
    'Below ₱10,000', '₱10,000 - ₱20,000', '₱20,000 - ₱30,000',
    '₱30,000 - ₱50,000', '₱50,000 - ₱100,000', 'Above ₱100,000'
];

export default function HousingInfoCard({ data, setData, errors }: Props) {
    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700 flex items-center justify-center">
                        <Building className="h-3 w-3 text-white" />
                    </div>
                    Housing & Economic Information
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="housingType" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Housing Type
                        </Label>
                        <Select 
                            value={data.housing_type}
                            onValueChange={(value) => setData('housing_type', value)}
                        >
                            <SelectTrigger className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300">
                                <SelectValue placeholder="Select housing type" />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                                {housingTypes.map((type) => (
                                    <SelectItem key={type} value={type} className="dark:text-gray-300 dark:focus:bg-gray-700">
                                        {type}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="ownershipStatus" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Ownership Status
                        </Label>
                        <Select 
                            value={data.ownership_status}
                            onValueChange={(value) => setData('ownership_status', value)}
                        >
                            <SelectTrigger className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300">
                                <SelectValue placeholder="Select ownership status" />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                                {ownershipStatuses.map((status) => (
                                    <SelectItem key={status} value={status} className="dark:text-gray-300 dark:focus:bg-gray-700">
                                        {status}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="waterSource" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            <Droplets className="h-4 w-4 inline mr-1 text-gray-400 dark:text-gray-500" />
                            Water Source
                        </Label>
                        <Select 
                            value={data.water_source}
                            onValueChange={(value) => setData('water_source', value)}
                        >
                            <SelectTrigger className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300">
                                <SelectValue placeholder="Select water source" />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                                {waterSources.map((source) => (
                                    <SelectItem key={source} value={source} className="dark:text-gray-300 dark:focus:bg-gray-700">
                                        {source}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="incomeRange" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            <TrendingUp className="h-4 w-4 inline mr-1 text-gray-400 dark:text-gray-500" />
                            Monthly Income Range
                        </Label>
                        <Select 
                            value={data.income_range}
                            onValueChange={(value) => setData('income_range', value)}
                        >
                            <SelectTrigger className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300">
                                <SelectValue placeholder="Select income range" />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                                {incomeRanges.map((range) => (
                                    <SelectItem key={range} value={range} className="dark:text-gray-300 dark:focus:bg-gray-700">
                                        {range}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-3 pt-2">
                    <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded transition-colors">
                        <Checkbox 
                            id="electricity" 
                            checked={data.electricity}
                            onCheckedChange={(checked) => setData('electricity', checked as boolean)}
                            className="dark:border-gray-600"
                        />
                        <Label htmlFor="electricity" className="text-sm cursor-pointer dark:text-gray-300">
                            <div className="flex items-center gap-2">
                                <Zap className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                                Has electricity connection
                            </div>
                        </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded transition-colors">
                        <Checkbox 
                            id="internet" 
                            checked={data.internet}
                            onCheckedChange={(checked) => setData('internet', checked as boolean)}
                            className="dark:border-gray-600"
                        />
                        <Label htmlFor="internet" className="text-sm cursor-pointer dark:text-gray-300">
                            <div className="flex items-center gap-2">
                                <Wifi className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                                Has internet connection
                            </div>
                        </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded transition-colors">
                        <Checkbox 
                            id="vehicle" 
                            checked={data.vehicle}
                            onCheckedChange={(checked) => setData('vehicle', checked as boolean)}
                            className="dark:border-gray-600"
                        />
                        <Label htmlFor="vehicle" className="text-sm cursor-pointer dark:text-gray-300">
                            <div className="flex items-center gap-2">
                                <Car className="h-4 w-4 text-green-500 dark:text-green-400" />
                                Owns a vehicle
                            </div>
                        </Label>
                    </div>
                </div>

                {/* Info Note */}
                {(data.housing_type || data.water_source || data.income_range) && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-xs text-blue-700 dark:text-blue-400">
                            This information helps determine eligibility for housing and social programs.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}