import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClearanceRequest } from '@/types/clearance';

interface QuickInfoCardProps {
    clearance: ClearanceRequest;
    formatDate: (date?: string | null) => string; // Updated to match the actual function signature
}

export function QuickInfoCard({ clearance, formatDate }: QuickInfoCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm font-medium">Quick Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                    <span className="text-gray-500">Created</span>
                    <span>{formatDate(clearance.created_at)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500">Last Updated</span>
                    <span>{formatDate(clearance.updated_at)}</span>
                </div>
                {clearance.issue_date && (
                    <div className="flex justify-between">
                        <span className="text-gray-500">Issued Date</span>
                        <span>{formatDate(clearance.issue_date)}</span>
                    </div>
                )}
                {clearance.valid_until && (
                    <div className="flex justify-between">
                        <span className="text-gray-500">Valid Until</span>
                        <span>{formatDate(clearance.valid_until)}</span>
                    </div>
                )}
                {clearance.payment_date && (
                    <div className="flex justify-between">
                        <span className="text-gray-500">Payment Date</span>
                        <span>{formatDate(clearance.payment_date)}</span>
                    </div>
                )}
                {clearance.or_number && (
                    <div className="flex justify-between">
                        <span className="text-gray-500">OR Number</span>
                        <span className="font-mono text-xs">{clearance.or_number}</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}