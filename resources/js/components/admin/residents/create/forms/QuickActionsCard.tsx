// components/admin/residents/create/forms/QuickActionsCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { Download, Upload, Home, FileDown, FileUp, Users, FileSpreadsheet, HelpCircle } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface Props {
    onDownloadTemplate: () => void;
    onImportClick: () => void;
}

export default function QuickActionsCard({ onDownloadTemplate, onImportClick }: Props) {
    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-amber-600 to-yellow-600 dark:from-amber-700 dark:to-yellow-700 flex items-center justify-center">
                        <Users className="h-3 w-3 text-white" />
                    </div>
                    Quick Actions
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {/* Create Household Link */}
                <Link href="/admin/households/create" className="block">
                    <Button 
                        variant="outline" 
                        className="w-full justify-start text-sm dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        type="button"
                    >
                        <Home className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
                        <span className="flex-1 text-left">Create New Household</span>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <HelpCircle className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="text-xs">Create a new household before adding residents</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </Button>
                </Link>

                {/* Download Template Button */}
                <Button 
                    variant="outline" 
                    className="w-full justify-start text-sm dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    type="button"
                    onClick={onDownloadTemplate}
                >
                    <FileDown className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
                    <span className="flex-1 text-left">Download Import Template</span>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <HelpCircle className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="text-xs">CSV template with sample data</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </Button>

                {/* Import Residents Button */}
                <Button 
                    variant="outline" 
                    className="w-full justify-start text-sm dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    type="button"
                    onClick={onImportClick}
                >
                    <FileUp className="h-4 w-4 mr-2 text-purple-600 dark:text-purple-400" />
                    <span className="flex-1 text-left">Import Residents</span>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <HelpCircle className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="text-xs">Bulk import residents from CSV</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </Button>

                {/* Additional Info */}
                <div className="mt-4 pt-4 border-t dark:border-gray-700">
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <FileSpreadsheet className="h-3 w-3" />
                        <span>CSV format supported</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}