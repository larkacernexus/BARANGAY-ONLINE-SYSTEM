// components/admin/officials/shared/position-information.tsx
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Crown, Award, Shield, UserCheck, Building, Target, Check, X } from 'lucide-react';
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
        status?: string; // Add status to errors
    };
}

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
    errors = {}
}: PositionInformationProps) {
    // Get icon based on position code
    const getPositionIcon = (code: string) => {
        switch (code) {
            case 'CAPTAIN':
                return <Crown className="h-3 w-3 text-amber-600 dark:text-amber-400" />;
            case 'SECRETARY':
                return <Award className="h-3 w-3 text-purple-600 dark:text-purple-400" />;
            case 'TREASURER':
                return <Shield className="h-3 w-3 text-green-600 dark:text-green-400" />;
            case 'SK-CHAIRMAN':
                return <UserCheck className="h-3 w-3 text-blue-600 dark:text-blue-400" />;
            case 'KAGAWAD':
                return <Building className="h-3 w-3 text-blue-600 dark:text-blue-400" />;
            default:
                return <Shield className="h-3 w-3 text-gray-600 dark:text-gray-400" />;
        }
    };

    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="position_id" className="dark:text-gray-300">Position *</Label>
                    <Select 
                        value={selectedPositionId?.toString() || ''}
                        onValueChange={onPositionChange}
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
                                            <Badge variant="outline" className="text-[10px] bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
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

                <div className="space-y-2">
                    <Label htmlFor="committee_id" className="dark:text-gray-300">Committee</Label>
                    <Select 
                        value={selectedCommitteeId?.toString() || ''}
                        onValueChange={onCommitteeChange}
                    >
                        <SelectTrigger className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300">
                            <SelectValue placeholder="Select committee" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                            <SelectItem value="">None</SelectItem>
                            {committees.map((committee) => (
                                <SelectItem key={committee.id} value={committee.id.toString()} className="dark:text-gray-300 dark:focus:bg-gray-700">
                                    <div className="flex items-center gap-2">
                                        <Target className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                        <span>{committee.name}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="term_start" className="dark:text-gray-300">Term Start *</Label>
                    <Input 
                        id="term_start" 
                        type="date" 
                        required 
                        value={termStart}
                        onChange={(e) => onTermStartChange(e.target.value)}
                        className={`dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 ${errors.term_start ? 'border-red-500 dark:border-red-500' : ''}`}
                    />
                    {errors.term_start && (
                        <p className="text-sm text-red-600 dark:text-red-400">{errors.term_start}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="term_end" className="dark:text-gray-300">Term End *</Label>
                    <Input 
                        id="term_end" 
                        type="date" 
                        required 
                        value={termEnd}
                        onChange={(e) => onTermEndChange(e.target.value)}
                        className={`dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 ${errors.term_end ? 'border-red-500 dark:border-red-500' : ''}`}
                    />
                    {errors.term_end && (
                        <p className="text-sm text-red-600 dark:text-red-400">{errors.term_end}</p>
                    )}
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="status" className="dark:text-gray-300">Status *</Label>
                    <Select 
                        value={status}
                        onValueChange={onStatusChange}
                    >
                        <SelectTrigger className={`dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 ${errors.status ? 'border-red-500 dark:border-red-500' : ''}`}>
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
                    {errors.status && (
                        <p className="text-sm text-red-600 dark:text-red-400">{errors.status}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="order" className="dark:text-gray-300">Display Order</Label>
                    <Input 
                        id="order" 
                        type="number" 
                        min="0"
                        value={order}
                        onChange={(e) => onOrderChange(parseInt(e.target.value))}
                        className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="responsibilities" className="dark:text-gray-300">Responsibilities</Label>
                <Textarea 
                    id="responsibilities" 
                    placeholder="Describe the official's responsibilities and duties..."
                    rows={4}
                    value={responsibilities}
                    onChange={(e) => onResponsibilitiesChange(e.target.value)}
                    className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                />
            </div>
        </div>
    );
}