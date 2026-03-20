// resources/js/Pages/Admin/DocumentTypes/components/settings-tab.tsx
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Settings,
    Zap,
    XCircle,
    CheckCircle,
    FileCheck,
    FileX,
    Copy,
} from 'lucide-react';

interface Props {
    documentType: any;
    onToggleStatus: () => void;
    onToggleRequired: () => void;
    onDuplicate: () => void;
}

export const SettingsTab = ({ documentType, onToggleStatus, onToggleRequired, onDuplicate }: Props) => {
    return (
        <div className="grid gap-6 lg:grid-cols-2">
            {/* Settings Card */}
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <Settings className="h-5 w-5" />
                        Document Type Settings
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                        Configure additional settings for this document type
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                            <div>
                                <div className="font-medium dark:text-gray-200">Status</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Whether this document type is active</div>
                            </div>
                            <Badge className={documentType.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}>
                                {documentType.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                        </div>
                        <Separator className="dark:bg-gray-700" />
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                            <div>
                                <div className="font-medium dark:text-gray-200">Requirement</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Whether this document is required</div>
                            </div>
                            <Badge className={documentType.is_required ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'}>
                                {documentType.is_required ? 'Required' : 'Optional'}
                            </Badge>
                        </div>
                        <Separator className="dark:bg-gray-700" />
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                            <div>
                                <div className="font-medium dark:text-gray-200">Sort Order</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Display order in lists</div>
                            </div>
                            <span className="font-mono dark:text-gray-300">{documentType.sort_order}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions Card */}
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <Zap className="h-5 w-5" />
                        Quick Actions
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Button 
                        variant="outline" 
                        className="w-full justify-start dark:border-gray-600 dark:text-gray-300"
                        onClick={onToggleStatus}
                    >
                        {documentType.is_active ? (
                            <>
                                <XCircle className="h-4 w-4 mr-2" />
                                Deactivate Document Type
                            </>
                        ) : (
                            <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Activate Document Type
                            </>
                        )}
                    </Button>
                    
                    <Button 
                        variant="outline" 
                        className="w-full justify-start dark:border-gray-600 dark:text-gray-300"
                        onClick={onToggleRequired}
                    >
                        {documentType.is_required ? (
                            <>
                                <FileX className="h-4 w-4 mr-2" />
                                Mark as Optional
                            </>
                        ) : (
                            <>
                                <FileCheck className="h-4 w-4 mr-2" />
                                Mark as Required
                            </>
                        )}
                    </Button>
                    
                    <Button 
                        variant="outline" 
                        className="w-full justify-start dark:border-gray-600 dark:text-gray-300"
                        onClick={onDuplicate}
                    >
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate Document Type
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};