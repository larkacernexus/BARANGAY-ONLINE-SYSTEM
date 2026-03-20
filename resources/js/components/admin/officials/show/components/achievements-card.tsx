// resources/js/Pages/Admin/Officials/components/achievements-card.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy } from 'lucide-react';

interface Props {
    official: any;
}

export const AchievementsCard = ({ official }: Props) => {
    const [expanded, setExpanded] = useState(false);

    if (!official.achievements) {
        return null;
    }

    const isLongText = official.achievements.length > 200;
    const displayText = expanded || !isLongText 
        ? official.achievements 
        : official.achievements.slice(0, 200) + '...';

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <Trophy className="h-5 w-5" />
                    Achievements & Recognition
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