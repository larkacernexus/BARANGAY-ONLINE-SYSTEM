// resources/js/components/admin/blotters/show/components/tabs/overview-tab.tsx

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChevronRight, AlertCircle, MapPin, User, Phone, Users } from 'lucide-react';
import { Blotter, InvolvedResident } from '@/types/admin/blotters/blotter';
import { QuickStatsCard } from '../cards/quick-stats-card';
import { QuickActionsCard } from '../cards/quick-actions-card';
import { TimelineCard } from '../cards/timeline-card';
import { SystemInfoCard } from '../cards/system-info-card';
import { InvolvedResidentCard } from '../cards/involved-resident-card';

interface OverviewTabProps {
    blotter: Blotter;
    involvedResidents: InvolvedResident[];
    attachmentsCount: number;
    onViewResidents: () => void;
    onViewDetails: () => void;
}

export function OverviewTab({
    blotter,
    involvedResidents,
    attachmentsCount,
    onViewResidents,
    onViewDetails
}: OverviewTabProps) {
    const hasInvolvedResidents = involvedResidents.length > 0;

    return (
        <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Main Information */}
            <div className="lg:col-span-2 space-y-6">
                <Card className="dark:bg-gray-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                            Incident Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Incident Type</h3>
                            <p className="mt-1 dark:text-gray-300">{blotter.incident_type}</p>
                        </div>
                        
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <MapPin className="h-4 w-4 text-gray-400" />
                                <span className="dark:text-gray-300">{blotter.location}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <MapPin className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    Barangay {blotter.barangay}
                                </span>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</h3>
                            <p className="mt-1 whitespace-pre-wrap dark:text-gray-300 line-clamp-3">
                                {blotter.incident_description}
                            </p>
                            {blotter.incident_description.length > 200 && (
                                <Button
                                    variant="link"
                                    className="mt-2 p-0 h-auto text-sm"
                                    onClick={onViewDetails}
                                >
                                    Read more
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="dark:bg-gray-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                            <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            Reporter
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div>
                            <p className="font-medium dark:text-gray-200">{blotter.reporter_name}</p>
                            {blotter.reporter_contact && (
                                <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    <Phone className="h-3 w-3" />
                                    {blotter.reporter_contact}
                                </div>
                            )}
                            {blotter.reporter_address && (
                                <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    <MapPin className="h-3 w-3" />
                                    {blotter.reporter_address}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {blotter.respondent_name && (
                    <Card className="dark:bg-gray-900">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                Respondent
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div>
                                <p className="font-medium dark:text-gray-200">{blotter.respondent_name}</p>
                                {blotter.respondent_address && (
                                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        <MapPin className="h-3 w-3" />
                                        {blotter.respondent_address}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {hasInvolvedResidents && (
                    <Card className="dark:bg-gray-900">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                    <Users className="h-5 w-5" />
                                    Involved Residents
                                </CardTitle>
                                <CardDescription className="dark:text-gray-400">
                                    {involvedResidents.length} resident(s) involved
                                </CardDescription>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onViewResidents}
                                className="dark:text-gray-400 dark:hover:text-white"
                            >
                                View All
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {involvedResidents.slice(0, 3).map((resident) => (
                                    <InvolvedResidentCard key={resident.id} resident={resident} />
                                ))}
                                {involvedResidents.length > 3 && (
                                    <Button
                                        variant="link"
                                        className="w-full"
                                        onClick={onViewResidents}
                                    >
                                        View all {involvedResidents.length} residents
                                        <ChevronRight className="h-4 w-4 ml-1" />
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
                <QuickStatsCard 
                    blotter={blotter} 
                    attachmentsCount={attachmentsCount} 
                />
                <QuickActionsCard blotter={blotter} />
                <TimelineCard blotter={blotter} />
                <SystemInfoCard blotter={blotter} />
            </div>
        </div>
    );
}