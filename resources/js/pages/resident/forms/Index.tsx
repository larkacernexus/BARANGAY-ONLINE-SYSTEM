import ResidentLayout from '@/layouts/resident-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    FileText,
    Search,
    Download,
    Eye,
    Upload,
    Printer,
    FileCheck,
    FileQuestion,
    FileSpreadsheet,
    FormInput,
    Folder,
    Clock,
    CheckCircle,
    AlertCircle,
    BookOpen
} from 'lucide-react';
import { useState } from 'react';

export default function Forms() {
    const [recentDownloads, setRecentDownloads] = useState<number[]>([1, 3, 5]);

    const forms = [
        {
            id: 1,
            name: 'Barangay Clearance Application',
            description: 'Application form for barangay clearance for employment, business, or other purposes',
            category: 'clearance',
            type: 'application',
            size: '245 KB',
            format: 'PDF',
            downloads: 1284,
            lastUpdated: '2024-11-15',
            status: 'active',
            version: '2.1'
        },
        {
            id: 2,
            name: 'Business Permit Application',
            description: 'Complete form for applying or renewing business permits within the barangay',
            category: 'business',
            type: 'application',
            size: '512 KB',
            format: 'PDF',
            downloads: 892,
            lastUpdated: '2024-10-20',
            status: 'active',
            version: '3.0'
        },
        {
            id: 3,
            name: 'Certificate of Indigency',
            description: 'Form to request certificate of indigency for educational or medical assistance',
            category: 'certificate',
            type: 'request',
            size: '198 KB',
            format: 'PDF',
            downloads: 1567,
            lastUpdated: '2024-12-01',
            status: 'active',
            version: '1.5'
        },
        {
            id: 4,
            name: 'Complaint Form',
            description: 'Official form for filing complaints or reporting concerns to the barangay',
            category: 'complaint',
            type: 'report',
            size: '321 KB',
            format: 'PDF',
            downloads: 743,
            lastUpdated: '2024-09-30',
            status: 'active',
            version: '2.2'
        },
        {
            id: 5,
            name: 'Residency Certificate Request',
            description: 'Application for certificate of residency for various requirements',
            category: 'certificate',
            type: 'request',
            size: '210 KB',
            format: 'PDF',
            downloads: 1023,
            lastUpdated: '2024-11-28',
            status: 'active',
            version: '1.8'
        },
        {
            id: 6,
            name: 'Event Registration Form',
            description: 'Form for registering to barangay events and activities',
            category: 'event',
            type: 'registration',
            size: '189 KB',
            format: 'PDF',
            downloads: 567,
            lastUpdated: '2024-10-15',
            status: 'active',
            version: '1.2'
        },
        {
            id: 7,
            name: 'Household Registration Update',
            description: 'Form for updating household information and member details',
            category: 'household',
            type: 'update',
            size: '412 KB',
            format: 'PDF',
            downloads: 432,
            lastUpdated: '2024-09-10',
            status: 'archived',
            version: '1.0'
        },
        {
            id: 8,
            name: 'Volunteer Application',
            description: 'Application form for barangay volunteer programs and activities',
            category: 'volunteer',
            type: 'application',
            size: '278 KB',
            format: 'PDF',
            downloads: 321,
            lastUpdated: '2024-11-05',
            status: 'active',
            version: '1.3'
        },
        {
            id: 9,
            name: 'Financial Assistance Request',
            description: 'Form for requesting financial assistance from barangay funds',
            category: 'assistance',
            type: 'request',
            size: '356 KB',
            format: 'PDF',
            downloads: 689,
            lastUpdated: '2024-10-25',
            status: 'active',
            version: '2.0'
        },
    ];

    const categories = [
        { id: 'all', name: 'All Forms', icon: Folder, count: forms.length },
        { id: 'clearance', name: 'Clearances', icon: FileCheck, count: forms.filter(f => f.category === 'clearance').length },
        { id: 'certificate', name: 'Certificates', icon: FileText, count: forms.filter(f => f.category === 'certificate').length },
        { id: 'business', name: 'Business', icon: FileSpreadsheet, count: forms.filter(f => f.category === 'business').length },
        { id: 'complaint', name: 'Complaints', icon: FileQuestion, count: forms.filter(f => f.category === 'complaint').length },
        { id: 'event', name: 'Events', icon: Calendar, count: forms.filter(f => f.category === 'event').length },
        { id: 'household', name: 'Household', icon: Home, count: forms.filter(f => f.category === 'household').length },
    ];

    const formTypes = [
        { id: 'application', name: 'Applications', color: 'bg-blue-100 text-blue-800' },
        { id: 'request', name: 'Requests', color: 'bg-green-100 text-green-800' },
        { id: 'report', name: 'Reports', color: 'bg-red-100 text-red-800' },
        { id: 'registration', name: 'Registrations', color: 'bg-purple-100 text-purple-800' },
        { id: 'update', name: 'Updates', color: 'bg-amber-100 text-amber-800' },
    ];

    const handleDownload = (formId: number) => {
        if (!recentDownloads.includes(formId)) {
            setRecentDownloads([...recentDownloads, formId]);
        }
        // In a real app, this would trigger an actual download
        console.log(`Downloading form ${formId}`);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge className="bg-green-100 text-green-800">Active</Badge>;
            case 'archived':
                return <Badge className="bg-gray-100 text-gray-800">Archived</Badge>;
            case 'draft':
                return <Badge className="bg-amber-100 text-amber-800">Draft</Badge>;
            default:
                return null;
        }
    };

    const getTypeBadge = (type: string) => {
        const typeInfo = formTypes.find(t => t.id === type);
        return typeInfo ? (
            <Badge className={typeInfo.color}>{typeInfo.name}</Badge>
        ) : null;
    };

    return (
        <ResidentLayout
            title="Forms"
            breadcrumbs={[
                { title: 'Dashboard', href: '/resident/dashboard' },
                { title: 'Forms', href: '/resident/forms' }
            ]}
        >
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Barangay Forms</h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            Access and download official barangay forms and documents
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">
                            <Upload className="h-4 w-4 mr-2" />
                            Submit Filled Form
                        </Button>
                        <Button>
                            <FormInput className="h-4 w-4 mr-2" />
                            Request New Form
                        </Button>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Total Forms</p>
                                    <p className="text-2xl font-bold mt-2">{forms.length}</p>
                                </div>
                                <FileText className="h-8 w-8 text-blue-200" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Total Downloads</p>
                                    <p className="text-2xl font-bold mt-2">
                                        {forms.reduce((sum, form) => sum + form.downloads, 0).toLocaleString()}
                                    </p>
                                </div>
                                <Download className="h-8 w-8 text-green-200" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Recently Downloaded</p>
                                    <p className="text-2xl font-bold mt-2">{recentDownloads.length}</p>
                                </div>
                                <Clock className="h-8 w-8 text-purple-200" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input placeholder="Search forms by name or description..." className="pl-10" />
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline">
                                    Filter by Category
                                </Button>
                                <Button variant="outline">
                                    Sort by Popularity
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Form Categories */}
                <Tabs defaultValue="all" className="w-full">
                    <TabsList className="w-full md:w-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
                        {categories.map((category) => {
                            const Icon = category.icon;
                            return (
                                <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
                                    <Icon className="h-4 w-4" />
                                    {category.name}
                                    <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                                        {category.count}
                                    </Badge>
                                </TabsTrigger>
                            );
                        })}
                    </TabsList>

                    {categories.map((category) => {
                        const Icon = category.icon;
                        return (
                            <TabsContent key={category.id} value={category.id} className="mt-6">
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-full bg-blue-50">
                                                <Icon className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <CardTitle>{category.name}</CardTitle>
                                                <CardDescription>
                                                    {category.count} forms available in this category
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                            {forms
                                                .filter(form => category.id === 'all' || form.category === category.id)
                                                .map((form) => (
                                                    <Card key={form.id} className="hover:shadow-md transition-shadow">
                                                        <CardContent className="pt-6">
                                                            <div className="space-y-4">
                                                                <div className="flex items-start justify-between">
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center gap-2 mb-2">
                                                                            <FileText className="h-5 w-5 text-gray-400" />
                                                                            <h3 className="font-bold text-lg">{form.name}</h3>
                                                                        </div>
                                                                        <p className="text-sm text-gray-600 mb-3">
                                                                            {form.description}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center justify-between">
                                                                    <div className="space-y-2">
                                                                        <div className="flex items-center gap-3">
                                                                            {getStatusBadge(form.status)}
                                                                            {getTypeBadge(form.type)}
                                                                        </div>
                                                                        <div className="text-xs text-gray-500">
                                                                            Version {form.version} • Updated {form.lastUpdated}
                                                                        </div>
                                                                    </div>
                                                                    <Badge variant="outline">
                                                                        {form.format}
                                                                    </Badge>
                                                                </div>

                                                                <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t">
                                                                    <div className="flex items-center gap-4">
                                                                        <span className="flex items-center gap-1">
                                                                            <Download className="h-3 w-3" />
                                                                            {form.downloads.toLocaleString()}
                                                                        </span>
                                                                        <span>{form.size}</span>
                                                                    </div>
                                                                    <div className="flex gap-2">
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => handleDownload(form.id)}
                                                                        >
                                                                            <Download className="h-4 w-4 mr-1" />
                                                                            Download
                                                                        </Button>
                                                                        <Button variant="ghost" size="sm">
                                                                            <Eye className="h-4 w-4" />
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        );
                    })}
                </Tabs>

                {/* Recently Downloaded */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recently Downloaded</CardTitle>
                        <CardDescription>
                            Forms you've recently accessed
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recentDownloads.length > 0 ? (
                            <div className="space-y-4">
                                {forms
                                    .filter(form => recentDownloads.includes(form.id))
                                    .map((form) => (
                                        <div key={form.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-full bg-blue-50">
                                                    <FileText className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <div className="font-medium">{form.name}</div>
                                                    <div className="text-sm text-gray-500">
                                                        Downloaded • Version {form.version} • {form.size}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm">
                                                    <Download className="h-4 w-4 mr-1" />
                                                    Download Again
                                                </Button>
                                                <Button variant="ghost" size="sm">
                                                    <Printer className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <FileQuestion className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No recent downloads</h3>
                                <p className="text-gray-500">Download forms to see them here.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Form Guidelines */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5" />
                            Form Submission Guidelines
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-3">
                                <h4 className="font-medium">Before Submission</h4>
                                <ul className="space-y-2 text-sm text-gray-600">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                        <span>Fill out all required fields completely</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                        <span>Attach all necessary supporting documents</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                        <span>Ensure information is accurate and up-to-date</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="space-y-3">
                                <h4 className="font-medium">Important Notes</h4>
                                <ul className="space-y-2 text-sm text-gray-600">
                                    <li className="flex items-start gap-2">
                                        <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                        <span>Incomplete forms will not be processed</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                        <span>Processing time: 3-5 working days</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                        <span>Keep a copy of your submitted form</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Most Popular Forms */}
                <Card>
                    <CardHeader>
                        <CardTitle>Most Popular Forms</CardTitle>
                        <CardDescription>
                            Most downloaded forms by residents
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {forms
                                .sort((a, b) => b.downloads - a.downloads)
                                .slice(0, 5)
                                .map((form, index) => (
                                    <div key={form.id} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center gap-4">
                                            <div className="text-2xl font-bold text-gray-300">#{index + 1}</div>
                                            <div>
                                                <div className="font-medium">{form.name}</div>
                                                <div className="text-sm text-gray-500">
                                                    {form.category.charAt(0).toUpperCase() + form.category.slice(1)} • {form.downloads.toLocaleString()} downloads
                                                </div>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm">
                                            Download
                                        </Button>
                                    </div>
                                ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </ResidentLayout>
    );
}