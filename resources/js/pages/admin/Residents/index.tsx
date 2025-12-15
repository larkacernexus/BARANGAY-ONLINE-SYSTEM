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
    MoreHorizontal,
    User,
    Home,
    Phone,
    Mail,
    Edit,
    Eye,
    Trash2
} from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function Residents() {
    const residents = [
        {
            id: 1,
            name: 'Juan Dela Cruz',
            age: 35,
            gender: 'Male',
            contact: '09123456789',
            address: '123 Main St, Purok 1',
            status: 'Active',
            household: 'Cruz Family',
            registrationDate: '2023-01-15'
        },
        {
            id: 2,
            name: 'Maria Santos',
            age: 28,
            gender: 'Female',
            contact: '09123456788',
            address: '456 Elm St, Purok 2',
            status: 'Active',
            household: 'Santos Residence',
            registrationDate: '2023-02-20'
        },
        {
            id: 3,
            name: 'Pedro Reyes',
            age: 42,
            gender: 'Male',
            contact: '09123456787',
            address: '789 Oak St, Purok 3',
            status: 'Inactive',
            household: 'Reyes Household',
            registrationDate: '2023-03-10'
        },
        // Add more residents...
    ];

    const stats = [
        { label: 'Total Residents', value: '2,847' },
        { label: 'Active', value: '2,540' },
        { label: 'New This Month', value: '45' },
        { label: 'Households', value: '678' },
    ];

    return (
        <AuthenticatedLayout
            title="Residents"
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Residents', href: '/residents' }
            ]}
        >
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Resident Management</h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            Manage resident profiles and information
                        </p>
                    </div>
                    <Link href="/residents/create">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Resident
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
                                <Input placeholder="Search residents by name, contact, or address..." className="pl-10" />
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

                {/* Residents Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Resident List</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Age/Gender</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Address</TableHead>
                                    <TableHead>Household</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {residents.map((resident) => (
                                    <TableRow key={resident.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                                                    <User className="h-4 w-4 text-gray-600" />
                                                </div>
                                                {resident.name}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div>{resident.age} years old</div>
                                                <div className="text-sm text-gray-500">{resident.gender}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Phone className="h-3 w-3" />
                                                {resident.contact}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Home className="h-3 w-3" />
                                                <span className="truncate max-w-[150px]">{resident.address}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{resident.household}</TableCell>
                                        <TableCell>
                                            <Badge variant={resident.status === 'Active' ? 'default' : 'secondary'}>
                                                {resident.status}
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

                        {/* Pagination */}
                        <div className="flex items-center justify-between mt-4">
                            <div className="text-sm text-gray-500">
                                Showing 1 to 10 of 2,847 residents
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm">Previous</Button>
                                <Button variant="outline" size="sm">1</Button>
                                <Button variant="outline" size="sm">2</Button>
                                <Button variant="outline" size="sm">3</Button>
                                <Button variant="outline" size="sm">Next</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Additional Information */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Registrations</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {residents.slice(0, 3).map((resident) => (
                                    <div key={resident.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                                        <div>
                                            <p className="font-medium">{resident.name}</p>
                                            <p className="text-sm text-gray-500">Registered {resident.registrationDate}</p>
                                        </div>
                                        <Badge variant="outline">New</Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-2">
                                <Button variant="outline" size="sm">
                                    Bulk Import
                                </Button>
                                <Button variant="outline" size="sm">
                                    Generate Report
                                </Button>
                                <Button variant="outline" size="sm">
                                    Print IDs
                                </Button>
                                <Button variant="outline" size="sm">
                                    Send Notifications
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}