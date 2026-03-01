import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ActionDropdown, ActionDropdownItem, ActionDropdownSeparator } from '@/components/adminui/action-dropdown';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { Home, Users, Phone, MapPin, Eye, Edit, Trash2, Clipboard } from 'lucide-react';
import { Household, Purok } from '@/types';

interface HouseholdCardProps {
    household: Household;
    puroks: Purok[];
    isSelected: boolean;
    isBulkMode: boolean;
    isMobile: boolean;
    onSelect: (id: number) => void;
    onDelete: (household: Household) => void;
    onCopyToClipboard: (text: string, label: string) => void;
    truncateText: (text: string, maxLength: number) => string;
    truncateAddress: (address: string, maxLength: number) => string;
    formatContactNumber: (contact: string) => string;
    getPurokName: (household: Household, puroks: Purok[]) => string;
    getStatusBadgeVariant: (status: string) => string;
}

export function HouseholdCard({
    household,
    puroks,
    isSelected,
    isBulkMode,
    isMobile,
    onSelect,
    onDelete,
    onCopyToClipboard,
    truncateText,
    truncateAddress,
    formatContactNumber,
    getPurokName,
    getStatusBadgeVariant
}: HouseholdCardProps) {
    const purokName = getPurokName(household, puroks);
    
    return (
        <Card 
            key={household.id}
            className={`overflow-hidden transition-all hover:shadow-md ${
                isSelected ? 'border-blue-500 border-2 bg-blue-50 dark:bg-blue-900/10' : ''
            }`}
            onClick={(e) => {
                if (isBulkMode && e.target instanceof HTMLElement && 
                    !e.target.closest('a') && 
                    !e.target.closest('button') &&
                    !e.target.closest('.dropdown-menu-content')) {
                    onSelect(household.id);
                }
            }}
        >
            <CardContent className="p-4">
                {/* Grid Header with actions */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <Home className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="font-medium truncate flex items-center gap-1">
                                {truncateText(household.household_number, isMobile ? 12 : 15)}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                                ID: {household.id}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                        {isBulkMode && (
                            <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => onSelect(household.id)}
                                onClick={(e) => e.stopPropagation()}
                                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                            />
                        )}
                        <ActionDropdown>
                            <ActionDropdownItem
                                icon={<Eye className="h-4 w-4" />}
                                href={`/admin/households/${household.id}`}
                            >
                                View Details
                            </ActionDropdownItem>
                            
                            <ActionDropdownItem
                                icon={<Edit className="h-4 w-4" />}
                                href={`/admin/households/${household.id}/edit`}
                            >
                                Edit Household
                            </ActionDropdownItem>
                            
                            <ActionDropdownSeparator />
                            
                            {household.contact_number && (
                                <ActionDropdownItem
                                    icon={<Clipboard className="h-4 w-4" />}
                                    onClick={() => onCopyToClipboard(household.contact_number, 'Contact')}
                                >
                                    Copy Contact
                                </ActionDropdownItem>
                            )}
                            
                            <ActionDropdownSeparator />
                            
                            {household.status !== 'inactive' && (
                                <ActionDropdownItem
                                    icon={<Trash2 className="h-4 w-4" />}
                                    onClick={() => onDelete(household)}
                                    dangerous
                                >
                                    Delete Household
                                </ActionDropdownItem>
                            )}
                        </ActionDropdown>
                    </div>
                </div>

                {/* Grid Content */}
                <div className="space-y-3">
                    {/* Head of Family */}
                    <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-700">Head of Family</div>
                        <div className="truncate text-gray-900">
                            {truncateText(household.head_of_family, isMobile ? 20 : 25)}
                        </div>
                    </div>

                    {/* Members & Contact */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5 text-gray-500" />
                            <span className="text-sm">
                                {household.member_count} member{household.member_count !== 1 ? 's' : ''}
                            </span>
                        </div>
                        {household.contact_number && (
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Phone className="h-3 w-3" />
                                {formatContactNumber(household.contact_number)}
                            </div>
                        )}
                    </div>

                    {/* Address */}
                    <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-700">Address</div>
                        <div className="text-sm text-gray-600 truncate">
                            {truncateAddress(household.address, isMobile ? 30 : 40)}
                        </div>
                    </div>

                    {/* Purok & Status */}
                    <div className="flex items-center justify-between pt-2 border-t">
                        <Badge 
                            variant="outline" 
                            className="truncate max-w-[50%] text-xs"
                            title={purokName}
                        >
                            {truncateText(purokName, isMobile ? 10 : 15)}
                        </Badge>
                        <Badge 
                            variant={getStatusBadgeVariant(household.status)}
                            className="truncate max-w-[40%] text-xs"
                            title={household.status}
                        >
                            {household.status}
                        </Badge>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}