// components/admin/dashboard/TopPuroks.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MapPin, Users, Home, ChevronRight, TrendingUp } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface Purok {
    name: string;
    residents: number;
    households: number;
}

interface TopPuroksProps {
    puroks: Purok[];
    maxDisplay?: number;
}

export function TopPuroks({ puroks, maxDisplay = 5 }: TopPuroksProps) {
    const displayPuroks = puroks.slice(0, maxDisplay);
    
    // Find max residents for progress bar scaling
    const maxResidents = displayPuroks.length > 0 
        ? Math.max(...displayPuroks.map(p => p.residents))
        : 1;

    if (displayPuroks.length === 0) {
        return (
            <Card className="dark:bg-gray-900">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        Top Puroks
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <MapPin className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">No purok data available</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        Top Puroks by Population
                    </CardTitle>
                    <Link href="/admin/puroks">
                        <Button variant="ghost" size="sm" className="text-xs gap-1">
                            View All
                            <ChevronRight className="h-3 w-3" />
                        </Button>
                    </Link>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {displayPuroks.map((purok, index) => (
                        <Link 
                            key={purok.name} 
                            href={`/admin/puroks/${purok.name.toLowerCase().replace(' ', '-')}`}
                            className="block group"
                        >
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                                            ${index === 0 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                              index === 1 ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' :
                                              index === 2 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                                              'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'}`}>
                                            {index + 1}
                                        </div>
                                        <span className="font-medium dark:text-gray-200">
                                            {purok.name}
                                        </span>
                                    </div>
                                    <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-300">
                                        <Users className="h-3 w-3 mr-1" />
                                        {purok.residents}
                                    </Badge>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <div className="flex-1">
                                        <Progress 
                                            value={(purok.residents / maxResidents) * 100} 
                                            className="h-2 dark:bg-gray-700"
                                        />
                                    </div>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                        <Home className="h-3 w-3" />
                                        {purok.households} HH
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
                
                <div className="mt-4 pt-3 border-t dark:border-gray-700">
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            Total Residents: {puroks.reduce((acc, p) => acc + p.residents, 0).toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                            <Home className="h-3 w-3" />
                            Total Households: {puroks.reduce((acc, p) => acc + p.households, 0).toLocaleString()}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}