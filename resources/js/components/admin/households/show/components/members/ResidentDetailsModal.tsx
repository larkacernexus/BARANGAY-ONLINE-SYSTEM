// resources/js/Pages/Admin/Puroks/components/resident-details-modal.tsx
import React from 'react';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    User, 
    Calendar, 
    Phone, 
    Mail, 
    MapPin, 
    Briefcase, 
    Award,
    ExternalLink,
    CheckCircle,
    Clock,
    AlertCircle,
    Heart,
    Shield,
    Briefcase as BriefcaseIcon,
    Mail as MailIcon,
    Phone as PhoneIcon,
    MapPin as MapPinIcon,
    Cake,
    BadgeCheck,
    UserRound,
    School,
    FileText,
    Home,
    Users,
    Star
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Resident } from '@/types/admin/puroks/purok';

interface ResidentDetailsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    resident: Resident | null;
}

interface StatCardProps {
    icon: React.ElementType;
    label: string;
    value: string;
    color?: string;
}

interface DetailCardProps {
    icon: React.ElementType;
    title: string;
    children: React.ReactNode;
    className?: string;
}

interface DetailRowProps {
    icon: React.ElementType;
    label: string;
    value: string | number | boolean | null | undefined;
    highlight?: boolean;
}

const getFullName = (resident: Resident): string => {
    let name = `${resident.first_name || ''}`;
    if (resident.middle_name) {
        name += ` ${resident.middle_name.charAt(0)}.`;
    }
    name += ` ${resident.last_name || ''}`;
    return name.trim();
};

// ✅ FIXED: Handle photo_path as string, with type assertion
const getPhotoUrl = (photoPath: any): string | null => {
    if (!photoPath) return null;
    if (typeof photoPath !== 'string') return null;
    if (photoPath.startsWith('http')) return photoPath;
    return `/storage/${photoPath}`;
};

const calculateAge = (birthDate: string | null): number | null => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
};

const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch {
        return dateString;
    }
};

const getGenderLabel = (gender: string | null): string => {
    if (!gender) return 'N/A';
    const genderMap: Record<string, string> = {
        male: 'Male',
        female: 'Female',
        other: 'Other',
    };
    return genderMap[gender.toLowerCase()] || gender;
};

const getCivilStatusLabel = (status: string | null): string => {
    if (!status) return 'N/A';
    const statusMap: Record<string, string> = {
        single: 'Single',
        married: 'Married',
        widowed: 'Widowed',
        divorced: 'Divorced',
        separated: 'Separated',
    };
    return statusMap[status.toLowerCase()] || status;
};

export const ResidentDetailsModal = ({ open, onOpenChange, resident }: ResidentDetailsModalProps) => {
    if (!resident) return null;

    const fullName = getFullName(resident);
    // ✅ FIXED: Access photo_path as property with type assertion
    const photoPath = (resident as any).photo_path;
    const photoUrl = photoPath ? getPhotoUrl(photoPath) : null;
    const age = resident.age || calculateAge(resident.birth_date);
    
    const getInitials = () => {
        const first = resident.first_name?.[0] || '';
        const last = resident.last_name?.[0] || '';
        return (first + last).toUpperCase();
    };

    const StatCard = ({ icon: Icon, label, value, color = "blue" }: StatCardProps) => (
        <div className="group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800/50 p-4 shadow-sm transition-all hover:shadow-md border border-gray-100 dark:border-gray-700">
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{value}</p>
                </div>
                <div className={cn(
                    "rounded-lg p-2 transition-colors",
                    `bg-${color}-50 dark:bg-${color}-900/20`
                )}>
                    <Icon className={cn("h-4 w-4", `text-${color}-600 dark:text-${color}-400`)} />
                </div>
            </div>
        </div>
    );

    const DetailCard = ({ icon: Icon, title, children, className }: DetailCardProps) => (
        <div className={cn("rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800/30 p-5 shadow-sm", className)}>
            <div className="flex items-center gap-2 mb-4">
                <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-2">
                    <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">{title}</h4>
            </div>
            <div className="space-y-3">
                {children}
            </div>
        </div>
    );

    const DetailRow = ({ icon: Icon, label, value, highlight = false }: DetailRowProps) => (
        <div className="flex items-start gap-3 text-sm">
            <Icon className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
            <div className="flex-1">
                <span className="text-gray-500 dark:text-gray-400">{label}:</span>
                <span className={cn(
                    "ml-2 font-medium text-gray-900 dark:text-gray-100",
                    highlight && "text-blue-600 dark:text-blue-400"
                )}>
                    {value || 'N/A'}
                </span>
            </div>
        </div>
    );

    // Get privileges from resident data
    const privilegesList = (resident as any).privileges_list || [];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] w-full max-h-[90vh] h-auto sm:max-w-[90vw] md:max-w-[85vw] lg:max-w-[80vw] xl:max-w-[75vw] 2xl:max-w-[70vw] p-0 dark:bg-gray-900 overflow-hidden">
                <ScrollArea className="max-h-[90vh]">
                    <div className="p-6">
                        {/* Header */}
                        <DialogHeader className="sticky top-0 bg-white dark:bg-gray-900 z-10 pb-4 mb-6">
                            <DialogTitle className="dark:text-gray-100 text-xl flex items-center gap-2">
                                <div className="rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 p-2">
                                    <User className="h-4 w-4 text-white" />
                                </div>
                                Resident Profile
                            </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-6">
                            {/* Profile Header with Photo and Stats */}
                            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 p-6">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-200/20 to-indigo-200/20 rounded-full blur-3xl" />
                                
                                <div className="relative flex flex-col lg:flex-row gap-6 items-center lg:items-start">
                                    {/* Avatar */}
                                    <div className="relative">
                                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 blur-md opacity-50" />
                                        <Avatar className="h-28 w-28 border-4 border-white dark:border-gray-800 shadow-xl relative">
                                            {photoUrl ? (
                                                <AvatarImage src={photoUrl} alt={fullName} />
                                            ) : (
                                                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-2xl">
                                                    {getInitials()}
                                                </AvatarFallback>
                                            )}
                                        </Avatar>
                                    </div>

                                    {/* Name and Status */}
                                    <div className="flex-1 text-center lg:text-left">
                                        <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                            {fullName}
                                        </h3>
                                        <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                                            <Badge className="bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border-0 shadow-sm px-3 py-1">
                                                <Home className="h-3 w-3 mr-1" />
                                                Resident
                                            </Badge>
                                            {(resident as any).is_head_of_household && (
                                                <Badge className="bg-blue-500 text-white border-0 shadow-sm px-3 py-1">
                                                    <Users className="h-3 w-3 mr-1" />
                                                    Household Head
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    {/* Quick Stats */}
                                    <div className="grid grid-cols-2 gap-3 min-w-[200px]">
                                        <StatCard 
                                            icon={Calendar} 
                                            label="Registered" 
                                            value={resident.created_at ? formatDate(resident.created_at) : 'N/A'} 
                                            color="blue" 
                                        />
                                        <StatCard 
                                            icon={Cake} 
                                            label="Age" 
                                            value={age ? `${age} yrs` : 'N/A'} 
                                            color="purple" 
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Main Content Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Left Column */}
                                <div className="space-y-6">
                                    {/* Personal Details */}
                                    <DetailCard icon={UserRound} title="Personal Information">
                                        <DetailRow icon={Heart} label="Gender" value={getGenderLabel(resident.gender)} />
                                        <DetailRow icon={Shield} label="Civil Status" value={getCivilStatusLabel(resident.civil_status)} />
                                        <DetailRow icon={MapPin} label="Birth Place" value={resident.place_of_birth} />
                                        <DetailRow 
                                            icon={BadgeCheck} 
                                            label="Voter Status" 
                                            value={resident.is_voter ? 'Registered Voter' : 'Not Registered'}
                                            highlight={resident.is_voter}
                                        />
                                        <DetailRow icon={School} label="Religion" value={resident.religion} />
                                        {resident.birth_date && (
                                            <DetailRow icon={Calendar} label="Date of Birth" value={formatDate(resident.birth_date)} />
                                        )}
                                    </DetailCard>

                                    {/* Contact Details */}
                                    <DetailCard icon={Phone} title="Contact Information">
                                        <DetailRow icon={PhoneIcon} label="Contact Number" value={resident.contact_number} />
                                        <DetailRow icon={MailIcon} label="Email Address" value={resident.email} />
                                        <DetailRow icon={MapPinIcon} label="Address" value={resident.address} />
                                    </DetailCard>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-6">
                                    {/* Employment & Education */}
                                    <DetailCard icon={Briefcase} title="Employment & Education">
                                        <DetailRow icon={BriefcaseIcon} label="Occupation" value={resident.occupation} />
                                        <DetailRow icon={School} label="Education" value={resident.education} />
                                    </DetailCard>

                                    {/* Remarks */}
                                    {resident.remarks && (
                                        <DetailCard icon={FileText} title="Remarks">
                                            <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-3">
                                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                                    {resident.remarks}
                                                </p>
                                            </div>
                                        </DetailCard>
                                    )}
                                </div>
                            </div>

                            {/* Privileges Section */}
                            {privilegesList.length > 0 && (
                                <>
                                    <Separator className="my-2" />
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <div className="rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 p-2">
                                                <Star className="h-4 w-4 text-white" />
                                            </div>
                                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                                                Benefits & Privileges
                                            </h4>
                                            <Badge variant="secondary" className="ml-2">
                                                {privilegesList.length}
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {privilegesList.map((privilege: any) => (
                                                <div 
                                                    key={privilege.id} 
                                                    className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800/30 p-4"
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                                            <Award className="h-4 w-4 text-gray-500" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                                                {privilege.name}
                                                            </h5>
                                                            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                                                                <span className="text-gray-500 dark:text-gray-400">
                                                                    Code: {privilege.code}
                                                                </span>
                                                                {privilege.id_number && (
                                                                    <span className="text-gray-500 dark:text-gray-400">
                                                                        ID: {privilege.id_number}
                                                                    </span>
                                                                )}
                                                                {privilege.discount_percentage && privilege.discount_percentage > 0 && (
                                                                    <span className="text-green-600 dark:text-green-400 font-medium">
                                                                        {privilege.discount_percentage}% OFF
                                                                    </span>
                                                                )}
                                                                {privilege.expires_at && (
                                                                    <span className="text-gray-500 dark:text-gray-400">
                                                                        Expires: {formatDate(privilege.expires_at)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <Button variant="outline" onClick={() => onOpenChange(false)}>
                                    Close
                                </Button>
                                <Link href={route('admin.residents.show', resident.id)}>
                                    <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all">
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        View Full Profile
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};