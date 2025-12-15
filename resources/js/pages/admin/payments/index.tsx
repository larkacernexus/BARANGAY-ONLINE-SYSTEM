import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Search,
    Filter,
    Download,
    Plus,
    CreditCard,
    CheckCircle,
    XCircle,
    Clock,
    User,
    Receipt,
    Eye,
    Edit,
    Printer
} from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function Payments() {
    const payments = [
        {
            id: 1,
            receiptNo: 'RCPT-2024-001',
            resident: 'Juan Dela Cruz',
            type: 'Business Tax',
            amount: '₱2,500.00',
            date: '2024-03-01',
            dueDate: '2024-03-15',
            status: 'Paid',
            officer: 'Maria Santos'
        },
        {
            id: 2,
            receiptNo: 'RCPT-2024-002',
            resident: 'Pedro Reyes',
            type: 'Real Property Tax',
            amount: '₱1,800.00',
            date: '2024-03-02',
            dueDate: '2024-03-20',
            status: 'Pending',
            officer: 'Juan Dela Cruz'
        },
        {
            id: 3,
            receiptNo: 'RCPT-2024-003',
            resident: 'Maria Santos',
            type: 'Clearance Fee',
            amount: '₱200.00',
            date: '2024-03-03',
            dueDate: '2024-03-10',
            status: 'Overdue',
            officer: 'Ana Torres'
        },
    ];

    const stats = [
        { label: 'Total Collected', value: '₱245,780', change: '+12% from last month' },
        { label: 'Pending Payments', value: '₱45,200', change: '23 payments pending' },
        { label: 'Overdue', value: '₱12,500', change: '8 payments overdue' },
        { label: 'This Month', value: '₱45,780', change: 'On track to target' },
    ];

    const paymentTypes = [
        { type: 'Business Tax', count: 45, amount: '₱112,500' },
        { type: 'Real Property Tax', count: 32, amount: '₱57,600' },
        { type: 'Clearance Fees', count: 89, amount: '₱17,800' },
        { type: 'Other Fees', count: 23, amount: '₱12,880' },
    ];

    return (
        <AuthenticatedLayout
            title="Payments"
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Payments', href: '/payments' }
            ]}
        >
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Payment Management</h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            Manage tax collections, fees, and billing
                        </p>
                    </div>
                    <Link href="/payments/create">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Record Payment
                        </Button>
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat) => (
                        <Card key={stat.label}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-500">
                                    {stat.label}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Payment Types Overview */}
                <Card>
                    <CardHeader>
                        <CardTitle>Payment Types Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {paymentTypes.map((item) => (
                                <div key={item.type} className="border rounded-lg p-4">
                                    <div className="text-sm font-medium text-gray-500">{item.type}</div>
                                    <div className="text-2xl font-bold mt-1">{item.amount}</div>
                                    <div className="text-sm text-gray-500">{item.count} transactions</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Search and Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input placeholder="Search payments by receipt number, resident name..." className="pl-10" />
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline">
                                    <Filter className="h-4 w-4 mr-2" />
                                    Filter by Status
                                </Button>
                                <Button variant="outline">
                                    <Download className="h-4 w-4 mr-2" />
                                    Export Report
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Payments Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Payments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Receipt No.</TableHead>
                                    <TableHead>Resident</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Due Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {payments.map((payment) => {
                                    const getStatusIcon = () => {
                                        switch (payment.status) {
                                            case 'Paid': return <CheckCircle className="h-4 w-4 text-green-500" />;
                                            case 'Pending': return <Clock className="h-4 w-4 text-amber-500" />;
                                            case 'Overdue': return <XCircle className="h-4 w-4 text-red-500" />;
                                            default: return null;
                                        }
                                    };

                                    const getStatusVariant = () => {
                                        switch (payment.status) {
                                            case 'Paid': return 'default';
                                            case 'Pending': return 'secondary';
                                            case 'Overdue': return 'destructive';
                                            default: return 'outline';
                                        }
                                    };

                                    return (
                                        <TableRow key={payment.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Receipt className="h-4 w-4 text-gray-500" />
                                                    {payment.receiptNo}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4" />
                                                    {payment.resident}
                                                </div>
                                            </TableCell>
                                            <TableCell>{payment.type}</TableCell>
                                            <TableCell className="font-bold">{payment.amount}</TableCell>
                                            <TableCell>{payment.date}</TableCell>
                                            <TableCell>{payment.dueDate}</TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusVariant()} className="flex items-center gap-1 w-fit">
                                                    {getStatusIcon()}
                                                    {payment.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Button size="sm" variant="ghost">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="sm" variant="ghost">
                                                        <Printer className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="sm" variant="ghost">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}