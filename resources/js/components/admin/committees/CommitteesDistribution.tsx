// components/admin/committees/CommitteesDistribution.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Committee } from '@/types/committees';
import { truncateText, getTruncationLength } from '@/lib/committeeutils';

interface CommitteesDistributionProps {
    committees: Committee[];
    onViewAll?: () => void;
}

export function CommitteesDistribution({ committees, onViewAll }: CommitteesDistributionProps) {
    if (committees.length === 0) {
        return (
            <Card className="overflow-hidden">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Committee Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-500 text-center py-4 text-sm">No committee data available</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="overflow-hidden">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg">Committee Distribution</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {committees.slice(0, 3).map((committee) => {
                        const nameLength = getTruncationLength('name');
                        const hasPositions = (committee.positions_count || 0) > 0;
                        
                        return (
                            <div key={committee.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span 
                                        className="text-sm font-medium truncate"
                                        title={committee.name}
                                    >
                                        {truncateText(committee.name, nameLength)}
                                    </span>
                                    {hasPositions && (
                                        <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                                            Has Positions
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <Badge variant="outline" className="text-xs">
                                        {committee.positions_count || 0} Positions
                                    </Badge>
                                    <Badge 
                                        variant={committee.is_active ? "default" : "secondary"} 
                                        className="text-xs"
                                    >
                                        {committee.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                            </div>
                        );
                    })}
                    {committees.length > 3 && onViewAll && (
                        <div className="text-center pt-2">
                            <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={onViewAll}
                                className="h-8"
                            >
                                View All Committees
                            </Button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}