// components/admin/dashboard/RecentResidents.tsx
import { Link } from '@inertiajs/react';
import { ArrowRight, Users, Home, Award } from 'lucide-react';

interface Resident {
    id: number;
    name: string;
    created_at: string;
    household_number?: string;
    privileges_count?: number;
}

interface RecentResidentsProps {
    residents: Resident[];
}

export function RecentResidents({ residents }: RecentResidentsProps) {
    if (!residents || residents.length === 0) {
        return (
            <div className="rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-gray-900">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Recent Residents</h3>
                </div>
                <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No recent residents</p>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-gray-900">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Recent Residents</h3>
                <Link 
                    href="/admin/residents"
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
                >
                    View all
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </div>
            
            <div className="space-y-3">
                {residents.map((resident) => (
                    <Link
                        key={resident.id}
                        href={`/admin/residents/${resident.id}`}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-purple-50 p-2 dark:bg-purple-900/20">
                                <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {resident.name}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    {resident.household_number && (
                                        <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                            <Home className="h-3 w-3" />
                                            HH #{resident.household_number}
                                        </span>
                                    )}
                                    {resident.privileges_count && resident.privileges_count > 0 && (
                                        <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                                            <Award className="h-3 w-3" />
                                            {resident.privileges_count} {resident.privileges_count === 1 ? 'privilege' : 'privileges'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(resident.created_at).toLocaleDateString()}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
}