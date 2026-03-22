// resources/js/Pages/Admin/Households/Show/components/members/ResidentDetailsModal.tsx

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
    GraduationCap, 
    Church,
    Award,
    ExternalLink,
    CheckCircle,
    Clock,
    AlertCircle,
    Home,
    Users,
    Info,
    Star,
    Heart,
    Shield,
    BookOpen,
    Briefcase as BriefcaseIcon,
    Calendar as CalendarIcon,
    Mail as MailIcon,
    Phone as PhoneIcon,
    MapPin as MapPinIcon,
    Cake,
    Building2,
    Baby,
    Eye,
    BadgeCheck,
    ScrollText,
    UserRound,
    HeartHandshake,
    School,
    Globe,
    FileText
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

interface ResidentPrivilege {
    id: number;
    name: string;
    code: string;
    status: 'active' | 'expiring_soon' | 'expired' | 'pending';
    id_number?: string;
    expires_at?: string;
    discount_percentage?: number;
}

interface Member {
    id: number;
    resident_id: number;
    relationship_to_head: string;
    is_head: boolean;
    created_at?: string;
    updated_at?: string;
    resident: {
        id: number;
        first_name: string;
        last_name: string;
        full_name: string;
        age?: number;
        gender?: string;
        civil_status?: string;
        contact_number?: string;
        email?: string;
        address?: string;
        occupation?: string;
        education?: string;
        religion?: string;
        is_voter?: boolean;
        place_of_birth?: string;
        remarks?: string;
        photo_url?: string;
        privileges_list?: ResidentPrivilege[];
    };
}

interface ResidentDetailsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    member: Member | null;
}

export const ResidentDetailsModal = ({ open, onOpenChange, member }: ResidentDetailsModalProps) => {
    if (!member) return null;

    const resident = member.resident;

    const getPrivilegeIcon = (status: string) => {
        switch (status) {
            case 'active':
                return <CheckCircle className="h-3.5 w-3.5 text-green-500" />;
            case 'expiring_soon':
                return <Clock className="h-3.5 w-3.5 text-yellow-500" />;
            case 'expired':
                return <AlertCircle className="h-3.5 w-3.5 text-red-500" />;
            default:
                return <Award className="h-3.5 w-3.5 text-gray-500" />;
        }
    };

    const getPrivilegeBadgeClass = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
            case 'expiring_soon':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
            case 'expired':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'expiring_soon':
                return 'Expiring Soon';
            case 'expired':
                return 'Expired';
            case 'pending':
                return 'Pending';
            default:
                return 'Active';
        }
    };

    const StatCard = ({ icon: Icon, label, value, color = "blue" }: any) => (
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

    const DetailCard = ({ icon: Icon, title, children, className }: any) => (
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

    const DetailRow = ({ icon: Icon, label, value, highlight = false }: any) => (
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

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] w-full max-h-[90vh] h-auto sm:max-w-[90vw] md:max-w-[85vw] lg:max-w-[80vw] xl:max-w-[75vw] 2xl:max-w-[70vw] landscape:max-w-[85vw] landscape:lg:max-w-[75vw] p-0 dark:bg-gray-900 overflow-hidden">
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
                                            {resident.photo_url ? (
                                                <AvatarImage src={resident.photo_url} alt={resident.full_name} />
                                            ) : (
                                                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-2xl">
                                                    {resident.first_name?.[0]}{resident.last_name?.[0]}
                                                </AvatarFallback>
                                            )}
                                        </Avatar>
                                        {member.is_head && (
                                            <div className="absolute -bottom-2 -right-2 rounded-full bg-blue-500 p-1.5 border-2 border-white dark:border-gray-800">
                                                <Home className="h-3 w-3 text-white" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Name and Status */}
                                    <div className="flex-1 text-center lg:text-left">
                                        <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                            {resident.full_name}
                                        </h3>
                                        <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                                            <Badge className="bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border-0 shadow-sm px-3 py-1">
                                                <Users className="h-3 w-3 mr-1" />
                                                {member.relationship_to_head}
                                            </Badge>
                                            {member.is_head && (
                                                <Badge className="bg-blue-500 text-white border-0 shadow-sm px-3 py-1">
                                                    <Home className="h-3 w-3 mr-1" />
                                                    Household Head
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    {/* Quick Stats */}
                                    <div className="grid grid-cols-2 gap-3 min-w-[200px]">
                                        <StatCard icon={Calendar} label="Member Since" value={member.created_at ? new Date(member.created_at).toLocaleDateString() : 'N/A'} color="blue" />
                                        <StatCard icon={Cake} label="Age" value={resident.age ? `${resident.age} yrs` : 'N/A'} color="purple" />
                                    </div>
                                </div>
                            </div>

                            {/* Main Content Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Left Column */}
                                <div className="space-y-6">
                                    {/* Personal Details */}
                                    <DetailCard icon={UserRound} title="Personal Information">
                                        <DetailRow icon={Heart} label="Gender" value={resident.gender} />
                                        <DetailRow icon={Shield} label="Civil Status" value={resident.civil_status} />
                                        <DetailRow icon={MapPin} label="Birth Place" value={resident.place_of_birth} />
                                        <DetailRow 
                                            icon={BadgeCheck} 
                                            label="Voter Status" 
                                            value={resident.is_voter ? 'Registered Voter' : 'Not Registered'}
                                            highlight={resident.is_voter}
                                        />
                                        <DetailRow icon={Church} label="Religion" value={resident.religion} />
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

                            <Separator className="my-2" />

                            {/* Privileges Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between flex-wrap gap-3">
                                    <div className="flex items-center gap-2">
                                        <div className="rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 p-2">
                                            <Star className="h-4 w-4 text-white" />
                                        </div>
                                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                                            Benefits & Privileges
                                        </h4>
                                        <Badge variant="secondary" className="ml-2">
                                            {resident.privileges_list?.length || 0} Total
                                        </Badge>
                                    </div>
                                </div>

                                {resident.privileges_list && resident.privileges_list.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {resident.privileges_list.map((privilege) => (
                                            <div 
                                                key={privilege.id} 
                                                className="group relative overflow-hidden rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800/30 p-4 transition-all hover:shadow-md hover:border-gray-200 dark:hover:border-gray-600"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-start gap-3 flex-1">
                                                        <div className={cn(
                                                            "p-2 rounded-lg transition-colors",
                                                            getPrivilegeBadgeClass(privilege.status).replace('border-', 'bg-').split(' ')[0]
                                                        )}>
                                                            {getPrivilegeIcon(privilege.status)}
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
                                                                {privilege.discount_percentage && (
                                                                    <span className="text-green-600 dark:text-green-400 font-medium">
                                                                        {privilege.discount_percentage}% OFF
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Badge className={cn(
                                                        "ml-3 shrink-0 border",
                                                        getPrivilegeBadgeClass(privilege.status)
                                                    )}>
                                                        {getStatusLabel(privilege.status)}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-gray-100 dark:border-gray-700">
                                        <Award className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                        <p className="text-gray-500 dark:text-gray-400">No benefits or privileges assigned</p>
                                    </div>
                                )}
                            </div>

                            {/* Timeline */}
                            {member.created_at && (
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                        <Calendar className="h-4 w-4" />
                                        <span>Added to household: {new Date(member.created_at).toLocaleString()}</span>
                                    </div>
                                    {member.updated_at && member.updated_at !== member.created_at && (
                                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                            <Clock className="h-4 w-4" />
                                            <span>Last updated: {new Date(member.updated_at).toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>
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