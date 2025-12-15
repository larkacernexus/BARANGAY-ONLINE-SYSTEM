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
    Home,
    Users,
    Phone,
    MapPin,
    Eye,
    Edit,
    Trash2
} from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function Households() {
    const households = [
        {
            id: 1,
            householdNumber: 'HH-2024-001',
            headOfFamily: 'Juan Dela Cruz',
            members: 5,
            contact: '09123456789',
            address: '123 Main St, Purok 1',
            purok: 'Purok 1',
            registrationDate: '2023-01-15',
            status: 'Active'
        },
        {
            id: 2,
            householdNumber: 'HH-2024-002',
            headOfFamily: 'Maria Santos',
            members: 4,
            contact: '09123456788',
            address: '456 Elm St, Purok 2',
            purok: 'Purok 2',
            registrationDate: '2023-02-20',
            status: 'Active'
        },
        {
            id: 3,
            householdNumber: 'HH-2024-003',
            headOfFamily: 'Pedro Reyes',
            members: 3,
            contact: '09123456787',
            address: '789 Oak St, Purok 3',
            purok: 'Purok 3',
            registrationDate: '2023-03-10',
            status: 'Inactive'
        },
    ];

    const stats = [
        { label: 'Total Households', value: '678' },
        { label: 'Active Households', value: '650' },
        { label: 'Total Members', value: '2,847' },
        { label: 'Average Members', value: '4.2' },
    ];

    return (
        <AuthenticatedLayout
            title="Households"
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Households', href: '/households' }
            ]}
        >
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Household Management</h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            Manage household registrations and information
                        </p>
                    </div>
                    <Link href="/households/create">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Register Household
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
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Search and Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input placeholder="Search households by name, number, or address..." className="pl-10" />
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline">
                                    <Filter className="h-4 w-4 mr-2" />
                                    Filters
                                </Button>
                                <Button variant="outline">
                                    <Download className="h-4 w-4 mr-2" />
                                    Export
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Households Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Household List</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Household No.</TableHead>
                                    <TableHead>Head of Family</TableHead>
                                    <TableHead>Members</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Address</TableHead>
                                    <TableHead>Purok</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {households.map((household) => (
                                    <TableRow key={household.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <Home className="h-4 w-4 text-gray-500" />
                                                {household.householdNumber}
                                            </div>
                                        </TableCell>
                                        <TableCell>{household.headOfFamily}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4" />
                                                {household.members} members
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Phone className="h-3 w-3" />
                                                {household.contact}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                <span className="truncate max-w-[150px]">{household.address}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{household.purok}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={household.status === 'Active' ? 'default' : 'secondary'}>
                                                {household.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button size="sm" variant="ghost">
                                                    <Eye className="h-4 w-4" />
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
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}