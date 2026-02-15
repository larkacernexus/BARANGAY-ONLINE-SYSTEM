// components/admin/committees/CommitteesQuickActions.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { Target, Users, Plus, BarChart3, FileSpreadsheet } from 'lucide-react';

interface CommitteesQuickActionsProps {
    selectedIds: number[];
    onGenerateReport?: () => void;
    onExport?: () => void;
}

export function CommitteesQuickActions({ 
    selectedIds, 
    onGenerateReport, 
    onExport 
}: CommitteesQuickActionsProps) {
    return (
        <Card className="overflow-hidden">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-3">
                    <Link href="/positions">
                        <Button variant="outline" size="sm" className="w-full justify-start h-8">
                            <Target className="h-3 w-3 mr-2" />
                            <span className="truncate">View Positions</span>
                        </Button>
                    </Link>
                    
                    <Link href="/officials">
                        <Button variant="outline" size="sm" className="w-full justify-start h-8">
                            <Users className="h-3 w-3 mr-2" />
                            <span className="truncate">View Officials</span>
                        </Button>
                    </Link>
                    
                    <Link href="/committees/create">
                        <Button variant="outline" size="sm" className="w-full justify-start h-8">
                            <Plus className="h-3 w-3 mr-2" />
                            <span className="truncate">Add Committee</span>
                        </Button>
                    </Link>
                    
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start h-8"
                        onClick={onGenerateReport}
                        disabled={selectedIds.length === 0}
                    >
                        <BarChart3 className="h-3 w-3 mr-2" />
                        <span className="truncate">Generate Report</span>
                    </Button>
                    
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start h-8 col-span-2"
                        onClick={onExport}
                    >
                        <FileSpreadsheet className="h-3 w-3 mr-2" />
                        <span className="truncate">Export All Data</span>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}