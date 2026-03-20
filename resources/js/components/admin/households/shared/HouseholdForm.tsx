// pages/admin/households/create.tsx (refactored)
import AppLayout from '@/layouts/admin-app-layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { PageProps } from '@/types';

// Import components
import HouseholdForm from '@/components/admin/households/shared/HouseholdForm';
import QuickActionsCard from '@/components/admin/households/create/QuickActionsCard';
import CredentialsModal from '@/components/admin/households/create/CredentialsModal';
import ImportHouseholdModal from '@/components/admin/households/create/import/ImportHouseholdModal';

// Import hooks and utils
import { useHouseholdForm } from '@/components/admin/households/create/hooks/useHouseholdForm';
import { downloadTemplate, downloadGuide, downloadEmptyTemplate } from '@/components/admin/households/create/utils/csv-utils';

interface CreateHouseholdProps extends PageProps {
    heads: any[];
    available_residents: any[];
    puroks: any[];
    roles: any[];
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
                                        Download our CSV template to import households in bulk.
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

                    {/* Main Form */}
                    <HouseholdForm
                        data={data}
                        setData={setData}
                        errors={errors}
                        processing={processing}
                        onSubmit={handleSubmit}
                        onReset={reset}
                        submitLabel="Register Household"
                        cancelUrl="/admin/households"
                        heads={heads}
                        availableResidents={available_residents}
                        puroks={puroks}
                    >
                        <QuickActionsCard 
                            onDownloadTemplate={() => downloadTemplate()}
                            onImportClick={() => setImportModalOpen(true)}
                        />
                    </HouseholdForm>
                </div>
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