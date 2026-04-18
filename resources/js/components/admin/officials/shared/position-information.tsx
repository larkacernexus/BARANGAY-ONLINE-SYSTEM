// components/admin/officials/shared/position-information.tsx
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Crown, Award, Shield, UserCheck, Building, Target, Check, X, AlertCircle } from 'lucide-react';
import { Position, Committee } from '@/components/admin/officials/shared/types/official';

interface PositionInformationProps {
    positions: Position[];
    committees: Committee[];
    selectedPositionId: number | null;
    selectedCommitteeId: number | null;
    termStart: string;
    termEnd: string;
    status: string;
    order: number;
    responsibilities: string;
    onPositionChange: (value: string) => void;
    onCommitteeChange: (value: string) => void;
    onTermStartChange: (value: string) => void;
    onTermEndChange: (value: string) => void;
    onStatusChange: (value: string) => void;
    onOrderChange: (value: number) => void;
    onResponsibilitiesChange: (value: string) => void;
    errors?: {
        position_id?: string;
        term_start?: string;
        term_end?: string;
        status?: string;
        committee_id?: string;
    };
    disabled?: boolean;
}

const getPositionIcon = (code: string) => {
    switch (code) {
        case 'CAPTAIN':
        case 'PUNONG_BARANGAY':
            return <Crown className="h-3 w-3 text-amber-600 dark:text-amber-400" />;
        case 'SECRETARY':
            return <Award className="h-3 w-3 text-purple-600 dark:text-purple-400" />;
        case 'TREASURER':
            return <Shield className="h-3 w-3 text-green-600 dark:text-green-400" />;
        case 'SK_CHAIRPERSON':
        case 'SK-CHAIRMAN':
            return <UserCheck className="h-3 w-3 text-blue-600 dark:text-blue-400" />;
        case 'KAGAWAD':
            return <Building className="h-3 w-3 text-blue-600 dark:text-blue-400" />;
        default:
            return <Shield className="h-3 w-3 text-gray-600 dark:text-gray-400" />;
    }
};

export function PositionInformation({
    positions,
    committees,
    selectedPositionId,
    selectedCommitteeId,
    termStart,
    termEnd,
    status,
    order,
    responsibilities,
    onPositionChange,
    onCommitteeChange,
    onTermStartChange,
    onTermEndChange,
    onStatusChange,
    onOrderChange,
    onResponsibilitiesChange,
    errors = {},
    disabled = false
}: PositionInformationProps) {
    const selectedPosition = positions.find(p => p.id === selectedPositionId);
    const showCommitteeField = selectedPosition && (
        selectedPosition.code === 'KAGAWAD' ||
        selectedPosition.name?.toLowerCase().includes('kagawad') ||
        selectedPosition.committee_id !== undefined
    );

    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label className="dark:text-gray-300">Position <span className="text-red-500">*</span></Label>
                    <Select 
                        value={selectedPositionId?.toString() || ''}
                        onValueChange={onPositionChange}
                        disabled={disabled}
                    >
                        <SelectTrigger className={`dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 ${errors.position_id ? 'border-red-500 dark:border-red-500' : ''}`}>
                            <SelectValue placeholder="Select position" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                            {positions.map((position) => (
                                <SelectItem key={position.id} value={position.id.toString()} className="dark:text-gray-300 dark:focus:bg-gray-700">
                                    <div className="flex items-center gap-2">
                                        {getPositionIcon(position.code)}
                                        <span>{position.name}</span>
                                        {position.requires_account && (
                                            <Badge variant="outline" className="text-[10px] bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                Requires Account
                                            </Badge>
                                        )}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.position_id && (
                        <p className="text-sm text-red-600 dark:text-red-400">{errors.position_id}</p>
                    )}
                </div>

                {showCommitteeField && (
                    <div className="space-y-2">
                        <Label className="dark:text-gray-300">
                            Committee <span className="text-red-500">*</span>
                        </Label>
                        <Select 
                            value={selectedCommitteeId?.toString() || ''}
                            onValueChange={onCommitteeChange}
                            disabled={disabled}
                        >
                            <SelectTrigger className={`dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 ${errors.committee_id ? 'border-red-500 dark:border-red-500' : ''}`}>
                                <SelectValue placeholder="Select committee" />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                                {committees.filter(c => c.is_active).map((committee) => (
                                    <SelectItem key={committee.id} value={committee.id.toString()} className="dark:text-gray-300 dark:focus:bg-gray-700">
                                        <div className="flex items-center gap-2">
                                            <Target className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                            <span>{committee.name}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.committee_id && (
                            <p className="text-sm text-red-600 dark:text-red-400">{errors.committee_id}</p>
                        )}
                    </div>
                )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label className="dark:text-gray-300">Term Start <span className="text-red-500">*</span></Label>
                    <Input 
                        type="date" 
                        required 
                        value={termStart}
                        onChange={(e) => onTermStartChange(e.target.value)}
                        disabled={disabled}
                        className={`dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 ${errors.term_start ? 'border-red-500 dark:border-red-500' : ''}`}
                    />
                    {errors.term_start && (
                        <p className="text-sm text-red-600 dark:text-red-400">{errors.term_start}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label className="dark:text-gray-300">Term End <span className="text-red-500">*</span></Label>
                    <Input 
                        type="date" 
                        required 
                        value={termEnd}
                        onChange={(e) => onTermEndChange(e.target.value)}
                        disabled={disabled}
                        className={`dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 ${errors.term_end ? 'border-red-500 dark:border-red-500' : ''}`}
                    />
                    {errors.term_end && (
                        <p className="text-sm text-red-600 dark:text-red-400">{errors.term_end}</p>
                    )}
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label className="dark:text-gray-300">Status</Label>
                    <Select 
                        value={status}
                        onValueChange={onStatusChange}
                        disabled={disabled}
                    >
                        <SelectTrigger className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300">
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                            <SelectItem value="active">
                                <div className="flex items-center gap-2">
                                    <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                                    Active
                                </div>
                            </SelectItem>
                            <SelectItem value="inactive">
                                <div className="flex items-center gap-2">
                                    <X className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                                    Inactive
                                </div>
                            </SelectItem>
                            <SelectItem value="former">
                                <div className="flex items-center gap-2">
                                    <Shield className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                                    Former
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label className="dark:text-gray-300">Display Order</Label>
                    <Input 
                        type="number" 
                        min="0"
                        value={order}
                        onChange={(e) => onOrderChange(parseInt(e.target.value) || 0)}
                        disabled={disabled}
                        className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label className="dark:text-gray-300">Responsibilities</Label>
                <Textarea 
                    placeholder="Describe the official's responsibilities and duties..."
                    rows={4}
                    value={responsibilities}
                    onChange={(e) => onResponsibilitiesChange(e.target.value)}
                    disabled={disabled}
                    className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                />
            </div>

            {selectedPosition?.requires_account && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div className="text-xs text-blue-700 dark:text-blue-300">
                            <span className="font-medium">Note:</span> This position requires a system account. You'll need to assign a user account in the next step.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}