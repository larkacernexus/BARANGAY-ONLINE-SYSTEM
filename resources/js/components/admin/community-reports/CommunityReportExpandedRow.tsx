// resources/js/components/admin/community-reports/CommunityReportExpandedRow.tsx

import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Link, router } from '@inertiajs/react';
import { formatDateTime } from '@/admin-utils/communityReportHelpers';
import { Eye } from 'lucide-react';

// Import types from the correct path
import type { CommunityReport } from '@/types/admin/reports/community-report';

interface CommunityReportExpandedRowProps {
    report: CommunityReport;
    isBulkMode: boolean;
}

export default function CommunityReportExpandedRow({
    report,
    isBulkMode
}: CommunityReportExpandedRowProps) {
    // Safe access to properties
    const hasDetailedDescription = report.detailed_description || report.description;
    const hasPreferredResolution = report.preferred_resolution;
    const hasResolutionNotes = report.resolution_notes;
    const hasPerpetratorDetails = report.perpetrator_details;
    const hasNoiseLevel = report.noise_level;
    const hasEstimatedAffectedCount = report.estimated_affected_count;
    const hasEvidences = report.evidences && report.evidences.length > 0;
    const hasPreviousReport = report.has_previous_report && report.previous_report_id;
    
    return (
        <TableRow className="bg-gray-50 dark:bg-gray-900/50">
            <TableCell 
                colSpan={isBulkMode ? 7 : 6} 
                className="px-4 py-3 dark:border-gray-700"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left Column - Description and Resolution */}
                    <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-200 mb-2">
                            Detailed Description
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                            {hasDetailedDescription || 'No detailed description provided.'}
                        </p>
                        
                        {hasPreferredResolution && (
                            <div className="mt-3">
                                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-200 mb-2">
                                    Preferred Resolution
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                                    {report.preferred_resolution}
                                </p>
                            </div>
                        )}
                        
                        {hasResolutionNotes && (
                            <div className="mt-3">
                                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-200 mb-2">
                                    Resolution Notes
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap bg-green-50 dark:bg-green-950/30 p-2 rounded border border-green-200 dark:border-green-800">
                                    {report.resolution_notes}
                                </p>
                            </div>
                        )}
                    </div>
                    
                    {/* Right Column - Additional Information */}
                    <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-200 mb-2">
                            Additional Information
                        </h4>
                        <div className="space-y-2 text-sm">
                            <div>
                                <span className="text-gray-600 dark:text-gray-400">Source:</span>{' '}
                                <span className="font-medium dark:text-gray-300 capitalize">
                                    {report.source || 'Unknown'}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-600 dark:text-gray-400">Created:</span>{' '}
                                <span className="font-medium dark:text-gray-300">
                                    {formatDateTime(report.created_at)}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-600 dark:text-gray-400">Updated:</span>{' '}
                                <span className="font-medium dark:text-gray-300">
                                    {formatDateTime(report.updated_at)}
                                </span>
                            </div>
                            
                            {hasPerpetratorDetails && (
                                <div>
                                    <span className="text-gray-600 dark:text-gray-400">Perpetrator Details:</span>{' '}
                                    <span className="font-medium dark:text-gray-300">
                                        {report.perpetrator_details}
                                    </span>
                                </div>
                            )}
                            
                            {hasNoiseLevel && (
                                <div>
                                    <span className="text-gray-600 dark:text-gray-400">Noise Level:</span>{' '}
                                    <span className="font-medium dark:text-gray-300 capitalize">
                                        {report.noise_level}
                                    </span>
                                </div>
                            )}
                            
                            {hasEstimatedAffectedCount && (
                                <div>
                                    <span className="text-gray-600 dark:text-gray-400">Estimated Affected:</span>{' '}
                                    <span className="font-medium dark:text-gray-300">
                                        {report.estimated_affected_count} people ({report.affected_people})
                                    </span>
                                </div>
                            )}
                            
                            {hasEvidences && (
                                <div>
                                    <span className="text-gray-600 dark:text-gray-400">Evidence Files:</span>{' '}
                                    <span className="font-medium dark:text-gray-300">
                                        {report.evidences!.length} file(s)
                                    </span>
                                </div>
                            )}
                            
                            {hasPreviousReport && (
                                <div className="flex items-center gap-1">
                                    <span className="text-gray-600 dark:text-gray-400">Previous Report:</span>
                                    <Link 
                                        href={`/admin/community-reports/${report.previous_report_id}`}
                                        className="text-blue-600 hover:underline dark:text-blue-400"
                                    >
                                        View Related Report
                                    </Link>
                                </div>
                            )}
                        </div>
                        
                        <div className="mt-3 flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.visit(`/admin/community-reports/${report.id}`)}
                                className="h-8 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                                <Eye className="h-3 w-3 mr-2" />
                                Full Details
                            </Button>
                        </div>
                    </div>
                </div>
            </TableCell>
        </TableRow>
    );
}