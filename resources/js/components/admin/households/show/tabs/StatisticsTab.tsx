// resources/js/Pages/Admin/Households/Show/tabs/StatisticsTab.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { 
    BarChart3, 
    History, 
    Users, 
    UserCheck, 
    UserX, 
    Calendar, 
    Award, 
    Home, 
    Zap, 
    Droplets, 
    Wifi, 
    Car, 
    Building2,
    TrendingUp,
    PieChart,
    Activity,
    Clock,
    FileText,
    AlertTriangle,
    CheckCircle2,
    Briefcase
} from 'lucide-react';
import { useMemo } from 'react';

// Import types from shared types file
import { Household, HouseholdMember, Resident, Privilege } from '@/types/admin/households/household.types';
import { formatDate, formatDateTime, getRelativeTime, calculateAge } from '@/types/admin/households/household.types';

// Extended types for the component
interface ExtendedHousehold extends Household {
    household_members?: (HouseholdMember & {
        resident?: Resident & {
            privileges_list?: Privilege[];
            age?: number;
            gender?: string;
            civil_status?: string;
            occupation?: string;
            education?: string;
            is_voter?: boolean;
        };
    })[];
    housing_type?: string;
    water_source?: string;
    electricity?: boolean;
    internet?: boolean;
    vehicle?: boolean;
    income_range?: string;
    ownership_status?: string;
    remarks?: string;
}

interface StatisticsTabProps {
    household: ExtendedHousehold;
    membersWithPrivileges: number;
    onShowMore: () => void;
    showMore: boolean;
}

export const StatisticsTab = ({ 
    household, 
    membersWithPrivileges,
    onShowMore,
    showMore
}: StatisticsTabProps) => {
    const members = household.household_members || [];
    const totalMembers = household.member_count || members.length;

    // Calculate statistics using useMemo for performance
    const stats = useMemo(() => {
        // Gender counts
        const maleCount = members.filter(m => m.resident?.gender?.toLowerCase() === 'male').length;
        const femaleCount = members.filter(m => m.resident?.gender?.toLowerCase() === 'female').length;
        
        // Age demographics
        const ages = members.map(m => m.resident?.age || (m.resident?.date_of_birth ? calculateAge(m.resident.date_of_birth) : 0));
        const avgAge = ages.length > 0 ? Math.round(ages.reduce((sum, age) => sum + age, 0) / ages.length) : 0;
        
        const ageGroups = {
            children: members.filter(m => (m.resident?.age || 0) < 18).length,
            adults: members.filter(m => (m.resident?.age || 0) >= 18 && (m.resident?.age || 0) < 60).length,
            seniors: members.filter(m => (m.resident?.age || 0) >= 60).length,
        };
        
        // Civil status
        const civilStatus = {
            single: members.filter(m => m.resident?.civil_status?.toLowerCase() === 'single').length,
            married: members.filter(m => m.resident?.civil_status?.toLowerCase() === 'married').length,
            widowed: members.filter(m => m.resident?.civil_status?.toLowerCase() === 'widowed').length,
            divorced: members.filter(m => m.resident?.civil_status?.toLowerCase() === 'divorced' || m.resident?.civil_status?.toLowerCase() === 'separated').length,
        };
        
        // Voter statistics
        const votersCount = members.filter(m => m.resident?.is_voter === true).length;
        const nonVotersCount = members.filter(m => m.resident?.is_voter === false).length;
        
        // Employment & Education
        const employedCount = members.filter(m => m.resident?.occupation && m.resident.occupation !== 'N/A' && m.resident.occupation !== '').length;
        const unemployedCount = members.filter(m => !m.resident?.occupation || m.resident.occupation === 'N/A' || m.resident.occupation === '').length;
        
        const educationLevels = {
            none: members.filter(m => !m.resident?.education || m.resident.education === 'None' || m.resident.education === 'N/A').length,
            elementary: members.filter(m => m.resident?.education?.toLowerCase().includes('elementary')).length,
            highschool: members.filter(m => m.resident?.education?.toLowerCase().includes('high')).length,
            college: members.filter(m => m.resident?.education?.toLowerCase().includes('college') || m.resident?.education?.toLowerCase().includes('university')).length,
            vocational: members.filter(m => m.resident?.education?.toLowerCase().includes('vocational')).length,
        };
        
        // Privilege statistics
        const allPrivileges = members.flatMap(m => m.resident?.privileges_list || []);
        const activePrivileges = allPrivileges.filter(p => p.status === 'active').length;
        const expiringPrivileges = allPrivileges.filter(p => p.status === 'expiring_soon').length;
        const expiredPrivileges = allPrivileges.filter(p => p.status === 'expired').length;
        const pendingPrivileges = allPrivileges.filter(p => p.status === 'pending').length;
        
        return {
            maleCount,
            femaleCount,
            avgAge,
            ageGroups,
            civilStatus,
            votersCount,
            nonVotersCount,
            employedCount,
            unemployedCount,
            educationLevels,
            activePrivileges,
            expiringPrivileges,
            expiredPrivileges,
            pendingPrivileges
        };
    }, [members]);

    // Calculate percentages
    const getPercentage = (value: number, total: number) => {
        if (total === 0) return 0;
        return Math.round((value / total) * 100);
    };

    // Housing type display mapping
    const getHousingTypeLabel = (type?: string): string => {
        const types: Record<string, string> = {
            concrete: 'Concrete',
            wood: 'Wood',
            mixed: 'Mixed',
            makeshift: 'Makeshift',
            others: 'Others'
        };
        return types[type?.toLowerCase() || ''] || type || 'Not specified';
    };

    // Water source display mapping
    const getWaterSourceLabel = (source?: string): string => {
        const sources: Record<string, string> = {
            faucet: 'Faucet',
            deep_well: 'Deep Well',
            shared_well: 'Shared Well',
            delivered: 'Delivered Water',
            spring: 'Spring',
            river: 'River/Rain',
            others: 'Others'
        };
        return sources[source?.toLowerCase() || ''] || source || 'Not specified';
    };

    return (
        <div className="space-y-6">
            {/* Quick Stats Grid */}
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <BarChart3 className="h-5 w-5" />
                        Quick Overview
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <Users className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{totalMembers}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Members</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <Award className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.ageGroups.seniors}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Senior Citizens</p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <UserCheck className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.votersCount}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Registered Voters</p>
                        </div>
                        <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                            <Award className="h-8 w-8 text-amber-600 dark:text-amber-400 mx-auto mb-2" />
                            <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{stats.activePrivileges}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Active Benefits</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Demographic Statistics */}
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <PieChart className="h-5 w-5" />
                        Demographic Profile
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Gender Distribution */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Gender Distribution</h3>
                        <div className="space-y-2">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600 dark:text-gray-400">Male</span>
                                    <span className="font-medium dark:text-gray-200">{stats.maleCount} ({getPercentage(stats.maleCount, totalMembers)}%)</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${getPercentage(stats.maleCount, totalMembers)}%` }} />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600 dark:text-gray-400">Female</span>
                                    <span className="font-medium dark:text-gray-200">{stats.femaleCount} ({getPercentage(stats.femaleCount, totalMembers)}%)</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div className="bg-pink-600 h-2 rounded-full" style={{ width: `${getPercentage(stats.femaleCount, totalMembers)}%` }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Age Distribution */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Age Distribution</h3>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.ageGroups.children}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Children (0-17)</p>
                                <p className="text-xs text-gray-400 mt-1">{getPercentage(stats.ageGroups.children, totalMembers)}%</p>
                            </div>
                            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.ageGroups.adults}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Adults (18-59)</p>
                                <p className="text-xs text-gray-400 mt-1">{getPercentage(stats.ageGroups.adults, totalMembers)}%</p>
                            </div>
                            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.ageGroups.seniors}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Seniors (60+)</p>
                                <p className="text-xs text-gray-400 mt-1">{getPercentage(stats.ageGroups.seniors, totalMembers)}%</p>
                            </div>
                        </div>
                        <div className="mt-3 text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Average Age: <span className="font-semibold">{stats.avgAge} years</span></p>
                        </div>
                    </div>

                    {/* Civil Status */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Civil Status</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Single</span>
                                <span className="font-medium dark:text-gray-200">{stats.civilStatus.single}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Married</span>
                                <span className="font-medium dark:text-gray-200">{stats.civilStatus.married}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Widowed</span>
                                <span className="font-medium dark:text-gray-200">{stats.civilStatus.widowed}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Divorced/Separated</span>
                                <span className="font-medium dark:text-gray-200">{stats.civilStatus.divorced}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Voter & Employment Statistics */}
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <Activity className="h-5 w-5" />
                        Voter & Employment Status
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Voter Statistics */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Voter Registration</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Registered Voters</span>
                                </div>
                                <span className="font-semibold text-green-600 dark:text-green-400">{stats.votersCount}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                                <div className="flex items-center gap-2">
                                    <UserX className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Non-Voters</span>
                                </div>
                                <span className="font-semibold text-gray-600 dark:text-gray-400">{stats.nonVotersCount}</span>
                            </div>
                        </div>
                    </div>

                    {/* Employment Statistics */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Employment Status</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                                <div className="flex items-center gap-2">
                                    <Briefcase className="h-4 w-4 text-green-500" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Employed</span>
                                </div>
                                <span className="font-semibold text-green-600 dark:text-green-400">{stats.employedCount}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                                <div className="flex items-center gap-2">
                                    <UserX className="h-4 w-4 text-red-400" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Unemployed</span>
                                </div>
                                <span className="font-semibold text-red-600 dark:text-red-400">{stats.unemployedCount}</span>
                            </div>
                        </div>
                    </div>

                    {/* Education Attainment */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Education Attainment</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                <span className="text-sm text-gray-600 dark:text-gray-400">No Formal Education</span>
                                <span className="font-medium dark:text-gray-200">{stats.educationLevels.none}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Elementary Level</span>
                                <span className="font-medium dark:text-gray-200">{stats.educationLevels.elementary}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                <span className="text-sm text-gray-600 dark:text-gray-400">High School Level</span>
                                <span className="font-medium dark:text-gray-200">{stats.educationLevels.highschool}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Vocational/Tech</span>
                                <span className="font-medium dark:text-gray-200">{stats.educationLevels.vocational}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                <span className="text-sm text-gray-600 dark:text-gray-400">College/University</span>
                                <span className="font-medium dark:text-gray-200">{stats.educationLevels.college}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Housing & Utilities */}
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <Building2 className="h-5 w-5" />
                        Housing & Utilities
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Housing Type</p>
                            <p className="font-medium dark:text-gray-200">{getHousingTypeLabel(household.housing_type)}</p>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Water Source</p>
                            <p className="font-medium dark:text-gray-200">{getWaterSourceLabel(household.water_source)}</p>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Zap className="h-4 w-4 text-yellow-500" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">Electricity</span>
                            </div>
                            <Badge variant={household.electricity ? "default" : "secondary"} className={household.electricity ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                                {household.electricity ? 'Connected' : 'Not Connected'}
                            </Badge>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Wifi className="h-4 w-4 text-blue-500" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">Internet</span>
                            </div>
                            <Badge variant={household.internet ? "default" : "secondary"} className={household.internet ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                                {household.internet ? 'Connected' : 'Not Connected'}
                            </Badge>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg flex justify-between items-center col-span-2">
                            <div className="flex items-center gap-2">
                                <Car className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">Vehicle Ownership</span>
                            </div>
                            <Badge variant={household.vehicle ? "default" : "secondary"} className={household.vehicle ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                                {household.vehicle ? 'Has Vehicle' : 'No Vehicle'}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Privileges Summary */}
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <Award className="h-5 w-5" />
                        Benefits & Privileges Summary
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.activePrivileges}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Active</p>
                        </div>
                        <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.expiringPrivileges}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Expiring Soon</p>
                        </div>
                        <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.expiredPrivileges}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Expired</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.pendingPrivileges}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Pending</p>
                        </div>
                    </div>
                    <div className="mt-4 text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Members with Benefits: <span className="font-semibold">{membersWithPrivileges}</span> / {totalMembers}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Timeline Card */}
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <History className="h-5 w-5" />
                        Household Timeline
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div className="relative pl-6 pb-6">
                            <div className="absolute left-0 top-0 h-full w-0.5 bg-blue-200 dark:bg-blue-900"></div>
                            <div className="absolute left-[-4px] top-0 h-2 w-2 rounded-full bg-blue-500 dark:bg-blue-400"></div>
                            <div>
                                <p className="font-medium dark:text-gray-200">Household Created</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{formatDateTime(household.created_at)}</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{getRelativeTime(household.created_at)}</p>
                            </div>
                        </div>
                        <div className="relative pl-6">
                            <div className="absolute left-0 top-0 h-full w-0.5 bg-gray-200 dark:bg-gray-700"></div>
                            <div className="absolute left-[-4px] top-0 h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-500"></div>
                            <div>
                                <p className="font-medium dark:text-gray-200">Last Updated</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{formatDateTime(household.updated_at)}</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{getRelativeTime(household.updated_at)}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Show More Button */}
            <div className="flex justify-center">
                <Button 
                    variant="outline" 
                    onClick={onShowMore}
                    className="dark:border-gray-600 dark:text-gray-300"
                >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    {showMore ? 'Show Less' : 'Show More Details'}
                </Button>
            </div>

            {/* More Details Section */}
            {showMore && (
                <Card className="dark:bg-gray-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                            <FileText className="h-5 w-5" />
                            Additional Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Remarks</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                                    {household.remarks || 'No remarks provided'}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Income Range</p>
                                    <p className="font-medium dark:text-gray-200">{household.income_range || 'Not specified'}</p>
                                </div>
                                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Ownership Status</p>
                                    <p className="font-medium dark:text-gray-200 capitalize">{household.ownership_status || 'Not specified'}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};