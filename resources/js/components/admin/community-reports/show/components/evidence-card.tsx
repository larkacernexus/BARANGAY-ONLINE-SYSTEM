// resources/js/components/admin/community-reports/show/components/evidence-card.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Paperclip, Eye, Download, FileImage, FileVideo, FileText } from 'lucide-react';
import { CommunityReport } from '@/types/admin/reports/community-report';

interface EvidenceCardProps {
    report: CommunityReport;
}

export function EvidenceCard({ report }: EvidenceCardProps) {
    const hasEvidences = report.evidences && report.evidences.length > 0;

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-700 dark:to-orange-700 flex items-center justify-center">
                        <Paperclip className="h-3 w-3 text-white" />
                    </div>
                    Evidence Files
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                    Attached evidence and documentation
                </CardDescription>
            </CardHeader>
            <CardContent>
                {hasEvidences ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {report.evidences!.map((evidence) => {
                                const isImage = evidence.file_type?.includes('image') || /\.(jpg|jpeg|png|gif|webp)$/i.test(evidence.file_name);
                                const isVideo = evidence.file_type?.includes('video') || /\.(mp4|mov|avi|wmv)$/i.test(evidence.file_name);
                                const fileUrl = evidence.url || `/storage/${evidence.file_path}`;
                                
                                return (
                                    <div key={evidence.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white dark:bg-gray-900/50">
                                        <div className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg shrink-0 ${
                                                    isImage ? 'bg-blue-100 dark:bg-blue-900/30' :
                                                    isVideo ? 'bg-purple-100 dark:bg-purple-900/30' :
                                                    'bg-gray-100 dark:bg-gray-700'
                                                }`}>
                                                    {isImage ? (
                                                        <FileImage className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                    ) : isVideo ? (
                                                        <FileVideo className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                                    ) : (
                                                        <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate dark:text-gray-200">
                                                        {evidence.file_name}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {isImage ? 'Image' : isVideo ? 'Video' : 'Document'}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {(evidence.file_size / 1024).toFixed(1)} KB
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-900/50 px-4 py-2 flex justify-end gap-2 border-t dark:border-gray-700">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => window.open(fileUrl, '_blank')}
                                                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-xs"
                                            >
                                                <Eye className="h-3 w-3 mr-1" />
                                                View
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    const a = document.createElement('a');
                                                    a.href = fileUrl;
                                                    a.download = evidence.file_name;
                                                    a.click();
                                                }}
                                                className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 text-xs"
                                            >
                                                <Download className="h-3 w-3 mr-1" />
                                                Download
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Paperclip className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                            No Evidence Files
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            No evidence files have been attached to this report.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}