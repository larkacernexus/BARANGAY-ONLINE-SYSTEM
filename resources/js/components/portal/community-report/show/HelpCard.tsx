// components/HelpCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { Phone, HelpCircle, MessageSquare } from 'lucide-react';

export const HelpCard = () => {
    return (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50">
            <CardHeader className="pb-2">
                <CardTitle className="text-base lg:text-lg flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                        <HelpCircle className="h-4 w-4 text-white" />
                    </div>
                    Need Help?
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <HelpContactItem icon={Phone} title="Emergency Hotline" value="911" />
                <HelpContactItem icon={Phone} title="Barangay Hotline" value="(02) 123-4567" />
                <Button variant="outline" className="w-full rounded-xl" asChild>
                    <Link href="/resident/support">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Contact Support
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
};

const HelpContactItem = ({ icon: Icon, title, value }: { icon: any; title: string; value: string }) => (
    <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 flex items-center gap-3">
        <Icon className="h-5 w-5 text-gray-400" />
        <div>
            <p className="font-medium text-sm">{title}</p>
            <p className="text-xs text-gray-500">{value}</p>
        </div>
    </div>
);