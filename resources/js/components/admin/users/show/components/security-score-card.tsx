// resources/js/Pages/Admin/Users/components/security-score-card.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react';
import { parseISO, differenceInDays } from 'date-fns';
import { getSecurityScore, getScoreColor, getScoreBg, getScoreLabel } from '../utils/helpers';

interface Props {
    user: any;
}

export const SecurityScoreCard = ({ user }: Props) => {
    const score = getSecurityScore(user);

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <ShieldCheck className="h-5 w-5" />
                    Security Score
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="text-center">
                    <div className={`text-5xl font-bold ${getScoreColor(score)}`}>{score}</div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{getScoreLabel(score)}</p>
                </div>
                
                <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                        className={`h-full rounded-full ${getScoreBg(score)}`}
                        style={{ width: `${score}%` }}
                    ></div>
                </div>

                <div className="space-y-2 mt-4">
                    <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${user.email_verified_at ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                        <span className="text-xs text-gray-600 dark:text-gray-400">Email verified: {user.email_verified_at ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${user.two_factor_confirmed_at ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                        <span className="text-xs text-gray-600 dark:text-gray-400">2FA enabled: {user.two_factor_confirmed_at ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${user.password_changed_at ? 'bg-green-500' : 'bg-amber-500'}`} />
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                            Password age: {user.password_changed_at 
                                ? `${differenceInDays(new Date(), parseISO(user.password_changed_at))} days`
                                : 'Never changed'}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};