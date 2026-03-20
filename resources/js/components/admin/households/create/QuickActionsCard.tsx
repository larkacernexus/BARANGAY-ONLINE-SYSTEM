// components/admin/households/create/QuickActionsCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Upload, Printer, Save, FileText, HelpCircle } from 'lucide-react';
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
                        <Save className="h-3 w-3 text-white" />
                    </div>
                    Quick Actions
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button 
                                variant="outline" 
                                className="w-full justify-start text-sm dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" 
                                type="button"
                                onClick={onDownloadTemplate}
                            >
                                <Download className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
                                <span className="flex-1 text-left">Download CSV Template</span>
                                <HelpCircle className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="text-xs">Template for bulk household import</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button 
                                variant="outline" 
                                className="w-full justify-start text-sm dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" 
                                type="button"
                                onClick={onImportClick}
                            >
                                <Upload className="h-4 w-4 mr-2 text-purple-600 dark:text-purple-400" />
                                <span className="flex-1 text-left">Import Households</span>
                                <HelpCircle className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="text-xs">Bulk import households from CSV</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button 
                                variant="outline" 
                                className="w-full justify-start text-sm dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" 
                                type="button"
                            >
                                <Printer className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
                                <span className="flex-1 text-left">Print Registration Form</span>
                                <HelpCircle className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="text-xs">Print blank registration form</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button 
                                variant="outline" 
                                className="w-full justify-start text-sm dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" 
                                type="button"
                            >
                                <Save className="h-4 w-4 mr-2 text-amber-600 dark:text-amber-400" />
                                <span className="flex-1 text-left">Save as Template</span>
                                <HelpCircle className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="text-xs">Save current form as template</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button 
                                variant="outline" 
                                className="w-full justify-start text-sm dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" 
                                type="button"
                            >
                                <FileText className="h-4 w-4 mr-2 text-indigo-600 dark:text-indigo-400" />
                                <span className="flex-1 text-left">Generate Household ID</span>
                                <HelpCircle className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="text-xs">Generate a new household ID</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </CardContent>
        </Card>
    );
}