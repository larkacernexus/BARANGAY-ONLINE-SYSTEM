// pages/admin/CommunityReports/Edit.tsx
import { useState, useRef, useEffect } from 'react';
import { router, Link } from '@inertiajs/react';
import { toast } from 'sonner';
import { route } from 'ziggy-js';
import AdminLayout from '@/layouts/admin-app-layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Send, ArrowRight, Eye, FileText, UserPlus, Trash2 } from 'lucide-react';
import { PageProps, ReportType, FileWithPreview, CommunityReportFormData } from '@/types/admin/reports/community-report';

// Import components
import { PreviewModal } from '@/components/admin/community-reports/create/components/PreviewModal';
import { StepProgress } from '@/components/admin/community-reports/create/components/StepProgress';
import { ComplainantInfoCard } from '@/components/admin/community-reports/create/components/ComplainantInfoCard';
import { ReportTypeCard } from '@/components/admin/community-reports/create/components/ReportTypeCard';
import { IncidentDetailsCard } from '@/components/admin/community-reports/create/components/IncidentDetailsCard';
import { ReviewCard } from '@/components/admin/community-reports/create/components/ReviewCard';
import { ProgressSidebar } from '@/components/admin/community-reports/create/components/ProgressSidebar';

// Steps configuration
const steps = [
    { number: 1, title: 'Basic Info', description: 'Complainant & report type', icon: UserPlus },
    { number: 2, title: 'Report Details', description: 'Incident information', icon: FileText },
    { number: 3, title: 'Review & Submit', description: 'Review and submit report', icon: Eye },
];

interface ExistingFile {
    id: number;
    file_name: string;
    file_path: string;
    file_type: string;
    file_size: number;
}

export default function Edit({
    report,
    report_types,
    puroks,
    users,
    ...props
}: PageProps & { report: any }) {
    const [activeStep, setActiveStep] = useState(1);
    const [selectedType, setSelectedType] = useState<ReportType | null>(null);
    const [selectedResident, setSelectedResident] = useState<PageProps['users'][0] | null>(null);
    const [newFiles, setNewFiles] = useState<FileWithPreview[]>([]);
    const [existingFiles, setExistingFiles] = useState<ExistingFile[]>([]);
    const [filesToDelete, setFilesToDelete] = useState<number[]>([]);
    const [previewModal, setPreviewModal] = useState<{
        isOpen: boolean;
        url: string | null;
        type: string;
        name: string;
    }>({
        isOpen: false,
        url: null,
        type: '',
        name: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const today = new Date().toISOString().split('T')[0];

    const [formData, setFormData] = useState<CommunityReportFormData>({
        user_id: report.user_id,
        report_type_id: report.report_type_id,
        title: report.title,
        description: report.description,
        detailed_description: report.detailed_description || '',
        location: report.location,
        incident_date: report.incident_date,
        incident_time: report.incident_time || '',
        urgency_level: report.urgency_level,
        recurring_issue: report.recurring_issue,
        affected_people: report.affected_people,
        estimated_affected_count: report.estimated_affected_count || '',
        is_anonymous: report.is_anonymous,
        reporter_name: report.reporter_name || '',
        reporter_contact: report.reporter_contact || '',
        reporter_address: report.reporter_address || '',
        perpetrator_details: report.perpetrator_details || '',
        preferred_resolution: report.preferred_resolution || '',
        has_previous_report: report.has_previous_report,
        previous_report_id: report.previous_report_id || '',
        impact_level: report.impact_level,
        safety_concern: report.safety_concern,
        environmental_impact: report.environmental_impact,
        noise_level: report.noise_level || '',
        duration_hours: report.duration_hours || '',
        status: report.status,
        priority: report.priority,
        assigned_to: report.assigned_to,
    });

    // Initialize data from report
    useEffect(() => {
        // Set selected type
        const type = report_types.find((t: { id: number; }) => t.id === report.report_type_id);
        if (type) {
            setSelectedType(type);
        }

        // Set selected resident
        if (report.user_id) {
            const resident = users.find((u: { id: number; }) => u.id === report.user_id);
            if (resident) {
                setSelectedResident(resident);
            }
        }

        // Set existing files
        if (report.evidences && report.evidences.length > 0) {
            setExistingFiles(report.evidences);
        }
    }, [report, report_types, users]);

    // Handle resident selection
    const handleResidentSelect = (resident: PageProps['users'][0]) => {
        setSelectedResident(resident);
        setFormData((prev: any) => ({
            ...prev,
            user_id: resident.id,
            reporter_name: resident.name,
            reporter_contact: resident.phone || resident.email || '',
            reporter_address: resident.address || '',
        }));
    };

    const handleClearResident = () => {
        setSelectedResident(null);
        setFormData((prev: any) => ({
            ...prev,
            user_id: null,
            reporter_name: '',
            reporter_contact: '',
            reporter_address: '',
        }));
    };

    // Handle type selection
    const handleTypeSelect = (typeId: number) => {
        const type = report_types.find((t: { id: number; }) => t.id === typeId);
        setSelectedType(type || null);
        setFormData((prev: any) => ({ ...prev, report_type_id: typeId }));
    };

    // Handle new file selection
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        const maxSize = 10 * 1024 * 1024;
        
        const validFiles = selectedFiles.filter(file => file.size <= maxSize);
        const invalidFiles = selectedFiles.filter(file => file.size > maxSize);
        
        if (invalidFiles.length > 0) {
            toast.error(`${invalidFiles.length} file(s) exceed the 10MB limit`);
        }
        
        const filesWithPreview = validFiles.map(file => {
            const fileWithPreview = file as FileWithPreview;
            fileWithPreview.id = Math.random().toString(36).substr(2, 9);
            if (file.type.startsWith('image/')) {
                fileWithPreview.preview = URL.createObjectURL(file);
            }
            return fileWithPreview;
        });
        
        setNewFiles(prev => [...prev, ...filesWithPreview]);
    };

    const removeNewFile = (id: string) => {
        setNewFiles(prev => {
            const file = prev.find(f => f.id === id);
            if (file?.preview) {
                URL.revokeObjectURL(file.preview);
            }
            return prev.filter(f => f.id !== id);
        });
    };

    const removeExistingFile = (fileId: number) => {
        setExistingFiles(prev => prev.filter(f => f.id !== fileId));
        setFilesToDelete(prev => [...prev, fileId]);
    };

    const clearAllNewFiles = () => {
        newFiles.forEach(file => {
            if (file.preview) {
                URL.revokeObjectURL(file.preview);
            }
        });
        setNewFiles([]);
    };

    const openPreview = (file: FileWithPreview | ExistingFile) => {
        let url = '';
        let type = '';
        let name = '';
        
        if ('preview' in file && file.preview) {
            url = file.preview;
            type = file.type;
            name = file.name;
        } else if ('file_path' in file) {
            url = file.file_path;
            type = file.file_type;
            name = file.file_name;
        }
        
        setPreviewModal({
            isOpen: true,
            url,
            type,
            name,
        });
    };

    const closePreview = () => {
        if (previewModal.url && !previewModal.url.startsWith('blob:')) {
            URL.revokeObjectURL(previewModal.url);
        }
        setPreviewModal({
            isOpen: false,
            url: null,
            type: '',
            name: '',
        });
    };

    // Clean up URLs on unmount
    useEffect(() => {
        return () => {
            newFiles.forEach(file => {
                if (file.preview) {
                    URL.revokeObjectURL(file.preview);
                }
            });
        };
    }, []);

    // Navigation
    const goToStep = (step: number) => {
        if (step >= 1 && step <= 3) {
            setActiveStep(step);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const nextStep = () => {
        if (activeStep === 1) {
            if (!formData.user_id && !formData.is_anonymous && !formData.reporter_name) {
                toast.error('Please select a resident or fill in complainant information');
                return;
            }
            if (!formData.report_type_id) {
                toast.error('Please select a report type');
                return;
            }
        }
        
        if (activeStep === 2) {
            if (!formData.title.trim()) {
                toast.error('Please enter a title');
                return;
            }
            if (!formData.description.trim()) {
                toast.error('Please enter a description');
                return;
            }
            if (!formData.location.trim()) {
                toast.error('Please enter the location');
                return;
            }
        }
        
        if (activeStep < 3) {
            setActiveStep(prev => prev + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const prevStep = () => {
        if (activeStep > 1) {
            setActiveStep(prev => prev - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Handle form input changes
    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData((prev: any) => ({ ...prev, [name]: checked }));
        } else {
            setFormData((prev: any) => ({ ...prev, [name]: value }));
        }
    };

    const handleCheckboxChange = (name: string, checked: boolean) => {
        setFormData((prev: any) => ({ ...prev, [name]: checked }));
    };

    // Form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isSubmitting) return;

        if (!formData.report_type_id) {
            toast.error('Please select a report type');
            goToStep(1);
            return;
        }

        if (!formData.title.trim() || !formData.description.trim() || !formData.location.trim()) {
            toast.error('Please fill in all required fields');
            goToStep(2);
            return;
        }

        try {
            setIsSubmitting(true);

            const submitData = new FormData();

            // Append all form fields
            Object.entries(formData).forEach(([key, value]) => {
                if (value !== null && value !== undefined && value !== '') {
                    if (typeof value === 'boolean') {
                        submitData.append(key, value ? '1' : '0');
                    } else {
                        submitData.append(key, String(value));
                    }
                }
            });

            // Append files to delete
            if (filesToDelete.length > 0) {
                submitData.append('delete_evidences', JSON.stringify(filesToDelete));
            }

            // Append new files
            newFiles.forEach((file, index) => {
                submitData.append(`evidences[${index}]`, file);
            });

            // Add _method for PUT request
            submitData.append('_method', 'PUT');

            router.post(route('admin.community-reports.update', report.id), submitData, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Community report updated successfully');
                    newFiles.forEach(file => {
                        if (file.preview) {
                            URL.revokeObjectURL(file.preview);
                        }
                    });
                },
                onError: (errors) => {
                    Object.entries(errors).forEach(([field, message]) => {
                        toast.error(`${field}: ${message}`);
                    });
                },
                onFinish: () => {
                    setIsSubmitting(false);
                },
            });
        } catch (error) {
            toast.error('An unexpected error occurred');
            setIsSubmitting(false);
        }
    };

    // Calculate form completion
    const requiredFields = ['title', 'description', 'location', 'incident_date', 'report_type_id'];
    const completedRequired = requiredFields.filter(field => {
        const value = formData[field as keyof CommunityReportFormData];
        return value !== '' && value !== null && value !== undefined;
    }).length;
    const totalProgress = Math.round((completedRequired / requiredFields.length) * 100);

    const isStepValid = () => {
        if (activeStep === 1) {
            return (formData.user_id !== null || formData.is_anonymous || formData.reporter_name) && 
                   formData.report_type_id !== null;
        }
        if (activeStep === 2) {
            return formData.title.trim() !== '' && 
                   formData.description.trim() !== '' && 
                   formData.location.trim() !== '';
        }
        return true;
    };

    // Get total files count
    const totalFilesCount = newFiles.length + existingFiles.length;

    return (
        <AdminLayout
            title={`Edit Community Report #${report.report_number || report.id}`}
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Community Reports', href: '/admin/community-reports' },
                { title: 'Edit Report', href: `/admin/community-reports/${report.id}/edit` }
            ]}
        >
            <form onSubmit={handleSubmit}>
                <div className="space-y-6 p-4 md:p-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Link href={route('admin.community-reports.index')}>
                                <Button type="button" variant="outline" size="sm">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back
                                </Button>
                            </Link>
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                    <FileText className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                                        Edit Community Report
                                    </h1>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Report #{report.report_number || report.id} • Last updated: {new Date(report.updated_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Link href={route('admin.community-reports.show', report.id)}>
                                <Button type="button" variant="outline" size="lg">
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Report
                                </Button>
                            </Link>
                            <Button 
                                type="submit" 
                                disabled={isSubmitting || !isStepValid()} 
                                size="lg"
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                {isSubmitting ? 'Saving...' : 'Update Report'}
                            </Button>
                        </div>
                    </div>

                    {/* Step Progress */}
                    <StepProgress steps={steps} activeStep={activeStep} onStepClick={goToStep} />

                    {/* Main Content Grid */}
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Left Column - Main Form */}
                        <div className="lg:col-span-2 space-y-6">
                            {activeStep === 1 && (
                                <>
                                    <ComplainantInfoCard
                                        residents={users}
                                        selectedResident={selectedResident}
                                        formData={{
                                            user_id: formData.user_id,
                                            is_anonymous: formData.is_anonymous,
                                            reporter_name: formData.reporter_name,
                                            reporter_contact: formData.reporter_contact,
                                            reporter_address: formData.reporter_address,
                                        }}
                                        onResidentSelect={handleResidentSelect}
                                        onClearResident={handleClearResident}
                                        onCheckboxChange={handleCheckboxChange}
                                        onInputChange={handleInputChange}
                                    />
                                    <ReportTypeCard
                                        reportTypes={report_types}
                                        selectedType={selectedType}
                                        onTypeSelect={handleTypeSelect}
                                    />
                                </>
                            )}

                            {activeStep === 2 && (
                                <IncidentDetailsCard
                                    formData={formData}
                                    newFiles={newFiles}
                                    existingFiles={existingFiles}
                                    selectedType={selectedType}
                                    puroks={puroks}
                                    today={today}
                                    onInputChange={handleInputChange}
                                    onCheckboxChange={handleCheckboxChange}
                                    onFileSelect={handleFileSelect}
                                    onRemoveNewFile={removeNewFile}
                                    onRemoveExistingFile={removeExistingFile}
                                    onClearAllNewFiles={clearAllNewFiles}
                                    onOpenPreview={openPreview}
                                />
                            )}

                            {activeStep === 3 && (
                                <ReviewCard
                                    isAnonymous={formData.is_anonymous}
                                    reporterName={formData.reporter_name}
                                    reporterContact={formData.reporter_contact}
                                    reporterAddress={formData.reporter_address}
                                    selectedType={selectedType}
                                    title={formData.title}
                                    description={formData.description}
                                    detailedDescription={formData.detailed_description}
                                    incidentDate={formData.incident_date}
                                    incidentTime={formData.incident_time}
                                    location={formData.location}
                                    perpetratorDetails={formData.perpetrator_details}
                                    preferredResolution={formData.preferred_resolution}
                                    filesCount={totalFilesCount}
                                    recurringIssue={formData.recurring_issue}
                                    safetyConcern={formData.safety_concern}
                                    environmentalImpact={formData.environmental_impact}
                                />
                            )}

                            {/* Navigation Buttons */}
                            <div className="flex items-center justify-between pt-4">
                                <div>
                                    {activeStep > 1 ? (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={prevStep}
                                        >
                                            <ArrowLeft className="h-4 w-4 mr-2" />
                                            Previous
                                        </Button>
                                    ) : (
                                        <Link href={route('admin.community-reports.index')}>
                                            <Button type="button" variant="outline">
                                                Cancel
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                                <div>
                                    {activeStep < 3 ? (
                                        <Button
                                            type="button"
                                            onClick={nextStep}
                                            disabled={!isStepValid()}
                                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                                        >
                                            Next
                                            <ArrowRight className="h-4 w-4 ml-2" />
                                        </Button>
                                    ) : (
                                        <Button 
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white"
                                        >
                                            <Send className="h-4 w-4 mr-2" />
                                            {isSubmitting ? 'Updating...' : 'Update Report'}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Sidebar */}
                        <ProgressSidebar
                            completedRequired={completedRequired}
                            requiredFieldsCount={requiredFields.length}
                            totalProgress={totalProgress}
                            selectedType={selectedType}
                            filesCount={totalFilesCount}
                            status={formData.status}
                            priority={formData.priority}
                            createdAt={report.created_at}
                            updatedAt={report.updated_at}
                        />
                    </div>
                </div>
            </form>

            {/* Preview Modal */}
            <PreviewModal
                isOpen={previewModal.isOpen}
                url={previewModal.url}
                type={previewModal.type}
                name={previewModal.name}
                onClose={closePreview}
            />
        </AdminLayout>
    );
}