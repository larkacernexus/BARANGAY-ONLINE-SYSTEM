// components/admin/dashboard/PrivilegeStats.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
    Shield, 
    Award, 
    Heart, 
    HeartHandshake, 
    Baby, 
    Gift, 
    Users,
    AlertTriangle,
    Calendar,
    ChevronRight,
    Clock,
    User,
    AlertCircle
} from 'lucide-react';
import { Link } from '@inertiajs/react';

interface PrivilegeStat {
    id: number;
    name: string;
    code: string;
    count: number;
    discount_percentage?: number;
}

interface ExpiringPrivilege {
    resident_id: number;
    first_name: string;
    last_name: string;
    privilege_name: string;
    privilege_code: string;
    expires_at: string;
    id_number?: string;
}

interface PrivilegeStatsProps {
    data: {
        byPrivilege: PrivilegeStat[];
        expiringSoon: ExpiringPrivilege[];
        recentlyExpired: ExpiringPrivilege[];
        totalActive: number;
    };
}

export function PrivilegeStats({ data }: PrivilegeStatsProps) {
    const { byPrivilege = [], expiringSoon = [], recentlyExpired = [], totalActive = 0 } = data;

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-PH', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getDaysRemaining = (dateString: string) => {
        const expiryDate = new Date(dateString);
        const today = new Date();
        const diffTime = expiryDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const getPrivilegeIcon = (code: string) => {
        const iconMap: Record<string, any> = {
            'SC': Heart,
            'PWD': HeartHandshake,
            'SP': Baby,
            '4PS': Gift,
            'IP': Users,
            'IND': Heart,
        };
        return iconMap[code] || Award;
    };

    const getPrivilegeColor = (code: string) => {
        const colorMap: Record<string, string> = {
            'SC': 'text-rose-600 bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400',
            'PWD': 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400',
            'SP': 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30 dark:text-cyan-400',
            '4PS': 'text-teal-600 bg-teal-100 dark:bg-teal-900/30 dark:text-teal-400',
            'IP': 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400',
            'IND': 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400',
        };
        return colorMap[code] || 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
    };

    if (byPrivilege.length === 0) {
        return (
            <Card className="dark:bg-gray-900">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        Privilege Statistics
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <Shield className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">No privilege data available</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Calculate max count for progress bar
    const maxCount = Math.max(...byPrivilege.map(p => p.count), 1);

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        Privilege Statistics
                    </CardTitle>
                    <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                        {totalActive} Active
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Privilege Distribution */}
                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        Distribution by Type
                    </h4>
                    <div className="space-y-3">
                        {byPrivilege.map((privilege) => {
                            const Icon = getPrivilegeIcon(privilege.code);
                            const percentage = (privilege.count / maxCount) * 100;
                            
                            return (
                                <div key={privilege.id} className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className={`p-1 rounded-md ${getPrivilegeColor(privilege.code)}`}>
                                                <Icon className="h-3 w-3" />
                                            </div>
                                            <span className="text-sm font-medium dark:text-gray-300">
                                                {privilege.name}
                                            </span>
                                            <Badge variant="outline" className="text-xs dark:border-gray-600">
                                                {privilege.code}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold dark:text-gray-100">
                                                {privilege.count}
                                            </span>
                                            {privilege.discount_percentage && (
                                                <span className="text-xs text-green-600 dark:text-green-400">
                                                    {privilege.discount_percentage}% off
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <Progress 
                                        value={percentage} 
                                        className="h-1.5 dark:bg-gray-700"
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Expiring Soon */}
                {expiringSoon.length > 0 && (
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium text-amber-600 dark:text-amber-400 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            Expiring Soon ({expiringSoon.length})
                        </h4>
                        <div className="space-y-2">
                            {expiringSoon.slice(0, 3).map((item, index) => {
                                const daysRemaining = getDaysRemaining(item.expires_at);
                                const Icon = getPrivilegeIcon(item.privilege_code);
                                
                                return (
                                    <Link 
                                        key={index}
                                        href={`/admin/residents/${item.resident_id}`}
                                        className="block p-2 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
                                    >
                                        <div className="flex items-start gap-2">
                                            <div className={`p-1 rounded-md ${getPrivilegeColor(item.privilege_code)}`}>
                                                <Icon className="h-3 w-3" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate dark:text-gray-200">
                                                    {item.first_name} {item.last_name}
                                                </p>
                                                <div className="flex items-center gap-2 text-xs">
                                                    <span className="text-gray-500 dark:text-gray-400">
                                                        {item.privilege_name}
                                                    </span>
                                                    {item.id_number && (
                                                        <span className="text-gray-400 dark:text-gray-500">
                                                            ID: {item.id_number}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge className={daysRemaining <= 7 
                                                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                                                    }>
                                                        <Clock className="h-3 w-3 mr-1" />
                                                        {daysRemaining} days
                                                    </Badge>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        Expires: {formatDate(item.expires_at)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                            {expiringSoon.length > 3 && (
                                <Link href="/admin/privileges?filter=expiring">
                                    <Button variant="ghost" size="sm" className="w-full text-xs gap-1 mt-1">
                                        View {expiringSoon.length - 3} more expiring
                                        <ChevronRight className="h-3 w-3" />
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                )}

                {/* Recently Expired */}
                {recentlyExpired.length > 0 && (
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Recently Expired
                        </h4>
                        <div className="space-y-2">
                            {recentlyExpired.slice(0, 2).map((item, index) => {
                                const Icon = getPrivilegeIcon(item.privilege_code);
                                
                                return (
                                    <Link 
                                        key={index}
                                        href={`/admin/residents/${item.resident_id}`}
                                        className="block p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                    >
                                        <div className="flex items-start gap-2">
                                            <div className={`p-1 rounded-md ${getPrivilegeColor(item.privilege_code)} opacity-50`}>
                                                <Icon className="h-3 w-3" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate text-gray-500 dark:text-gray-400">
                                                    {item.first_name} {item.last_name}
                                                </p>
                                                <div className="flex items-center gap-2 text-xs">
                                                    <span className="text-gray-400 dark:text-gray-500">
                                                        {item.privilege_name}
                                                    </span>
                                                    <span className="text-gray-400 dark:text-gray-500">
                                                        • {formatDate(item.expires_at)}
                                                    </span>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="text-xs border-gray-300 dark:border-gray-600">
                                                Expired
                                            </Badge>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="pt-2">
                    <Link href="/admin/privileges">
                        <Button variant="outline" size="sm" className="w-full gap-1 dark:border-gray-600 dark:text-gray-300">
                            Manage Privileges
                            <ChevronRight className="h-3 w-3" />
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}