// components/ReporterInfoCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, User } from 'lucide-react';

interface ReporterInfoCardProps {
    isAnonymous: boolean;
    reporterName: string;
    reporterContact?: string | null;
    reporterAddress?: string | null;
}

export const ReporterInfoCard = ({ isAnonymous, reporterName, reporterContact, reporterAddress }: ReporterInfoCardProps) => {
    return (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50">
            <CardHeader className="pb-2">
                <CardTitle className="text-base lg:text-lg flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                    </div>
                    Reporter Information
                </CardTitle>
            </CardHeader>
            <CardContent>
                {isAnonymous ? (
                    <div className="text-center py-4">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center mx-auto mb-3">
                            <Shield className="h-8 w-8 text-gray-400" />
                        </div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Anonymous Report</h4>
                        <p className="text-sm text-gray-500 mt-1">Reporter's identity is protected</p>
                        <div className="mt-4 p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 text-left">
                            <p className="text-xs text-gray-500">Name</p>
                            <p className="text-sm font-medium mb-2">{reporterName}</p>
                            {reporterContact && (
                                <>
                                    <p className="text-xs text-gray-500">Contact</p>
                                    <p className="text-sm font-medium mb-2">********</p>
                                </>
                            )}
                            {reporterAddress && (
                                <>
                                    <p className="text-xs text-gray-500">Address</p>
                                    <p className="text-sm font-medium">********</p>
                                </>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <InfoField label="Name" value={reporterName} />
                        {reporterContact && <InfoField label="Contact" value={reporterContact} />}
                        {reporterAddress && <InfoField label="Address" value={reporterAddress} />}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

const InfoField = ({ label, value }: { label: string; value: string }) => (
    <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <p className="font-medium text-sm">{value}</p>
    </div>
);