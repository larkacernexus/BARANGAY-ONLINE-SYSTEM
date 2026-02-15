import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Link, router } from '@inertiajs/react';
import { CommunityReport } from '@/admin-utils/communityReportTypes';
import { formatDateTime } from '@/admin-utils/communityReportHelpers';
import { Eye } from 'lucide-react';

interface CommunityReportExpandedRowProps {
    report: CommunityReport;
    isBulkMode: boolean;
}

export default function CommunityReportExpandedRow({
    report,
    isBulkMode
}: CommunityReportExpandedRowProps) {
    return (
        <TableRow className="bg-gray-50">
            <TableCell colSpan={isBulkMode ? 7 : 6} className="px-4 py-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Detailed Description</h4>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">
                            {report.detailed_description || report.description || 'No detailed description provided.'}
                        </p>
                        {report.preferred_resolution && (
                            <div className="mt-3">
                                <h4 className="text-sm font-medium text-gray-900 mb-2">Preferred Resolution</h4>
                                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                                    {report.preferred_resolution}
                                </p>
                            </div>
                        )}
                        {report.resolution_notes && (
                            <div className="mt-3">
                                <h4 className="text-sm font-medium text-gray-900 mb-2">Resolution Notes</h4>
                                <p className="text-sm text-gray-600 whitespace-pre-wrap bg-green-50 p-2 rounded border">
                                    {report.resolution_notes}
                                </p>
                            </div>
                        )}
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Additional Information</h4>
                        <div className="space-y-2 text-sm">
                            <div>
                                <span className="text-gray-600">Source:</span>{' '}
                                <span className="font-medium capitalize">{report.source || 'Unknown'}</span>
                            </div>
                            <div>
                                <span className="text-gray-600">Created:</span>{' '}
                                <span className="font-medium">{formatDateTime(report.created_at)}</span>
                            </div>
                            <div>
                                <span className="text-gray-600">Updated:</span>{' '}
                                <span className="font-medium">{formatDateTime(report.updated_at)}</span>
                            </div>
                            {report.perpetrator_details && (
                                <div>
                                    <span className="text-gray-600">Perpetrator Details:</span>{' '}
                                    <span className="font-medium">{report.perpetrator_details}</span>
                                </div>
                            )}
                            {report.noise_level && (
                                <div>
                                    <span className="text-gray-600">Noise Level:</span>{' '}
                                    <span className="font-medium capitalize">{report.noise_level}</span>
                                </div>
                            )}
                            {report.estimated_affected_count && (
                                <div>
                                    <span className="text-gray-600">Estimated Affected:</span>{' '}
                                    <span className="font-medium">{report.estimated_affected_count} people ({report.affected_people})</span>
                                </div>
                            )}
                            {report.evidences && report.evidences.length > 0 && (
                                <div>
                                    <span className="text-gray-600">Evidence Files:</span>{' '}
                                    <span className="font-medium">{report.evidences.length} file(s)</span>
                                </div>
                            )}
                            {report.has_previous_report && report.previous_report_id && (
                                <div className="flex items-center gap-1">
                                    <span className="text-gray-600">Previous Report:</span>
                                    <Link 
                                        href={`/admin/community-reports/${report.previous_report_id}`}
                                        className="text-blue-600 hover:underline"
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
                                className="h-8"
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