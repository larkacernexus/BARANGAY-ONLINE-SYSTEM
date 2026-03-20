// components/admin/feesCreate/BulkSelectionPanel.tsx

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
    Users, 
    Home, 
    Search, 
    Filter, 
    User, 
    Phone, 
    MapPin, 
    Trash2, 
    Plus, 
    Check, 
    X,
    Building,
    UserCheck,
    AlertCircle,
    FileText,
    ChevronDown,
    ChevronUp,
    Grid,
    List,
    Eye,
    EyeOff,
    RefreshCw,
    Award
} from 'lucide-react';
import { Resident, Household, Privilege } from '@/types/fees';
import { useState, useMemo } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface BulkSelectionPanelProps {
    bulkType: 'residents' | 'households' | 'custom';
    residents: Resident[];
    households: Household[];
    puroks: string[];
    allPrivileges?: Privilege[]; // Added
    selectedResidentIds: (string | number)[];
    selectedHouseholdIds: (string | number)[];
    customPayers: Array<{
        id: string;
        name: string;
        contact_number?: string;
        purok?: string;
        address?: string;
        type: 'custom';
    }>;
    filterPurok?: string;
    filterDiscountEligible?: boolean;
    applyToAllResidents: boolean;
    applyToAllHouseholds: boolean;
    searchTerm: string;
    toggleResidentSelection: (id: string | number) => void;
    toggleHouseholdSelection: (id: string | number) => void;
    addCustomPayer: () => void;
    removeCustomPayer: (id: string) => void;
    updateCustomPayer: (id: string, field: string, value: string) => void;
    handleSelectAllResidents: () => void;
    handleSelectAllHouseholds: () => void;
    setData: (key: string, value: any) => void;
    setSearchTerm: (term: string) => void;
    selectAllResidents: boolean;
    selectAllHouseholds: boolean;
}

export default function BulkSelectionPanel({
    bulkType,
    residents,
    households,
    puroks,
    allPrivileges = [],
    selectedResidentIds,
    selectedHouseholdIds,
    customPayers,
    filterPurok,
    filterDiscountEligible,
    applyToAllResidents,
    applyToAllHouseholds,
    searchTerm,
    toggleResidentSelection,
    toggleHouseholdSelection,
    addCustomPayer,
    removeCustomPayer,
    updateCustomPayer,
    handleSelectAllResidents,
    handleSelectAllHouseholds,
    setData,
    setSearchTerm,
    selectAllResidents,
    selectAllHouseholds
}: BulkSelectionPanelProps) {
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
    const [showFilters, setShowFilters] = useState(true);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [showPreview, setShowPreview] = useState(false);

    const toggleExpand = (id: string) => {
        const newExpanded = new Set(expandedItems);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedItems(newExpanded);
    };

    // Dynamically get resident badges from privileges
    const getResidentBadges = (resident: Resident) => {
        const badges = [];
        
        if (resident.privileges && resident.privileges.length > 0) {
            resident.privileges.forEach((rp: any) => {
                // Find matching privilege for icon/color
                const privilegeDef = allPrivileges.find(p => p.code === rp.code);
                
                badges.push({
                    code: rp.code,
                    label: rp.name,
                    icon: getPrivilegeIcon(rp.code),
                    color: getPrivilegeColor(rp.code),
                    id_number: rp.id_number
                });
            });
        }
        
        return badges;
    };

    // Helper to get privilege icon
    const getPrivilegeIcon = (code: string): string => {
        const icons: Record<string, string> = {
            'SC': '👴',
            'OSP': '👴',
            'PWD': '♿',
            'SP': '👨‍👧',
            'IND': '🏠',
            '4PS': '📦',
            'IP': '🌿',
            'FRM': '🌾',
            'FSH': '🎣',
            'OFW': '✈️',
            'SCH': '📚',
            'UNE': '💼',
        };
        return icons[code] || '🎫';
    };

    // Helper to get privilege color
    const getPrivilegeColor = (code: string): string => {
        const colors: Record<string, string> = {
            'SC': 'bg-blue-100 text-blue-800 border-blue-200',
            'OSP': 'bg-blue-100 text-blue-800 border-blue-200',
            'PWD': 'bg-purple-100 text-purple-800 border-purple-200',
            'SP': 'bg-green-100 text-green-800 border-green-200',
            'IND': 'bg-orange-100 text-orange-800 border-orange-200',
            '4PS': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'IP': 'bg-teal-100 text-teal-800 border-teal-200',
            'FRM': 'bg-brown-100 text-brown-800 border-brown-200',
            'FSH': 'bg-cyan-100 text-cyan-800 border-cyan-200',
            'OFW': 'bg-indigo-100 text-indigo-800 border-indigo-200',
            'SCH': 'bg-pink-100 text-pink-800 border-pink-200',
            'UNE': 'bg-gray-100 text-gray-800 border-gray-200',
        };
        return colors[code] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    // Filter residents by discount eligibility (dynamically using privileges)
    const isDiscountEligible = (resident: Resident): boolean => {
        if (!filterDiscountEligible) return true;
        return (resident.privileges && resident.privileges.length > 0) || false;
    };

    const getSelectionStats = () => {
        if (bulkType === 'residents') {
            const eligibleCount = residents.filter(r => r.privileges && r.privileges.length > 0).length;
            const selectedCount = applyToAllResidents ? residents.length : selectedResidentIds.length;
            return { 
                total: residents.length, 
                selected: selectedCount, 
                eligible: eligibleCount,
                selectedPercentage: residents.length > 0 ? Math.round((selectedCount / residents.length) * 100) : 0
            };
        } else if (bulkType === 'households') {
            const selectedCount = applyToAllHouseholds ? households.length : selectedHouseholdIds.length;
            return { 
                total: households.length, 
                selected: selectedCount, 
                eligible: 0,
                selectedPercentage: households.length > 0 ? Math.round((selectedCount / households.length) * 100) : 0
            };
        } else {
            return { 
                total: customPayers.length, 
                selected: customPayers.length, 
                eligible: 0,
                selectedPercentage: 100
            };
        }
    };

    const stats = getSelectionStats();

    return (
        <div className="h-full flex flex-col">
            <Card className="border-2 border-primary/10 h-full flex flex-col overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-white pb-4 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-primary/10 p-2">
                                {bulkType === 'residents' && <Users className="h-6 w-6 text-primary" />}
                                {bulkType === 'households' && <Home className="h-6 w-6 text-primary" />}
                                {bulkType === 'custom' && <User className="h-6 w-6 text-primary" />}
                            </div>
                            <div>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    {bulkType === 'residents' ? 'Resident Selection' : 
                                     bulkType === 'households' ? 'Household Selection' : 'Custom Payers'}
                                    <Badge variant="secondary" className="px-3 py-1">
                                        {stats.selected} selected
                                    </Badge>
                                </CardTitle>
                                <CardDescription className="mt-1">
                                    {bulkType === 'residents' && 'Select residents to apply the same fee configuration'}
                                    {bulkType === 'households' && 'Select households to apply the same fee configuration'}
                                    {bulkType === 'custom' && 'Add custom payers not currently in the system'}
                                </CardDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowFilters(!showFilters)}
                                            className="gap-2"
                                        >
                                            {showFilters ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            {showFilters ? 'Hide Filters' : 'Show Filters'}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {showFilters ? 'Hide search and filter options' : 'Show search and filter options'}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>

                    {/* Quick Stats Bar */}
                    <div className="mt-4 grid grid-cols-4 gap-3">
                        <div className="rounded-lg bg-gray-100 p-3">
                            <div className="text-xs font-medium text-gray-600 uppercase tracking-wider">Total</div>
                            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                        </div>
                        <div className="rounded-lg bg-primary/10 p-3">
                            <div className="text-xs font-medium text-primary uppercase tracking-wider">Selected</div>
                            <div className="text-2xl font-bold text-primary">{stats.selected}</div>
                        </div>
                        {bulkType === 'residents' && (
                            <div className="rounded-lg bg-blue-50 p-3">
                                <div className="text-xs font-medium text-blue-600 uppercase tracking-wider">With Privileges</div>
                                <div className="text-2xl font-bold text-blue-700">{stats.eligible}</div>
                            </div>
                        )}
                        <div className="rounded-lg bg-green-50 p-3">
                            <div className="text-xs font-medium text-green-600 uppercase tracking-wider">Coverage</div>
                            <div className="text-2xl font-bold text-green-700">{stats.selectedPercentage}%</div>
                        </div>
                    </div>
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                    {/* Filters Section */}
                    {showFilters && (bulkType === 'residents' || bulkType === 'households') && (
                        <div className="space-y-6 border-b bg-gradient-to-r from-gray-50 to-white p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-gray-200 p-2">
                                        <Filter className="h-5 w-5 text-gray-700" />
                                    </div>
                                    <h3 className="text-lg font-semibold">Filters & Search</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setData('filter_purok', '');
                                            setData('filter_discount_eligible', false);
                                            setSearchTerm('');
                                        }}
                                        className="gap-2"
                                    >
                                        <RefreshCw className="h-4 w-4" />
                                        Reset All
                                    </Button>
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="search" className="flex items-center gap-2 text-sm">
                                        <Search className="h-4 w-4" />
                                        Search
                                    </Label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                        <Input
                                            id="search"
                                            placeholder="Search by name, contact, or purok..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-9 h-10"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="filter-purok" className="flex items-center gap-2 text-sm">
                                        <MapPin className="h-4 w-4" />
                                        Filter by Purok
                                    </Label>
                                    <Select
                                        value={filterPurok || ''}
                                        onValueChange={(value) => setData('filter_purok', value || '')}
                                    >
                                        <SelectTrigger className="h-10">
                                            <SelectValue placeholder="All Puroks" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">All Puroks</SelectItem>
                                            {puroks.map((purok) => (
                                                <SelectItem key={purok} value={purok}>
                                                    Purok {purok}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {bulkType === 'residents' && (
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2 text-sm">
                                            <Award className="h-4 w-4" />
                                            Quick Filters
                                        </Label>
                                        <div className="flex flex-wrap gap-2">
                                            <Button
                                                type="button"
                                                variant={filterDiscountEligible ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setData('filter_discount_eligible', !filterDiscountEligible)}
                                                className="h-9"
                                            >
                                                <Award className="mr-2 h-4 w-4" />
                                                With Privileges Only
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Apply to all toggle */}
                            <div className="rounded-lg border bg-white p-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <Checkbox
                                            id={`apply-to-all-${bulkType}`}
                                            checked={bulkType === 'residents' ? applyToAllResidents : applyToAllHouseholds}
                                            onCheckedChange={(checked) => 
                                                setData(
                                                    bulkType === 'residents' ? 'apply_to_all_residents' : 'apply_to_all_households',
                                                    checked
                                                )
                                            }
                                            className="h-4 w-4"
                                        />
                                        <div className="flex-1">
                                            <Label
                                                htmlFor={`apply-to-all-${bulkType}`}
                                                className="cursor-pointer font-semibold"
                                            >
                                                Apply to ALL {bulkType === 'residents' ? 'residents' : 'households'}
                                            </Label>
                                            <p className="text-xs text-gray-600 mt-1">
                                                {filterPurok 
                                                    ? `Filtered to Purok ${filterPurok} • Showing ${stats.total} of ${bulkType === 'residents' ? 'all residents' : 'all households'}`
                                                    : `All ${stats.total} ${bulkType} in the system`
                                                }
                                            </p>
                                        </div>
                                    </div>
                                    {!applyToAllResidents && !applyToAllHouseholds && (
                                        <Button
                                            type="button"
                                            variant="default"
                                            size="sm"
                                            onClick={bulkType === 'residents' ? handleSelectAllResidents : handleSelectAllHouseholds}
                                            className="ml-2"
                                        >
                                            {selectAllResidents || selectAllHouseholds ? (
                                                <>
                                                    <X className="mr-2 h-4 w-4" />
                                                    Deselect All
                                                </>
                                            ) : (
                                                <>
                                                    <Check className="mr-2 h-4 w-4" />
                                                    Select All
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Main Content Area */}
                    <div className="flex-1 overflow-hidden flex flex-col">
                        {/* View Controls */}
                        {!applyToAllResidents && !applyToAllHouseholds && bulkType !== 'custom' && (
                            <div className="flex-shrink-0 p-3 border-b">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                variant={viewMode === 'list' ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => setViewMode('list')}
                                                className="h-8 gap-1 text-xs"
                                            >
                                                <List className="h-3 w-3" />
                                                List
                                            </Button>
                                            <Button
                                                type="button"
                                                variant={viewMode === 'grid' ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => setViewMode('grid')}
                                                className="h-8 gap-1 text-xs"
                                            >
                                                <Grid className="h-3 w-3" />
                                                Grid
                                            </Button>
                                        </div>
                                        
                                        {stats.selected > 0 && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setShowPreview(!showPreview)}
                                                className="h-8 gap-1 text-xs"
                                            >
                                                <FileText className="h-3 w-3" />
                                                {showPreview ? 'Back' : `Preview (${stats.selected})`}
                                            </Button>
                                        )}
                                    </div>
                                    
                                    <div className="text-xs text-gray-500">
                                        Showing {stats.total} {bulkType}
                                        {filterPurok && ` in Purok ${filterPurok}`}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Selection Content */}
                        <div className="flex-1 overflow-hidden">
                            {!applyToAllResidents && !applyToAllHouseholds ? (
                                showPreview ? (
                                    // Preview Mode
                                    <div className="h-full flex flex-col">
                                        <div className="p-3 border-b bg-gray-50 flex-shrink-0">
                                            <h4 className="font-semibold">Selected Items Preview</h4>
                                            <p className="text-xs text-gray-500">Review the {bulkType} that will receive fees</p>
                                        </div>
                                        <ScrollArea className="flex-1">
                                            <div className="p-3 space-y-2">
                                                {bulkType === 'residents' && 
                                                    residents
                                                        .filter(r => selectedResidentIds.includes(r.id.toString()))
                                                        .map(resident => {
                                                            const badges = getResidentBadges(resident);
                                                            return (
                                                                <div key={resident.id} className="rounded-lg bg-gradient-to-r from-gray-50 to-white p-3 border">
                                                                    <div className="flex items-center justify-between">
                                                                        <div className="font-medium">{resident.full_name}</div>
                                                                        <div className="flex gap-1">
                                                                            {badges.slice(0, 2).map((badge, idx) => (
                                                                                <Badge key={idx} className={`text-xs ${badge.color}`}>
                                                                                    {badge.icon} {badge.label}
                                                                                </Badge>
                                                                            ))}
                                                                            {badges.length > 2 && (
                                                                                <Badge variant="outline" className="text-xs">
                                                                                    +{badges.length - 2}
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-xs text-gray-600 mt-1">
                                                                        {resident.purok && `Purok ${resident.purok}`}
                                                                        {resident.contact_number && ` • ${resident.contact_number}`}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })
                                                }
                                                {bulkType === 'households' && 
                                                    households
                                                        .filter(h => selectedHouseholdIds.includes(h.id.toString()))
                                                        .map(household => (
                                                            <div key={household.id} className="rounded-lg bg-gradient-to-r from-gray-50 to-white p-3 border">
                                                                <div className="font-medium">{household.name}</div>
                                                                <div className="text-xs text-gray-600 mt-1">
                                                                    {household.purok && `Purok ${household.purok}`}
                                                                    {household.contact_number && ` • ${household.contact_number}`}
                                                                    {household.member_count && ` • ${household.member_count} members`}
                                                                </div>
                                                                {household.head_privileges && household.head_privileges.length > 0 && (
                                                                    <div className="mt-2 flex gap-1">
                                                                        {household.head_privileges.slice(0, 2).map((p: any, idx: number) => (
                                                                            <Badge key={idx} variant="outline" className="text-xs bg-purple-50">
                                                                                {p.name}
                                                                            </Badge>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))
                                                }
                                            </div>
                                        </ScrollArea>
                                        <div className="p-3 border-t bg-gray-50 flex-shrink-0">
                                            <div className="flex items-center justify-between">
                                                <div className="text-xs text-gray-600">
                                                    Total: {stats.selected} {bulkType}
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setShowPreview(false)}
                                                    size="sm"
                                                >
                                                    Back to Selection
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    // Selection Mode
                                    <ScrollArea className="h-full">
                                        {bulkType === 'residents' && (
                                            <div className="divide-y">
                                                {residents.length === 0 ? (
                                                    <div className="flex flex-col items-center justify-center p-8 text-center">
                                                        <AlertCircle className="h-8 w-8 text-gray-300 mb-3" />
                                                        <h3 className="font-semibold text-gray-700">No residents found</h3>
                                                        <p className="mt-1 text-gray-500 text-sm">
                                                            Try adjusting your search or filter criteria.
                                                        </p>
                                                        <Button
                                                            variant="outline"
                                                            className="mt-3"
                                                            size="sm"
                                                            onClick={() => {
                                                                setData('filter_purok', '');
                                                                setData('filter_discount_eligible', false);
                                                                setSearchTerm('');
                                                            }}
                                                        >
                                                            Clear All Filters
                                                        </Button>
                                                    </div>
                                                ) : viewMode === 'list' ? (
                                                    residents
                                                        .filter(r => isDiscountEligible(r))
                                                        .map((resident) => {
                                                            const isSelected = selectedResidentIds.includes(resident.id.toString());
                                                            const badges = getResidentBadges(resident);
                                                            const isExpanded = expandedItems.has(resident.id.toString());

                                                            return (
                                                                <div
                                                                    key={resident.id}
                                                                    className={`p-4 transition-all hover:bg-gray-50 ${
                                                                        isSelected ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                                                                    }`}
                                                                >
                                                                    <div className="flex items-start justify-between">
                                                                        <div className="flex items-start space-x-3">
                                                                            <Checkbox
                                                                                checked={isSelected}
                                                                                onCheckedChange={() => toggleResidentSelection(resident.id)}
                                                                                className="mt-1 h-4 w-4"
                                                                            />
                                                                            <div className="flex-1 min-w-0">
                                                                                <div className="flex items-center gap-2 mb-1">
                                                                                    <div className="font-semibold truncate">
                                                                                        {resident.full_name}
                                                                                    </div>
                                                                                    <div className="flex flex-wrap gap-1">
                                                                                        {badges.map((badge, idx) => (
                                                                                            <TooltipProvider key={idx}>
                                                                                                <Tooltip>
                                                                                                    <TooltipTrigger asChild>
                                                                                                        <Badge 
                                                                                                            variant="outline"
                                                                                                            className={`text-xs px-2 py-0.5 cursor-help ${badge.color}`}
                                                                                                        >
                                                                                                            <span className="mr-1 text-xs">{badge.icon}</span>
                                                                                                            <span className="text-xs">{badge.label}</span>
                                                                                                        </Badge>
                                                                                                    </TooltipTrigger>
                                                                                                    <TooltipContent>
                                                                                                        <p>ID: {badge.id_number || 'Not provided'}</p>
                                                                                                    </TooltipContent>
                                                                                                </Tooltip>
                                                                                            </TooltipProvider>
                                                                                        ))}
                                                                                    </div>
                                                                                </div>
                                                                                
                                                                                <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
                                                                                    {resident.contact_number && (
                                                                                        <div className="flex items-center gap-1">
                                                                                            <Phone className="h-3 w-3 flex-shrink-0" />
                                                                                            <span className="truncate">{resident.contact_number}</span>
                                                                                        </div>
                                                                                    )}
                                                                                    {resident.purok && (
                                                                                        <div className="flex items-center gap-1">
                                                                                            <MapPin className="h-3 w-3 flex-shrink-0" />
                                                                                            <span>Purok {resident.purok}</span>
                                                                                        </div>
                                                                                    )}
                                                                                    {resident.age && (
                                                                                        <div>
                                                                                            <span className="font-medium">Age:</span> {resident.age}
                                                                                        </div>
                                                                                    )}
                                                                                    {resident.gender && (
                                                                                        <div>
                                                                                            <span className="font-medium">Gender:</span> {resident.gender}
                                                                                        </div>
                                                                                    )}
                                                                                </div>

                                                                                {isExpanded && resident.address && (
                                                                                    <div className="mt-3 rounded bg-gray-100 p-3 text-xs">
                                                                                        <div className="font-medium mb-1">Complete Address:</div>
                                                                                        <div className="text-gray-700">{resident.address}</div>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center gap-1">
                                                                            <Button
                                                                                type="button"
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                onClick={() => toggleExpand(resident.id.toString())}
                                                                                className="h-7 w-7 p-0"
                                                                            >
                                                                                {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })
                                                ) : (
                                                    // Grid View for Residents
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3">
                                                        {residents
                                                            .filter(r => isDiscountEligible(r))
                                                            .map((resident) => {
                                                            const isSelected = selectedResidentIds.includes(resident.id.toString());
                                                            const badges = getResidentBadges(resident);

                                                            return (
                                                                <div
                                                                    key={resident.id}
                                                                    className={`border rounded-lg p-3 transition-all hover:shadow-md ${
                                                                        isSelected ? 'border-primary ring-1 ring-primary/20 bg-primary/5' : 'border-gray-200'
                                                                    }`}
                                                                >
                                                                    <div className="flex items-start justify-between mb-2">
                                                                        <Checkbox
                                                                            checked={isSelected}
                                                                            onCheckedChange={() => toggleResidentSelection(resident.id)}
                                                                            className="h-4 w-4"
                                                                        />
                                                                        <div className="flex flex-wrap gap-1">
                                                                            {badges.slice(0, 2).map((badge, idx) => (
                                                                                <Badge 
                                                                                    key={idx} 
                                                                                    className={`text-xs px-1.5 py-0.5 ${badge.color}`}
                                                                                >
                                                                                    <span className="text-xs">{badge.icon}</span>
                                                                                </Badge>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                    <div className="font-semibold text-sm mb-1 truncate">{resident.full_name}</div>
                                                                    <div className="space-y-1 text-xs text-gray-600">
                                                                        {resident.contact_number && (
                                                                            <div className="flex items-center gap-1">
                                                                                <Phone className="h-3 w-3" />
                                                                                <span className="truncate">{resident.contact_number}</span>
                                                                            </div>
                                                                        )}
                                                                        {resident.purok && (
                                                                            <div className="flex items-center gap-1">
                                                                                <MapPin className="h-3 w-3" />
                                                                                <span>Purok {resident.purok}</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {bulkType === 'households' && (
                                            <div className="divide-y">
                                                {households.length === 0 ? (
                                                    <div className="flex flex-col items-center justify-center p-8 text-center">
                                                        <Home className="h-8 w-8 text-gray-300 mb-3" />
                                                        <h3 className="font-semibold text-gray-700">No households found</h3>
                                                        <p className="mt-1 text-gray-500 text-sm">
                                                            Try adjusting your search or filter criteria.
                                                        </p>
                                                    </div>
                                                ) : (
                                                    households.map((household) => {
                                                        const isSelected = selectedHouseholdIds.includes(household.id.toString());
                                                        const isExpanded = expandedItems.has(household.id.toString());

                                                        return (
                                                            <div
                                                                key={household.id}
                                                                className={`p-4 transition-all hover:bg-gray-50 ${
                                                                    isSelected ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                                                                }`}
                                                            >
                                                                <div className="flex items-start justify-between">
                                                                    <div className="flex items-start space-x-3">
                                                                        <Checkbox
                                                                            checked={isSelected}
                                                                            onCheckedChange={() => toggleHouseholdSelection(household.id)}
                                                                            className="mt-1 h-4 w-4"
                                                                        />
                                                                        <div className="flex-1 min-w-0">
                                                                            <div className="flex items-center gap-2 mb-1">
                                                                                <div className="font-semibold">{household.name}</div>
                                                                                {household.member_count && (
                                                                                    <Badge variant="outline" className="text-xs">
                                                                                        👨‍👩‍👧‍👦 {household.member_count} members
                                                                                    </Badge>
                                                                                )}
                                                                            </div>
                                                                            
                                                                            <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
                                                                                {household.contact_number && (
                                                                                    <div className="flex items-center gap-1">
                                                                                        <Phone className="h-3 w-3 flex-shrink-0" />
                                                                                        <span>{household.contact_number}</span>
                                                                                    </div>
                                                                                )}
                                                                                {household.purok && (
                                                                                    <div className="flex items-center gap-1">
                                                                                        <MapPin className="h-3 w-3 flex-shrink-0" />
                                                                                        <span>Purok {household.purok}</span>
                                                                                    </div>
                                                                                )}
                                                                                {household.head_of_family && (
                                                                                    <div className="col-span-2">
                                                                                        <span className="font-medium">Head:</span> {household.head_of_family}
                                                                                    </div>
                                                                                )}
                                                                            </div>

                                                                            {/* Show head's privileges if any */}
                                                                            {household.head_privileges && household.head_privileges.length > 0 && (
                                                                                <div className="mt-2 flex gap-1">
                                                                                    {household.head_privileges.map((p: any, idx: number) => (
                                                                                        <Badge key={idx} variant="outline" className="text-xs bg-purple-50">
                                                                                            {p.name}
                                                                                        </Badge>
                                                                                    ))}
                                                                                </div>
                                                                            )}

                                                                            {isExpanded && household.address && (
                                                                                <div className="mt-3 rounded bg-gray-100 p-3 text-xs">
                                                                                    <div className="font-medium mb-1">Complete Address:</div>
                                                                                    <div className="text-gray-700">{household.address}</div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-1">
                                                                        <Button
                                                                            type="button"
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => toggleExpand(household.id.toString())}
                                                                            className="h-7 w-7 p-0"
                                                                        >
                                                                            {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        )}
                                    </ScrollArea>
                                )
                            ) : (
                                // Apply to All Message
                                <div className="h-full flex flex-col items-center justify-center p-4">
                                    <div className="text-center max-w-sm">
                                        <div className="bg-primary/10 rounded-full p-4 inline-flex mb-4">
                                            <Check className="h-6 w-6 text-primary" />
                                        </div>
                                        <h3 className="text-lg font-bold mb-2">Applying to All {bulkType}</h3>
                                        <p className="text-gray-600 text-sm mb-4">
                                            This fee will be applied to all {stats.total} {bulkType}
                                            {filterPurok && ` in Purok ${filterPurok}`}.
                                        </p>
                                        <div className="flex gap-2 justify-center">
                                            <Button
                                                variant="outline"
                                                onClick={() => setData(
                                                    bulkType === 'residents' ? 'apply_to_all_residents' : 'apply_to_all_households',
                                                    false
                                                )}
                                                size="sm"
                                            >
                                                Cancel "Apply to All"
                                            </Button>
                                            {filterPurok && (
                                                <Button
                                                    variant="default"
                                                    onClick={() => setData('filter_purok', '')}
                                                    size="sm"
                                                >
                                                    Clear Purok Filter
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Custom Payers Section */}
                    {bulkType === 'custom' && (
                        <div className="flex-1 overflow-hidden flex flex-col">
                            <div className="p-3 border-b bg-gray-50 flex-shrink-0">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold">Custom Payers</h3>
                                        <p className="text-xs text-gray-500">
                                            Add payers not in the resident or household database
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={addCustomPayer}
                                            className="gap-1 text-xs"
                                        >
                                            <Plus className="h-3 w-3" />
                                            Add Payer
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            
                            <ScrollArea className="flex-1">
                                <div className="p-3">
                                    {customPayers.length === 0 ? (
                                        <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
                                            <User className="mx-auto h-8 w-8 text-gray-400 mb-3" />
                                            <h3 className="font-semibold text-gray-900 mb-1">
                                                No custom payers added yet
                                            </h3>
                                            <p className="text-gray-500 text-sm mb-4 max-w-md mx-auto">
                                                Add custom payers manually
                                            </p>
                                            <Button onClick={addCustomPayer} size="sm">
                                                <Plus className="mr-1 h-3 w-3" />
                                                Add First Payer
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {customPayers.map((payer) => (
                                                <div key={payer.id} className="rounded-lg border bg-white p-3">
                                                    <div className="mb-3 flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <Building className="h-4 w-4 text-gray-600" />
                                                            <span className="font-semibold">Custom Payer</span>
                                                            <Badge variant="outline" className="text-xs">
                                                                Custom
                                                            </Badge>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeCustomPayer(payer.id)}
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-6 w-6 p-0"
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                                        <div className="space-y-1">
                                                            <Label htmlFor={`name-${payer.id}`} className="text-xs font-medium">
                                                                Full Name *
                                                            </Label>
                                                            <Input
                                                                id={`name-${payer.id}`}
                                                                value={payer.name}
                                                                onChange={(e) => 
                                                                    updateCustomPayer(payer.id, 'name', e.target.value)
                                                                }
                                                                placeholder="Juan Dela Cruz"
                                                                required
                                                                className="h-8 text-sm"
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <Label htmlFor={`contact-${payer.id}`} className="text-xs font-medium">
                                                                Contact Number
                                                            </Label>
                                                            <Input
                                                                id={`contact-${payer.id}`}
                                                                value={payer.contact_number || ''}
                                                                onChange={(e) => 
                                                                    updateCustomPayer(payer.id, 'contact_number', e.target.value)
                                                                }
                                                                placeholder="09123456789"
                                                                type="tel"
                                                                className="h-8 text-sm"
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <Label htmlFor={`purok-${payer.id}`} className="text-xs font-medium">
                                                                Purok
                                                            </Label>
                                                            <Select
                                                                value={payer.purok || ''}
                                                                onValueChange={(value) => 
                                                                    updateCustomPayer(payer.id, 'purok', value)
                                                                }
                                                            >
                                                                <SelectTrigger className="h-8 text-sm">
                                                                    <SelectValue placeholder="Select Purok" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="">No Purok</SelectItem>
                                                                    {puroks.map((purok) => (
                                                                        <SelectItem key={purok} value={purok}>
                                                                            Purok {purok}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <Label htmlFor={`address-${payer.id}`} className="text-xs font-medium">
                                                                Complete Address
                                                            </Label>
                                                            <Input
                                                                id={`address-${payer.id}`}
                                                                value={payer.address || ''}
                                                                onChange={(e) => 
                                                                    updateCustomPayer(payer.id, 'address', e.target.value)
                                                                }
                                                                placeholder="Street, Barangay, City"
                                                                className="h-8 text-sm"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="mt-3 pt-2 border-t">
                                                        <p className="text-xs text-gray-500">
                                                            This payer will receive a separate fee invoice.
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                            
                            {customPayers.length > 0 && (
                                <div className="p-3 border-t bg-gray-50 flex-shrink-0">
                                    <div className="flex justify-center">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={addCustomPayer}
                                            size="sm"
                                            className="text-xs"
                                        >
                                            <Plus className="mr-1 h-3 w-3" />
                                            Add Another Payer
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}