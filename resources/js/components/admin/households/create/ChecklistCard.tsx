// components/admin/households/create/ChecklistCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertCircle, Key, Home, Phone, MapPin, Users } from 'lucide-react';

interface Member {
    id: number;
    relationship: string;
}

interface Props {
    data: any;
    members: Member[];
}

export default function ChecklistCard({ data, members }: Props) {
    const checklistItems = [
        { key: 'head_of_family', label: 'Head of family information', icon: Home },
        { key: 'address', label: 'Complete address', icon: MapPin },
        { key: 'contact_number', label: 'Contact information', icon: Phone },
        { key: 'members', label: `Household members (${members.length})`, icon: Users, custom: true, minCount: 1 },
        { key: 'purok_id', label: 'Purok selected', icon: MapPin },
    ];

    const isCompleted = (key: string, custom?: boolean) => {
        if (custom) return members.length > 0;
        return !!data[key];
    };

    const completedCount = checklistItems.filter(item => isCompleted(item.key, item.custom)).length;
    const totalCount = checklistItems.length;
    const progress = Math.round((completedCount / totalCount) * 100);

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm dark:text-gray-100">
                    <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-700 dark:to-orange-700 flex items-center justify-center">
                        <CheckCircle className="h-3 w-3 text-white" />
                    </div>
                    Registration Checklist
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Progress Bar */}
                    <div>
                        <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Completion</span>
                            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{progress}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                                className={`h-full rounded-full transition-all duration-300 ${
                                    progress === 100 
                                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 dark:from-green-600 dark:to-emerald-600' 
                                        : progress >= 50 
                                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-blue-600 dark:to-indigo-600' 
                                            : 'bg-gradient-to-r from-amber-500 to-orange-500 dark:from-amber-600 dark:to-orange-600'
                                }`}
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    {/* Checklist Items */}
                    <div className="space-y-3">
                        {checklistItems.map((item) => {
                            const completed = isCompleted(item.key, item.custom);
                            const Icon = item.icon;
                            
                            return (
                                <div key={item.key} className="flex items-center gap-3">
                                    <div className={`h-6 w-6 rounded-full flex items-center justify-center ${
                                        completed 
                                            ? 'bg-green-100 dark:bg-green-900/30' 
                                            : 'bg-gray-100 dark:bg-gray-900'
                                    }`}>
                                        {completed ? (
                                            <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                                        ) : (
                                            <AlertCircle className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                                        )}
                                    </div>
                                    <div className="flex-1 flex items-center gap-2">
                                        <Icon className={`h-4 w-4 ${completed ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`} />
                                        <span className={`text-sm ${completed ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                            {item.label}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                        
                        {data.create_user_account && (
                            <div className="flex items-center gap-3 mt-2 pt-2 border-t dark:border-gray-700">
                                <div className="h-6 w-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                    <Key className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div className="flex-1 flex items-center gap-2">
                                    <Key className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                    <span className="text-sm text-purple-600 dark:text-purple-400">
                                        User account creation enabled
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Missing Items */}
                    {completedCount < totalCount && (
                        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                            <p className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {totalCount - completedCount} item(s) remaining to complete
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}