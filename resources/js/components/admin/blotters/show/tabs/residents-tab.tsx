// resources/js/components/admin/blotters/show/components/tabs/residents-tab.tsx

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { Users, Edit, User, MapPin, Phone } from 'lucide-react';
import { Blotter, InvolvedResident } from '@/types/admin/blotters/blotter';
import { InvolvedResidentCard } from '@/components/admin/blotters/show/cards/involved-resident-card';

interface ResidentsTabProps {
    blotter: Blotter;
    involvedResidents: InvolvedResident[];
}

export function ResidentsTab({ blotter, involvedResidents }: ResidentsTabProps) {
    const hasInvolvedResidents = involvedResidents.length > 0;

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <Users className="h-5 w-5" />
                    Involved Residents ({involvedResidents.length})
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                    Residents involved in this blotter case
                </CardDescription>
            </CardHeader>
            <CardContent>
                {hasInvolvedResidents ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {involvedResidents.map((resident) => (
                            <InvolvedResidentCard key={resident.id} resident={resident} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 space-y-4">
                        <Users className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600" />
                        <div>
                            <h4 className="font-medium text-gray-700 dark:text-gray-300">No residents found</h4>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                                This blotter doesn't have any involved residents listed
                            </p>
                        </div>
                        <Link href={`/admin/blotters/${blotter.id}/edit`}>
                            <Button variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                                <Edit className="h-4 w-4 mr-2" />
                                Add Residents
                            </Button>
                        </Link>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}