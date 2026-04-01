// pages/admin/residents/create.tsx
import AppLayout from '@/layouts/admin-app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Upload, Download, UserPlus, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import ImportModal from '@/components/filerelated/import-modal';

// Import new components
import ResidentFormHeader from '@/components/admin/residents/create/forms/ResidentFormHeader';
import PersonalInfoForm from '@/components/admin/residents/create/forms/PersonalInfoForm';
import ContactInfoForm from '@/components/admin/residents/create/forms/ContactInfoForm';
import AdditionalInfoForm from '@/components/admin/residents/create/forms/AdditionalInfoForm';
import PhotoUploadCard from '@/components/admin/residents/create/forms/PhotoUploadCard';
import PrivilegesCard from '@/components/admin/residents/create/forms/PrivilegesCard';
import FormSummaryCard from '@/components/admin/residents/create/forms/FormSummaryCard';
import QuickActionsCard from '@/components/admin/residents/create/forms/QuickActionsCard';
import HouseholdSection from '@/components/admin/residents/create/forms/HouseholdSection';
import { useResidentForm } from '@/components/admin/residents/create/hooks/useResidentForm';
import { downloadTemplate, downloadGuide, downloadEmptyTemplate } from '@/components/admin/residents/create/utils/csv-utils';

// Import types from main types file
import { 
    Purok, 
    Privilege,
    PageProps
} from '@/types/admin/residents/residents-types';

interface Household {
    id: number;
    household_number: string;
    head_of_family: string;
    head_resident_id: number | null;
    has_head: boolean;
    head_name: string;
    member_count: number;
}

interface CreateResidentProps extends PageProps {
    households: Household[];
    puroks: Purok[];
    privileges: Privilege[];
    civilStatusOptions: Array<{value: string, label: string}>;
    genderOptions: Array<{value: string, label: string}>;
    educationOptions: Array<{value: string, label: string}>;
    relationshipOptions: Array<{value: string, label: string}>;
    householdCreationOptions: Array<{value: string, label: string}>;
}

export default function CreateResident({ 
    households, 
    puroks, 
    privileges,
    civilStatusOptions, 
    genderOptions, 
    educationOptions,
    relationshipOptions,
    householdCreationOptions
}: CreateResidentProps) {
    const [importModalOpen, setImportModalOpen] = useState(false);
    const { data, setData, post, processing, errors, reset, handleFileChange } = useResidentForm();
    
    // Filter out the "NEW_HOUSEHOLD" option
    const existingHouseholds = households.filter(h => h.id !== 0);

    // Calculate form completion
    const requiredFields = [
        'first_name', 'last_name', 'birth_date', 'gender', 
        'civil_status', 'contact_number', 'address', 'purok_id'
    ];
    
    if (data.household_option === 'existing' && data.household_id) {
        requiredFields.push('relationship_to_head');
    }
    if (data.household_option === 'new') {
        requiredFields.push('new_household_name');
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const formData = new FormData();
        
        Object.entries(data).forEach(([key, value]) => {
            if (key === 'photo' && value instanceof File) {
                formData.append('photo', value);
            } else if (key === 'privileges') {
                if (value && Array.isArray(value) && value.length > 0) {
                    formData.append('privileges', JSON.stringify(value));
                }
            } else if (key === 'new_household_name' && value) {
                formData.append('new_household_name', String(value));
            } else if (value !== null && value !== undefined && value !== '') {
                formData.append(key, String(value));
            }
        });

        post('/admin/residents', {
            data: formData,
            preserveScroll: true,
            onSuccess: () => {
                // Optional: Show success message or redirect
                console.log('Resident created successfully');
            }
        });
    };

    const handleClearForm = () => {
        if (reset && typeof reset === 'function') {
            reset();
        }
    };

    const handleImportSuccess = () => {
        setImportModalOpen(false);
    };

    // Helper to handle privilege addition
    const handleAddPrivilege = (privilegeId: number) => {
        const privilege = privileges.find(p => p.id === privilegeId);
        if (privilege) {
            const expiresAt = privilege.validity_years 
                ? new Date(new Date().setFullYear(new Date().getFullYear() + privilege.validity_years)).toISOString().split('T')[0]
                : '';
            
            setData('privileges', [
                ...data.privileges,
                {
                    privilege_id: privilegeId,
                    id_number: '',
                    verified_at: new Date().toISOString().split('T')[0],
                    expires_at: expiresAt,
                    remarks: '',
                }
            ]);
        }
    };

    // Helper to handle privilege removal
    const handleRemovePrivilege = (privilegeId: number) => {
        setData('privileges', data.privileges.filter(p => p.privilege_id !== privilegeId));
    };

    // Helper to handle privilege update
    const handleUpdatePrivilege = (privilegeId: number, field: string, value: string) => {
        setData('privileges', data.privileges.map(p => 
            p.privilege_id === privilegeId ? { ...p, [field]: value } : p
        ));
    };

    return (
        <>
            <AppLayout
                title="Add Resident"
                breadcrumbs={[
                    { title: 'Dashboard', href: '/admin/dashboard' },
                    { title: 'Residents', href: '/admin/residents' },
                    { title: 'Add Resident', href: '/admin/residents/create' }
                ]}
            >
                <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <div className="space-y-6">
                        {/* Header with Actions */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <Link href="/admin/residents">
                                    <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300">
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Back to Residents
                                    </Button>
                                </Link>
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                        <UserPlus className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight dark:text-gray-100">
                                            Add New Resident
                                        </h1>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            Fill in the details to register a new resident
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setImportModalOpen(true)}
                                    className="dark:border-gray-600 dark:text-gray-300"
                                >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Import CSV
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white dark:from-blue-700 dark:to-indigo-700"
                                    size="sm"
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            Save Resident
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Error Messages */}
                        {Object.keys(errors).length > 0 && (
                            <Card className="border-l-4 border-l-red-500 dark:bg-gray-900">
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-red-800 dark:text-red-300">Please fix the following errors:</p>
                                            <ul className="list-disc list-inside mt-2 space-y-1">
                                                {Object.entries(errors).map(([field, error]) => (
                                                    <li key={field} className="text-sm text-red-600 dark:text-red-400">
                                                        <span className="font-medium capitalize">{field.replace(/_/g, ' ')}:</span> {error}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Template Download Info */}
                        <Card className="border-l-4 border-l-blue-500 dark:bg-gray-900">
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <Download className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                    <div className="flex-1">
                                        <h3 className="font-medium text-blue-800 dark:text-blue-300">Need to import multiple residents?</h3>
                                        <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                                            Download our CSV template to import residents in bulk. The template includes sample data and follows the exact format required.
                                        </p>
                                        <div className="flex items-center gap-4 mt-2">
                                            <button
                                                type="button"
                                                onClick={() => downloadTemplate()}
                                                className="text-sm text-blue-700 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 font-medium underline"
                                            >
                                                Download Template
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => downloadEmptyTemplate()}
                                                className="text-sm text-blue-700 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 font-medium underline"
                                            >
                                                Download Empty Template
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => downloadGuide()}
                                                className="text-sm text-blue-700 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 font-medium underline"
                                            >
                                                View Guide
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid gap-6 lg:grid-cols-3">
                            {/* Left Column - Main Form */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Personal Information */}
                                <PersonalInfoForm 
                                    data={data}
                                    setData={setData}
                                    errors={errors}
                                    genderOptions={genderOptions}
                                    civilStatusOptions={civilStatusOptions}
                                />

                                {/* Contact Information & Household Section */}
                                <Card className="dark:bg-gray-900">
                                    <ContactInfoForm 
                                        data={data}
                                        setData={setData}
                                        errors={errors}
                                        puroks={puroks}
                                    />
                                    
                                    <HouseholdSection
                                        data={data}
                                        setData={setData}
                                        errors={errors}
                                        householdCreationOptions={householdCreationOptions}
                                        existingHouseholds={existingHouseholds}
                                        relationshipOptions={relationshipOptions}
                                    />
                                </Card>

                                {/* Additional Information */}
                                <AdditionalInfoForm 
                                    data={data}
                                    setData={setData}
                                    educationOptions={educationOptions}
                                />
                            </div>

                            {/* Right Column */}
                            <div className="space-y-6">
                                {/* Photo Upload */}
                                <PhotoUploadCard 
                                    photo={data.photo}
                                    onFileChange={handleFileChange}
                                />

                                {/* Privileges/Categories Card */}
                                <PrivilegesCard
                                    privileges={privileges}
                                    assignedPrivileges={data.privileges}
                                    onAddPrivilege={handleAddPrivilege}
                                    onRemovePrivilege={handleRemovePrivilege}
                                    onUpdatePrivilege={handleUpdatePrivilege}
                                />

                                {/* Form Preview */}
                                <FormSummaryCard 
                                    data={data}
                                    requiredFields={requiredFields}
                                />

                                {/* Quick Actions */}
                                <QuickActionsCard 
                                    onDownloadTemplate={downloadTemplate}
                                    onImportClick={() => setImportModalOpen(true)}
                                />
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex items-center justify-between pt-6 border-t dark:border-gray-700">
                            <Button 
                                variant="ghost" 
                                type="button" 
                                onClick={handleClearForm} 
                                className="dark:text-gray-400 dark:hover:text-white"
                                disabled={processing}
                            >
                                Clear Form
                            </Button>
                            <div className="flex items-center gap-2">
                                <Link href="/admin/residents">
                                    <Button variant="outline" type="button" className="dark:border-gray-600 dark:text-gray-300">
                                        Cancel
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={processing} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white dark:from-blue-700 dark:to-indigo-700">
                                    <Save className="h-4 w-4 mr-2" />
                                    {processing ? 'Saving...' : 'Save & Register Resident'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </AppLayout>

            {/* Import Modal */}
            <ImportModal
                open={importModalOpen}
                onOpenChange={setImportModalOpen}
                downloadTemplate={downloadTemplate}
                downloadGuide={downloadGuide}
                downloadEmptyTemplate={downloadEmptyTemplate}
                onImportSuccess={handleImportSuccess}
                importUrl="/admin/residents/import"
            />
        </>
    );
}