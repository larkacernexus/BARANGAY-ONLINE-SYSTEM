// components/EvidenceCard.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { Paperclip, File } from 'lucide-react';
import { EvidenceThumbnail } from './EvidenceThumbnail';
import { ReportEvidence } from '@/types/portal/reports/community-report';

interface EvidenceCardProps {
    evidences: ReportEvidence[];
    canEdit: boolean;
    reportId: number;
    onViewEvidence: (url: string) => void;
    onDownloadEvidence: (url: string, fileName: string) => void;
    onDeleteEvidence: (evidenceId: number) => void;
    deletingEvidenceId?: number | null;
}

export const EvidenceCard = ({
    evidences,
    canEdit,
    reportId,
    onViewEvidence,
    onDownloadEvidence,
    onDeleteEvidence,
    deletingEvidenceId
}: EvidenceCardProps) => {
    if (!evidences || evidences.length === 0) {
        return (
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base lg:text-lg flex items-center gap-2">
                        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                            <Paperclip className="h-4 w-4 text-white" />
                        </div>
                        Supporting Evidence
                    </CardTitle>
                    <CardDescription>No evidence files attached</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <File className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">No Evidence Attached</h4>
                        <p className="text-sm text-gray-500">No supporting files were uploaded with this report</p>
                        {canEdit && (
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="mt-4 gap-2 rounded-xl"
                                asChild
                            >
                                <Link href={`/portal/community-reports/${reportId}/edit`}>
                                    <Paperclip className="h-4 w-4" />
                                    Add Evidence
                                </Link>
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50">
            <CardHeader className="pb-2">
                <CardTitle className="text-base lg:text-lg flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                        <Paperclip className="h-4 w-4 text-white" />
                    </div>
                    Supporting Evidence
                </CardTitle>
                <CardDescription>
                    {evidences.length} file{evidences.length !== 1 ? 's' : ''} attached
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {evidences.map((evidence) => (
                        <div key={evidence.id} className="space-y-2">
                            <EvidenceThumbnail
                                evidence={evidence}
                                onView={() => onViewEvidence(evidence.file_url)}
                                onDownload={() => onDownloadEvidence(evidence.file_url, evidence.file_name)}
                                onDelete={() => onDeleteEvidence(evidence.id)}
                                canEdit={canEdit}
                                isDeleting={deletingEvidenceId === evidence.id}
                            />
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-medium truncate flex-1">
                                    {evidence.file_name}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
                
                {canEdit && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full gap-2 rounded-xl"
                            asChild
                        >
                            <Link href={`/portal/community-reports/${reportId}/edit`}>
                                <Paperclip className="h-4 w-4" />
                                Add More Evidence
                            </Link>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};