// pages/admin/households/create.tsx
import AppLayout from '@/layouts/admin-app-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Upload, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { useState, useMemo, useCallback } from 'react';
import { PageProps } from '@/types/admin/households/household.types';

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

// Import types
import type { HouseholdFormData, Resident, Purok, Role } from '@/types/admin/households/household.types';

interface CreateHouseholdProps extends PageProps {
    heads: Resident[];
    available_residents: Resident[];
    puroks: Purok[];
    roles: Role[];
}

// Constants for better maintainability
const REQUIRED_FIELDS = ['head_of_family', 'address', 'purok_id'] as const;
const OPTIONAL_FIELDS = ['remarks', 'housing_type', 'water_source', 'electricity', 'internet'] as const;

type RequiredField = typeof REQUIRED_FIELDS[number];
type OptionalField = typeof OPTIONAL_FIELDS[number];

// Utility functions for form validation
const isFieldEmpty = (value: unknown): boolean => {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value === '';
    if (typeof value === 'number') return value === 0;
    return false;
};

const isFieldCompleted = <T extends keyof HouseholdFormData>(
    field: T, 
    value: HouseholdFormData[T]
): boolean => {
    if (field === 'purok_id') {
        return value !== null && value !== undefined && value !== 0;
    }
    if (field === 'electricity' || field === 'internet') {
        return value !== undefined;
    }
    return !isFieldEmpty(value);
};

export default function CreateHousehold({ 
    heads, 
    available_residents, 
    puroks,
    roles 
}: CreateHouseholdProps) {
    const [importModalOpen, setImportModalOpen] = useState(false);
    const { data, setData, post, processing, errors, reset } = useHouseholdForm();

    // Memoized form completion calculations
    const formProgress = useMemo(() => {
        const completedRequired = REQUIRED_FIELDS.filter(field => 
            isFieldCompleted(field, data[field])
        ).length;

        const completedOptional = OPTIONAL_FIELDS.filter(field => 
            isFieldCompleted(field, data[field])
        ).length;

        const totalFields = REQUIRED_FIELDS.length + OPTIONAL_FIELDS.length;
        const completedFields = completedRequired + completedOptional;
        
        return {
            completedRequired,
            completedOptional,
            totalProgress: Math.round((completedFields / totalFields) * 100),
            isComplete: completedFields === totalFields
        };
    }, [data]);

    // Memoized error list for better performance
    const errorList = useMemo(() => {
        return Object.entries(errors).map(([field, error]) => ({
            field,
            error: error as string
        }));
    }, [errors]);

    // Handlers
    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/households', {
            preserveScroll: true,
            onSuccess: () => reset()
        });
    }, [post, reset]);

    const handleImportSuccess = useCallback(() => {
        setImportModalOpen(false);
    }, []);

    const handleReset = useCallback(() => {
        if (confirm('Are you sure you want to clear all form data?')) {
            reset();
        }
    }, [reset]);

    // Determine progress bar color based on completion percentage
    const getProgressBarColor = useCallback((progress: number): string => {
        if (progress === 100) return 'bg-gradient-to-r from-green-500 to-emerald-500 dark:from-green-600 dark:to-emerald-600';
        if (progress >= 50) return 'bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-blue-600 dark:to-indigo-600';
        return 'bg-gradient-to-r from-amber-500 to-orange-500 dark:from-amber-600 dark:to-orange-600';
    }, []);

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
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Header with Actions */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Link href="/admin/households">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="dark:border-gray-600 dark:text-gray-300 hover:dark:bg-gray-800"
                                >
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
                                className="dark:border-gray-600 dark:text-gray-300 hover:dark:bg-gray-800"
                            >
                                <Upload className="h-4 w-4 mr-2" />
                                Import CSV
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white dark:from-green-700 dark:to-emerald-700 shadow-md hover:shadow-lg transition-all"
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

                    {/* Template Download Info */}
                    <Card className="border-l-4 border-l-blue-500 dark:bg-gray-900">
                        <div className="p-4">
                            <div className="flex items-start gap-3">
                                <Upload className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                <div className="flex-1">
                                    <h3 className="font-medium text-blue-800 dark:text-blue-300">Need to import multiple households?</h3>
                                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                                        Download our CSV template to import households in bulk. The template includes sample data and follows the exact format required.
                                    </p>
                                    <div className="flex flex-wrap items-center gap-4 mt-2">
                                        <button
                                            type="button"
                                            onClick={downloadTemplate}
                                            className="text-sm text-blue-700 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 font-medium underline transition-colors"
                                        >
                                            Download Template
                                        </button>
                                        <button
                                            type="button"
                                            onClick={downloadEmptyTemplate}
                                            className="text-sm text-blue-700 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 font-medium underline transition-colors"
                                        >
                                            Download Empty Template
                                        </button>
                                        <button
                                            type="button"
                                            onClick={downloadGuide}
                                            className="text-sm text-blue-700 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 font-medium underline transition-colors"
                                        >
                                            View Guide
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Error Messages */}
                    {errorList.length > 0 && (
                        <Card className="border-l-4 border-l-red-500 dark:bg-gray-900">
                            <div className="p-4">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                        <p className="font-medium text-red-800 dark:text-red-300 mb-2">
                                            Please fix the following errors:
                                        </p>
                                        <ul className="space-y-1">
                                            {errorList.map(({ field, error }) => (
                                                <li key={field} className="text-sm text-red-600 dark:text-red-400">
                                                    <span className="font-medium capitalize">{field.replace(/_/g, ' ')}:</span> {error}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Form Progress Banner */}
                    <Card className="border-l-4 border-l-blue-500 dark:bg-gray-900">
                        <div className="p-4">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                        <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium dark:text-gray-100">Form Completion Progress</p>
                                        <p className="text-sm text-blue-600 dark:text-blue-400">
                                            {formProgress.completedRequired}/{REQUIRED_FIELDS.length} required fields completed
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right w-full sm:w-auto">
                                    <p className="text-2xl font-bold dark:text-gray-100">{formProgress.totalProgress}%</p>
                                    <div className="w-full sm:w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-300 ${getProgressBarColor(formProgress.totalProgress)}`}
                                            style={{ width: `${formProgress.totalProgress}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Main Form Grid */}
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Left Column - Main Form */}
                        <div className="lg:col-span-2 space-y-6">
                            <BasicInfoCard 
                                data={data}
                                setData={setData}
                                errors={errors}
                                heads={heads}
                            />
                            <AddressInfoCard 
                                data={data}
                                setData={setData}
                                errors={errors}
                                puroks={puroks}
                            />
                            <MembersCard 
                                data={data}
                                setData={setData}
                                errors={errors}
                                availableResidents={available_residents}
                                heads={heads}
                            />
                            <HousingInfoCard 
                                data={data}
                                setData={setData}
                                errors={errors}
                            />
                            <AdditionalInfoCard 
                                data={data}
                                setData={setData}
                                errors={errors}
                            />
                        </div>

                        {/* Right Column - Summary & Actions */}
                        <div className="space-y-6">
                            <SummaryCard 
                                data={data}
                                members={data.members}
                            />
                            <ChecklistCard 
                                data={data}
                                members={data.members}
                            />
                            <QuickActionsCard 
                                onDownloadTemplate={downloadTemplate}
                                onImportClick={() => setImportModalOpen(true)}
                            />
                            <WaterSourceGuide />
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-6 border-t dark:border-gray-700">
                        <Button 
                            variant="ghost" 
                            type="button" 
                            onClick={handleReset}
                            className="dark:text-gray-400 dark:hover:text-white hover:dark:bg-gray-800 w-full sm:w-auto"
                        >
                            Clear Form
                        </Button>
                        <div className="flex flex-col-reverse sm:flex-row items-center gap-2 w-full sm:w-auto">
                            <Link href="/admin/households" className="w-full sm:w-auto">
                                <Button 
                                    variant="outline" 
                                    type="button" 
                                    className="dark:border-gray-600 dark:text-gray-300 hover:dark:bg-gray-800 w-full"
                                >
                                    Cancel
                                </Button>
                            </Link>
                            <Button 
                                type="submit" 
                                disabled={processing}
                                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white dark:from-green-700 dark:to-emerald-700 w-full sm:w-auto"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                {processing ? 'Saving...' : 'Register Household'}
                            </Button>
                        </div>
                    </div>
                </form>
            </AppLayout>

            {/* Modals */}
            <CredentialsModal />
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