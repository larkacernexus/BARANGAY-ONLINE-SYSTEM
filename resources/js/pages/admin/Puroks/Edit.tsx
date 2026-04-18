// pages/admin/puroks/edit.tsx
import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import AppLayout from '@/layouts/admin-app-layout';
import { FormContainer } from '@/components/adminui/form/form-container';
import { FormTabs, TabConfig } from '@/components/adminui/form/form-tabs';
import { FormProgress } from '@/components/adminui/form/form-progress';
import { FormNavigation } from '@/components/adminui/form/form-navigation';
import { FormHeader } from '@/components/adminui/form/form-header';
import { FormErrors } from '@/components/adminui/form/form-errors';
import { RequiredFieldsChecklist } from '@/components/adminui/form/required-fields-checklist';
import { useFormManager } from '@/hooks/admin/use-form-manager';
import { Resident } from '@/types/admin/puroks/purok';
import { MapPin, User, Globe, Info, Trash2, History, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { BasicInfoTab } from '@/components/admin/puroks/create/basic-info-tab';
import { LeadershipTab } from '@/components/admin/puroks/create/leadership-tab';
import { LocationTab } from '@/components/admin/puroks/create/location-tab';
import { route } from 'ziggy-js';

interface Purok {
    id: number;
    name: string;
    description?: string;
    leader_id?: number | null;
    leader_name?: string;
    leader_contact?: string;
    status: string;
    google_maps_url?: string;
    latitude?: number | null;
    longitude?: number | null;
    created_at: string;
    updated_at: string;
    households_count?: number;
    residents_count?: number;
}

interface FormData {
    name: string;
    description: string;
    leader_id: string;
    status: 'active' | 'inactive';
    google_maps_url: string;
    latitude: string;
    longitude: string;
}

const tabs: TabConfig[] = [
    { id: 'basic', label: 'Basic Info', icon: MapPin, requiredFields: ['name', 'status'] },
    { id: 'leadership', label: 'Leadership', icon: User, requiredFields: [] },
    { id: 'location', label: 'Location', icon: Globe, requiredFields: [] }
];

const requiredFieldsMap = {
    basic: ['name', 'status'],
    leadership: [],
    location: []
};

export default function EditPurok() {
    const { props } = usePage<{
        purok: Purok;
        availableResidents?: Resident[];
    }>();
    const { purok, availableResidents = [] } = props;
    
    const [showPreview, setShowPreview] = useState(true);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const {
        formData,
        errors,
        isSubmitting,
        activeTab,
        formProgress,
        allRequiredFieldsFilled,
        handleInputChange,
        handleSelectChange,
        handleSubmit,
        setActiveTab,
        getTabStatus,
        getMissingFields,
        goToNextTab,
        goToPrevTab
    } = useFormManager<FormData>({
        initialData: {
            name: purok.name,
            description: purok.description || '',
            leader_id: purok.leader_id?.toString() || '',
            status: purok.status as 'active' | 'inactive',
            google_maps_url: purok.google_maps_url || '',
            latitude: purok.latitude?.toString() || '',
            longitude: purok.longitude?.toString() || '',
        },
        requiredFields: requiredFieldsMap,
        onSubmit: (data) => {
            router.put(route('admin.puroks.update', purok.id), data as any, {
                onSuccess: () => {
                    toast.success('Purok updated successfully');
                    router.visit(route('admin.puroks.show', purok.id));
                },
                onError: (errs) => {
                    // Remove setErrors line - errors are handled by Inertia
                    toast.error('Failed to update purok');
                    console.error('Validation errors:', errs);
                }
            });
        }
    });

    // Get status color for badges
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': 
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'inactive': 
                return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
            default: 
                return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
        }
    };

    // Get initials for avatar
    const getInitials = (firstName: string, lastName: string) => {
        if (!firstName || !lastName) return '?';
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    // Format full name
    const formatFullName = (resident: Resident) => {
        const lastName = resident.last_name || '';
        const firstName = resident.first_name || '';
        const middleName = resident.middle_name ? ' ' + resident.middle_name.charAt(0) + '.' : '';
        return `${lastName}, ${firstName}${middleName}`;
    };

    // Get selected leader from available residents
    const selectedLeader = formData.leader_id 
        ? availableResidents.find(r => r.id.toString() === formData.leader_id)
        : null;

    // Handle delete
    const handleDelete = () => {
        setShowDeleteDialog(true);
    };

    const confirmDelete = () => {
        router.delete(route('admin.puroks.destroy', purok.id), {
            onSuccess: () => {
                toast.success('Purok deleted successfully');
                router.visit(route('admin.puroks.index'));
            },
            onError: () => {
                toast.error('Failed to delete purok');
                setShowDeleteDialog(false);
            }
        });
    };

    const handleCancel = () => {
        router.visit(route('admin.puroks.show', purok.id));
    };

    const tabStatuses: Record<string, 'complete' | 'incomplete' | 'error' | 'optional'> = {
        basic: getTabStatus('basic'),
        leadership: getTabStatus('leadership'),
        location: getTabStatus('location')
    };

    const missingFields = getMissingFields();
    const requiredFieldsList = [
        { label: 'Purok Name', value: !!formData.name, tabId: 'basic' },
        { label: 'Status', value: !!formData.status, tabId: 'basic' }
    ];

    const tabOrder = ['basic', 'leadership', 'location'];

    // Count changed fields for display
    const changedFieldsCount = [
        formData.name !== purok.name,
        formData.description !== (purok.description || ''),
        formData.leader_id !== (purok.leader_id?.toString() || ''),
        formData.status !== purok.status,
        formData.google_maps_url !== (purok.google_maps_url || '')
    ].filter(Boolean).length;

    const hasUnsavedChanges = changedFieldsCount > 0;

    return (
        <AppLayout
            title={`Edit Purok: ${purok.name}`}
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Puroks', href: '/admin/puroks' },
                { title: purok.name, href: route('admin.puroks.show', purok.id) },
                { title: 'Edit', href: route('admin.puroks.edit', purok.id) }
            ]}
        >
            <div className="space-y-6">
                {/* Header with custom actions */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCancel}
                            type="button"
                            className="dark:border-gray-600 dark:text-gray-300"
                        >
                            <MapPin className="h-4 w-4 mr-2" />
                            Back to Purok
                        </Button>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight dark:text-gray-100">
                                Edit Purok
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    ID: #{purok.id}
                                </Badge>
                                <Badge className={getStatusColor(formData.status)}>
                                    {formData.status}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowPreview(!showPreview)}
                            className="dark:border-gray-600 dark:text-gray-300"
                        >
                            <MapPin className="h-4 w-4 mr-2" />
                            {showPreview ? 'Hide Preview' : 'Show Preview'}
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={handleDelete}
                            disabled={isSubmitting}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                </div>

                {/* Warning Alert for Active Purok with Households */}
                {purok.status === 'active' && (purok.households_count || 0) > 0 && (
                    <Card className="border-l-4 border-l-yellow-500 dark:bg-gray-900">
                        <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                                <div>
                                    <p className="font-medium text-yellow-800 dark:text-yellow-300">Warning</p>
                                    <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                                        This purok has {purok.households_count} households and {purok.residents_count || 0} residents.
                                        Changing the status to inactive may affect these records.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Last Updated & Changes Banner */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="dark:bg-gray-900">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <History className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Last updated: {new Date(purok.updated_at).toLocaleString()}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Created: {new Date(purok.created_at).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {hasUnsavedChanges && (
                        <Card className="border-l-4 border-l-blue-500 dark:bg-gray-900">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse"></div>
                                        <span className="font-medium dark:text-gray-200">
                                            {changedFieldsCount} field{changedFieldsCount !== 1 ? 's' : ''} modified
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <FormErrors errors={errors} />

                <div className={`grid ${showPreview ? 'lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
                    <div className={`${showPreview ? 'lg:col-span-2' : 'col-span-1'} space-y-4`}>
                        <FormTabs
                            tabs={tabs}
                            activeTab={activeTab}
                            onTabChange={setActiveTab}
                            tabStatuses={tabStatuses}
                        />

                        {activeTab === 'basic' && (
                            <>
                                <FormContainer 
                                    title="Basic Information" 
                                    description="Update the core details for this purok"
                                >
                                    <BasicInfoTab
                                        formData={formData}
                                        errors={errors}
                                        onInputChange={handleInputChange}
                                        onSelectChange={handleSelectChange}
                                        isSubmitting={isSubmitting}
                                    />
                                </FormContainer>
                                <FormNavigation
                                    onNext={() => goToNextTab(tabOrder)}
                                    onCancel={handleCancel}
                                    onSubmit={handleSubmit}
                                    isSubmitting={isSubmitting}
                                    isSubmittable={allRequiredFieldsFilled}
                                    showPrevious={false}
                                    nextLabel="Next: Leadership"
                                    submitLabel="Update Purok"
                                />
                            </>
                        )}

                        {activeTab === 'leadership' && (
                            <>
                                <FormContainer 
                                    title="Purok Leadership" 
                                    description="Update the purok leader assignment (optional)"
                                >
                                    <LeadershipTab
                                        formData={formData}
                                        errors={errors}
                                        availableResidents={availableResidents}
                                        onLeaderSelect={(id) => handleSelectChange('leader_id', id)}
                                        isSubmitting={isSubmitting}
                                    />
                                </FormContainer>
                                <FormNavigation
                                    onPrevious={() => goToPrevTab(tabOrder)}
                                    onNext={() => goToNextTab(tabOrder)}
                                    onCancel={handleCancel}
                                    onSubmit={handleSubmit}
                                    isSubmitting={isSubmitting}
                                    isSubmittable={allRequiredFieldsFilled}
                                    previousLabel="Back: Basic Info"
                                    nextLabel="Next: Location"
                                    submitLabel="Update Purok"
                                />
                            </>
                        )}

                        {activeTab === 'location' && (
                            <>
                                <FormContainer 
                                    title="Google Maps Location" 
                                    description="Update the Google Maps link - coordinates will be extracted automatically"
                                >
                                   <LocationTab
                                        formData={formData}
                                        errors={errors}
                                        onInputChange={handleInputChange}
                                        isSubmitting={isSubmitting}
                                        currentCoordinates={{
                                            latitude: purok.latitude ?? null,
                                            longitude: purok.longitude ?? null
                                        }}
                                    />
                                </FormContainer>
                                <FormNavigation
                                    onPrevious={() => goToPrevTab(tabOrder)}
                                    onCancel={handleCancel}
                                    onSubmit={handleSubmit}
                                    isSubmitting={isSubmitting}
                                    isSubmittable={allRequiredFieldsFilled}
                                    previousLabel="Back: Leadership"
                                    showNext={false}
                                    submitLabel="Update Purok"
                                />
                            </>
                        )}
                    </div>

                    {showPreview && (
                        <div className="lg:col-span-1">
                            <div className="sticky top-4 space-y-4">
                                <FormProgress
                                    progress={formProgress}
                                    isComplete={allRequiredFieldsFilled}
                                    missingFields={missingFields}
                                    onMissingFieldClick={(tabId) => setActiveTab(tabId)}
                                />
                                
                                <RequiredFieldsChecklist
                                    fields={requiredFieldsList}
                                    onTabClick={(tabId) => setActiveTab(tabId)}
                                    missingFields={missingFields}
                                />

                                {/* Purok Summary Preview Card */}
                                <Card className="dark:bg-gray-900">
                                    <div className="p-4 border-b dark:border-gray-700">
                                        <h3 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                            <Info className="h-4 w-4" />
                                            Purok Summary
                                        </h3>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center">
                                                <MapPin className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-medium dark:text-gray-200">
                                                    {formData.name || <span className="text-gray-400 italic">Not set</span>}
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge className={getStatusColor(formData.status)}>
                                                        {formData.status}
                                                    </Badge>
                                                    {selectedLeader && (
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            Leader assigned
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {selectedLeader && (
                                            <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <Avatar className="h-8 w-8">
                                                    {selectedLeader.photo_url ? (
                                                        <AvatarImage src={selectedLeader.photo_url} />
                                                    ) : null}
                                                    <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white text-xs">
                                                        {getInitials(selectedLeader.first_name, selectedLeader.last_name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium dark:text-gray-200">
                                                        {formatFullName(selectedLeader)}
                                                    </p>
                                                    {selectedLeader.contact_number && (
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            {selectedLeader.contact_number}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {formData.description && (
                                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3">
                                                    {formData.description}
                                                </p>
                                            </div>
                                        )}

                                        <Separator className="dark:bg-gray-700" />

                                        <div className="space-y-2">
                                            <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400">Statistics</h4>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                                                    <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                                                        {purok.households_count || 0}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">Households</div>
                                                </div>
                                                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                                                    <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                                                        {purok.residents_count || 0}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">Residents</div>
                                                </div>
                                            </div>
                                        </div>

                                        {hasUnsavedChanges && (
                                            <>
                                                <Separator className="dark:bg-gray-700" />
                                                <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                                                    <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-1">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse"></div>
                                                        {changedFieldsCount} field{changedFieldsCount !== 1 ? 's' : ''} modified
                                                    </p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </Card>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent className="dark:bg-gray-900">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                            <Trash2 className="h-5 w-5" />
                            Delete Purok
                        </AlertDialogTitle>
                        <AlertDialogDescription className="dark:text-gray-400">
                            Are you sure you want to delete purok "{purok.name}"? This action cannot be undone.
                            {(purok.households_count && purok.households_count > 0) && (
                                <span className="block mt-2 text-yellow-600 dark:text-yellow-400">
                                    Warning: This purok has {purok.households_count} households and {purok.residents_count || 0} residents.
                                </span>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
                        >
                            Delete Purok
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}