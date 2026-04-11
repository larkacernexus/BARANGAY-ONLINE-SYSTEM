// components/blotter/IncidentDetailsCard.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Calendar, MapPin, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { IncidentTypeDropdown } from './IncidentTypeDropdown';
import { IncidentType } from '@/types/admin/blotters/blotter';

interface IncidentDetailsCardProps {
    selectedType: IncidentType | null;
    incidentSearchTerm: string;
    filteredTypes: IncidentType[];
    groupedTypes: Record<string, IncidentType[]>;
    incidentDatetime: string;
    priority: string;
    location: string;
    barangay: string;
    description: string;
    errors: Record<string, string>;
    onTypeSelect: (type: IncidentType) => void;
    onTypeClear: () => void;
    onIncidentDatetimeChange: (value: string) => void;
    onPriorityChange: (value: string) => void;
    onLocationChange: (value: string) => void;
    onDescriptionChange: (value: string) => void;
    getPriorityDescription: (priority: string) => string;
}

export const IncidentDetailsCard = ({
    selectedType,
    filteredTypes,
    groupedTypes,
    incidentDatetime,
    priority,
    location,
    barangay,
    description,
    errors,
    onTypeSelect,
    onTypeClear,
    onIncidentDatetimeChange,
    onPriorityChange,
    onLocationChange,
    onDescriptionChange,
    getPriorityDescription
}: IncidentDetailsCardProps) => {
    const getPriorityIcon = (priority: string) => {
        switch(priority) {
            case 'urgent': return <AlertCircle className="h-4 w-4" />;
            case 'high': return <AlertTriangle className="h-4 w-4" />;
            case 'medium': return <Info className="h-4 w-4" />;
            case 'low': return <CheckCircle className="h-4 w-4" />;
            default: return <Info className="h-4 w-4" />;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch(priority) {
            case 'urgent': return 'text-red-600 dark:text-red-400';
            case 'high': return 'text-orange-600 dark:text-orange-400';
            case 'medium': return 'text-yellow-600 dark:text-yellow-400';
            case 'low': return 'text-green-600 dark:text-green-400';
            default: return '';
        }
    };

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-red-600 to-orange-600 dark:from-red-700 dark:to-orange-700 flex items-center justify-center">
                        <AlertCircle className="h-3 w-3 text-white" />
                    </div>
                    Incident Details
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                    Enter the details of the incident
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <IncidentTypeDropdown
                    selectedType={selectedType}
                    onSelect={onTypeSelect}
                    onClear={onTypeClear}
                    filteredTypes={filteredTypes}
                    groupedTypes={groupedTypes}
                    error={errors.incident_type}
                />

                {selectedType && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-sm text-blue-700 dark:text-blue-300">{selectedType.description}</p>
                        <div className="mt-2 flex gap-3 text-xs">
                            <span className="text-blue-600 dark:text-blue-400">
                                Resolution: {selectedType.resolution_days} days
                            </span>
                            <span className="text-blue-600 dark:text-blue-400">
                                {selectedType.requires_evidence ? '📎 Evidence Required' : '📄 Evidence Optional'}
                            </span>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="incident_datetime" className="dark:text-gray-300">
                            Date & Time <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                            <Input
                                id="incident_datetime"
                                type="datetime-local"
                                value={incidentDatetime}
                                onChange={(e) => onIncidentDatetimeChange(e.target.value)}
                                className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                            />
                        </div>
                        {errors.incident_datetime && (
                            <p className="text-sm text-red-600 dark:text-red-400">{errors.incident_datetime}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="priority" className="dark:text-gray-300">Priority Level *</Label>
                        <Select value={priority} onValueChange={onPriorityChange}>
                            <SelectTrigger className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300">
                                <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="urgent">
                                    <div className="flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4 text-red-600" />
                                        <div>
                                            <div>Urgent</div>
                                            <div className="text-xs text-gray-500">24 hours</div>
                                        </div>
                                    </div>
                                </SelectItem>
                                <SelectItem value="high">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                                        <div>
                                            <div>High</div>
                                            <div className="text-xs text-gray-500">3 days</div>
                                        </div>
                                    </div>
                                </SelectItem>
                                <SelectItem value="medium">
                                    <div className="flex items-center gap-2">
                                        <Info className="h-4 w-4 text-yellow-600" />
                                        <div>
                                            <div>Medium</div>
                                            <div className="text-xs text-gray-500">7 days</div>
                                        </div>
                                    </div>
                                </SelectItem>
                                <SelectItem value="low">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        <div>
                                            <div>Low</div>
                                            <div className="text-xs text-gray-500">15 days</div>
                                        </div>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {getPriorityDescription(priority)}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="location" className="dark:text-gray-300">
                            Location <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                            <Input
                                id="location"
                                placeholder="Street, building, landmark..."
                                value={location}
                                onChange={(e) => onLocationChange(e.target.value)}
                                className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                            />
                        </div>
                        {errors.location && (
                            <p className="text-sm text-red-600 dark:text-red-400">{errors.location}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="barangay" className="dark:text-gray-300">Barangay</Label>
                        <Input
                            id="barangay"
                            value={barangay}
                            disabled
                            className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="incident_description" className="dark:text-gray-300">
                        Description <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                        id="incident_description"
                        rows={5}
                        value={description}
                        onChange={(e) => onDescriptionChange(e.target.value)}
                        placeholder="Provide a detailed description of what happened..."
                        className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                    />
                    {errors.incident_description && (
                        <p className="text-sm text-red-600 dark:text-red-400">{errors.incident_description}</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};