// resources/js/components/admin/community-reports/show/components/assign-dialog.tsx
import { useState } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search, User, Check, Mail, Phone, Hash, RefreshCw, UserCheck, Briefcase, Building2, MapPin } from 'lucide-react';
import { StaffMember } from './types';

interface AssignDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    staff: StaffMember[];
    selectedStaff: number | null;
    setSelectedStaff: (id: number | null) => void;
    assignNotes: string;
    setAssignNotes: (notes: string) => void;
    isAssigning: boolean;
    onAssign: () => void;
    getStaffDisplayName: (staff: StaffMember | null) => string;
    getStaffInitials: (staff: StaffMember | null) => string;
}

export function AssignDialog({
    open,
    onOpenChange,
    staff,
    selectedStaff,
    setSelectedStaff,
    assignNotes,
    setAssignNotes,
    isAssigning,
    onAssign,
    getStaffDisplayName,
    getStaffInitials,
}: AssignDialogProps) {
    const [staffSearch, setStaffSearch] = useState('');

    const filteredStaff = staff.filter(staffMember => 
        getStaffDisplayName(staffMember).toLowerCase().includes(staffSearch.toLowerCase()) ||
        (staffMember.position && staffMember.position.toLowerCase().includes(staffSearch.toLowerCase())) ||
        (staffMember.role && staffMember.role.toLowerCase().includes(staffSearch.toLowerCase())) ||
        (staffMember.email && staffMember.email.toLowerCase().includes(staffSearch.toLowerCase())) ||
        (staffMember.phone && staffMember.phone.toLowerCase().includes(staffSearch.toLowerCase())) ||
        (staffMember.username && staffMember.username.toLowerCase().includes(staffSearch.toLowerCase())) ||
        (staffMember.purok && staffMember.purok.toLowerCase().includes(staffSearch.toLowerCase()))
    );

    const selectedStaffMember = selectedStaff ? staff.find(s => s.id === selectedStaff) : null;

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col dark:bg-gray-900">
                <AlertDialogHeader>
                    <AlertDialogTitle className="dark:text-gray-100">Assign to Staff</AlertDialogTitle>
                    <AlertDialogDescription className="dark:text-gray-400">
                        Select a barangay official to assign this report to. Only active officials are listed.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                
                <div className="flex-1 overflow-y-auto py-4">
                    {/* Search Bar */}
                    <div className="mb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search by name, position, role, email, phone, username, or purok..."
                                value={staffSearch}
                                onChange={(e) => setStaffSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm dark:bg-gray-900 dark:text-gray-300"
                            />
                        </div>
                    </div>

                    {/* Staff List */}
                    <div className="space-y-2">
                        {filteredStaff.length === 0 ? (
                            <div className="text-center py-8">
                                <User className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                    {staffSearch ? 'No Matching Staff Found' : 'No Staff Available'}
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400">
                                    {staffSearch 
                                        ? 'Try a different search term' 
                                        : 'No active barangay officials are currently available.'}
                                </p>
                            </div>
                        ) : (
                            filteredStaff.map((staffMember) => (
                                <div
                                    key={staffMember.id}
                                    className={`p-4 border dark:border-gray-700 rounded-lg cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                                        selectedStaff === staffMember.id 
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700' 
                                            : 'border-gray-200'
                                    }`}
                                    onClick={() => setSelectedStaff(staffMember.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex-shrink-0">
                                            {staffMember.avatar ? (
                                                <img
                                                    src={staffMember.avatar}
                                                    alt={getStaffDisplayName(staffMember)}
                                                    className="h-10 w-10 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                                    selectedStaff === staffMember.id 
                                                        ? 'bg-blue-500 text-white' 
                                                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                                }`}>
                                                    <span className="font-semibold text-sm">
                                                        {getStaffInitials(staffMember)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="font-medium truncate dark:text-gray-200">
                                                    {getStaffDisplayName(staffMember)}
                                                </p>
                                                {selectedStaff === staffMember.id && (
                                                    <Check className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
                                                )}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                                {staffMember.position && (
                                                    <Badge variant="outline" className="text-xs bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 flex items-center gap-1">
                                                        <Briefcase className="h-3 w-3" />
                                                        {staffMember.position}
                                                    </Badge>
                                                )}
                                                {staffMember.role && (
                                                    <Badge variant="outline" className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800 flex items-center gap-1">
                                                        <Building2 className="h-3 w-3" />
                                                        {staffMember.role}
                                                    </Badge>
                                                )}
                                                {staffMember.purok && (
                                                    <Badge variant="outline" className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" />
                                                        Purok {staffMember.purok}
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                {staffMember.username && (
                                                    <span className="flex items-center gap-1 truncate">
                                                        <Hash className="h-3 w-3" />
                                                        <span className="truncate">@{staffMember.username}</span>
                                                    </span>
                                                )}
                                                {staffMember.email && (
                                                    <span className="flex items-center gap-1 truncate">
                                                        <Mail className="h-3 w-3" />
                                                        <span className="truncate">{staffMember.email}</span>
                                                    </span>
                                                )}
                                                {staffMember.phone && (
                                                    <span className="flex items-center gap-1 truncate">
                                                        <Phone className="h-3 w-3" />
                                                        <span className="truncate">{staffMember.phone}</span>
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Assignment Notes */}
                    <div className="mt-6">
                        <Label htmlFor="assign-notes" className="text-sm font-medium mb-2 block dark:text-gray-300">
                            Assignment Notes (Optional)
                        </Label>
                        <Textarea
                            id="assign-notes"
                            placeholder="Add notes about this assignment..."
                            value={assignNotes}
                            onChange={(e) => setAssignNotes(e.target.value)}
                            className="min-h-[100px] text-sm dark:bg-gray-900 dark:border-gray-700"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            These notes will be added to the resolution notes.
                        </p>
                    </div>

                    {/* Selected Staff Preview */}
                    {selectedStaffMember && (
                        <div className="mt-4 p-4 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium text-blue-700 dark:text-blue-400">Selected Staff</p>
                                <Badge variant="outline" className="bg-white dark:bg-gray-900 dark:border-gray-600 dark:text-gray-300">
                                    Ready to assign
                                </Badge>
                            </div>
                            <div className="flex items-center gap-3">
                                {selectedStaffMember.avatar ? (
                                    <img
                                        src={selectedStaffMember.avatar}
                                        alt={getStaffDisplayName(selectedStaffMember)}
                                        className="h-8 w-8 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-medium">
                                        {getStaffInitials(selectedStaffMember)}
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate dark:text-blue-300">
                                        {getStaffDisplayName(selectedStaffMember)}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                        {selectedStaffMember.position && (
                                            <span className="text-xs text-gray-600 dark:text-gray-400">{selectedStaffMember.position}</span>
                                        )}
                                        {selectedStaffMember.role && (
                                            <span className="text-xs text-gray-500 dark:text-gray-500">{selectedStaffMember.role}</span>
                                        )}
                                        {selectedStaffMember.purok && (
                                            <span className="text-xs text-gray-500 dark:text-gray-500">Purok {selectedStaffMember.purok}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <AlertDialogFooter className="pt-4 border-t dark:border-gray-700">
                    <AlertDialogCancel disabled={isAssigning} className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onAssign}
                        disabled={isAssigning || !selectedStaff}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        {isAssigning ? (
                            <>
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                Assigning...
                            </>
                        ) : (
                            <>
                                <UserCheck className="mr-2 h-4 w-4" />
                                Assign Report
                            </>
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}