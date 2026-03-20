// components/admin/households/create/WaterSourceGuide.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplets, HelpCircle } from 'lucide-react';

export default function WaterSourceGuide() {
    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-700 dark:to-cyan-700 flex items-center justify-center">
                        <Droplets className="h-3 w-3 text-white" />
                    </div>
                    Water Source Guide
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3 text-xs">
                    <div className="flex items-center gap-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                        <div className="h-3 w-3 rounded-full bg-blue-500 dark:bg-blue-400"></div>
                        <span className="text-blue-700 dark:text-blue-300">Level I: Point Source (Well, Spring)</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                        <div className="h-3 w-3 rounded-full bg-green-500 dark:bg-green-400"></div>
                        <span className="text-green-700 dark:text-green-300">Level II: Communal Faucet</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-purple-50 dark:bg-purple-900/20 rounded border border-purple-200 dark:border-purple-800">
                        <div className="h-3 w-3 rounded-full bg-purple-500 dark:bg-purple-400"></div>
                        <span className="text-purple-700 dark:text-purple-300">Level III: Waterworks System</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}