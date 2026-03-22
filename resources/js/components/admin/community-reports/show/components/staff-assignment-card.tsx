// resources/js/components/admin/community-reports/show/components/staff-assignment-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, X, UserCheck, Mail, Phone, Hash, Plus, Briefcase, Building2, MapPin } from 'lucide-react';
import { CommunityReport, StaffMember } from './types';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';

interface StaffAssignmentCardProps {
    report: CommunityReport;
    staff: StaffMember[];
    onAssignClick: () => void;
    onUnassign: () => void;
    getStaffDisplayName: (staff: StaffMember | null) => string;
    getStaffInitials: (staff: StaffMember | null) => string;
}

export function StaffAssignmentCard({
    report,
    staff,
    onAssignClick,
    onUnassign,
    getStaffDisplayName,
    getStaffInitials,
}: StaffAssignmentCardProps) {
    const handleQuickAssign = (staffId: number) => {
        router.put(route('admin.community-reports.update', report.id), {
            assigned_to: staffId,
            status: 'assigned'
        }, {
            preserveScroll: true,
        });
    };

    const assignedStaff = report.assignedTo;

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm dark:text-gray-100">
                    <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700 flex items-center justify-center">
                        <UserCheck className="h-3 w-3 text-white" />
                    </div>
                    Staff Assignment
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {assignedStaff ? (
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-medium dark:text-gray-300">Currently Assigned</p>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onUnassign}
                                className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/50"
                            >
                                <X className="h-3 w-3 mr-1" />
                                Unassign
                            </Button>
                        </div>
                        <div className="flex items-center gap-3 p-3 border rounded-lg bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 shrink-0">
                                {assignedStaff.avatar ? (
                                    <img 
                                        src={assignedStaff.avatar} 
                                        alt={getStaffDisplayName(assignedStaff)}
                                        className="h-5 w-5 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="h-5 w-5 rounded-full bg-blue-500 dark:bg-blue-600 flex items-center justify-center text-white text-xs font-medium">
                                        {getStaffInitials(assignedStaff)}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium truncate dark:text-blue-300">
                                    {getStaffDisplayName(assignedStaff)}
                                </p>
                                {assignedStaff.position && (
                                    <p className="text-xs text-blue-600 dark:text-blue-400 truncate flex items-center gap-1 mt-0.5">
                                        <Briefcase className="h-3 w-3" />
                                        {assignedStaff.position}
                                    </p>
                                )}
                                {assignedStaff.role && (
                                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate flex items-center gap-1 mt-1">
                                        <Building2 className="h-3 w-3" />
                                        {assignedStaff.role}
                                    </p>
                                )}
                                {assignedStaff.username && (
                                    <p className="text-xs text-blue-500 dark:text-blue-400 truncate flex items-center gap-1 mt-1">
                                        <Hash className="h-3 w-3" />
                                        @{assignedStaff.username}
                                    </p>
                                )}
                                {assignedStaff.email && (
                                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate flex items-center gap-1 mt-1">
                                        <Mail className="h-3 w-3" />
                                        {assignedStaff.email}
                                    </p>
                                )}
                                {assignedStaff.phone && (
                                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate flex items-center gap-1 mt-1">
                                        <Phone className="h-3 w-3" />
                                        {assignedStaff.phone}
                                    </p>
                                )}
                                {assignedStaff.purok && (
                                    <p className="text-xs text-gray-500 dark:text-gray-500 truncate flex items-center gap-1 mt-1">
                                        <MapPin className="h-3 w-3" />
                                        Purok {assignedStaff.purok}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div>
                        <p className="text-sm font-medium mb-3 dark:text-gray-300">Not Assigned</p>
                        <div className="p-4 border border-dashed dark:border-gray-700 rounded-lg text-center">
                            <User className="h-8 w-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">No staff assigned to this report</p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onAssignClick}
                                className="w-full dark:border-gray-600 dark:text-gray-300"
                            >
                                <UserCheck className="h-4 w-4 mr-2" />
                                Assign Staff
                            </Button>
                        </div>
                    </div>
                )}
                
                {staff.length > 0 && !assignedStaff && (
                    <div className="pt-4 border-t dark:border-gray-700">
                        <p className="text-sm font-medium mb-2 dark:text-gray-300">Quick Assign</p>
                        <div className="space-y-2">
                            {staff.slice(0, 3).map((staffMember) => (
                                <Button
                                    key={staffMember.id}
                                    variant="outline"
                                    className="w-full justify-start text-sm dark:border-gray-600 dark:text-gray-300"
                                    onClick={() => handleQuickAssign(staffMember.id)}
                                    size="sm"
                                >
                                    <div className="p-1 rounded-full bg-gray-100 dark:bg-gray-700 shrink-0 mr-2">
                                        {staffMember.avatar ? (
                                            <img 
                                                src={staffMember.avatar} 
                                                alt={getStaffDisplayName(staffMember)}
                                                className="h-5 w-5 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="h-5 w-5 rounded-full bg-blue-500 dark:bg-blue-600 flex items-center justify-center text-white text-xs font-medium">
                                                {getStaffInitials(staffMember)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 text-left truncate">
                                        <span className="font-medium truncate dark:text-gray-200">
                                            {getStaffDisplayName(staffMember)}
                                        </span>
                                        {staffMember.position && (
                                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 truncate hidden sm:inline">
                                                • {staffMember.position}
                                            </span>
                                        )}
                                    </div>
                                    {staffMember.role && (
                                        <Badge variant="secondary" className="ml-auto text-xs shrink-0 dark:bg-gray-700 dark:text-gray-300">
                                            {staffMember.role}
                                        </Badge>
                                    )}
                                </Button>
                            ))}
                            {staff.length > 3 && (
                                <Button
                                    variant="ghost"
                                    className="w-full text-sm dark:text-gray-400 dark:hover:text-gray-300"
                                    onClick={onAssignClick}
                                    size="sm"
                                >
                                    <Plus className="h-3 w-3 mr-1" />
                                    View all {staff.length} staff members
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}