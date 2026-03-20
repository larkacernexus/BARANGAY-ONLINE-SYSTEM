// resources/js/Pages/Admin/Announcements/components/audience-tab.tsx
import React from 'react';
import { Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
    Users, 
    Globe, 
    MapPin, 
    Home, 
    Briefcase, 
    UserCircle,
    Shield,
    Mail,
    MapPinned,
    Edit,
    Eye,
    Copy,
    TrendingUp
} from 'lucide-react';
import { route } from 'ziggy-js';

interface Announcement {
    id: number;
    audience_type: string;
    audience_type_label: string;
    audience_summary: string;
    estimated_reach: number;
}

interface AudienceDetails {
    roles?: Array<{ id: number; name: string }>;
    puroks?: Array<{ id: number; name: string }>;
    households?: Array<{ id: number; household_number: string; purok?: { name: string } }>;
    businesses?: Array<{ id: number; business_name: string; owner_name?: string }>;
    users?: Array<{ id: number; first_name: string; last_name: string; email: string; role?: { name: string } }>;
}

interface Props {
    announcement: Announcement;
    audience_details: AudienceDetails;
    AudienceIcon: React.ElementType;
    onPreview: (e: React.MouseEvent) => void;
    onDuplicate: () => void;
}

export const AudienceTab = ({
    announcement,
    audience_details,
    AudienceIcon,
    onPreview,
    onDuplicate
}: Props) => {
    return (
        <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Audience List */}
            <div className="lg:col-span-2 space-y-6">
                <Card className="dark:bg-gray-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                            <AudienceIcon className="h-5 w-5" />
                            Targeted Audience
                        </CardTitle>
                        <CardDescription className="dark:text-gray-400">
                            Specific groups and individuals who will see this announcement
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* All Users */}
                        {announcement.audience_type === 'all' && (
                            <div className="text-center py-8">
                                <Globe className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold dark:text-gray-100 mb-2">All Users</h3>
                                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                                    This announcement is visible to all users of the system, including residents, households, businesses, and administrators.
                                </p>
                            </div>
                        )}

                        {/* Roles */}
                        {audience_details.roles && audience_details.roles.length > 0 && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                                        <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <h3 className="font-medium dark:text-gray-200">Target Roles ({audience_details.roles.length})</h3>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {audience_details.roles.map((role) => (
                                        <Badge key={role.id} variant="outline" className="justify-start py-2 dark:border-gray-600 dark:text-gray-300">
                                            <Shield className="h-3 w-3 mr-1" />
                                            {role.name}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Puroks */}
                        {audience_details.puroks && audience_details.puroks.length > 0 && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                                        <MapPin className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    </div>
                                    <h3 className="font-medium dark:text-gray-200">Target Puroks ({audience_details.puroks.length})</h3>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {audience_details.puroks.map((purok) => (
                                        <Badge key={purok.id} variant="outline" className="justify-start py-2 dark:border-gray-600 dark:text-gray-300">
                                            <Home className="h-3 w-3 mr-1" />
                                            {purok.name}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Households */}
                        {audience_details.households && audience_details.households.length > 0 && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30">
                                        <Home className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <h3 className="font-medium dark:text-gray-200">
                                        Target {announcement.audience_type === 'household_members' ? 'Households (All Members)' : 'Households'} 
                                        ({audience_details.households.length})
                                    </h3>
                                </div>
                                <div className="grid gap-2 max-h-96 overflow-y-auto pr-2">
                                    {audience_details.households.map((household) => (
                                        <Card key={household.id} className="dark:bg-gray-900">
                                            <CardContent className="p-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Home className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                                        <div>
                                                            <p className="font-medium dark:text-gray-200">{household.household_number}</p>
                                                            {household.purok && (
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">{household.purok.name}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <MapPinned className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Businesses */}
                        {audience_details.businesses && audience_details.businesses.length > 0 && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/30">
                                        <Briefcase className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <h3 className="font-medium dark:text-gray-200">Target Businesses ({audience_details.businesses.length})</h3>
                                </div>
                                <div className="grid gap-2 max-h-96 overflow-y-auto pr-2">
                                    {audience_details.businesses.map((business) => (
                                        <Card key={business.id} className="dark:bg-gray-900">
                                            <CardContent className="p-3">
                                                <div className="flex items-center gap-2">
                                                    <Briefcase className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                                    <div>
                                                        <p className="font-medium dark:text-gray-200">{business.business_name}</p>
                                                        {business.owner_name && (
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">Owner: {business.owner_name}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Users */}
                        {audience_details.users && audience_details.users.length > 0 && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30">
                                        <UserCircle className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <h3 className="font-medium dark:text-gray-200">Target Users ({audience_details.users.length})</h3>
                                </div>
                                <div className="grid gap-2 max-h-96 overflow-y-auto pr-2">
                                    {audience_details.users.map((user) => (
                                        <Card key={user.id} className="dark:bg-gray-900">
                                            <CardContent className="p-3">
                                                <div className="flex items-start gap-2">
                                                    <Avatar className="h-8 w-8 dark:bg-gray-700">
                                                        <AvatarFallback className="text-xs dark:bg-gray-600 dark:text-gray-200">
                                                            {user.first_name[0]}{user.last_name[0]}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1">
                                                        <p className="font-medium dark:text-gray-200">
                                                            {user.first_name} {user.last_name}
                                                        </p>
                                                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                            <Mail className="h-3 w-3" />
                                                            {user.email}
                                                            {user.role && (
                                                                <>
                                                                    <span>•</span>
                                                                    <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-300">
                                                                        {user.role.name}
                                                                    </Badge>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Right Column - Audience Stats */}
            <div className="space-y-6">
                <Card className="dark:bg-gray-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                            <TrendingUp className="h-5 w-5" />
                            Audience Statistics
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                                    <span className="text-sm font-medium dark:text-gray-300">Estimated Reach</span>
                                </div>
                                <span className="text-lg font-bold dark:text-gray-100">{announcement.estimated_reach.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Globe className="h-4 w-4 text-green-500 dark:text-green-400" />
                                    <span className="text-sm font-medium dark:text-gray-300">Audience Type</span>
                                </div>
                                <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                                    {announcement.audience_type_label}
                                </Badge>
                            </div>
                        </div>

                        <Separator className="dark:bg-gray-700" />

                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Target Summary</p>
                            <p className="text-sm dark:text-gray-300">{announcement.audience_summary}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="dark:bg-gray-900">
                    <CardHeader>
                        <CardTitle className="text-sm dark:text-gray-100">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Link href={route('admin.announcements.edit', announcement.id)} className="block">
                            <Button variant="outline" className="w-full justify-start dark:border-gray-600 dark:text-gray-300" type="button">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Announcement
                            </Button>
                        </Link>
                        <Button 
                            variant="outline" 
                            className="w-full justify-start dark:border-gray-600 dark:text-gray-300"
                            onClick={onPreview}
                            type="button"
                        >
                            <Eye className="h-4 w-4 mr-2" />
                            View Preview
                        </Button>
                        <Button 
                            variant="outline" 
                            className="w-full justify-start dark:border-gray-600 dark:text-gray-300"
                            onClick={onDuplicate}
                            type="button"
                        >
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate Announcement
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};