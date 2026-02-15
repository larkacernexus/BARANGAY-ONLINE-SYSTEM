import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ActionDropdown, ActionDropdownItem, ActionDropdownSeparator } from '@/components/adminui/action-dropdown';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { 
    User, Phone, Home, Crown, Camera, Eye, 
    Edit, QrCode, Clipboard, FileText, Trash2 
} from 'lucide-react';

interface ResidentCardProps {
    resident: any;
    isSelected: boolean;
    isBulkMode: boolean;
    isMobile: boolean;
    onSelect: (id: number) => void;
    onDelete: (resident: any) => void;
    onViewPhoto: (resident: any) => void;
    truncateText: (text: string, maxLength: number) => string;
    truncateAddress: (address: string, maxLength: number) => string;
    formatContactNumber: (contact: string) => string;
    getPhotoUrl: (photoPath?: string, photoUrl?: string) => string | null;
    getFullName: (resident: any) => string;
    isHeadOfHousehold: (resident: any) => boolean;
    getStatusBadgeVariant: (status: string) => string;
    getStatusLabel: (status: string) => string;
    getHouseholdInfo: (resident: any) => any;
}

export function ResidentCard({
    resident,
    isSelected,
    isBulkMode,
    isMobile,
    onSelect,
    onDelete,
    onViewPhoto,
    truncateText,
    truncateAddress,
    formatContactNumber,
    getPhotoUrl,
    getFullName,
    isHeadOfHousehold,
    getStatusBadgeVariant,
    getStatusLabel,
    getHouseholdInfo
}: ResidentCardProps) {
    const fullName = getFullName(resident);
    const photoUrl = getPhotoUrl(resident.photo_path, resident.photo_url);
    const hasPhoto = !!photoUrl;
    const isHead = isHeadOfHousehold(resident);
    const householdInfo = getHouseholdInfo(resident);
    
    return (
        <Card 
            className={`overflow-hidden transition-all hover:shadow-md ${
                isSelected ? 'border-blue-500 border-2 bg-blue-50 dark:bg-blue-900/10' : ''
            } ${isHead ? 'bg-yellow-50/30 dark:bg-yellow-900/10' : ''}`}
            onClick={(e) => {
                if (isBulkMode && e.target instanceof HTMLElement && 
                    !e.target.closest('a') && 
                    !e.target.closest('button') &&
                    !e.target.closest('.dropdown-menu-content')) {
                    onSelect(resident.id);
                }
            }}
        >
            <CardContent className="p-4">
                {/* Card Header */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {hasPhoto ? (
                                <img 
                                    src={photoUrl} 
                                    alt={fullName}
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        const parent = e.currentTarget.parentElement;
                                        if (parent) {
                                            parent.innerHTML = '<svg class="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>';
                                        }
                                    }}
                                />
                            ) : (
                                <User className="h-5 w-5 text-gray-600" />
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="font-medium truncate flex items-center gap-1">
                                {truncateText(fullName, isMobile ? 18 : 24)}
                                {isHead && (
                                    <Crown className="h-3 w-3 text-amber-600" />
                                )}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                                ID: {resident.id}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                        {isBulkMode && (
                            <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => onSelect(resident.id)}
                                onClick={(e) => e.stopPropagation()}
                                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                            />
                        )}
                        <ActionDropdown>
                            <ActionDropdownItem
                                icon={<Eye className="h-4 w-4" />}
                                href={`/residents/${resident.id}`}
                            >
                                View Details
                            </ActionDropdownItem>
                            
                            <ActionDropdownItem
                                icon={<Edit className="h-4 w-4" />}
                                href={`/residents/${resident.id}/edit`}
                            >
                                Edit Profile
                            </ActionDropdownItem>

                            {hasPhoto && (
                                <ActionDropdownItem
                                    icon={<Camera className="h-4 w-4" />}
                                    onClick={() => onViewPhoto(resident)}
                                >
                                    View Photo
                                </ActionDropdownItem>
                            )}
                            
                            <ActionDropdownSeparator />
                            
                            <ActionDropdownItem
                                icon={<QrCode className="h-4 w-4" />}
                                href={`/residents/${resident.id}/generate-id`}
                            >
                                Generate ID
                            </ActionDropdownItem>
                            
                            <ActionDropdownSeparator />
                            
                            {resident.status !== 'deceased' && (
                                <ActionDropdownItem
                                    icon={<Trash2 className="h-4 w-4" />}
                                    onClick={() => onDelete(resident)}
                                    dangerous
                                >
                                    Delete Resident
                                </ActionDropdownItem>
                            )}
                        </ActionDropdown>
                    </div>
                </div>

                {/* Card Content */}
                <div className="space-y-3">
                    {/* Age & Gender */}
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1">
                            <span className="font-medium">{resident.age}</span>
                            <span className="text-gray-500">years</span>
                        </div>
                        <Badge variant="outline" className="capitalize text-xs">
                            {resident.gender}
                        </Badge>
                    </div>

                    {/* Contact */}
                    <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-3 w-3 text-gray-500 flex-shrink-0" />
                        <div className="truncate text-gray-700">
                            {formatContactNumber(resident.contact_number)}
                        </div>
                    </div>

                    {/* Address & Purok */}
                    <div className="flex items-start gap-2 text-sm">
                        <Home className="h-3 w-3 text-gray-500 flex-shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                            <div className="truncate text-gray-700">
                                {truncateAddress(resident.address, isMobile ? 25 : 35)}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                                {resident.purok ? resident.purok.name : 'No Purok'}
                            </div>
                        </div>
                    </div>

                    {/* Household */}
                    <div className="text-sm">
                        {householdInfo ? (
                            <Link href={`/households/${householdInfo.id}`} className="hover:text-primary hover:underline">
                                <div className="flex items-center gap-1 text-gray-700">
                                    <span className="font-medium truncate">
                                        {truncateText(householdInfo.household_number, isMobile ? 15 : 20)}
                                    </span>
                                    {householdInfo.is_head && (
                                        <Crown className="h-3 w-3 text-amber-600" />
                                    )}
                                </div>
                                <div className="text-xs text-gray-500 truncate">
                                    {truncateText(householdInfo.head_of_family, isMobile ? 15 : 20)}
                                </div>
                            </Link>
                        ) : (
                            <span className="text-gray-400 italic text-sm">No household</span>
                        )}
                    </div>

                    {/* Status & Tags */}
                    <div className="flex items-center justify-between pt-2 border-t">
                        <Badge 
                            variant={getStatusBadgeVariant(resident.status)}
                            className="truncate max-w-[60%] text-xs"
                        >
                            {getStatusLabel(resident.status)}
                        </Badge>
                        <div className="flex gap-1">
                            {resident.is_voter && (
                                <Badge variant="outline" className="text-xs px-1">
                                    Voter
                                </Badge>
                            )}
                            {resident.is_pwd && (
                                <Badge variant="outline" className="text-xs px-1 bg-purple-50 text-purple-700">
                                    PWD
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}