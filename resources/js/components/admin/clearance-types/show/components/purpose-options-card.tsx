// resources/js/Pages/Admin/ClearanceTypes/components/purpose-options-card.tsx
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen } from 'lucide-react';

interface Props {
    options: string[];
}

export const PurposeOptionsCard = ({ options }: Props) => {
    if (options.length === 0) return null;

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <BookOpen className="h-5 w-5" />
                    Purpose Options
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                    Common purposes for this clearance
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-2">
                    {options.map((purpose, index) => (
                        <Badge key={index} variant="secondary" className="dark:bg-gray-700 dark:text-gray-300">
                            {purpose}
                        </Badge>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};