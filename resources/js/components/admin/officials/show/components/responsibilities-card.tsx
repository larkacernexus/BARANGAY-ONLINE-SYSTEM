// resources/js/Pages/Admin/Officials/components/responsibilities-card.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

interface Props {
    official: any;
}

export const ResponsibilitiesCard = ({ official }: Props) => {
    const [expanded, setExpanded] = useState(false);

    if (!official.responsibilities) {
        return (
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <FileText className="h-5 w-5" />
                        Responsibilities
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-500 dark:text-gray-400 italic">No responsibilities specified</p>
                </CardContent>
            </Card>
        );
    }

    const isLongText = official.responsibilities.length > 200;
    const displayText = expanded || !isLongText 
        ? official.responsibilities 
        : official.responsibilities.slice(0, 200) + '...';

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <FileText className="h-5 w-5" />
                    Responsibilities
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="prose max-w-none dark:prose-invert">
                    <p className="whitespace-pre-wrap dark:text-gray-300">{displayText}</p>
                </div>
                {isLongText && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpanded(!expanded)}
                        className="mt-2"
                    >
                        {expanded ? 'Show less' : 'Read more'}
                    </Button>
                )}
            </CardContent>
        </Card>
    );
};