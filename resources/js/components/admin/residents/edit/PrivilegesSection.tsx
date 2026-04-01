// components/admin/residents/edit/PrivilegesSection.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Award, Plus, X, Search, Calendar, FileText, 
  Percent, Shield, ChevronDown, ChevronUp,
  Clock, CheckCircle, AlertCircle, AlertTriangle,
  IdCard, FileWarning
} from 'lucide-react';
import { useState } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

// Import types from main types file
import { Privilege } from '@/types/admin/residents/residents-types';

interface PrivilegeAssignment {
    privilege_id: number;
    id_number?: string;
    verified_at?: string;
    expires_at?: string;
    remarks?: string;
    discount_percentage?: number;
}

interface Props {
    privileges: Privilege[];
    assignedPrivileges: PrivilegeAssignment[];
    onAddPrivilege: (privilegeId: number) => void;
    onRemovePrivilege: (privilegeId: number) => void;
    onUpdatePrivilege: (privilegeId: number, field: string, value: string) => void;
}

// Helper function to safely get input value
const getInputValue = (value: string | null | undefined): string => {
    if (value === null || value === undefined) return '';
    return value;
};

export default function PrivilegesSection({ 
    privileges, 
    assignedPrivileges, 
    onAddPrivilege, 
    onRemovePrivilege,
    onUpdatePrivilege 
}: Props) {
    const [privilegeSearch, setPrivilegeSearch] = useState('');
    const [expandedCards, setExpandedCards] = useState<Record<number, boolean>>({});

    const getPrivilegeDetails = (privilegeId: number) => {
        return privileges.find(p => p.id === privilegeId);
    };

    const toggleCard = (privilegeId: number) => {
        setExpandedCards(prev => ({
            ...prev,
            [privilegeId]: !prev[privilegeId]
        }));
    };

    const availablePrivileges = privileges.filter(p => 
        p.is_active &&
        !assignedPrivileges.some(assigned => assigned.privilege_id === p.id) &&
        (privilegeSearch === '' || 
         p.name.toLowerCase().includes(privilegeSearch.toLowerCase()) ||
         p.code.toLowerCase().includes(privilegeSearch.toLowerCase()))
    );

    // Check if privilege has missing required info
    const hasMissingInfo = (assignment: PrivilegeAssignment, privilege: Privilege) => {
        if (privilege.requires_id_number && !assignment.id_number) return true;
        if (privilege.requires_verification && !assignment.verified_at) return true;
        return false;
    };

    // Group privileges by category/status
    const today = new Date().toISOString().split('T')[0];
    const activePrivileges = assignedPrivileges.filter(p => !p.expires_at || p.expires_at >= today);
    const expiredPrivileges = assignedPrivileges.filter(p => p.expires_at && p.expires_at < today);
    
    // Count privileges with missing info
    const missingInfoCount = assignedPrivileges.filter(assignment => {
        const privilege = getPrivilegeDetails(assignment.privilege_id);
        return privilege && hasMissingInfo(assignment, privilege);
    }).length;

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-700 dark:to-orange-700 flex items-center justify-center">
                            <Award className="h-3 w-3 text-white" />
                        </div>
                        <CardTitle className="dark:text-gray-100">Benefits & Privileges</CardTitle>
                    </div>
                    {assignedPrivileges.length > 0 && (
                        <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                            {assignedPrivileges.length} assigned
                        </Badge>
                    )}
                </div>
                <CardDescription className="dark:text-gray-400">
                    Manage resident benefits and special classifications
                </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
                {/* Quick Stats with Missing Info Alert */}
                {assignedPrivileges.length > 0 && (
                    <div className="space-y-2">
                        <div className="grid grid-cols-3 gap-1">
                            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                <div className="flex items-center gap-1 text-green-700 dark:text-green-400 mb-1">
                                    <CheckCircle className="h-3 w-3" />
                                    <span className="text-xs font-medium">Active</span>
                                </div>
                                <p className="text-lg font-bold text-green-700 dark:text-green-400">{activePrivileges.length}</p>
                            </div>
                            <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                <div className="flex items-center gap-1 text-red-700 dark:text-red-400 mb-1">
                                    <AlertCircle className="h-3 w-3" />
                                    <span className="text-xs font-medium">Expired</span>
                                </div>
                                <p className="text-lg font-bold text-red-700 dark:text-red-400">{expiredPrivileges.length}</p>
                            </div>
                            <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                                <div className="flex items-center gap-1 text-amber-700 dark:text-amber-400 mb-1">
                                    <FileWarning className="h-3 w-3" />
                                    <span className="text-xs font-medium">Incomplete</span>
                                </div>
                                <p className="text-lg font-bold text-amber-700 dark:text-amber-400">{missingInfoCount}</p>
                            </div>
                        </div>
                        
                        {missingInfoCount > 0 && (
                            <div className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                                <p className="text-xs text-amber-700 dark:text-amber-400">
                                    {missingInfoCount} benefit{missingInfoCount > 1 ? 's' : ''} need{missingInfoCount === 1 ? 's' : ''} additional information
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Add New Benefit Section */}
                <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                        <Plus className="h-4 w-4" />
                        Add New Benefit
                    </Label>
                    
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <Input
                            placeholder="Search benefits..."
                            value={privilegeSearch}
                            onChange={(e) => setPrivilegeSearch(e.target.value)}
                            className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                        />
                    </div>
                    
                    {/* Available Privileges - Compact list */}
                    <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900/50">
                        {availablePrivileges.length > 0 ? (
                            availablePrivileges.map((privilege) => (
                                <div
                                    key={privilege.id}
                                    className="p-2 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition-colors flex items-center justify-between"
                                    onClick={() => onAddPrivilege(privilege.id)}
                                >
                                    <div className="flex-1 min-w-0 flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-gray-400 shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1 flex-wrap">
                                                <span className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                                                    {privilege.name}
                                                </span>
                                                <Badge variant="outline" className="text-xs px-1 py-0 h-4 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                                    {privilege.code}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs">
                                                {privilege.default_discount_percentage ? (
                                                    <span className="text-green-600 dark:text-green-400">
                                                        {privilege.default_discount_percentage}% off
                                                    </span>
                                                ) : null}
                                                {privilege.requires_id_number && (
                                                    <span className="text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                                                        <IdCard className="h-3 w-3" />
                                                        <span>ID required</span>
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <Button 
                                        type="button" 
                                        size="sm" 
                                        variant="ghost" 
                                        className="h-6 w-6 p-0 ml-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-950/50 shrink-0 rounded-full"
                                    >
                                        <Plus className="h-3 w-3" />
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-4 px-2">
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {privilegeSearch ? 'No matches found' : 'All benefits assigned'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <Separator className="dark:bg-gray-700" />

                {/* Assigned Privileges - Compact cards with missing info indicators */}
                {assignedPrivileges.length > 0 ? (
                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                        {assignedPrivileges.map((assignment) => {
                            const privilege = getPrivilegeDetails(assignment.privilege_id);
                            if (!privilege) return null;
                            
                            const isExpired = assignment.expires_at && assignment.expires_at < today;
                            const isExpanded = expandedCards[assignment.privilege_id];
                            const missingInfo = hasMissingInfo(assignment, privilege);
                            
                            return (
                                <Collapsible
                                    key={assignment.privilege_id}
                                    open={isExpanded}
                                    onOpenChange={() => toggleCard(assignment.privilege_id)}
                                    className={cn(
                                        "border rounded-lg bg-white dark:bg-gray-900/50 hover:shadow-sm transition-shadow",
                                        missingInfo 
                                            ? "border-amber-200 dark:border-amber-800" 
                                            : isExpired
                                                ? "border-red-200 dark:border-red-800"
                                                : "border-gray-200 dark:border-gray-700"
                                    )}
                                >
                                    {/* Header - Always visible */}
                                    <div className="p-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className={cn(
                                                        "w-2 h-2 rounded-full",
                                                        missingInfo ? 'bg-amber-500' :
                                                        isExpired ? 'bg-red-500' : 
                                                        assignment.expires_at ? 'bg-green-500' : 'bg-blue-500'
                                                    )} />
                                                    <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                                                        {privilege.name}
                                                    </span>
                                                    <Badge variant="outline" className="text-xs px-1 py-0 h-5">
                                                        {privilege.code}
                                                    </Badge>
                                                </div>
                                                
                                                <div className="grid grid-cols-2 gap-1 text-xs">
                                                    <div>
                                                        <span className="text-gray-500 dark:text-gray-500 block">ID:</span>
                                                        <div className="flex items-center gap-1">
                                                            {!assignment.id_number && privilege.requires_id_number ? (
                                                                <>
                                                                    <AlertTriangle className="h-3 w-3 text-amber-500" />
                                                                    <span className="text-amber-600 dark:text-amber-400 italic">No ID</span>
                                                                </>
                                                            ) : (
                                                                <span className="font-mono text-gray-700 dark:text-gray-300">
                                                                    {assignment.id_number || '—'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500 dark:text-gray-500 block">Expires:</span>
                                                        <span className={cn(
                                                            isExpired ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-700 dark:text-gray-300'
                                                        )}>
                                                            {assignment.expires_at || 'Never'}
                                                            {isExpired && <span className="ml-1 text-red-600 dark:text-red-400">(Expired)</span>}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Missing Info Warning - Compact */}
                                                {missingInfo && !isExpanded && (
                                                    <div className="flex items-center gap-1 mt-1 text-amber-600 dark:text-amber-400">
                                                        <FileWarning className="h-3 w-3" />
                                                        <span className="text-xs">
                                                            {!assignment.id_number && privilege.requires_id_number ? 'ID required' : ''}
                                                            {!assignment.verified_at && privilege.requires_verification ? 'Verification required' : ''}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="flex items-center gap-1 ml-2">
                                                <CollapsibleTrigger asChild>
                                                    <Button 
                                                        type="button"
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="h-7 w-7 p-0 rounded-full"
                                                    >
                                                        {isExpanded ? 
                                                            <ChevronUp className="h-4 w-4" /> : 
                                                            <ChevronDown className="h-4 w-4" />
                                                        }
                                                    </Button>
                                                </CollapsibleTrigger>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onRemovePrivilege(assignment.privilege_id)}
                                                    className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/50 rounded-full"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Expanded Details with Missing Info Highlight */}
                                    <CollapsibleContent>
                                        <div className="px-3 pb-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                                            <div className="space-y-3">
                                                {privilege.requires_id_number && (
                                                    <div>
                                                        <Label htmlFor={`id-${privilege.id}`} className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                                                            <IdCard className="h-3 w-3" />
                                                            ID Number
                                                            {!assignment.id_number && (
                                                                <Badge variant="outline" className="text-xs bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 h-4 px-1">
                                                                    Required
                                                                </Badge>
                                                            )}
                                                        </Label>
                                                        <Input
                                                            id={`id-${privilege.id}`}
                                                            placeholder={`Enter ${privilege.name} ID`}
                                                            value={getInputValue(assignment.id_number)}
                                                            onChange={(e) => onUpdatePrivilege(assignment.privilege_id, 'id_number', e.target.value)}
                                                            className={cn(
                                                                "h-8 text-sm dark:bg-gray-900 dark:border-gray-700",
                                                                !assignment.id_number && "border-amber-300 dark:border-amber-700 focus:ring-amber-500"
                                                            )}
                                                        />
                                                    </div>
                                                )}
                                                
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <Label htmlFor={`verified-${privilege.id}`} className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            Verified Date
                                                            {privilege.requires_verification && !assignment.verified_at && (
                                                                <Badge variant="outline" className="text-xs bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 h-4 px-1">
                                                                    Required
                                                                </Badge>
                                                            )}
                                                        </Label>
                                                        <div className="relative">
                                                            <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400 dark:text-gray-500" />
                                                            <Input
                                                                id={`verified-${privilege.id}`}
                                                                type="date"
                                                                value={getInputValue(assignment.verified_at)}
                                                                onChange={(e) => onUpdatePrivilege(assignment.privilege_id, 'verified_at', e.target.value)}
                                                                className={cn(
                                                                    "h-8 text-sm pl-8 dark:bg-gray-900 dark:border-gray-700",
                                                                    privilege.requires_verification && !assignment.verified_at && "border-amber-300 dark:border-amber-700 focus:ring-amber-500"
                                                                )}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <Label htmlFor={`expires-${privilege.id}`} className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            Expiry Date
                                                        </Label>
                                                        <div className="relative">
                                                            <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400 dark:text-gray-500" />
                                                            <Input
                                                                id={`expires-${privilege.id}`}
                                                                type="date"
                                                                value={getInputValue(assignment.expires_at)}
                                                                onChange={(e) => onUpdatePrivilege(assignment.privilege_id, 'expires_at', e.target.value)}
                                                                className="h-8 text-sm pl-8 dark:bg-gray-900 dark:border-gray-700"
                                                            />
                                                        </div>
                                                        {isExpired && (
                                                            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                                                This benefit has expired
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <div>
                                                    <Label htmlFor={`remarks-${privilege.id}`} className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                                                        Remarks
                                                    </Label>
                                                    <Input
                                                        id={`remarks-${privilege.id}`}
                                                        placeholder="Additional notes (optional)"
                                                        value={getInputValue(assignment.remarks)}
                                                        onChange={(e) => onUpdatePrivilege(assignment.privilege_id, 'remarks', e.target.value)}
                                                        className="h-8 text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </CollapsibleContent>
                                </Collapsible>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-6">
                        <Award className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">No benefits assigned yet</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            Search and add benefits from above
                        </p>
                    </div>
                )}

                {/* Info Note */}
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-1">
                        <FileText className="h-3 w-3 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                            <span className="font-medium">Missing info indicator:</span> Benefits with incomplete information are highlighted in amber
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}