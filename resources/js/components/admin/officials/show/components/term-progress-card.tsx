// resources/js/Pages/Admin/Officials/components/term-progress-card.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import { differenceInDays } from 'date-fns';

interface Props {
    official: any;
    formatDate: (date: string, includeTime?: boolean) => string;
}

export const TermProgressCard = ({ official, formatDate }: Props) => {
    const calculateTermProgress = () => {
        const start = new Date(official.term_start).getTime();
        const end = new Date(official.term_end).getTime();
        const now = new Date().getTime();
        
        if (now < start) return 0;
        if (now > end) return 100;
        
        const total = end - start;
        const elapsed = now - start;
        return Math.round((elapsed / total) * 100);
    };

    const termProgress = calculateTermProgress();
    
    const getTermStatusColor = () => {
        if (!official.is_current) return 'bg-gray-400 dark:bg-gray-600';
        if (termProgress > 80) return 'bg-amber-500 dark:bg-amber-600';
        if (termProgress > 50) return 'bg-green-500 dark:bg-green-600';
        return 'bg-blue-500 dark:bg-blue-600';
    };

    const getDaysRemaining = () => {
        const end = new Date(official.term_end);
        const now = new Date();
        const diffDays = differenceInDays(end, now);
        return diffDays > 0 ? diffDays : 0;
    };

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <Calendar className="h-5 w-5" />
                    Term Progress
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Started</p>
                        <p className="font-medium dark:text-gray-200">{formatDate(official.term_start)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Ends</p>
                        <p className="font-medium dark:text-gray-200">{formatDate(official.term_end)}</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="dark:text-gray-300">Term Progress</span>
                        <span className="dark:text-gray-300">{termProgress}%</span>
                    </div>
                    <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                            className={`h-full rounded-full ${getTermStatusColor()}`}
                            style={{ width: `${termProgress}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>Start: {formatDate(official.term_start)}</span>
                        <span>End: {formatDate(official.term_end)}</span>
                    </div>
                </div>

                {official.is_current && (
                    <div className={`p-3 rounded-lg ${
                        termProgress > 80 
                            ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800' 
                            : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                    }`}>
                        <div className="flex items-center gap-2">
                            {termProgress > 80 ? (
                                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            ) : (
                                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                            )}
                            <span className="text-sm font-medium dark:text-gray-200">
                                {termProgress > 80 
                                    ? `${getDaysRemaining()} days remaining in term`
                                    : 'Currently serving their term'
                                }
                            </span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};