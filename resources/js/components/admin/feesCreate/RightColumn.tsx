import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Building, Home, Phone, MapPin, FileText, Info } from 'lucide-react';
import { FeeFormData, Resident, Household } from '@/types/fees';
import { getEligibilityBadges } from '@/admin-utils/fees/discount-display-utils';

interface RightColumnProps {
    data: FeeFormData;
    setData: (key: keyof FeeFormData, value: any) => void;
    selectedPayer: Resident | Household | null;
    residents: Resident[];
    households: Household[];
    puroks: string[];
    errors?: Record<string, string>;
    handlePayerTypeChange: (payerType: string) => void;
    handleResidentSelect: (residentId: string) => void;
    handleHouseholdSelect: (householdId: string) => void;
    hideIndividualSelection?: boolean;
}

const payerTypes = [
    { value: 'resident', icon: User, label: 'Resident' },
    { value: 'business', icon: Building, label: 'Business' },
    { value: 'household', icon: Home, label: 'Household' },
    { value: 'visitor', icon: User, label: 'Visitor' },
    { value: 'other', icon: User, label: 'Other' },
];

export default function RightColumn({
    data,
    setData,
    selectedPayer,
    residents,
    households,
    puroks,
    errors,
    handlePayerTypeChange,
    handleResidentSelect,
    handleHouseholdSelect,
    hideIndividualSelection = false
}: RightColumnProps) {
    const safeString = (value: any): string => {
        if (value === null || value === undefined || value === 'null') return '';
        return String(value);
    };

    const parseNumber = (value: any): number => {
        if (value === null || value === undefined || value === '' || value === 'null') return 0;
        const num = parseFloat(value);
        return isNaN(num) ? 0 : num;
    };

    const residentBadges = selectedPayer && 'is_senior' in selectedPayer 
        ? getEligibilityBadges(selectedPayer as Resident)
        : [];

    return (
        <div className="space-y-6">
            {/* Payer Information Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Payer Information
                    </CardTitle>
                    <CardDescription>
                        Select or enter payer details
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {hideIndividualSelection ? (
                        <div className="rounded-md bg-blue-50 border border-blue-200 p-4">
                            <div className="flex items-start gap-3">
                                <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div className="text-sm text-blue-700">
                                    <p className="font-medium">Bulk Fee Mode Active</p>
                                    <p className="mt-1">
                                        Payer selection is managed in the bulk selection panel. 
                                        Use the "Edit Selection" button in the Fee Creation Mode section 
                                        to manage multiple payers.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-4">
                                <div>
                                    <Label>Payer Type *</Label>
                                    <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-3">
                                        {payerTypes.map((type) => {
                                            const IconComponent = type.icon;
                                            return (
                                                <button
                                                    key={type.value}
                                                    type="button"
                                                    onClick={() => handlePayerTypeChange(type.value)}
                                                    className={`flex flex-col items-center justify-center rounded-md border p-3 transition-colors ${
                                                        data.payer_type === type.value
                                                            ? 'border-primary bg-primary/10 text-primary'
                                                            : 'border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                    }`}
                                                >
                                                    <IconComponent className="mb-1 h-5 w-5" />
                                                    <span className="text-xs font-medium">
                                                        {type.label}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {errors?.payer_type && (
                                        <p className="text-sm text-red-500">
                                            {errors.payer_type}
                                        </p>
                                    )}
                                </div>

                                {/* Resident/Household Selection - SIMPLIFIED CONDITION */}
                                {(data.payer_type === 'resident' || data.payer_type === 'household') && (
                                    <div className="space-y-2">
                                        <Label htmlFor={`${data.payer_type}_id`}>
                                            Select {data.payer_type === 'resident' ? 'Resident' : 'Household'} *
                                        </Label>
                                        <select
                                            id={`${data.payer_type}_id`}
                                            required
                                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                                            value={safeString(
                                                data.payer_type === 'resident' ? data.resident_id : data.household_id
                                            )}
                                            onChange={(e) => {
                                                if (data.payer_type === 'resident') {
                                                    handleResidentSelect(e.target.value);
                                                } else {
                                                    handleHouseholdSelect(e.target.value);
                                                }
                                            }}
                                        >
                                            <option value="">
                                                Select {data.payer_type === 'resident' ? 'Resident' : 'Household'}
                                            </option>
                                            {data.payer_type === 'resident'
                                                ? residents.map((resident) => (
                                                    <option
                                                        key={resident.id}
                                                        value={resident.id}
                                                    >
                                                        {resident.full_name} 
                                                        {resident.purok ? ` (Purok ${resident.purok})` : ''}
                                                        {resident.is_senior && ' 👵'}
                                                        {resident.is_pwd && ' ♿'}
                                                        {resident.is_solo_parent && ' 👨‍👧‍👦'}
                                                        {resident.is_indigent && ' 🏠'}
                                                    </option>
                                                ))
                                                : households.map((household) => (
                                                    <option
                                                        key={household.id}
                                                        value={household.id}
                                                    >
                                                        {household.name} 
                                                        {household.purok ? ` (Purok ${household.purok})` : ''}
                                                        {household.member_count && ` - ${household.member_count} members`}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                )}

                                {/* Business Name */}
                                {data.payer_type === 'business' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="business_name">
                                            Business Name *
                                        </Label>
                                        <Input
                                            id="business_name"
                                            required
                                            value={safeString(data.business_name)}
                                            onChange={(e) => {
                                                setData('business_name', e.target.value);
                                                setData('payer_name', e.target.value);
                                            }}
                                            placeholder="Enter business name"
                                        />
                                    </div>
                                )}

                                {/* Manual Payer Name */}
                                {(data.payer_type === 'visitor' || data.payer_type === 'other') && (
                                    <div className="space-y-2">
                                        <Label htmlFor="payer_name">
                                            Payer Name *
                                        </Label>
                                        <Input
                                            id="payer_name"
                                            required
                                            value={safeString(data.payer_name)}
                                            onChange={(e) => setData('payer_name', e.target.value)}
                                            placeholder="Enter payer's full name"
                                        />
                                    </div>
                                )}

                                {/* Contact Information */}
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="contact_number" className="flex items-center">
                                            <Phone className="mr-1 h-4 w-4" />
                                            Contact Number
                                        </Label>
                                        <Input
                                            id="contact_number"
                                            value={safeString(data.contact_number)}
                                            onChange={(e) => setData('contact_number', e.target.value)}
                                            placeholder="09XXXXXXXXX"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="purok" className="flex items-center">
                                            <MapPin className="mr-1 h-4 w-4" />
                                            Purok
                                        </Label>
                                        <Select
                                            value={safeString(data.purok) || 'none'}
                                            onValueChange={(value) => setData('purok', value === 'none' ? '' : value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Purok" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Select Purok</SelectItem>
                                                {puroks.map((purok) => (
                                                    <SelectItem key={purok} value={purok}>
                                                        Purok {purok}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address">
                                        Address
                                    </Label>
                                    <Textarea
                                        id="address"
                                        rows={2}
                                        value={safeString(data.address)}
                                        onChange={(e) => setData('address', e.target.value)}
                                        placeholder="Complete address"
                                    />
                                </div>
                            </div>

                            {/* Payer Eligibility Information - Informational Only */}
                            {data.payer_type === 'resident' && selectedPayer && 'is_senior' in selectedPayer && (
                                <div className="mt-4 rounded-md border border-gray-200 bg-gray-50 p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Info className="h-4 w-4 text-blue-600" />
                                        <h4 className="font-medium text-sm text-blue-700">Payer Eligibility Information</h4>
                                    </div>
                                    
                                    {residentBadges.length > 0 ? (
                                        <div className="space-y-2">
                                            <div className="flex flex-wrap gap-2">
                                                {residentBadges.map((badge, idx) => (
                                                    <Badge 
                                                        key={idx} 
                                                        variant="outline"
                                                        className={`text-xs px-2 py-1 ${badge.color}`}
                                                    >
                                                        <span className="mr-1">{badge.icon}</span>
                                                        {badge.label}
                                                    </Badge>
                                                ))}
                                            </div>
                                            <div className="mt-2 text-xs text-gray-500">
                                                <p>
                                                    <strong>Note:</strong> These eligibility markers are for reference only. 
                                                    Actual discounts will be applied during payment processing upon presentation 
                                                    of valid government-issued IDs, as required by Philippine law.
                                                </p>
                                                <p className="mt-1 italic">
                                                    RA 9994 (Senior Citizens) • RA 10754 (PWDs) • RA 8972 (Solo Parents)
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">
                                            No special eligibility markers for this resident.
                                        </p>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Additional Information Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Additional Information
                    </CardTitle>
                    <CardDescription>
                        Provide additional details and remarks
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="purpose">
                            Purpose / Description
                        </Label>
                        <Textarea
                            id="purpose"
                            rows={3}
                            value={safeString(data.purpose)}
                            onChange={(e) => setData('purpose', e.target.value)}
                            placeholder="Describe the purpose of this fee or provide additional details..."
                        />
                    </div>

                    {data.payer_type === 'business' && (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="business_type">
                                    Business Type
                                </Label>
                                <Input
                                    id="business_type"
                                    value={safeString(data.business_type)}
                                    onChange={(e) => setData('business_type', e.target.value)}
                                    placeholder="e.g., Retail, Restaurant, Service"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="area">
                                    Area (sq.m.)
                                </Label>
                                <div className="relative">
                                    <span className="absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-500">
                                        m²
                                    </span>
                                    <Input
                                        id="area"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className="pl-10"
                                        value={data.area}
                                        onChange={(e) =>
                                            setData('area', parseNumber(e.target.value))
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="property_description">
                            Property Description (for property-related fees)
                        </Label>
                        <Textarea
                            id="property_description"
                            rows={2}
                            value={safeString(data.property_description)}
                            onChange={(e) => setData('property_description', e.target.value)}
                            placeholder="Describe the property, lot, or structure..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="remarks">
                            Remarks / Notes
                        </Label>
                        <Textarea
                            id="remarks"
                            rows={2}
                            value={safeString(data.remarks)}
                            onChange={(e) => setData('remarks', e.target.value)}
                            placeholder="Any additional remarks or instructions..."
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Billing Period Card */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        Billing Period (Optional)
                    </CardTitle>
                    <CardDescription>
                        Set the billing period for recurring fees
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="billing_period">
                                Billing Period Description
                            </Label>
                            <Input
                                id="billing_period"
                                value={safeString(data.billing_period)}
                                onChange={(e) =>
                                    setData('billing_period', e.target.value)
                                }
                                placeholder="e.g., January 2024, Q1 2024"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="period_start">
                                Period Start
                            </Label>
                            <Input
                                id="period_start"
                                type="date"
                                value={safeString(data.period_start)}
                                onChange={(e) =>
                                    setData('period_start', e.target.value)
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="period_end">
                                Period End
                            </Label>
                            <Input
                                id="period_end"
                                type="date"
                                value={safeString(data.period_end)}
                                onChange={(e) =>
                                    setData('period_end', e.target.value)
                                }
                                min={data.period_start}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}