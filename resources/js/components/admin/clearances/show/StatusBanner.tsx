import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, CheckCircle, Eye, Printer, Download } from 'lucide-react';
import { ClearanceRequest } from '@/types/admin/clearances/clearance'; // Fix import path

interface StatusBannerProps {
    clearance: ClearanceRequest;
    validityStatus: { text: string; color: string } | null;
    formatDate: (date?: string) => string;
    onPreview: () => void;
    onPrint: () => void;
    onDownload: () => void;
}

export function StatusBanner({ 
    clearance, 
    validityStatus, 
    formatDate, 
    onPreview, 
    onPrint, 
    onDownload 
}: StatusBannerProps) {
    if (clearance.status !== 'issued' || !validityStatus) return null;

    // Check payment status from payment object or payment_status property
    const isPaid = clearance.payment?.status === 'completed' || clearance.payment_status === 'completed';
    const paymentStatus = clearance.payment?.status || clearance.payment_status;

    return (
        <Card className={`border-l-4 ${validityStatus.color.includes('green') ? 'border-l-green-500' : validityStatus.color.includes('amber') ? 'border-l-amber-500' : 'border-l-red-500'}`}>
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Shield className={`h-5 w-5 ${validityStatus.color}`} />
                        <div>
                            <p className="font-medium">Clearance Status</p>
                            <p className={`text-sm ${validityStatus.color}`}>
                                {validityStatus.text} • Issued on {formatDate(clearance.issue_date)} • Valid until {formatDate(clearance.valid_until)}
                                {isPaid && (
                                    <span className="ml-2 inline-flex items-center gap-1 text-green-600">
                                        <CheckCircle className="h-3 w-3" />
                                        Paid
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                    {isPaid ? (
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={onPreview}>
                                <Eye className="h-4 w-4 mr-2" />
                                Preview
                            </Button>
                            <Button variant="outline" size="sm" onClick={onPrint}>
                                <Printer className="h-4 w-4 mr-2" />
                                Print Clearance
                            </Button>
                        </div>
                    ) : (
                        <Button variant="outline" size="sm" onClick={onDownload}>
                            <Download className="h-4 w-4 mr-2" />
                            Download Certificate
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}