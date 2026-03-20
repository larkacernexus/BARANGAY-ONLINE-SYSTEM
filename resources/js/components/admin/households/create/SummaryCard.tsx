// components/admin/households/create/SummaryCard.tsx
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Users, Home, Phone, Mail, MapPin } from 'lucide-react';

interface Member {
    id: number;
    name: string;
    relationship: string;
}

interface Props {
    data: any;
    members: Member[];
}

export default function SummaryCard({ data, members }: Props) {
    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm dark:text-gray-100">
                    <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700 flex items-center justify-center">
                        <Users className="h-3 w-3 text-white" />
                    </div>
                    Household Summary
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-2">
                        <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800 text-center">
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{members.length}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Total Members</p>
                        </div>
                        <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800 text-center">
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{data.head_of_family ? '1' : '0'}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Head of Family</p>
                        </div>
                    </div>

                    {/* Head of Family */}
                    {data.head_of_family && (
                        <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Head of Family</p>
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                <span className="font-medium dark:text-gray-200">{data.head_of_family}</span>
                            </div>
                        </div>
                    )}

                    {/* Contact Info */}
                    {(data.contact_number || data.email) && (
                        <div className="space-y-2 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                            {data.contact_number && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Phone className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                                    <span className="dark:text-gray-300">{data.contact_number}</span>
                                </div>
                            )}
                            {data.email && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Mail className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                                    <span className="dark:text-gray-300">{data.email}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Address */}
                    {data.address && data.purok_name && (
                        <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 text-gray-400 dark:text-gray-500 mt-0.5" />
                                <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Address</p>
                                    <p className="text-sm dark:text-gray-300 mt-1">
                                        {data.address}, Purok {data.purok_name}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Members Breakdown */}
                    <div className="border-t dark:border-gray-700 pt-4">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Members Breakdown</p>
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                            {members.length === 0 ? (
                                <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                                    No members added
                                </div>
                            ) : (
                                members.map((member) => (
                                    <div key={member.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 dark:bg-gray-900/50 rounded border border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center gap-2 truncate">
                                            <User className="h-3 w-3 text-gray-400 dark:text-gray-500 shrink-0" />
                                            <span className="truncate dark:text-gray-300">{member.name || `Member ${member.id}`}</span>
                                        </div>
                                        <Badge variant="outline" className="text-xs shrink-0 dark:border-gray-600 dark:text-gray-300">
                                            {member.relationship}
                                        </Badge>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}