// components/admin/announcements/AudienceTarget.tsx

import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
    Users, 
    MapPin, 
    Home, 
    Briefcase, 
    UserCircle,
    Search,
    X,
    ChevronDown,
    ChevronUp,
    Info,
    Globe,
    AlertCircle,
    CheckCircle2,
    Loader2,
    Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Flexible types that can accept data from parent components
interface BaseItem {
    id: number;
    [key: string]: any;
}

interface Role extends BaseItem {
    name: string;
}

interface Purok extends BaseItem {
    name: string;
}

interface Household extends BaseItem {
    household_number: string;
    purok?: {
        id?: number;
        name: string;
    };
}

interface Business extends BaseItem {
    business_name: string;
    owner_name?: string;
}

interface User extends BaseItem {
    first_name: string;
    last_name: string;
    email: string;
    role?: {
        id?: number;
        name: string;
    };
    role_id?: number;
    household_id?: number;
}

interface AudienceTargetValue {
    audience_type: string;
    target_roles: number[];
    target_puroks: number[];
    target_households: number[];
    target_businesses: number[];
    target_users: number[];
}

interface AudienceTargetProps {
    value: AudienceTargetValue;
    onChange: (field: keyof AudienceTargetValue, value: any) => void;
    roles: Role[];
    puroks: Purok[];
    households: Household[];
    businesses: Business[];
    users: User[];
    errors?: Record<string, string>;
    disabled?: boolean;
}

interface AudienceType {
    value: string;
    label: string;
    icon: React.ElementType;
    description: string;
    color?: string;
}

interface SelectionSectionProps {
    type: keyof AudienceTargetValue;
    title: string;
    icon: React.ElementType;
    items: any[];
    searchPlaceholder: string;
    renderItem: (item: any) => React.ReactNode;
    selectedIds: number[];
    onToggle: (id: number) => void;
    onSelectAll: () => void;
    onClearAll: () => void;
    searchTerm: string;
    onSearchChange: (term: string) => void;
    isExpanded: boolean;
    onToggleExpand: () => void;
    disabled?: boolean;
    error?: string;
}

// Memoized Selection Section component for better performance
const SelectionSection = memo(({
    type,
    title,
    icon: Icon,
    items,
    searchPlaceholder,
    renderItem,
    selectedIds,
    onToggle,
    onSelectAll,
    onClearAll,
    searchTerm,
    onSearchChange,
    isExpanded,
    onToggleExpand,
    disabled = false,
    error
}: SelectionSectionProps) => {
    // Filter items based on search term
    const filteredItems = useMemo(() => {
        if (!searchTerm.trim()) return items;
        
        const searchLower = searchTerm.toLowerCase();
        return items.filter(item => 
            JSON.stringify(item).toLowerCase().includes(searchLower)
        );
    }, [items, searchTerm]);

    // Get selected items
    const selectedItems = useMemo(() => 
        items.filter(item => selectedIds.includes(item.id)),
        [items, selectedIds]
    );

    // Handlers with disabled check
    const handleToggle = useCallback((id: number) => {
        if (!disabled) {
            onToggle(id);
        }
    }, [onToggle, disabled]);

    const handleSelectAll = useCallback(() => {
        if (!disabled) {
            onSelectAll();
        }
    }, [onSelectAll, disabled]);

    const handleClearAll = useCallback(() => {
        if (!disabled) {
            onClearAll();
        }
    }, [onClearAll, disabled]);

    const handleRemoveSelected = useCallback((id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!disabled) {
            onToggle(id);
        }
    }, [onToggle, disabled]);

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        onSearchChange(e.target.value);
    }, [onSearchChange]);

    const handleClearSearch = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onSearchChange('');
    }, [onSearchChange]);

    return (
        <div className={cn(
            "border rounded-lg p-4 mb-4 transition-all",
            error ? 'border-red-300 bg-red-50 dark:bg-red-950/20' : 'hover:border-gray-300',
            disabled && 'opacity-60 pointer-events-none'
        )}>
            {/* Header - Click to expand/collapse */}
            <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={disabled ? undefined : onToggleExpand}
                role="button"
                tabIndex={disabled ? -1 : 0}
                onKeyDown={(e) => {
                    if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        onToggleExpand();
                    }
                }}
                aria-expanded={isExpanded}
                aria-controls={`${type}-section`}
            >
                <div className="flex items-center gap-2">
                    <Icon className={cn(
                        "h-5 w-5",
                        error ? 'text-red-500' : 'text-gray-500'
                    )} />
                    <div>
                        <h4 className="font-medium flex items-center gap-2">
                            {title}
                            {error && (
                                <AlertCircle className="h-4 w-4 text-red-500" />
                            )}
                        </h4>
                        <p className="text-sm text-gray-500">
                            {selectedIds.length} selected
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {selectedIds.length > 0 && (
                        <Badge variant="secondary" className="mr-2">
                            {selectedIds.length}
                        </Badge>
                    )}
                    {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-gray-500" />
                    ) : (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                    )}
                </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div id={`${type}-section`} className="mt-4 space-y-4">
                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder={searchPlaceholder}
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="pl-8 pr-8"
                            onClick={(e) => e.stopPropagation()}
                            disabled={disabled}
                            aria-label={`Search ${title.toLowerCase()}`}
                        />
                        {searchTerm && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-1 top-1 h-7 w-7 p-0"
                                onClick={handleClearSearch}
                                disabled={disabled}
                                aria-label="Clear search"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>

                    {/* Selected Items Preview */}
                    {selectedItems.length > 0 && (
                        <div className="flex flex-wrap gap-1 p-2 bg-gray-50 rounded dark:bg-gray-800">
                            {selectedItems.slice(0, 5).map((item) => (
                                <Badge 
                                    key={item.id} 
                                    variant="secondary" 
                                    className="flex items-center gap-1 pl-2"
                                >
                                    {renderItem(item)}
                                    {!disabled && (
                                        <X 
                                            className="h-3 w-3 cursor-pointer hover:text-red-500 transition-colors" 
                                            onClick={(e) => handleRemoveSelected(item.id, e)}
                                            aria-label={`Remove ${item.name || item.household_number || item.business_name || item.first_name}`}
                                        />
                                    )}
                                </Badge>
                            ))}
                            {selectedItems.length > 5 && (
                                <Badge variant="outline">
                                    +{selectedItems.length - 5} more
                                </Badge>
                            )}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleSelectAll}
                            disabled={disabled || filteredItems.length === 0}
                            className="text-xs"
                        >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Select All ({filteredItems.length})
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleClearAll}
                            disabled={disabled || selectedIds.length === 0}
                            className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                        >
                            <X className="h-3 w-3 mr-1" />
                            Clear All
                        </Button>
                    </div>

                    {/* Items List */}
                    <ScrollArea className="h-60 border rounded">
                        <div className="p-2 space-y-2">
                            {filteredItems.length > 0 ? (
                                filteredItems.map((item) => {
                                    const isItemSelected = selectedIds.includes(item.id);
                                    return (
                                        <div 
                                            key={item.id} 
                                            className={cn(
                                                "flex items-start space-x-2 p-2 rounded transition-colors",
                                                !disabled && "hover:bg-gray-50 cursor-pointer dark:hover:bg-gray-800",
                                                isItemSelected && "bg-blue-50 dark:bg-blue-900/20",
                                                disabled && "opacity-50"
                                            )}
                                            onClick={() => handleToggle(item.id)}
                                            role="checkbox"
                                            aria-checked={isItemSelected}
                                            tabIndex={disabled ? -1 : 0}
                                            onKeyDown={(e) => {
                                                if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
                                                    e.preventDefault();
                                                    handleToggle(item.id);
                                                }
                                            }}
                                        >
                                            <Checkbox
                                                id={`${type}-${item.id}`}
                                                checked={isItemSelected}
                                                onCheckedChange={() => handleToggle(item.id)}
                                                onClick={(e) => e.stopPropagation()}
                                                disabled={disabled}
                                                className="mt-0.5"
                                                aria-label={`Select ${item.name || item.household_number || item.business_name || `${item.first_name} ${item.last_name}`}`}
                                            />
                                            <label 
                                                htmlFor={`${type}-${item.id}`}
                                                className="text-sm flex-1 cursor-pointer"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {renderItem(item)}
                                            </label>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-8">
                                    <Search className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                                    <p className="text-gray-500">No items found</p>
                                    {searchTerm && (
                                        <Button
                                            variant="link"
                                            size="sm"
                                            onClick={handleClearSearch}
                                            className="mt-2"
                                        >
                                            Clear search
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    {/* Error Message */}
                    {error && (
                        <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
});

SelectionSection.displayName = 'SelectionSection';

// Main Component
export default function AudienceTarget({
    value,
    onChange,
    roles,
    puroks,
    households,
    businesses,
    users,
    errors = {},
    disabled = false
}: AudienceTargetProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        roles: false,
        puroks: false,
        households: false,
        businesses: false,
        users: false
    });
    const [estimatedReach, setEstimatedReach] = useState<number>(0);
    const [isCalculating, setIsCalculating] = useState(false);

    // Audience type options
    const audienceTypes: AudienceType[] = [
        { 
            value: 'all', 
            label: 'All Users', 
            icon: Globe, 
            description: 'Send to all registered users',
            color: 'text-green-600'
        },
        { 
            value: 'roles', 
            label: 'Specific Roles', 
            icon: Users, 
            description: 'Target users by their role (e.g., Household Head, Staff)',
            color: 'text-blue-600'
        },
        { 
            value: 'puroks', 
            label: 'Specific Puroks', 
            icon: MapPin, 
            description: 'Target households in specific puroks',
            color: 'text-purple-600'
        },
        { 
            value: 'households', 
            label: 'Specific Households', 
            icon: Home, 
            description: 'Target specific household accounts',
            color: 'text-orange-600'
        },
        { 
            value: 'household_members', 
            label: 'All Household Members', 
            icon: Users, 
            description: 'Target all residents in specific households',
            color: 'text-indigo-600'
        },
        { 
            value: 'businesses', 
            label: 'Business Owners', 
            icon: Briefcase, 
            description: 'Target business owners',
            color: 'text-yellow-600'
        },
        { 
            value: 'specific_users', 
            label: 'Specific Users', 
            icon: UserCircle, 
            description: 'Select individual users',
            color: 'text-pink-600'
        },
    ];

    // Calculate estimated reach
    useEffect(() => {
        const calculateReach = async () => {
            setIsCalculating(true);
            
            // Small delay for better UX
            await new Promise(resolve => setTimeout(resolve, 100));
            
            let reach = 0;
            switch (value.audience_type) {
                case 'all':
                    reach = users.length;
                    break;
                case 'roles': {
                    const usersWithRoles = users.filter(u => value.target_roles.includes(u.role_id || 0));
                    reach = usersWithRoles.length;
                    break;
                }
                case 'puroks': {
                    const householdIds = new Set(
                        households
                            .filter(h => value.target_puroks.includes(h.purok?.id || 0))
                            .map(h => h.id)
                    );
                    reach = users.filter(u => householdIds.has(u.household_id || 0)).length;
                    break;
                }
                case 'households': {
                    reach = users.filter(u => value.target_households.includes(u.household_id || 0)).length;
                    break;
                }
                case 'household_members': {
                    // Calculate average household size from actual data
                    const avgHouseholdSize = households.length > 0 
                        ? Math.ceil(users.length / households.length) 
                        : 4;
                    reach = value.target_households.length * avgHouseholdSize;
                    break;
                }
                case 'businesses':
                    reach = value.target_businesses.length;
                    break;
                case 'specific_users':
                    reach = value.target_users.length;
                    break;
            }
            
            setEstimatedReach(reach);
            setIsCalculating(false);
        };

        calculateReach();
    }, [
        value.audience_type,
        value.target_roles,
        value.target_puroks,
        value.target_households,
        value.target_businesses,
        value.target_users,
        users,
        households
    ]);

    // Handlers
    const handleAudienceTypeChange = useCallback((newType: string) => {
        onChange('audience_type', newType);
        // Clear other selections when changing type
        onChange('target_roles', []);
        onChange('target_puroks', []);
        onChange('target_households', []);
        onChange('target_businesses', []);
        onChange('target_users', []);
        setSearchTerm('');
    }, [onChange]);

    const toggleSelection = useCallback((field: keyof AudienceTargetValue, id: number) => {
        const current = value[field] as number[];
        const newValue = current.includes(id)
            ? current.filter(i => i !== id)
            : [...current, id];
        
        onChange(field, newValue);
    }, [value, onChange]);

    const selectAll = useCallback((field: keyof AudienceTargetValue, items: any[]) => {
        const newValue = items.map(i => i.id);
        onChange(field, newValue);
    }, [onChange]);

    const clearAll = useCallback((field: keyof AudienceTargetValue) => {
        onChange(field, []);
    }, [onChange]);

    const toggleSection = useCallback((section: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    }, []);

    const handleSearchChange = useCallback((term: string) => {
        setSearchTerm(term);
    }, []);

    // Get selected audience type details
    const selectedAudienceType = audienceTypes.find(t => t.value === value.audience_type);

    return (
        <Card className={cn(disabled && 'opacity-75')}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Audience Targeting
                </CardTitle>
                <CardDescription>
                    Choose who will see this announcement
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Audience Type Selection */}
                <div className="space-y-4">
                    <Label htmlFor="audience-type" className="text-base font-medium">
                        Audience Type <span className="text-red-500">*</span>
                    </Label>
                    <div 
                        id="audience-type"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                        role="radiogroup"
                        aria-label="Audience type selection"
                    >
                        {audienceTypes.map((type) => {
                            const Icon = type.icon;
                            const isSelected = value.audience_type === type.value;
                            
                            return (
                                <div key={type.value} className="relative">
                                    <input
                                        type="radio"
                                        name="audience_type"
                                        id={`audience-${type.value}`}
                                        value={type.value}
                                        checked={isSelected}
                                        onChange={() => handleAudienceTypeChange(type.value)}
                                        disabled={disabled}
                                        className="peer sr-only"
                                        aria-describedby={`${type.value}-description`}
                                    />
                                    <label
                                        htmlFor={`audience-${type.value}`}
                                        className={cn(
                                            "flex flex-col p-4 cursor-pointer rounded-lg border-2 transition-all h-full",
                                            isSelected 
                                                ? 'border-primary bg-primary/5 shadow-md' 
                                                : 'border-muted hover:bg-accent hover:border-gray-300',
                                            disabled && 'pointer-events-none opacity-50'
                                        )}
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <Icon className={cn(
                                                "h-5 w-5 transition-colors",
                                                isSelected ? type.color : 'text-gray-500'
                                            )} />
                                            <span className={cn(
                                                "font-medium",
                                                isSelected ? type.color : ''
                                            )}>
                                                {type.label}
                                            </span>
                                        </div>
                                        <p 
                                            id={`${type.value}-description`}
                                            className="text-sm text-gray-500 dark:text-gray-400"
                                        >
                                            {type.description}
                                        </p>
                                    </label>
                                </div>
                            );
                        })}
                    </div>
                    {errors.audience_type && (
                        <p className="text-sm text-red-600 flex items-center gap-1 mt-2">
                            <AlertCircle className="h-4 w-4" />
                            {errors.audience_type}
                        </p>
                    )}
                </div>

                {/* Estimated Reach */}
                {value.audience_type !== 'all' && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                                {isCalculating ? (
                                    <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                                ) : (
                                    <Info className="h-5 w-5 text-blue-500" />
                                )}
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-blue-700 dark:text-blue-300">
                                    Estimated Reach
                                </p>
                                <p className="text-sm text-blue-600 dark:text-blue-400">
                                    {isCalculating ? (
                                        'Calculating...'
                                    ) : (
                                        <>
                                            This announcement will reach approximately{' '}
                                            <span className="font-bold">{estimatedReach.toLocaleString()}</span>{' '}
                                            {estimatedReach === 1 ? 'person' : 'people'}
                                        </>
                                    )}
                                </p>
                                {estimatedReach === 0 && !isCalculating && (
                                    <p className="text-xs text-blue-500 mt-1">
                                        No users match the current selection criteria
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Audience Specific Selections */}
                {value.audience_type !== 'all' && (
                    <div className="space-y-4 mt-6">
                        {/* Roles Selection */}
                        {value.audience_type === 'roles' && (
                            <SelectionSection
                                type="target_roles"
                                title="Select Roles"
                                icon={Users}
                                items={roles}
                                searchPlaceholder="Search roles..."
                                renderItem={(role: Role) => (
                                    <span className="font-medium">{role.name}</span>
                                )}
                                selectedIds={value.target_roles}
                                onToggle={(id) => toggleSelection('target_roles', id)}
                                onSelectAll={() => selectAll('target_roles', roles)}
                                onClearAll={() => clearAll('target_roles')}
                                searchTerm={searchTerm}
                                onSearchChange={handleSearchChange}
                                isExpanded={expandedSections.roles}
                                onToggleExpand={() => toggleSection('roles')}
                                disabled={disabled}
                                error={errors.target_roles}
                            />
                        )}

                        {/* Puroks Selection */}
                        {value.audience_type === 'puroks' && (
                            <SelectionSection
                                type="target_puroks"
                                title="Select Puroks"
                                icon={MapPin}
                                items={puroks}
                                searchPlaceholder="Search puroks..."
                                renderItem={(purok: Purok) => (
                                    <span className="font-medium">{purok.name}</span>
                                )}
                                selectedIds={value.target_puroks}
                                onToggle={(id) => toggleSelection('target_puroks', id)}
                                onSelectAll={() => selectAll('target_puroks', puroks)}
                                onClearAll={() => clearAll('target_puroks')}
                                searchTerm={searchTerm}
                                onSearchChange={handleSearchChange}
                                isExpanded={expandedSections.puroks}
                                onToggleExpand={() => toggleSection('puroks')}
                                disabled={disabled}
                                error={errors.target_puroks}
                            />
                        )}

                        {/* Households Selection */}
                        {(value.audience_type === 'households' || value.audience_type === 'household_members') && (
                            <>
                                <SelectionSection
                                    type="target_households"
                                    title="Select Households"
                                    icon={Home}
                                    items={households}
                                    searchPlaceholder="Search by household number or purok..."
                                    renderItem={(household: Household) => (
                                        <div className="flex items-center gap-1">
                                            <span className="font-medium">{household.household_number}</span>
                                            {household.purok && (
                                                <Badge variant="outline" className="ml-2 text-xs">
                                                    {household.purok.name}
                                                </Badge>
                                            )}
                                        </div>
                                    )}
                                    selectedIds={value.target_households}
                                    onToggle={(id) => toggleSelection('target_households', id)}
                                    onSelectAll={() => selectAll('target_households', households)}
                                    onClearAll={() => clearAll('target_households')}
                                    searchTerm={searchTerm}
                                    onSearchChange={handleSearchChange}
                                    isExpanded={expandedSections.households}
                                    onToggleExpand={() => toggleSection('households')}
                                    disabled={disabled}
                                    error={errors.target_households}
                                />
                                {value.audience_type === 'household_members' && (
                                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-sm">
                                        <p className="text-amber-700 dark:text-amber-300 flex items-center gap-1">
                                            <Info className="h-4 w-4 inline" />
                                            This will notify ALL members (residents) of selected households
                                        </p>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Businesses Selection */}
                        {value.audience_type === 'businesses' && (
                            <SelectionSection
                                type="target_businesses"
                                title="Select Businesses"
                                icon={Briefcase}
                                items={businesses}
                                searchPlaceholder="Search by business name or owner..."
                                renderItem={(business: Business) => (
                                    <div>
                                        <span className="font-medium">{business.business_name}</span>
                                        {business.owner_name && (
                                            <span className="text-gray-500 text-xs block">
                                                Owner: {business.owner_name}
                                            </span>
                                        )}
                                    </div>
                                )}
                                selectedIds={value.target_businesses}
                                onToggle={(id) => toggleSelection('target_businesses', id)}
                                onSelectAll={() => selectAll('target_businesses', businesses)}
                                onClearAll={() => clearAll('target_businesses')}
                                searchTerm={searchTerm}
                                onSearchChange={handleSearchChange}
                                isExpanded={expandedSections.businesses}
                                onToggleExpand={() => toggleSection('businesses')}
                                disabled={disabled}
                                error={errors.target_businesses}
                            />
                        )}

                        {/* Specific Users Selection */}
                        {value.audience_type === 'specific_users' && (
                            <SelectionSection
                                type="target_users"
                                title="Select Users"
                                icon={UserCircle}
                                items={users}
                                searchPlaceholder="Search by name, email, or role..."
                                renderItem={(user: User) => (
                                    <div>
                                        <span className="font-medium">
                                            {user.first_name} {user.last_name}
                                        </span>
                                        {user.role && (
                                            <Badge variant="outline" className="ml-2 text-xs">
                                                {user.role.name}
                                            </Badge>
                                        )}
                                        <span className="text-gray-400 text-xs block">
                                            {user.email}
                                        </span>
                                    </div>
                                )}
                                selectedIds={value.target_users}
                                onToggle={(id) => toggleSelection('target_users', id)}
                                onSelectAll={() => selectAll('target_users', users)}
                                onClearAll={() => clearAll('target_users')}
                                searchTerm={searchTerm}
                                onSearchChange={handleSearchChange}
                                isExpanded={expandedSections.users}
                                onToggleExpand={() => toggleSection('users')}
                                disabled={disabled}
                                error={errors.target_users}
                            />
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}