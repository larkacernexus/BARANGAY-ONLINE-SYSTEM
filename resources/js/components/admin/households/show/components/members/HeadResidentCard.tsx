// resources/js/Pages/Admin/Households/Show/components/members/HeadResidentCard.tsx

import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Badge } from '@/components/ui/badge';
import { User, Crown, ExternalLink, MapPin, Phone, Mail, Calendar, Briefcase } from 'lucide-react';
import { ExtendedMember, ExtendedPrivilege } from '@/types/admin/households/household.types';
import { PrivilegeIndicators } from '../badges/PrivilegeIndicators';

interface HeadResidentCardProps {
    member: ExtendedMember;
    householdId?: number;
}

// Helper to get full name
const getFullName = (firstName: string, lastName: string, middleName?: string): string => {
    const parts = [firstName, middleName, lastName].filter(Boolean);
    return parts.join(' ');
};

// Helper to get photo URL
const getPhotoUrl = (photoPath?: string, photoUrl?: string): string | null => {
    if (photoUrl) {
        if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://') || photoUrl.startsWith('/')) {
            return photoUrl;
        }
        return `/${photoUrl.replace(/^\/+/, '')}`;
    }
    
    if (photoPath) {
        const cleanPath = photoPath.replace('public/', '');
        return `/storage/${cleanPath}`;
    }
    
    return null;
};

// Helper to format age from date of birth
const calculateAge = (dateOfBirth?: string): number | null => {
    if (!dateOfBirth) return null;
    try {
        const birthDate = new Date(dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    } catch {
        return null;
    }
};

// Helper to format date
const formatDate = (date?: string): string => {
    if (!date) return 'N/A';
    try {
        return new Date(date).toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch {
        return 'Invalid Date';
    }
};

export const HeadResidentCard = ({ member, householdId }: HeadResidentCardProps) => {
    const resident = member.resident;
    
    if (!resident) {
        return null;
    }
    
    const fullName = getFullName(resident.first_name, resident.last_name, resident.middle_name);
    const photoUrl = getPhotoUrl(resident.photo_path, resident.photo_url);
    const age = calculateAge(resident.date_of_birth);
    const gender = resident.gender || 'N/A';
    const civilStatus = resident.civil_status || 'N/A';
    const occupation = resident.occupation || '';
    const contactNumber = resident.contact_number;
    const email = resident.email;
    const address = resident.address;
    const privileges = (resident as any).privileges_list as ExtendedPrivilege[] || [];
    
    // Check if resident is head of household (relationship === 'head')
    const isHead = member.relationship === 'head';
    
    return (
        <Link 
            href={route('admin.residents.show', resident.id)}
            className="block hover:no-underline"
        >
            <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 transition-all duration-200 cursor-pointer group border border-blue-100 dark:border-blue-800">
                {/* Avatar Section */}
                <div className="relative flex-shrink-0">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 flex items-center justify-center overflow-hidden shadow-md">
                        {photoUrl ? (
                            <img 
                                src={photoUrl}
                                alt={fullName}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <User className="h-8 w-8 text-white" />
                        )}
                    </div>
                    {isHead && (
                        <div className="absolute -top-1 -right-1">
                            <div className="h-6 w-6 rounded-full bg-yellow-400 dark:bg-yellow-500 flex items-center justify-center shadow-md">
                                <Crown className="h-3.5 w-3.5 text-white" />
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Content Section */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                            {fullName}
                        </p>
                        <ExternalLink className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </div>
                    
                    {/* Demographics */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {age && (
                            <>
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {age} years old
                                </span>
                            </>
                        )}
                        {gender && gender !== 'N/A' && (
                            <>
                                <span>•</span>
                                <span>{gender.charAt(0).toUpperCase() + gender.slice(1)}</span>
                            </>
                        )}
                        {civilStatus && civilStatus !== 'N/A' && (
                            <>
                                <span>•</span>
                                <span>{civilStatus === 'single' ? 'Single' : 
                                        civilStatus === 'married' ? 'Married' :
                                        civilStatus === 'widowed' ? 'Widowed' : 'Separated'}</span>
                            </>
                        )}
                        {occupation && (
                            <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    <Briefcase className="h-3 w-3" />
                                    {occupation}
                                </span>
                            </>
                        )}
                    </div>
                    
                    {/* Contact Information */}
                    {(contactNumber || email) && (
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {contactNumber && (
                                <span className="flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {contactNumber}
                                </span>
                            )}
                            {email && (
                                <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                        <Mail className="h-3 w-3" />
                                        {email}
                                    </span>
                                </>
                            )}
                        </div>
                    )}
                    
                    {/* Address */}
                    {address && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500 mt-1">
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{address}</span>
                        </div>
                    )}
                    
                    {/* Privileges */}
                    {privileges.length > 0 && (
                        <div className="mt-2">
                            <PrivilegeIndicators privileges={privileges} maxDisplay={3} />
                        </div>
                    )}
                </div>
                
                {/* Head Badge */}
                <Badge className="ml-auto flex-shrink-0 bg-gradient-to-r from-yellow-400 to-amber-500 text-white border-0 shadow-sm">
                    <Crown className="h-3 w-3 mr-1" />
                    Head of Family
                </Badge>
            </div>
        </Link>
    );
};