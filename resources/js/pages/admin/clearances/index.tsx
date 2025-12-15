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
    FileText,
    CheckCircle,
    Clock,
    XCircle,
    User,
    Calendar,
    Eye,
    Edit,
    Printer,
    Trash2
} from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function Clearances() {
    const clearances = [
        {
            id: 1,
            clearanceNo: 'CLR-2024-001',
            resident: 'Juan Dela Cruz',
            type: 'Business',
            purpose: 'Business Permit Application',
            issueDate: '2024-03-01',
            expiryDate: '2024-06-01',
            status: 'Issued',
            officer: 'Maria Santos'
        },
        {
            id: 2,
            clearanceNo: 'CLR-2024-002',
            resident: 'Pedro Reyes',
            type: 'Residency',
            purpose: 'School Requirement',
            issueDate: '2024-03-02',
            expiryDate: '2024-06-02',
            status: 'Pending',
            officer: 'Juan Dela Cruz'
        },
        {
            id: 3,
            clearanceNo: 'CLR-2024-003',
            resident: 'Maria Santos',
            type: 'Good Moral',
            purpose: 'Employment',
            issueDate: '2024-03-03',
            expiryDate: '2024-06-03',
            status: 'Rejected',
            officer: 'Ana Torres'
        },
    ];

    const stats = [
        { label: 'Total Issued', value: '156', change: '+12 this month' },
        { label: 'Pending Approval', value: '12', change: '3 new today' },
        { label: 'Expiring Soon', value: '8', change: 'Within 30 days' },
        { label: 'Rejected', value: '5', change: 'This month' },
    ];

    const clearanceTypes = [
        { type: 'Business Clearance', count: 45, fee: '₱200' },
        { type: 'Residency', count: 32, fee: '₱100' },
        { type: 'Good Moral', count: 28, fee: '₱150' },
        { type: 'Barangay ID', count: 51, fee: '₱50' },
    ];

    return (
        <AuthenticatedLayout
            title="Clearances"
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Clearances', href: '/clearances' }
            ]}
        >
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Clearance Management</h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            Issue and manage barangay clearances and certificates
                        </p>
                    </div>
                    <Link href="/clearances/create">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Issue Clearance
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

                {/* Clearance Types */}
                <Card>
                    <CardHeader>
                        <CardTitle>Clearance Types</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {clearanceTypes.map((item) => (
                                <div key={item.type} className="border rounded-lg p-4">
                                    <div className="text-sm font-medium text-gray-500">{item.type}</div>
                                    <div className="text-2xl font-bold mt-1">{item.count}</div>
                                    <div className="text-sm text-gray-500">Fee: {item.fee}</div>
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
                                <Input placeholder="Search clearances by number, resident name..." className="pl-10" />
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline">
                                    <Filter className="h-4 w-4 mr-2" />
                                    Filter by Status
                                </Button>
                                <Button variant="outline">
                                    <Download className="h-4 w-4 mr-2" />
                                    Export
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Clearances Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Clearances</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Clearance No.</TableHead>
                                    <TableHead>Resident</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Purpose</TableHead>
                                    <TableHead>Issue Date</TableHead>
                                    <TableHead>Expiry Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {clearances.map((clearance) => {
                                    const getStatusIcon = () => {
                                        switch (clearance.status) {
                                            case 'Issued': return <CheckCircle className="h-4 w-4 text-green-500" />;
                                            case 'Pending': return <Clock className="h-4 w-4 text-amber-500" />;
                                            case 'Rejected': return <XCircle className="h-4 w-4 text-red-500" />;
                                            default: return null;
                                        }
                                    };

                                    const getStatusVariant = () => {
                                        switch (clearance.status) {
                                            case 'Issued': return 'default';
                                            case 'Pending': return 'secondary';
                                            case 'Rejected': return 'destructive';
                                            default: return 'outline';
                                        }
                                    };

                                    return (
                                        <TableRow key={clearance.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-gray-500" />
                                                    {clearance.clearanceNo}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4" />
                                                    {clearance.resident}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{clearance.type}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="max-w-[200px] truncate">
                                                    {clearance.purpose}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {clearance.issueDate}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {clearance.expiryDate}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusVariant()} className="flex items-center gap-1 w-fit">
                                                    {getStatusIcon()}
                                                    {clearance.status}
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
                                                    <Button size="sm" variant="ghost">
                                                        <Trash2 className="h-4 w-4" />
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