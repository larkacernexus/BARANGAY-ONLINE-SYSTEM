// components/admin/dashboard/PendingRequests.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
    FileText, CreditCard, AlertTriangle, CheckCircle, 
    Clock, ArrowRight, ChevronRight 
} from 'lucide-react';
import { Link } from '@inertiajs/react';

interface PendingRequestsProps {
    requests: {
        clearances: number;
        payments: number;
        reports: number;
        approvals: number;
    };
}

export function PendingRequests({ requests }: PendingRequestsProps) {
    const totalPending = requests.clearances + requests.payments + requests.reports + requests.approvals;
    
    const items = [
        {
            label: 'Clearances',
            value: requests.clearances,
            icon: FileText,
            color: 'text-purple-600 dark:text-purple-400',
            bgColor: 'bg-purple-100 dark:bg-purple-900/30',
            href: '/admin/clearances?status=pending',
            progressColor: 'bg-purple-500'
        },
        {
            label: 'Payments',
            value: requests.payments,
            icon: CreditCard,
            color: 'text-blue-600 dark:text-blue-400',
            bgColor: 'bg-blue-100 dark:bg-blue-900/30',
            href: '/admin/payments?status=pending',
            progressColor: 'bg-blue-500'
        },
        {
            label: 'Reports',
            value: requests.reports,
            icon: AlertTriangle,
            color: 'text-amber-600 dark:text-amber-400',
            bgColor: 'bg-amber-100 dark:bg-amber-900/30',
            href: '/admin/community-reports?status=pending',
            progressColor: 'bg-amber-500'
        },
        {
            label: 'Approvals',
            value: requests.approvals,
            icon: CheckCircle,
            color: 'text-green-600 dark:text-green-400',
            bgColor: 'bg-green-100 dark:bg-green-900/30',
            href: '/admin/approvals',
            progressColor: 'bg-green-500'
        }
    ];

    if (totalPending === 0) {
        return (
            <Card className="dark:bg-gray-900">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        Pending Requests
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <CheckCircle className="h-12 w-12 mx-auto text-green-300 dark:text-green-700 mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">All caught up! No pending requests</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        Pending Requests
                    </CardTitle>
                    <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                        {totalPending} total
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {items.map((item) => (
                        <Link 
                            key={item.label} 
                            href={item.href}
                            className="block group"
                        >
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`p-1.5 rounded-md ${item.bgColor}`}>
                                            <item.icon className={`h-4 w-4 ${item.color}`} />
                                        </div>
                                        <span className="text-sm font-medium dark:text-gray-300">
                                            {item.label}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-bold dark:text-gray-100">
                                            {item.value}
                                        </span>
                                        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                                    </div>
                                </div>
                                <Progress 
                                    value={(item.value / totalPending) * 100} 
                                    className={`h-1.5 dark:bg-gray-700 ${item.progressColor}`}
                                />
                            </div>
                        </Link>
                    ))}
                </div>
                
                <div className="mt-4 pt-3 border-t dark:border-gray-700">
                    <Link href="/admin/dashboard/pending">
                        <Button variant="ghost" size="sm" className="w-full text-xs gap-1">
                            View All Pending Requests
                            <ChevronRight className="h-3 w-3" />
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}