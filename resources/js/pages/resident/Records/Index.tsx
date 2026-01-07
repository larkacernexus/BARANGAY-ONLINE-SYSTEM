import ResidentLayout from '@/layouts/resident-app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useState } from 'react';

// Import ALL icons with explicit names
import { 
  FileText as FileTextIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  Eye as EyeIcon,
  User as UserIcon,
  Heart as HeartIcon,
  GraduationCap as GraduationCapIcon,
  Briefcase as BriefcaseIcon,
  Award as AwardIcon,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  File as FileIcon,
  Calendar as CalendarIcon,
  Shield as ShieldIcon,
  Upload as UploadIcon,
  Filter as FilterIcon,
  ArrowUpDown as ArrowUpDownIcon,
} from 'lucide-react';

// Define a proper type for icon components
type IconComponent = React.ComponentType<{ className?: string }>;

// Create a static icon mapping
const iconMap: Record<string, IconComponent> = {
  'User': UserIcon,
  'Heart': HeartIcon,
  'FileText': FileTextIcon,
  'GraduationCap': GraduationCapIcon,
  'Briefcase': BriefcaseIcon,
  'Award': AwardIcon,
  'Shield': ShieldIcon,
  'Folder': FolderIcon,
  'FolderOpen': FolderOpenIcon,
  'File': FileIcon
};

// Color mappings for Tailwind
const colorMap: Record<string, string> = {
  'blue': 'text-blue-600',
  'red': 'text-red-600',
  'green': 'text-green-600',
  'yellow': 'text-yellow-600',
  'purple': 'text-purple-600',
  'pink': 'text-pink-600',
  'indigo': 'text-indigo-600',
  'gray': 'text-gray-600'
};

const bgColorMap: Record<string, string> = {
  'blue': 'bg-blue-50',
  'red': 'bg-red-50',
  'green': 'bg-green-50',
  'yellow': 'bg-yellow-50',
  'purple': 'bg-purple-50',
  'pink': 'bg-pink-50',
  'indigo': 'bg-indigo-50',
  'gray': 'bg-gray-50'
};

interface Document {
    id: number;
    name: string;
    description?: string;
    category_id: number;
    file_extension: string;
    file_size_human: string;
    created_at: string;
}

interface Category {
    id: number;
    name: string;
    slug: string;
    icon: string;
    color: string;
}

interface PageProps {
    documents: {
        data: Document[];
        total: number;
    };
    categories: Category[];
    storageStats?: {
        used: string;
        limit: string;
        available: string;
        percentage: number;
    };
    filters: {
        category?: string;
        search?: string;
        resident?: string;
    };
    householdResidents?: Array<{
        id: number;
        first_name: string;
        last_name: string;
    }>;
    currentResident?: {
        id: number;
        first_name: string;
        last_name: string;
    };
    household?: {
        id: number;
        household_number: string;
        head_of_family: string;
    };
    error?: string;
}

export default function MyRecords({ 
    documents, 
    categories, 
    storageStats,
    filters,
    householdResidents,
    currentResident,
    household,
    error 
}: PageProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [activeTab, setActiveTab] = useState(filters.category || 'all');
    
    // Default storage stats if not provided
    const defaultStorageStats = {
        used: '0 MB',
        limit: '100 MB',
        available: '100 MB',
        percentage: 0
    };
    
    const safeStorageStats = storageStats || defaultStorageStats;
    
    // If there's an error, show error message
    if (error) {
        return (
            <ResidentLayout
                title="My Records"
                breadcrumbs={[
                    { title: 'Dashboard', href: '/resident/dashboard' },
                    { title: 'My Records', href: '#' }
                ]}
            >
                <Card>
                    <CardContent className="py-12 text-center">
                        <ShieldIcon className="h-12 w-12 mx-auto text-red-400" />
                        <h3 className="mt-4 text-lg font-semibold">Error</h3>
                        <p className="text-gray-500 mt-2">
                            {error}
                        </p>
                        <Button 
                            className="mt-4"
                            onClick={() => window.location.href = '/dashboard'}
                        >
                            Go to Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </ResidentLayout>
        );
    }
    
    // Process categories without storing React components in objects
    const processedCategories = categories.map(cat => {
        return {
            id: cat.slug,
            name: cat.name,
            iconName: cat.icon,
            count: documents?.data?.filter(doc => doc.category_id === cat.id).length || 0,
            color: colorMap[cat.color] || 'text-gray-600',
            bgColor: bgColorMap[cat.color] || 'bg-gray-50',
            ...cat
        };
    });
    
    // Add "All Documents" category
    const allCategory = {
        id: 'all',
        name: 'All Documents',
        iconName: 'FolderOpen',
        count: documents?.total || 0,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50'
    };
    
    const allCategories = [allCategory, ...processedCategories];
    
    // Helper function to get icon component by name
    const getIconComponent = (iconName: string): IconComponent => {
        return iconMap[iconName] || FileIcon;
    };

    // Handle search with Inertia
    const handleSearch = (value: string) => {
        setSearch(value);
        
        const params: any = {};
        if (value) params.search = value;
        if (activeTab !== 'all') params.category = activeTab;
        
        router.get('/my-records', params, {
            preserveState: true,
            preserveScroll: true,
            only: ['documents', 'filters', 'categories', 'storageStats', 'householdResidents', 'currentResident', 'household'],
        });
    };

    // Handle tab change with Inertia
    const handleTabChange = (categoryId: string) => {
        setActiveTab(categoryId);
        
        const params: any = {};
        if (search) params.search = search;
        if (categoryId !== 'all') params.category = categoryId;
        
        router.get('/my-records', params, {
            preserveState: true,
            preserveScroll: true,
            only: ['documents', 'filters', 'categories', 'storageStats', 'householdResidents', 'currentResident', 'household'],
        });
    };

    return (
        <ResidentLayout
            title="My Records"
            breadcrumbs={[
                { title: 'Dashboard', href: '/resident/dashboard' },
                { title: 'My Records', href: '#' }
            ]}
        >
            <Head title="My Records" />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">My Records</h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            Household: {household?.household_number || 'N/A'} - {household?.head_of_family || 'N/A'}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" onClick={() => router.get('/resident/records/export')}>
                            <DownloadIcon className="h-4 w-4 mr-2" />
                            Export All
                        </Button>
                        <Link href="my-records/create">
                            <Button>
                                <UploadIcon className="h-4 w-4 mr-2" />
                                Upload Document
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Categories */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {allCategories.map((category) => {
                        const IconComponent = getIconComponent(category.iconName);
                        return (
                            <Card 
                                key={category.id} 
                                className="hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => handleTabChange(category.id)}
                            >
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-full ${category.bgColor}`}>
                                                <IconComponent className={`h-5 w-5 ${category.color}`} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">{category.name}</p>
                                                <p className="text-2xl font-bold mt-1">{category.count}</p>
                                            </div>
                                        </div>
                                        <FolderIcon className="h-8 w-8 text-gray-200" />
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Search */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input 
                                    placeholder="Search documents by name or type..." 
                                    className="pl-10"
                                    value={search}
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline">
                                    <FilterIcon className="h-4 w-4 mr-2" />
                                    Filter
                                </Button>
                                <Button variant="outline">
                                    <ArrowUpDownIcon className="h-4 w-4 mr-2" />
                                    Sort by Date
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabs */}
                <div className="border-b border-gray-200">
                    <div className="flex overflow-x-auto">
                        {allCategories.map((category) => (
                            <button
                                key={category.id}
                                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                                    activeTab === category.id
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                                onClick={() => handleTabChange(category.id)}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                {allCategories.map((category) => {
                    if (activeTab !== category.id) return null;
                    
                    const IconComponent = getIconComponent(category.iconName);
                    const docsInCategory = activeTab === 'all' 
                        ? (documents?.data || []) 
                        : (documents?.data || []).filter(doc => {
                            const docCategory = categories.find(c => c.id === doc.category_id);
                            return docCategory?.slug === category.id;
                        });
                    
                    // Filter by search
                    const filteredDocs = docsInCategory.filter(doc =>
                        doc.name.toLowerCase().includes(search.toLowerCase()) ||
                        doc.description?.toLowerCase().includes(search.toLowerCase())
                    );
                    
                    return (
                        <div key={category.id} className="mt-6">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${category.bgColor}`}>
                                            <IconComponent className={`h-6 w-6 ${category.color}`} />
                                        </div>
                                        <div>
                                            <CardTitle>{category.name} Documents</CardTitle>
                                            <CardDescription>
                                                {filteredDocs.length} documents in this category
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {filteredDocs.length > 0 ? (
                                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                            {filteredDocs.map((doc) => {
                                                const category = categories.find(c => c.id === doc.category_id);
                                                const DocIconComponent = category ? getIconComponent(category.icon) : FileIcon;
                                                const categoryColor = category ? (colorMap[category.color] || 'text-gray-600') : 'text-gray-600';
                                                
                                                return (
                                                    <Card key={doc.id} className="hover:shadow-md transition-shadow">
                                                        <CardContent className="pt-6">
                                                            <div className="flex items-start justify-between mb-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="p-2 rounded-full bg-gray-100">
                                                                        <DocIconComponent className={`h-5 w-5 ${categoryColor}`} />
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-bold">{doc.name}</div>
                                                                        <Badge variant="outline" className="mt-1">
                                                                            {doc.file_extension?.toUpperCase()}
                                                                        </Badge>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            {doc.description && (
                                                                <p className="text-sm text-gray-500 mb-3">
                                                                    {doc.description.length > 100 
                                                                        ? `${doc.description.substring(0, 100)}...` 
                                                                        : doc.description}
                                                                </p>
                                                            )}
                                                            <div className="flex items-center justify-between text-sm text-gray-500">
                                                                <div className="flex items-center gap-1">
                                                                    <CalendarIcon className="h-3 w-3" />
                                                                    {new Date(doc.created_at).toLocaleDateString()}
                                                                </div>
                                                                <div>{doc.file_size_human}</div>
                                                            </div>
                                                            <div className="flex gap-2 mt-4">
                                                                <Button 
                                                                    size="sm" 
                                                                    variant="outline" 
                                                                    className="flex-1"
                                                                    onClick={() => router.get(`/resident/records/${doc.id}/view`)}
                                                                >
                                                                    <EyeIcon className="h-4 w-4 mr-1" />
                                                                    View
                                                                </Button>
                                                                <Button 
                                                                    size="sm" 
                                                                    variant="outline" 
                                                                    className="flex-1"
                                                                    onClick={() => router.get(`/resident/records/${doc.id}/download`)}
                                                                >
                                                                    <DownloadIcon className="h-4 w-4 mr-1" />
                                                                    Download
                                                                </Button>
                                                            </div>
                                                            <div className="mt-2">
                                                                <Button 
                                                                    size="sm" 
                                                                    variant="ghost" 
                                                                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                    onClick={() => {
                                                                        if (confirm('Are you sure you want to delete this document?')) {
                                                                            router.delete(`/resident/records/${doc.id}`);
                                                                        }
                                                                    }}
                                                                >
                                                                    Delete
                                                                </Button>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <FolderIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
                                            <p className="text-gray-500">
                                                {search ? 'No documents match your search.' : 'You don\'t have any documents in this category yet.'}
                                            </p>
                                            <Link href="/resident/records/upload">
                                                <Button className="mt-4">
                                                    <UploadIcon className="h-4 w-4 mr-2" />
                                                    Upload Document
                                                </Button>
                                            </Link>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    );
                })}

                {/* Storage Usage - Only show if storageStats exists */}
                {safeStorageStats && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Storage Usage</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm font-medium text-gray-500">Used Storage</div>
                                        <div className="text-2xl font-bold">{safeStorageStats.used} / {safeStorageStats.limit}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-medium text-gray-500">Available</div>
                                        <div className="text-2xl font-bold text-green-600">{safeStorageStats.available}</div>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                        className="bg-blue-600 h-2 rounded-full" 
                                        style={{ width: `${Math.min(safeStorageStats.percentage, 100)}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>{safeStorageStats.percentage}% used</span>
                                    <span>Upgrade available</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </ResidentLayout>
    );
}