// components/admin/officials/shared/preview-card.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Crown, Award, UserCheck, Building, User } from 'lucide-react';
import { Resident, Position, Committee, Role, User as UserType } from './types/official';

interface PreviewCardProps {
    selectedResident: Resident | null;
    selectedUser: UserType | null;
    selectedPosition: Position | null;
    photoPreview: string | null;
    positionId: number | null;
    committeeId: number | null;
    termStart: string;
    termEnd: string;
    useResidentPhoto: boolean;
    photo: File | null;
    isRegular: boolean;
    userAssigned: boolean;
    positions: Position[];
    committees: Committee[];
    roles: Role[];
}

export function PreviewCard({
    selectedResident,
    selectedUser,
    selectedPosition,
    photoPreview,
    positionId,
    committeeId,
    termStart,
    termEnd,
    useResidentPhoto,
    photo,
    isRegular,
    userAssigned,
    positions,
    committees,
    roles
}: PreviewCardProps) {
    const selectedCommittee = committees.find(c => c.id === committeeId);
    
    const getPositionIcon = (code: string) => {
        switch (code) {
            case 'CAPTAIN':
                return <Crown className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
            case 'SECRETARY':
                return <Award className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
            case 'TREASURER':
                return <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />;
            case 'SK-CHAIRMAN':
                return <UserCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
            default:
                return <Building className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
        }
    };

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-700 dark:to-orange-700 flex items-center justify-center">
                        <Shield className="h-3 w-3 text-white" />
                    </div>
                    Preview
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {selectedResident && selectedPosition ? (
                    <>
                        <div className="flex items-center gap-3">
                            <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                                {photoPreview ? (
                                    <img 
                                        src={photoPreview} 
                                        alt="Official preview"
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    getPositionIcon(selectedPosition.code)
                                )}
                            </div>
                            <div>
                                <h4 className="font-medium dark:text-gray-200">
                                    {selectedResident.last_name}, {selectedResident.first_name}
                                    {selectedResident.middle_name && ` ${selectedResident.middle_name.charAt(0)}.`}
                                    {selectedResident.suffix && ` ${selectedResident.suffix}`}
                                </h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Will hold position: {selectedPosition.name}
                                </p>
                            </div>
                        </div>

                        <div className="pt-4 border-t dark:border-gray-700">
                            <h4 className="font-medium mb-2 dark:text-gray-300">Assignment Details:</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Position:</span>
                                    <span className="font-medium dark:text-gray-200 flex items-center gap-1">
                                        {getPositionIcon(selectedPosition.code)}
                                        {selectedPosition.name}
                                    </span>
                                </div>
                                {selectedCommittee && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 dark:text-gray-400">Committee:</span>
                                        <span className="font-medium dark:text-gray-200">
                                            {selectedCommittee.name}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Term:</span>
                                    <span className="font-medium dark:text-gray-200">
                                        {new Date(termStart).toLocaleDateString()} - {new Date(termEnd).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Type:</span>
                                    <span className="font-medium dark:text-gray-200">
                                        {isRegular ? 'Regular Official' : 'Ex-Officio'}
                                    </span>
                                </div>
                                
                                {userAssigned && selectedUser ? (
                                    <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                        <div className="flex items-start gap-2">
                                            <User className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5" />
                                            <div>
                                                <p className="text-xs font-medium text-green-800 dark:text-green-300">
                                                    Position Account Assigned
                                                </p>
                                                <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                                                    Username: {selectedUser.username}
                                                </p>
                                                <p className="text-xs text-green-700 dark:text-green-400">
                                                    This account will be used by {selectedResident.first_name} {selectedResident.last_name}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                                        <p className="text-xs text-amber-700 dark:text-amber-400">
                                            ⚠️ No position account assigned. Select a position account for {selectedPosition.name}.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                        <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Select a resident and position to see preview</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}