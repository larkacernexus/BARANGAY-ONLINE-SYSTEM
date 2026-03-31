// pages/admin/Blotters/Create.tsx (Complete Fixed Version)

import { useState, useMemo, ChangeEvent, FormEvent } from 'react';
import { Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Save, ArrowRight, Send, AlertCircle, AlertTriangle, CheckCircle, FileText, Info, Users } from 'lucide-react';
import { BLOTTER_INCIDENT_TYPES } from '@/data/blotterIncidentTypes';

// Import components
import { StepProgress } from '@/components/admin/blotters/create/components/StepProgress';
import { IncidentDetailsCard } from '@/components/admin/blotters/create/components/IncidentDetailsCard';
import { AttachmentsCard } from '@/components/admin/blotters/create/components/AttachmentsCard';
import { ReporterInfoCard } from '@/components/admin/blotters/create/components/ReporterInfoCard';
import { RespondentInfoCard } from '@/components/admin/blotters/create/components/RespondentInfoCard';
import { AdditionalInfoCard } from '@/components/admin/blotters/create/components/AdditionalInfoCard';
import { InvolvedResidentsCard } from '@/components/admin/blotters/create/components/InvolvedResidentsCard';
import { ReviewCard } from '@/components/admin/blotters/create/components/ReviewCard';
import { ProgressSidebar } from '@/components/admin/blotters/create/components/ProgressSidebar';

// Import types
import type { Resident, IncidentType } from '@/types/admin/blotters/blotter';
interface Props {
    residents: Resident[];
    barangayName?: string;
}

const steps = [
    { number: 1, title: 'Incident Info', description: 'Type, date, location', icon: AlertCircle },
    { number: 2, title: 'Parties Involved', description: 'Reporter & respondent', icon: Users },
    { number: 3, title: 'Submit', description: 'Review & submit', icon: Send },
];

export default function CreateBlotter({ residents, barangayName = 'Kibawe' }: Props) {
    const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
    const [selectedType, setSelectedType] = useState<IncidentType | null>(null);
    const [selectedResidents, setSelectedResidents] = useState<Resident[]>([]);
    const [attachmentPreviews, setAttachmentPreviews] = useState<string[]>([]);
    const [incidentSearchTerm, setIncidentSearchTerm] = useState('');
    const [selectedReporterResident, setSelectedReporterResident] = useState<Resident | null>(null);
    const [selectedRespondentResident, setSelectedRespondentResident] = useState<Resident | null>(null);

    const { data, setData, post, processing, errors } = useForm({
        incident_type: '',
        incident_description: '',
        incident_datetime: '',
        location: '',
        barangay: barangayName,
        reporter_name: '',
        reporter_contact: '',
        reporter_address: '',
        reporter_is_resident: false,
        reporter_resident_id: null as number | null,
        respondent_name: '',
        respondent_address: '',
        respondent_is_resident: false,
        respondent_resident_id: null as number | null,
        witnesses: '',
        evidence: '',
        priority: 'medium',
        involved_residents: [] as number[],
        attachments: [] as File[], // Using browser File type
    });

    // Filter incident types
    const filteredIncidentTypes = useMemo(() => {
        if (!incidentSearchTerm) return BLOTTER_INCIDENT_TYPES;
        const searchLower = incidentSearchTerm.toLowerCase();
        return BLOTTER_INCIDENT_TYPES.filter(type => 
            type.name.toLowerCase().includes(searchLower) ||
            type.code.toLowerCase().includes(searchLower) ||
            type.category.toLowerCase().includes(searchLower) ||
            type.description.toLowerCase().includes(searchLower)
        );
    }, [incidentSearchTerm]);

    const groupedIncidentTypes = useMemo(() => {
        const groups: Record<string, IncidentType[]> = {};
        filteredIncidentTypes.forEach(type => {
            if (!groups[type.category]) {
                groups[type.category] = [];
            }
            groups[type.category].push(type);
        });
        return groups;
    }, [filteredIncidentTypes]);

    // Calculate progress
    const requiredFields = ['incident_type', 'incident_datetime', 'location', 'incident_description'];
    const completedRequired = requiredFields.filter(field => {
        const value = data[field as keyof typeof data];
        return value !== '' && value !== null && value !== undefined;
    }).length;
    const totalProgress = Math.round((completedRequired / requiredFields.length) * 100);

    const isStepValid = (): boolean => {
        if (activeStep === 1) {
            return !!(data.incident_type && data.incident_datetime && data.location && data.incident_description);
        }
        if (activeStep === 2) {
            return !!(data.reporter_name || data.reporter_resident_id);
        }
        return true;
    };

    // Navigation
    const goToStep = (step: number): void => {
        if (step >= 1 && step <= 3) {
            setActiveStep(step as 1 | 2 | 3);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const nextStep = (): void => {
        if (activeStep === 1 && !isStepValid()) return;
        if (activeStep < 3) {
            setActiveStep(prev => (prev + 1) as 1 | 2 | 3);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const prevStep = (): void => {
        if (activeStep > 1) {
            setActiveStep(prev => (prev - 1) as 1 | 2 | 3);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Event handlers
    const handleIncidentTypeSelect = (type: IncidentType): void => {
        setSelectedType(type);
        setData('incident_type', type.code);
        
        const priorityMap: Record<number, string> = {
            1: 'urgent', 2: 'high', 3: 'medium', 4: 'low', 5: 'low'
        };
        setData('priority', priorityMap[type.priority_level] || 'medium');
        setData('incident_description', `${type.name}: ${type.description}\n\nDetails:\n- `);
        setIncidentSearchTerm(type.name);
    };

    const handleIncidentTypeClear = (): void => {
        setSelectedType(null);
        setData('incident_type', '');
        setIncidentSearchTerm('');
    };

    const handleReporterResidentSelect = (resident: Resident): void => {
        setSelectedReporterResident(resident);
        setData('reporter_name', resident.name);
        setData('reporter_contact', resident.contact_number || '');
        setData('reporter_address', resident.address || '');
        setData('reporter_resident_id', resident.id);
    };

    const handleReporterResidentClear = (): void => {
        setSelectedReporterResident(null);
        setData('reporter_name', '');
        setData('reporter_contact', '');
        setData('reporter_address', '');
        setData('reporter_resident_id', null);
    };

    const handleRespondentResidentSelect = (resident: Resident): void => {
        setSelectedRespondentResident(resident);
        setData('respondent_name', resident.name);
        setData('respondent_address', resident.address || '');
        setData('respondent_resident_id', resident.id);
    };

    const handleRespondentResidentClear = (): void => {
        setSelectedRespondentResident(null);
        setData('respondent_name', '');
        setData('respondent_address', '');
        setData('respondent_resident_id', null);
    };

    // FIXED: Properly typed file change handler
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const fileArray: File[] = Array.from(files);
            const currentAttachments = [...data.attachments];
            setData('attachments', [...currentAttachments, ...fileArray]);
            
            // Generate previews for image files
            fileArray.forEach((file: File) => {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        setAttachmentPreviews(prev => [...prev, reader.result as string]);
                    };
                    reader.readAsDataURL(file);
                } else {
                    setAttachmentPreviews(prev => [...prev, '']);
                }
            });
        }
    };

    // FIXED: removeFile accepts index parameter
    const handleRemoveNewFile = (index: number): void => {
        const updatedAttachments = data.attachments.filter((_, i) => i !== index);
        setData('attachments', updatedAttachments);
        
        const updatedPreviews = attachmentPreviews.filter((_, i) => i !== index);
        setAttachmentPreviews(updatedPreviews);
    };

    const toggleResident = (resident: Resident): void => {
        const isSelected = selectedResidents.some(r => r.id === resident.id);
        if (isSelected) {
            setSelectedResidents(selectedResidents.filter(r => r.id !== resident.id));
            setData('involved_residents', data.involved_residents.filter(id => id !== resident.id));
        } else {
            setSelectedResidents([...selectedResidents, resident]);
            setData('involved_residents', [...data.involved_residents, resident.id]);
        }
    };

    // FIXED: Proper FormData handling
    const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        if (!isStepValid()) return;
        
        // Create FormData for file uploads
        const formData = new FormData();
        
        // Append all form fields
        Object.entries(data).forEach(([key, value]) => {
            if (key === 'attachments' && Array.isArray(value)) {
                // Append each file individually
                (value as File[]).forEach((file: File, index: number) => {
                    formData.append(`attachments[${index}]`, file);
                });
            } else if (value !== null && value !== undefined && value !== '') {
                formData.append(key, value.toString());
            }
        });
        
        post('/admin/blotters', {
            data: formData,
            forceFormData: true,
        });
    };

    // Helper functions
    const getPriorityIcon = (priority: string) => {
        switch(priority) {
            case 'urgent': return <AlertCircle className="h-4 w-4" />;
            case 'high': return <AlertTriangle className="h-4 w-4" />;
            case 'medium': return <Info className="h-4 w-4" />;
            case 'low': return <CheckCircle className="h-4 w-4" />;
            default: return <Info className="h-4 w-4" />;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch(priority) {
            case 'urgent': return 'text-red-600 dark:text-red-400';
            case 'high': return 'text-orange-600 dark:text-orange-400';
            case 'medium': return 'text-yellow-600 dark:text-yellow-400';
            case 'low': return 'text-green-600 dark:text-green-400';
            default: return '';
        }
    };

    const getPriorityDescription = (priority: string) => {
        switch(priority) {
            case 'urgent': return 'Requires immediate action within 24 hours';
            case 'high': return 'Requires action within 3 days';
            case 'medium': return 'Requires action within 7 days';
            case 'low': return 'Requires action within 15 days';
            default: return '';
        }
    };

    return (
        <AdminLayout
            title="File Blotter"
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Blotters', href: '/admin/blotters' },
                { title: 'File Blotter', href: '/admin/blotters/create' }
            ]}
        >
            <form onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="space-y-6 p-4 md:p-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Link href="/admin/blotters">
                                <Button type="button" variant="outline" size="sm">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back
                                </Button>
                            </Link>
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 flex items-center justify-center shadow-lg shadow-red-500/20">
                                    <FileText className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight dark:text-gray-100">
                                        File New Blotter
                                    </h1>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Record a new incident or complaint for Barangay {barangayName}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <Button 
                            type="submit" 
                            disabled={processing || !isStepValid()}
                            className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {processing ? 'Saving...' : 'File Blotter'}
                        </Button>
                    </div>

                    {/* Step Progress */}
                    <StepProgress steps={steps} activeStep={activeStep} onStepClick={goToStep} />

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
                                                    <span className="font-medium capitalize">{field.replace(/_/g, ' ')}:</span> {error as string}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Main Form - Left Column */}
                        <div className="lg:col-span-2 space-y-6">
                            {activeStep === 1 && (
                                <>
                                    <IncidentDetailsCard
                                        selectedType={selectedType}
                                        incidentSearchTerm={incidentSearchTerm}
                                        filteredTypes={filteredIncidentTypes}
                                        groupedTypes={groupedIncidentTypes}
                                        incidentDatetime={data.incident_datetime}
                                        priority={data.priority}
                                        location={data.location}
                                        barangay={data.barangay}
                                        description={data.incident_description}
                                        errors={errors}
                                        onTypeSelect={handleIncidentTypeSelect}
                                        onTypeClear={handleIncidentTypeClear}
                                        onIncidentDatetimeChange={(val) => setData('incident_datetime', val)}
                                        onPriorityChange={(val) => setData('priority', val)}
                                        onLocationChange={(val) => setData('location', val)}
                                        onDescriptionChange={(val) => setData('incident_description', val)}
                                        getPriorityDescription={getPriorityDescription}
                                    />
                                    <AttachmentsCard
                                        newAttachments={data.attachments}
                                        existingAttachments={[]}
                                        previews={attachmentPreviews}
                                        onFileChange={handleFileChange}
                                        onRemoveNewFile={handleRemoveNewFile}
                                        isEditMode={false}
                                    />
                                </>
                            )}

                            {activeStep === 2 && (
                                <>
                                    <ReporterInfoCard
                                        residents={residents}
                                        isResident={data.reporter_is_resident}
                                        selectedResident={selectedReporterResident}
                                        reporterName={data.reporter_name}
                                        reporterContact={data.reporter_contact}
                                        reporterAddress={data.reporter_address}
                                        onToggle={(checked) => setData('reporter_is_resident', checked)}
                                        onResidentSelect={handleReporterResidentSelect}
                                        onResidentClear={handleReporterResidentClear}
                                        onNameChange={(val) => setData('reporter_name', val)}
                                        onContactChange={(val) => setData('reporter_contact', val)}
                                        onAddressChange={(val) => setData('reporter_address', val)}
                                        errors={errors}
                                    />
                                    <RespondentInfoCard
                                        residents={residents}
                                        isResident={data.respondent_is_resident}
                                        selectedResident={selectedRespondentResident}
                                        respondentName={data.respondent_name}
                                        respondentAddress={data.respondent_address}
                                        onToggle={(checked) => setData('respondent_is_resident', checked)}
                                        onResidentSelect={handleRespondentResidentSelect}
                                        onResidentClear={handleRespondentResidentClear}
                                        onNameChange={(val) => setData('respondent_name', val)}
                                        onAddressChange={(val) => setData('respondent_address', val)}
                                    />
                                    <AdditionalInfoCard
                                        witnesses={data.witnesses}
                                        evidence={data.evidence}
                                        onWitnessesChange={(val) => setData('witnesses', val)}
                                        onEvidenceChange={(val) => setData('evidence', val)}
                                        showTips={true}
                                    />
                                    <InvolvedResidentsCard
                                        residents={residents}
                                        selectedResidents={selectedResidents}
                                        onToggle={toggleResident}
                                    />
                                </>
                            )}

                            {activeStep === 3 && (
                                <ReviewCard
                                    selectedType={selectedType}
                                    incidentDatetime={data.incident_datetime}
                                    location={data.location}
                                    priority={data.priority}
                                    description={data.incident_description}
                                    reporterName={data.reporter_name}
                                    reporterContact={data.reporter_contact}
                                    reporterAddress={data.reporter_address}
                                    reporterIsResident={data.reporter_is_resident}
                                    respondentName={data.respondent_name}
                                    respondentAddress={data.respondent_address}
                                    respondentIsResident={data.respondent_is_resident}
                                    selectedResidents={selectedResidents}
                                    witnesses={data.witnesses}
                                    evidence={data.evidence}
                                    attachmentsCount={data.attachments.length}
                                    getPriorityIcon={getPriorityIcon}
                                    getPriorityColor={getPriorityColor}
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
                                        <Link href="/admin/blotters">
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
                                            className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                                        >
                                            Next
                                            <ArrowRight className="h-4 w-4 ml-2" />
                                        </Button>
                                    ) : (
                                        <Button 
                                            type="submit"
                                            disabled={processing}
                                            className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                                        >
                                            <Send className="h-4 w-4 mr-2" />
                                            {processing ? 'Submitting...' : 'Submit Blotter'}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Progress & Summary */}
                        <ProgressSidebar
                            completedRequired={completedRequired}
                            requiredFieldsCount={requiredFields.length}
                            totalProgress={totalProgress}
                            selectedType={selectedType}
                            attachmentsCount={data.attachments.length}
                        />
                    </div>
                </div>
            </form>
        </AdminLayout>
    );
}