// pages/admin/households/create.tsx
import AppLayout from '@/layouts/admin-app-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Upload, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { PageProps } from '@/types';

// Import components
import HouseholdFormHeader from '@/components/admin/households/create/HouseholdFormHeader';
import BasicInfoCard from '@/components/admin/households/create/BasicInfoCard';
import AddressInfoCard from '@/components/admin/households/create/AddressInfoCard';
import MembersCard from '@/components/admin/households/create/MembersCard';
import HousingInfoCard from '@/components/admin/households/create/HousingInfoCard';
import AdditionalInfoCard from '@/components/admin/households/create/AdditionalInfoCard';
import SummaryCard from '@/components/admin/households/create/SummaryCard';
import QuickActionsCard from '@/components/admin/households/create/QuickActionsCard';
import CredentialsModal from '@/components/admin/households/create/CredentialsModal';
import ImportHouseholdModal from '@/components/admin/households/create/import/ImportHouseholdModal';

// Import hooks and utils
import { useHouseholdForm } from '@/components/admin/households/create/hooks/useHouseholdForm';
import { downloadTemplate, downloadGuide, downloadEmptyTemplate } from '@/components/admin/households/create/utils/csv-utils';
import ChecklistCard from '@/components/admin/households/create/ChecklistCard';
import WaterSourceGuide from '@/components/admin/households/create/WaterSourceGuide';

// Define types locally
interface HouseholdMember {
    resident_id: number;
    role: string;
    is_primary: boolean;
}

interface HouseholdFormData {
    head_of_family: number | null;
    address: string;
    purok_id: number | null;
    remarks: string;
    housing_type: string;
    water_source: string;
    electricity: boolean;
    internet: boolean;
    members: HouseholdMember[];
}

interface Resident {
    id: number;
    first_name: string;
    last_name: string;
    middle_name?: string;
    age?: number;
    address?: string;
    purok?: string;
    purok_id?: number;
    photo_path?: string;
    photo_url?: string;
}

interface Purok {
    id: number;
    name: string;
}

interface Role {
    id: number;
    name: string;
    description?: string;
}

interface CreateHouseholdProps extends PageProps {
    heads: Resident[];
    available_residents: Resident[];
    puroks: Purok[];
    roles: Role[];
}

// Type guard to check if a field is a key of HouseholdFormData
function isHouseholdFormField(key: string): key is keyof HouseholdFormData {
    const validFields: (keyof HouseholdFormData)[] = [
        'head_of_family',
        'address',
        'purok_id',
        'remarks',
        'housing_type',
        'water_source',
        'electricity',
        'internet',
        'members'
    ];
    return validFields.includes(key as keyof HouseholdFormData);
}

export default function CreateHousehold({ 
    heads, 
    available_residents, 
    puroks,
    roles 
}: CreateHouseholdProps) {
    const [importModalOpen, setImportModalOpen] = useState(false);
    const { data, setData, post, processing, errors, reset } = useHouseholdForm();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/households', {
            preserveScroll: true,
            onSuccess: () => {
                reset();
            }
        });
    };

    const handleImportSuccess = () => {
        setImportModalOpen(false);
    };

    // Calculate form completion with proper type checking
    const requiredFields = ['head_of_family', 'address', 'purok_id'] as const;
    const optionalFields = ['remarks', 'housing_type', 'water_source', 'electricity', 'internet'] as const;
    
    // Type-safe field completion checker
    const completedRequired = requiredFields.filter(field => {
        const value = data[field];
        if (field === 'purok_id') {
            return value !== null && value !== undefined && value !== 0;
        }
        return value !== '' && value !== null && value !== undefined;
    }).length;

    const completedOptional = optionalFields.filter(field => {
        const value = data[field];
        if (field === 'electricity' || field === 'internet') {
            return value !== undefined;
        }
        return value !== '' && value !== null && value !== undefined;
    }).length;

    const totalProgress = Math.round(
        ((completedRequired + completedOptional) / (requiredFields.length + optionalFields.length)) * 100
    );

    // Helper function to get field error
    const getFieldError = (field: keyof HouseholdFormData): string | undefined => {
        return errors[field];
    };

    return (
        <>
            <AppLayout
                title="Register Household"
                breadcrumbs={[
                    { title: 'Dashboard', href: '/admin/dashboard' },
                    { title: 'Households', href: '/admin/households' },
                    { title: 'Register Household', href: '/admin/households/create' }
                ]}
            >
                <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                        {/* Header with Actions */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <Link href="/admin/households">
                                    <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300">
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Back to Households
                                    </Button>
                                </Link>
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700 flex items-center justify-center shadow-lg shadow-green-500/20">
                                        <Save className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight dark:text-gray-100">
                                            Register Household
                                        </h1>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            Fill in the details to register a new household
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
                                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white dark:from-green-700 dark:to-emerald-700"
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
                                            Register Household
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Template Download Info - With dark mode styling */}
                        <Card className="border-l-4 border-l-blue-500 dark:bg-gray-900">
                            <div className="p-4">
                                <div className="flex items-start gap-3">
                                    <Upload className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                    <div className="flex-1">
                                        <h3 className="font-medium text-blue-800 dark:text-blue-300">Need to import multiple households?</h3>
                                        <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                                            Download our CSV template to import households in bulk. The template includes sample data and follows the exact format required.
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
                            </div>
                        </Card>

                        {/* Error Messages - With dark mode styling */}
                        {Object.keys(errors).length > 0 && (
                            <Card className="border-l-4 border-l-red-500 dark:bg-gray-900">
                                <div className="p-4">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-red-800 dark:text-red-300">Please fix the following errors:</p>
                                            <ul className="list-disc list-inside mt-2 space-y-1">
                                                {Object.entries(errors).map(([field, error]) => {
                                                    if (isHouseholdFormField(field)) {
                                                        return (
                                                            <li key={field} className="text-sm text-red-600 dark:text-red-400">
                                                                <span className="font-medium capitalize">{field.replace(/_/g, ' ')}:</span> {error}
                                                            </li>
                                                        );
                                                    }
                                                    return null;
                                                })}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Form Progress Banner */}
                        <Card className="border-l-4 border-l-blue-500 dark:bg-gray-900">
                            <div className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                            <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium dark:text-gray-100">Form Completion Progress</p>
                                            <p className="text-sm text-blue-600 dark:text-blue-400">
                                                {completedRequired}/{requiredFields.length} required fields completed
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold dark:text-gray-100">{totalProgress}%</p>
                                        <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full ${
                                                    totalProgress === 100 
                                                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 dark:from-green-600 dark:to-emerald-600' 
                                                        : totalProgress >= 50 
                                                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-blue-600 dark:to-indigo-600' 
                                                            : 'bg-gradient-to-r from-amber-500 to-orange-500 dark:from-amber-600 dark:to-orange-600'
                                                }`}
                                                style={{ width: `${totalProgress}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <div className="grid gap-6 lg:grid-cols-3">
                            {/* Left Column - Main Form */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Basic Household Information */}
                                <BasicInfoCard 
                                    data={data}
                                    setData={setData}
                                    errors={errors}
                                    heads={heads}
                                />

                                {/* Address Information */}
                                <AddressInfoCard 
                                    data={data}
                                    setData={setData}
                                    errors={errors}
                                    puroks={puroks}
                                />

                                {/* Household Members */}
                                <MembersCard 
                                    data={data}
                                    setData={setData}
                                    errors={errors}
                                    availableResidents={available_residents}
                                    heads={heads}
                                />

                                {/* Housing & Economic Information */}
                                <HousingInfoCard 
                                    data={data}
                                    setData={setData}
                                    errors={errors}
                                />

                                {/* Additional Information */}
                                <AdditionalInfoCard 
                                    data={data}
                                    setData={setData}
                                    errors={errors}
                                />
                            </div>

                            {/* Right Column - Summary & Actions */}
                            <div className="space-y-6">
                                {/* Household Summary */}
                                <SummaryCard 
                                    data={data}
                                    members={data.members}
                                />

                                {/* Registration Checklist */}
                                <ChecklistCard 
                                    data={data}
                                    members={data.members}
                                />

                                {/* Quick Actions */}
                                <QuickActionsCard 
                                    onDownloadTemplate={() => downloadTemplate()}
                                    onImportClick={() => setImportModalOpen(true)}
                                />

                                {/* Water Source Guide */}
                                <WaterSourceGuide />
                            </div>
                        </div>

                        {/* Form Actions - Fixed at bottom */}
                        <div className="flex items-center justify-between pt-6 border-t dark:border-gray-700">
                            <Button variant="ghost" type="button" onClick={reset} className="dark:text-gray-400 dark:hover:text-white">
                                Clear Form
                            </Button>
                            <div className="flex items-center gap-2">
                                <Link href="/admin/households">
                                    <Button variant="outline" type="button" className="dark:border-gray-600 dark:text-gray-300">
                                        Cancel
                                    </Button>
                                </Link>
                                <Button 
                                    type="submit" 
                                    disabled={processing}
                                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white dark:from-green-700 dark:to-emerald-700"
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    {processing ? 'Saving...' : 'Register Household'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </AppLayout>

            {/* Credentials Modal */}
            <CredentialsModal />

            {/* Import Modal */}
            <ImportHouseholdModal
                open={importModalOpen}
                onOpenChange={setImportModalOpen}
                downloadTemplate={downloadTemplate}
                downloadGuide={downloadGuide}
                downloadEmptyTemplate={downloadEmptyTemplate}
                onImportSuccess={handleImportSuccess}
                importUrl="/admin/households/import"
                puroks={puroks}
                roles={roles}
            />
        </>
    );
}