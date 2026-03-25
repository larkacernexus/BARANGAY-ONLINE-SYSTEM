// components/QuickActionsCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { FileText, Trash2, Printer, Share2, Zap } from 'lucide-react';

interface QuickActionsCardProps {
    canEdit: boolean;
    reportId: number;
    onPrint: () => void;
    onShare: () => void;
}

export const QuickActionsCard = ({ canEdit, reportId, onPrint, onShare }: QuickActionsCardProps) => {
    return (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50">
            <CardHeader className="pb-2">
                <CardTitle className="text-base lg:text-lg flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                        <Zap className="h-4 w-4 text-white" />
                    </div>
                    Quick Actions
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                {canEdit && (
                    <Button 
                        variant="default"
                        className="w-full justify-start gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600"
                        asChild
                    >
                        <Link href={`/portal/community-reports/${reportId}/edit`}>
                            <FileText className="h-4 w-4" />
                            Edit Report
                        </Link>
                    </Button>
                )}
                <Button 
                    variant="outline" 
                    className="w-full justify-start gap-2 rounded-xl"
                    onClick={onPrint}
                >
                    <Printer className="h-4 w-4" />
                    Print Details
                </Button>
                <Button 
                    variant="outline" 
                    className="w-full justify-start gap-2 rounded-xl"
                    onClick={onShare}
                >
                    <Share2 className="h-4 w-4" />
                    Share Report
                </Button>
                {canEdit && (
                    <Button 
                        variant="destructive" 
                        className="w-full justify-start gap-2 rounded-xl"
                        asChild
                    >
                        <Link 
                            href={`/portal/community-reports/${reportId}`} 
                            method="delete"
                            as="button"
                            type="button"
                            onClick={(e) => {
                                if (!confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
                                    e.preventDefault();
                                }
                            }}
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete Report
                        </Link>
                    </Button>
                )}
            </CardContent>
        </Card>
    );
};