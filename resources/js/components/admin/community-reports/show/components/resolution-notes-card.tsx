// resources/js/components/admin/community-reports/show/components/resolution-notes-card.tsx
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RefreshCw, MessageSquare } from 'lucide-react';
import { CommunityReport } from './types';

interface ResolutionNotesCardProps {
    report: CommunityReport;
    adminNotes: string;
    setAdminNotes: (notes: string) => void;
    isSavingNotes: boolean;
    onSaveNotes: () => void;
}

export function ResolutionNotesCard({
    report,
    adminNotes,
    setAdminNotes,
    isSavingNotes,
    onSaveNotes,
}: ResolutionNotesCardProps) {
    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm dark:text-gray-100">
                    <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700 flex items-center justify-center">
                        <MessageSquare className="h-3 w-3 text-white" />
                    </div>
                    Resolution Notes
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                    Internal notes and resolution details
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add resolution notes here..."
                    className="min-h-[150px] text-sm dark:bg-gray-900 dark:border-gray-700"
                />
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between border-t dark:border-gray-700 pt-4">
                <div className="text-xs text-gray-500 dark:text-gray-400 order-2 sm:order-1">
                    {adminNotes.length} characters
                </div>
                <Button
                    onClick={onSaveNotes}
                    disabled={isSavingNotes || adminNotes === (report?.resolution_notes || '')}
                    className="w-full sm:w-auto order-1 sm:order-2 bg-blue-600 hover:bg-blue-700 text-white"
                    size="sm"
                >
                    {isSavingNotes ? (
                        <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        'Save Notes'
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
}