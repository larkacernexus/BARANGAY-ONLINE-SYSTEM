// components/admin/residents/edit/ResidentInfoCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { Home, Calendar, Hash, ExternalLink } from 'lucide-react';

interface Props {
    residentId: string;
    createdAt: string;
    age: number;           // Add age prop
    gender: string;        // Add gender prop
    householdRelation?: {
        id: number;
        household_number: string;
    };
    formatDisplayDate: (date: string) => string;
}

export default function ResidentInfoCard({ 
    residentId, 
    createdAt, 
    age,                   // Destructure age
    gender,                // Destructure gender
    householdRelation, 
    formatDisplayDate 
}: Props) {
    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700 flex items-center justify-center">
                        <Hash className="h-3 w-3 text-white" />
                    </div>
                    Resident Information
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Resident ID */}
                <div className="space-y-2">
                    <Label htmlFor="resident_id_display" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                        <Hash className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        Resident ID
                    </Label>
                    <div className="relative">
                        <Input 
                            id="resident_id_display"
                            readOnly
                            className="bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 font-mono font-bold pr-16"
                            value={residentId}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            <span className="text-xs text-gray-400 dark:text-gray-500">(auto)</span>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Unique identifier automatically generated
                    </p>
                </div>

                {/* Registration Date */}
                <div className="space-y-2">
                    <Label htmlFor="registration_date" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        Registration Date
                    </Label>
                    <Input 
                        id="registration_date"
                        readOnly
                        className="bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                        value={formatDisplayDate(createdAt)}
                    />
                </div>

                {/* Household Information */}
                {householdRelation && (
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                            <Home className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                            Household
                        </Label>
                        <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <div className="flex items-center gap-2 mb-3">
                                <Home className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                <p className="font-medium text-blue-800 dark:text-blue-300">
                                    Household #{householdRelation.household_number}
                                </p>
                            </div>
                            <Link href={`/admin/households/${householdRelation.id}`}>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="w-full dark:border-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-950/50"
                                >
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    View Household
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Age</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            {age || '-'}
                        </p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Gender</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-gray-100 capitalize">
                            {gender || '-'}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}