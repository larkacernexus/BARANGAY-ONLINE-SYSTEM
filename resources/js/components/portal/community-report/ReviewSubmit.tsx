// components/community-report/ReviewSubmit.tsx

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Shield, Save, Info } from 'lucide-react';
import { ReportType } from '@/types/portal/community-report';
import { iconMap, isOtherType } from '@/types/portal/communityreports/utils/community-report-helpers';

interface ReviewSubmitProps {
    selectedType: ReportType | undefined;
    data: {
        report_type_id: number | null;
        title: string;
        location: string;
        incident_date: string;
        incident_time: string;
        urgency: string;
        reporter_name: string;
        reporter_contact: string;
    };
    filesCount: number;
    existingFilesCount: number;
    anonymous: boolean;
    currentDraftId: string | null;
    onAnonymousToggle: (checked: boolean) => void;
    setData: (key: string, value: any) => void;
}

export const ReviewSubmit: React.FC<ReviewSubmitProps> = ({
    selectedType,
    data,
    filesCount,
    existingFilesCount,
    anonymous,
    currentDraftId,
    onAnonymousToggle,
    setData
}) => {
    const totalFiles = filesCount + existingFilesCount;

    return (
        <div className="space-y-6">
            {/* Report Summary */}
            <Card className="rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <CardContent className="p-4 lg:p-6">
                    <h3 className="font-medium mb-4 text-lg text-gray-900 dark:text-white">
                        Report Summary
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                            <span className="text-gray-600 dark:text-gray-400">Type</span>
                            <div className="flex items-center gap-2">
                                {selectedType && (() => {
                                    const Icon = isOtherType(selectedType) ? iconMap['help-circle'] : (iconMap[selectedType.icon] || iconMap.default);
                                    return <Icon className="h-4 w-4" style={{ color: isOtherType(selectedType) ? '#d97706' : selectedType.color }} />;
                                })()}
                                <span className="font-medium text-gray-900 dark:text-white">{selectedType?.name}</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                            <span className="text-gray-600 dark:text-gray-400">Title</span>
                            <span className="font-medium text-gray-900 dark:text-white">{data.title}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                            <span className="text-gray-600 dark:text-gray-400">Location</span>
                            <span className="font-medium text-gray-900 dark:text-white">{data.location}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                            <span className="text-gray-600 dark:text-gray-400">Date & Time</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                                {data.incident_date} {data.incident_time && 'at'} {data.incident_time}
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                            <span className="text-gray-600 dark:text-gray-400">Urgency</span>
                            <Badge 
                                variant="outline"
                                className={`
                                    ${data.urgency === 'high' 
                                        ? 'border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/30' 
                                        : data.urgency === 'medium' 
                                        ? 'border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30' 
                                        : 'border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30'
                                    }
                                `}
                            >
                                {data.urgency.charAt(0).toUpperCase() + data.urgency.slice(1)}
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                            <span className="text-gray-600 dark:text-gray-400">Attachments</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                                {totalFiles} files
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                            <span className="text-gray-600 dark:text-gray-400">Reported By</span>
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {anonymous ? 'Anonymous' : data.reporter_name}
                                </span>
                                {anonymous && (
                                    <Badge variant="outline" className="text-xs border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400">
                                        <Shield className="h-3 w-3 mr-1" />
                                        Protected
                                    </Badge>
                                )}
                            </div>
                        </div>
                        {!anonymous && data.reporter_contact && (
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                <span className="text-gray-600 dark:text-gray-400">Contact</span>
                                <span className="font-medium text-gray-900 dark:text-white">{data.reporter_contact}</span>
                            </div>
                        )}
                        {currentDraftId && (
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                <span className="text-gray-600 dark:text-gray-400">Draft Status</span>
                                <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                                    <Save className="h-3 w-3 mr-1" />
                                    Saved in Browser
                                </Badge>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Anonymous Reporting */}
            <Card className="rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <CardContent className="p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <div className="font-medium flex items-center gap-2 text-gray-900 dark:text-white">
                                <Shield className="h-4 w-4" />
                                Submit Anonymously
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {selectedType?.allows_anonymous 
                                    ? 'Your identity will be hidden from officials'
                                    : 'Not available for this report type'
                                }
                            </p>
                        </div>
                        {selectedType?.allows_anonymous ? (
                            <button
                                type="button"
                                className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700 data-[state=checked]:bg-blue-600 transition-colors"
                                onClick={() => onAnonymousToggle(!anonymous)}
                                style={{ backgroundColor: anonymous ? '#2563eb' : undefined }}
                            >
                                <span className="sr-only">Toggle anonymous</span>
                                <span 
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                        anonymous ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        ) : (
                            <div className="opacity-50 cursor-not-allowed">
                                <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700">
                                    <span className="sr-only">Toggle anonymous</span>
                                    <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Contact Information (if not anonymous) */}
            {!anonymous && (
                <Card className="rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                    <CardContent className="p-4 lg:p-6 space-y-4">
                        <h4 className="font-medium text-gray-900 dark:text-white">Contact Information</h4>
                        <div className="space-y-3">
                            <div className="space-y-2">
                                <Label htmlFor="reporter_name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Name *
                                </Label>
                                <Input
                                    id="reporter_name"
                                    value={data.reporter_name}
                                    onChange={e => setData('reporter_name', e.target.value)}
                                    placeholder="Your full name"
                                    required={!anonymous}
                                    maxLength={255}
                                    className="h-11 text-sm rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="reporter_contact" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Contact *
                                </Label>
                                <Input
                                    id="reporter_contact"
                                    type="text"
                                    value={data.reporter_contact}
                                    onChange={e => setData('reporter_contact', e.target.value)}
                                    placeholder="Email address or phone number"
                                    required={!anonymous}
                                    maxLength={255}
                                    className="h-11 text-sm rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    We'll use this to contact you about your report
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Terms Agreement */}
            <div className="p-4 border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 rounded-xl">
                <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                            By submitting, you confirm:
                        </p>
                        <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
                            <li>• All information provided is accurate and truthful</li>
                            <li>• You have provided all required evidence</li>
                            <li>• You'll receive updates on your report status</li>
                            <li>• False reports may result in penalties</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};