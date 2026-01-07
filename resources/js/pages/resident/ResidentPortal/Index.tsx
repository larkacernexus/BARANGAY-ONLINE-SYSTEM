import AuthenticatedLayout from '@/layouts/resident-app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    User,
    Home,
    FileText,
    CreditCard,
    Calendar,
    Bell,
    AlertCircle,
    CheckCircle,
    Clock,
    Download,
    FileCheck,
    Receipt,
    Shield,
    Phone,
    Mail,
    MapPin,
    Users,
    Eye,
    Edit,
    Printer,
    FileSpreadsheet,
    History,
    QrCode,
    IdCard,
    MessageSquare,
    Settings,
    HelpCircle,
    RefreshCw
} from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function ResidentPortal() {
    // Resident information
    const resident = {
        id: 1,
        fullName: 'Juan Dela Cruz',
        residentId: 'RES-2024-001',
        birthDate: '1988-05-15',
        age: 35,
        gender: 'Male',
        civilStatus: 'Married',
        contactNumber: '09123456789',
        email: 'juan.delacruz@example.com',
        address: '123 Main Street, Purok 1, Barangay Kibawe',
        purok: 'Purok 1',
        household: 'Cruz Family (HH-2024-001)',
        occupation: 'Farmer/Business Owner',
        education: 'College Graduate',
        religion: 'Roman Catholic',
        isVoter: true,
        isPWD: false,
        isSenior: false,
        status: 'Active',
        registrationDate: '2023-01-15',
        lastUpdated: '2024-03-01'
    };

    // Family members
    const familyMembers = [
        { id: 1, name: 'Maria Dela Cruz', relationship: 'Spouse', age: 32, status: 'Active' },
        { id: 2, name: 'Jose Dela Cruz', relationship: 'Son', age: 10, status: 'Active' },
        { id: 3, name: 'Ana Dela Cruz', relationship: 'Daughter', age: 8, status: 'Active' },
        { id: 4, name: 'Pedro Dela Cruz', relationship: 'Son', age: 5, status: 'Active' },
    ];

    // Recent clearances/certificates
    const recentDocuments = [
        { id: 1, type: 'Business Clearance', number: 'CLR-2024-015', issueDate: '2024-03-15', expiryDate: '2024-06-15', status: 'Active', purpose: 'Business Permit Renewal' },
        { id: 2, type: 'Residency Certificate', number: 'CERT-2024-032', issueDate: '2024-02-20', expiryDate: '2024-08-20', status: 'Active', purpose: 'School Requirement' },
        { id: 3, type: 'Barangay ID', number: 'BID-2024-001', issueDate: '2024-01-10', expiryDate: '2025-01-10', status: 'Active', purpose: 'Valid ID' },
        { id: 4, type: 'Good Moral Certificate', number: 'GMC-2023-045', issueDate: '2023-12-05', expiryDate: '2024-06-05', status: 'Expired', purpose: 'Employment' },
    ];

    // Recent payments
    const recentPayments = [
        { id: 1, type: 'Business Tax', receipt: 'RCPT-2024-001', date: '2024-03-15', amount: '₱2,500.00', status: 'Paid' },
        { id: 2, type: 'Clearance Fee', receipt: 'RCPT-2024-002', date: '2024-03-10', amount: '₱200.00', status: 'Paid' },
        { id: 3, type: 'Certificate Fee', receipt: 'RCPT-2024-003', date: '2024-02-20', amount: '₱100.00', status: 'Paid' },
        { id: 4, type: 'Barangay ID Fee', receipt: 'RCPT-2024-004', date: '2024-01-10', amount: '₱50.00', status: 'Paid' },
    ];

    // Upcoming deadlines
    const upcomingDeadlines = [
        { id: 1, item: 'Business Tax Q2', dueDate: '2024-06-30', amount: '₱2,500.00', status: 'Upcoming' },
        { id: 2, item: 'Barangay ID Renewal', dueDate: '2025-01-10', amount: '₱50.00', status: 'Future' },
        { id: 3, item: 'Annual Community Tax', dueDate: '2024-12-31', amount: '₱500.00', status: 'Future' },
    ];

    // Barangay announcements
    const announcements = [
        { id: 1, title: 'Barangay Assembly', date: 'April 15, 2024', description: 'Monthly barangay assembly at the barangay hall', category: 'Event' },
        { id: 2, title: 'Health Check-up', date: 'April 20-25, 2024', description: 'Free medical check-up for all residents', category: 'Health' },
        { id: 3, title: 'Tax Payment Reminder', date: 'March 31, 2024', description: '1st quarter business tax payment deadline', category: 'Important' },
        { id: 4, title: 'Water Interruption', date: 'April 5, 2024', description: 'Scheduled water maintenance from 8AM to 5PM', category: 'Notice' },
    ];

    // Quick actions for residents
    const quickActions = [
        { id: 1, title: 'Request Clearance', icon: FileText, description: 'Apply for barangay clearance', href: '/resident/clearances/request', color: 'bg-blue-500' },
        { id: 2, title: 'Pay Fees Online', icon: CreditCard, description: 'Pay taxes and fees', href: '/resident/payments', color: 'bg-green-500' },
        { id: 3, title: 'Update Profile', icon: User, description: 'Update personal information', href: '/resident/profile/edit', color: 'bg-purple-500' },
        { id: 4, title: 'View Family', icon: Users, description: 'View family members', href: '/resident/family', color: 'bg-amber-500' },
        { id: 5, title: 'Print ID', icon: Printer, description: 'Print barangay ID', href: '/resident/id/print', color: 'bg-red-500' },
        { id: 6, title: 'Report Issue', icon: AlertCircle, description: 'Report community issue', href: '/resident/report', color: 'bg-orange-500' },
    ];

    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active':
            case 'paid':
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">✓ {status}</Badge>;
            case 'expired':
                return <Badge variant="destructive">✗ {status}</Badge>;
            case 'upcoming':
                return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">⚠ {status}</Badge>;
            case 'future':
                return <Badge variant="outline">{status}</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <AuthenticatedLayout
            title="Resident Portal"
            breadcrumbs={[
                { title: 'Resident Portal', href: '/resident' }
            ]}
        >
            <div className="space-y-6">
                {/* Welcome Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-blue-100 dark:border-gray-700">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                <User className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Welcome back, {resident.fullName}!
                                </h1>
                                <p className="text-gray-600 dark:text-gray-300 mt-1">
                                    Resident ID: <span className="font-semibold">{resident.residentId}</span> • 
                                    Status: <span className="font-semibold text-green-600 dark:text-green-400">{resident.status}</span>
                                </p>
                                <div className="flex items-center gap-3 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <Home className="h-3 w-3" />
                                        {resident.purok}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Phone className="h-3 w-3" />
                                        {resident.contactNumber}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                                <QrCode className="h-4 w-4 mr-2" />
                                Show QR Code
                            </Button>
                            <Button size="sm">
                                <IdCard className="h-4 w-4 mr-2" />
                                View Digital ID
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Quick Actions Grid */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {quickActions.map((action) => {
                            const Icon = action.icon;
                            return (
                                <Link key={action.id} href={action.href}>
                                    <Card className="hover:shadow-lg transition-shadow cursor-pointer border-0 shadow-sm">
                                        <CardContent className="p-4 flex flex-col items-center text-center">
                                            <div className={`h-12 w-12 rounded-full ${action.color} flex items-center justify-center mb-3`}>
                                                <Icon className="h-6 w-6 text-white" />
                                            </div>
                                            <h3 className="font-medium text-sm mb-1">{action.title}</h3>
                                            <p className="text-xs text-gray-500">{action.description}</p>
                                        </CardContent>
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Main Content Tabs */}
                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:w-fit">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="documents">Documents</TabsTrigger>
                        <TabsTrigger value="payments">Payments</TabsTrigger>
                        <TabsTrigger value="family">Family</TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid gap-6 lg:grid-cols-3">
                            {/* Left Column - Personal Info */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Personal Information Card */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <User className="h-5 w-5" />
                                            Personal Information
                                        </CardTitle>
                                        <CardDescription>
                                            Your registered information with the barangay
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-3">
                                                <div>
                                                    <div className="text-sm text-gray-500">Resident ID</div>
                                                    <div className="font-medium">{resident.residentId}</div>
                                                </div>
                                                <div>
                                                    <div className="text-sm text-gray-500">Full Name</div>
                                                    <div className="font-medium">{resident.fullName}</div>
                                                </div>
                                                <div>
                                                    <div className="text-sm text-gray-500">Birth Date</div>
                                                    <div className="font-medium">{resident.birthDate} ({resident.age} years old)</div>
                                                </div>
                                                <div>
                                                    <div className="text-sm text-gray-500">Gender</div>
                                                    <div className="font-medium">{resident.gender}</div>
                                                </div>
                                                <div>
                                                    <div className="text-sm text-gray-500">Civil Status</div>
                                                    <div className="font-medium">{resident.civilStatus}</div>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <div>
                                                    <div className="text-sm text-gray-500">Contact Number</div>
                                                    <div className="font-medium flex items-center gap-1">
                                                        <Phone className="h-3 w-3" />
                                                        {resident.contactNumber}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-sm text-gray-500">Email Address</div>
                                                    <div className="font-medium flex items-center gap-1">
                                                        <Mail className="h-3 w-3" />
                                                        {resident.email}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-sm text-gray-500">Address</div>
                                                    <div className="font-medium flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" />
                                                        {resident.address}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-sm text-gray-500">Occupation</div>
                                                    <div className="font-medium">{resident.occupation}</div>
                                                </div>
                                                <div>
                                                    <div className="text-sm text-gray-500">Registration Date</div>
                                                    <div className="font-medium">{resident.registrationDate}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-6 flex gap-2">
                                            <Button variant="outline" size="sm">
                                                <Edit className="h-4 w-4 mr-2" />
                                                Request Update
                                            </Button>
                                            <Button variant="outline" size="sm">
                                                <Printer className="h-4 w-4 mr-2" />
                                                Print Profile
                                            </Button>
                                            <Button variant="outline" size="sm">
                                                <Download className="h-4 w-4 mr-2" />
                                                Export Data
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Barangay Announcements */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Bell className="h-5 w-5" />
                                            Barangay Announcements
                                        </CardTitle>
                                        <CardDescription>
                                            Latest updates from Barangay Kibawe
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {announcements.map((announcement) => (
                                                <div key={announcement.id} className="border-l-4 border-blue-500 pl-4 py-2">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="font-medium">{announcement.title}</h4>
                                                        <Badge variant="outline">{announcement.category}</Badge>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mt-1">{announcement.description}</p>
                                                    <div className="text-xs text-gray-500 mt-2">{announcement.date}</div>
                                                </div>
                                            ))}
                                        </div>
                                        <Button variant="outline" className="w-full mt-4">
                                            View All Announcements
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right Column - Summary Cards */}
                            <div className="space-y-6">
                                {/* Status Summary */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Status Summary</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Resident Status</span>
                                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Voter Status</span>
                                            {resident.isVoter ? (
                                                <Badge className="bg-blue-100 text-blue-800">Registered Voter</Badge>
                                            ) : (
                                                <Badge variant="outline">Not Registered</Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">PWD Status</span>
                                            {resident.isPWD ? (
                                                <Badge className="bg-purple-100 text-purple-800">PWD Registered</Badge>
                                            ) : (
                                                <Badge variant="outline">Not PWD</Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Senior Citizen</span>
                                            {resident.isSenior ? (
                                                <Badge className="bg-amber-100 text-amber-800">Senior Citizen</Badge>
                                            ) : (
                                                <Badge variant="outline">Not Senior</Badge>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Upcoming Deadlines */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Calendar className="h-5 w-5" />
                                            Upcoming Deadlines
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {upcomingDeadlines.map((item) => (
                                                <div key={item.id} className="border-b pb-3 last:border-0">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <div className="font-medium">{item.item}</div>
                                                            <div className="text-sm text-gray-500">Due: {item.dueDate}</div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="font-bold">{item.amount}</div>
                                                            {getStatusBadge(item.status)}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <Button variant="outline" className="w-full mt-4">
                                            View All Payments
                                        </Button>
                                    </CardContent>
                                </Card>

                                {/* Quick Stats */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Quick Stats</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Active Clearances</span>
                                            <span className="font-bold">3</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Total Payments</span>
                                            <span className="font-bold">₱2,850.00</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Family Members</span>
                                            <span className="font-bold">5</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Years in Barangay</span>
                                            <span className="font-bold">2 years</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Documents Tab */}
                    <TabsContent value="documents" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>My Documents & Clearances</CardTitle>
                                        <CardDescription>
                                            All certificates, clearances, and IDs issued to you
                                        </CardDescription>
                                    </div>
                                    <Button>
                                        <FileText className="h-4 w-4 mr-2" />
                                        Request New Document
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {recentDocuments.map((doc) => (
                                        <div key={doc.id} className="border rounded-lg p-4">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                                        <FileText className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium">{doc.type}</h4>
                                                        <div className="text-sm text-gray-500 mt-1">
                                                            <span className="font-mono">{doc.number}</span> • 
                                                            Issued: {doc.issueDate} • 
                                                            Expires: {doc.expiryDate}
                                                        </div>
                                                        <div className="text-sm text-gray-600 mt-1">
                                                            Purpose: {doc.purpose}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {getStatusBadge(doc.status)}
                                                    <Button size="sm" variant="outline">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="sm" variant="outline">
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="sm" variant="outline">
                                                        <Printer className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Button variant="outline" className="w-full mt-4">
                                    View All Documents
                                </Button>
                            </CardContent>
                        </Card>

                        <div className="grid gap-6 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Document Statistics</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="text-sm text-gray-500">Active Documents</div>
                                            <div className="text-2xl font-bold">3</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-500">Expired This Year</div>
                                            <div className="text-2xl font-bold">1</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-500">Total Issued</div>
                                            <div className="text-2xl font-bold">8</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Quick Links</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <Button variant="outline" className="w-full justify-start">
                                        <FileCheck className="h-4 w-4 mr-2" />
                                        Request Clearance
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start">
                                        <Shield className="h-4 w-4 mr-2" />
                                        Apply for Indigency
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start">
                                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                                        Download Certificate Template
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Payments Tab */}
                    <TabsContent value="payments" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Payment History</CardTitle>
                                        <CardDescription>
                                            Your tax payments, fees, and transactions
                                        </CardDescription>
                                    </div>
                                    <Button>
                                        <CreditCard className="h-4 w-4 mr-2" />
                                        Pay Online
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {recentPayments.map((payment) => (
                                        <div key={payment.id} className="border rounded-lg p-4">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                                                        <Receipt className="h-5 w-5 text-green-600" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium">{payment.type}</h4>
                                                        <div className="text-sm text-gray-500 mt-1">
                                                            Receipt: <span className="font-mono">{payment.receipt}</span> • 
                                                            Date: {payment.date}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="text-right">
                                                        <div className="font-bold text-lg">{payment.amount}</div>
                                                        {getStatusBadge(payment.status)}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Button size="sm" variant="outline">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button size="sm" variant="outline">
                                                            <Download className="h-4 w-4" />
                                                        </Button>
                                                        <Button size="sm" variant="outline">
                                                            <Printer className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Button variant="outline" className="w-full mt-4">
                                    View Full Payment History
                                </Button>
                            </CardContent>
                        </Card>

                        <div className="grid gap-6 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Payment Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Total Paid This Year</span>
                                        <span className="font-bold">₱2,850.00</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Pending Payments</span>
                                        <span className="font-bold text-amber-600">₱2,500.00</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Next Due Date</span>
                                        <span className="font-bold">June 30, 2024</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Payment Methods Used</span>
                                        <span className="font-bold">2 (Cash, GCash)</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Payment Methods</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center justify-between p-2 border rounded">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded bg-blue-100 flex items-center justify-center">
                                                <CreditCard className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <span>GCash</span>
                                        </div>
                                        <Badge variant="outline">Default</Badge>
                                    </div>
                                    <div className="flex items-center justify-between p-2 border rounded">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded bg-green-100 flex items-center justify-center">
                                                <Receipt className="h-4 w-4 text-green-600" />
                                            </div>
                                            <span>Over-the-Counter</span>
                                        </div>
                                        <Badge variant="outline">Available</Badge>
                                    </div>
                                    <Button variant="outline" className="w-full">
                                        Manage Payment Methods
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Family Tab */}
                    <TabsContent value="family" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Family Members</CardTitle>
                                        <CardDescription>
                                            Members of your registered household
                                        </CardDescription>
                                    </div>
                                    <Button>
                                        <Users className="h-4 w-4 mr-2" />
                                        Add Family Member
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {/* Household Head (Current User) */}
                                    <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                                    <User className="h-6 w-6 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium flex items-center gap-2">
                                                        {resident.fullName}
                                                        <Badge className="bg-blue-100 text-blue-800">You</Badge>
                                                        <Badge className="bg-green-100 text-green-800">Head</Badge>
                                                    </h4>
                                                    <div className="text-sm text-gray-500">
                                                        {resident.age} years old • {resident.occupation}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm text-gray-500">Resident ID</div>
                                                <div className="font-medium">{resident.residentId}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Other Family Members */}
                                    {familyMembers.map((member) => (
                                        <div key={member.id} className="border rounded-lg p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                                                        <User className="h-6 w-6 text-gray-600" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium">{member.name}</h4>
                                                        <div className="text-sm text-gray-500">
                                                            {member.relationship} • {member.age} years old
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge className="bg-green-100 text-green-800">{member.status}</Badge>
                                                    <Button size="sm" variant="outline">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="sm" variant="outline">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-6 grid grid-cols-2 gap-4">
                                    <Card>
                                        <CardContent className="p-4">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold">5</div>
                                                <div className="text-sm text-gray-500">Total Members</div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="p-4">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold">HH-2024-001</div>
                                                <div className="text-sm text-gray-500">Household Number</div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Bottom Action Bar */}
                <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                            <RefreshCw className="h-3 w-3" />
                            Last updated: {resident.lastUpdated}
                        </span>
                        <span>•</span>
                        <span>Need help? Contact Barangay: 0912-345-6789</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Send Message
                        </Button>
                        <Button variant="outline" size="sm">
                            <HelpCircle className="h-4 w-4 mr-2" />
                            Help
                        </Button>
                        <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4 mr-2" />
                            Settings
                        </Button>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}