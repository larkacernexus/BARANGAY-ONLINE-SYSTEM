// pages/admin/Blotters/Edit.tsx
import { useState, useEffect } from 'react';
import { router, Link } from '@inertiajs/react';
import { toast } from 'sonner';
import AdminLayout from '@/layouts/admin-app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Save, Send, ArrowRight, Eye, FileText, AlertCircle, Users, UserPlus, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { BLOTTER_INCIDENT_TYPES, getPriorityLevelColor, getPriorityLevelLabel } from '@/data/blotterIncidentTypes';

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

// Types
interface Resident {
    id: number;
    name: string;
    first_name: string;
    last_name: string;
    address?: string;
    contact_number?: string;
}

interface Attachment {
    id: number;
    file_name: string;
    file_path: string;
    file_type: string;
    file_size: number;
    created_at: string;
}

interface InvolvedResident {
    id: number;
    name: string;
    address?: string;
}

interface Props {
    blotter: {
        id: number;
        case_number: string;
        incident_type: string;
        incident_description: string;
        incident_datetime: string;
        location: string;
        barangay: string;
        reporter_name: string;
        reporter_contact: string;
        reporter_address: string;
        reporter_resident_id: number | null;
        respondent_name: string;
        respondent_address: string;
        respondent_resident_id: number | null;
        witnesses: string;
        evidence: string;
        priority: string;
        status: string;
        involved_residents: InvolvedResident[];
        attachments: Attachment[];
        created_at: string;
        updated_at: string;
    };
    residents: Resident[];
    barangayName?: string;
}

// Steps configuration
const steps = [
    { number: 1, title: 'Incident Info', description: 'Type, date, location', icon: AlertCircle },
    { number: 2, title: 'Parties Involved', description: 'Reporter & respondent', icon: Users },
    { number: 3, title: 'Submit', description: 'Review & submit', icon: Send },
];

export default function Edit({ blotter, residents, barangayName = 'Kibawe' }: Props) {
    const [activeStep, setActiveStep] = useState(1);
    const [selectedType, setSelectedType] = useState<any>(null);
    const [selectedResidents, setSelectedResidents] = useState<Resident[]>([]);
    const [newAttachments, setNewAttachments] = useState<File[]>([]);
    const [existingAttachments, setExistingAttachments] = useState<Attachment[]>([]);
    const [attachmentsToDelete, setAttachmentsToDelete] = useState<number[]>([]);
    const [attachmentPreviews, setAttachmentPreviews] = useState<string[]>([]);
    const [incidentSearchTerm, setIncidentSearchTerm] = useState('');
    const [selectedReporterResident, setSelectedReporterResident] = useState<Resident | null>(null);
    const [selectedRespondentResident, setSelectedRespondentResident] = useState<Resident | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [data, setData] = useState({
        incident_type: blotter.incident_type,
        incident_description: blotter.incident_description,
        incident_datetime: blotter.incident_datetime,
        location: blotter.location,
        barangay: blotter.barangay,
        reporter_name: blotter.reporter_name,
        reporter_contact: blotter.reporter_contact,
        reporter_address: blotter.reporter_address,
        reporter_is_resident: !!blotter.reporter_resident_id,
        reporter_resident_id: blotter.reporter_resident_id,
        respondent_name: blotter.respondent_name,
        respondent_address: blotter.respondent_address,
        respondent_is_resident: !!blotter.respondent_resident_id,
        respondent_resident_id: blotter.respondent_resident_id,
        witnesses: blotter.witnesses,
        evidence: blotter.evidence,
        priority: blotter.priority,
        involved_residents: blotter.involved_residents?.map(r => r.id) || [],
        attachments: [] as File[],
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Initialize data from blotter
    useEffect(() => {
        // Set selected incident type
        const type = BLOTTER_INCIDENT_TYPES.find(t => t.code === blotter.incident_type);
        if (type) {
            setSelectedType(type);
            setIncidentSearchTerm(type.name);
        }

        // Set selected reporter resident
        if (blotter.reporter_resident_id) {
            const resident = residents.find(r => r.id === blotter.reporter_resident_id);
            if (resident) {
                setSelectedReporterResident(resident);
            }
        }

        // Set selected respondent resident
        if (blotter.respondent_resident_id) {
            const resident = residents.find(r => r.id === blotter.respondent_resident_id);
            if (resident) {
                setSelectedRespondentResident(resident);
            }
        }

        // Set selected involved residents
        if (blotter.involved_residents?.length) {
            const involved = residents.filter(r => 
                blotter.involved_residents.some(ir => ir.id === r.id)
            );
            setSelectedResidents(involved);
        }

        // Set existing attachments
        if (blotter.attachments?.length) {
            setExistingAttachments(blotter.attachments);
        }
    }, [blotter, residents]);

    // Filter incident types for dropdown
    const filteredIncidentTypes = BLOTTER_INCIDENT_TYPES.filter(type => {
        if (!incidentSearchTerm) return true;
        const searchLower = incidentSearchTerm.toLowerCase();
        return type.name.toLowerCase().includes(searchLower) ||
               type.code.toLowerCase().includes(searchLower) ||
               type.category.toLowerCase().includes(searchLower);
    });

    const groupedIncidentTypes = filteredIncidentTypes.reduce((groups, type) => {
        if (!groups[type.category]) {
            groups[type.category] = [];
        }
        groups[type.category].push(type);
        return groups;
    }, {} as Record<string, typeof BLOTTER_INCIDENT_TYPES>);

    // Calculate progress
    const requiredFields = ['incident_type', 'incident_datetime', 'location', 'incident_description'];
    const completedRequired = requiredFields.filter(field => {
        const value = data[field as keyof typeof data];
        return value !== '' && value !== null && value !== undefined;
    }).length;
    const totalProgress = Math.round((completedRequired / requiredFields.length) * 100);

    const isStepValid = () => {
        if (activeStep === 1) {
            return data.incident_type && data.incident_datetime && data.location && data.incident_description;
        }
        if (activeStep === 2) {
            return (data.reporter_name || data.reporter_resident_id) ? true : false;
        }
        return true;
    };

    // Navigation
    const goToStep = (step: number) => {
        if (step >= 1 && step <= 3) {
            setActiveStep(step);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const nextStep = () => {
        if (activeStep === 1 && !isStepValid()) return;
        if (activeStep === 2 && !isStepValid()) return;
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

    // Event handlers
    const handleIncidentTypeSelect = (type: any) => {
        setSelectedType(type);
        setData(prev => ({ ...prev, incident_type: type.code }));
        
        const priorityMap: Record<number, string> = {
            1: 'urgent', 2: 'high', 3: 'medium', 4: 'low', 5: 'low'
        };
        setData(prev => ({ ...prev, priority: priorityMap[type.priority_level] || 'medium' }));
        setData(prev => ({ ...prev, incident_description: `${type.name}: ${type.description}\n\nDetails:\n- ` }));
        setIncidentSearchTerm(type.name);
    };

    const handleIncidentTypeClear = () => {
        setSelectedType(null);
        setData(prev => ({ ...prev, incident_type: '' }));
        setIncidentSearchTerm('');
    };

    const handleReporterResidentSelect = (resident: Resident) => {
        setSelectedReporterResident(resident);
        setData(prev => ({
            ...prev,
            reporter_name: resident.name,
            reporter_contact: resident.contact_number || '',
            reporter_address: resident.address || '',
            reporter_resident_id: resident.id,
        }));
    };

    const handleReporterResidentClear = () => {
        setSelectedReporterResident(null);
        setData(prev => ({
            ...prev,
            reporter_name: '',
            reporter_contact: '',
            reporter_address: '',
            reporter_resident_id: null,
        }));
    };

    const handleRespondentResidentSelect = (resident: Resident) => {
        setSelectedRespondentResident(resident);
        setData(prev => ({
            ...prev,
            respondent_name: resident.name,
            respondent_address: resident.address || '',
            respondent_resident_id: resident.id,
        }));
    };

    const handleRespondentResidentClear = () => {
        setSelectedRespondentResident(null);
        setData(prev => ({
            ...prev,
            respondent_name: '',
            respondent_address: '',
            respondent_resident_id: null,
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setNewAttachments([...newAttachments, ...files]);
            
            files.forEach(file => {
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

    const removeNewFile = (index: number) => {
        setNewAttachments(newAttachments.filter((_, i) => i !== index));
        setAttachmentPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingFile = (fileId: number) => {
        setExistingAttachments(prev => prev.filter(f => f.id !== fileId));
        setAttachmentsToDelete(prev => [...prev, fileId]);
    };

    const toggleResident = (resident: Resident) => {
        const isSelected = selectedResidents.some(r => r.id === resident.id);
        if (isSelected) {
            setSelectedResidents(selectedResidents.filter(r => r.id !== resident.id));
            setData(prev => ({
                ...prev,
                involved_residents: prev.involved_residents.filter(id => id !== resident.id)
            }));
        } else {
            setSelectedResidents([...selectedResidents, resident]);
            setData(prev => ({
                ...prev,
                involved_residents: [...prev.involved_residents, resident.id]
            }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!isStepValid()) {
            toast.error('Please complete all required fields');
            return;
        }

        setIsSubmitting(true);

        const submitData = new FormData();
        
        // Append all form fields
        Object.entries(data).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                if (key === 'attachments') return;
                if (typeof value === 'boolean') {
                    submitData.append(key, value ? '1' : '0');
                } else {
                    submitData.append(key, String(value));
                }
            }
        });

        // Append attachments to delete
        if (attachmentsToDelete.length > 0) {
            submitData.append('delete_attachments', JSON.stringify(attachmentsToDelete));
        }

        // Append new attachments
        newAttachments.forEach((file, index) => {
            submitData.append(`attachments[${index}]`, file);
        });

        // Add method override for PUT
        submitData.append('_method', 'PUT');

        router.post(`/admin/blotters/${blotter.id}`, submitData, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Blotter updated successfully');
                setIsSubmitting(false);
            },
            onError: (errors) => {
                setErrors(errors);
                Object.entries(errors).forEach(([field, message]) => {
                    toast.error(`${field}: ${message}`);
                });
                setIsSubmitting(false);
            },
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

    const totalAttachmentsCount = newAttachments.length + existingAttachments.length;

    return (
        <AdminLayout
            title={`Edit Blotter #${blotter.case_number || blotter.id}`}
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Blotters', href: '/admin/blotters' },
                { title: 'Edit Blotter', href: `/admin/blotters/${blotter.id}/edit` }
            ]}
        >
            <form onSubmit={handleSubmit}>
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
                                        Edit Blotter
                                    </h1>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Case #{blotter.case_number || blotter.id} • Last updated: {new Date(blotter.updated_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Link href={`/admin/blotters/${blotter.id}`}>
                                <Button type="button" variant="outline" size="lg">
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                </Button>
                            </Link>
                            <Button 
                                type="submit" 
                                disabled={isSubmitting || !isStepValid()}
                                className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                {isSubmitting ? 'Saving...' : 'Update Blotter'}
                            </Button>
                        </div>
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
                                        onIncidentDatetimeChange={(val) => setData(prev => ({ ...prev, incident_datetime: val }))}
                                        onPriorityChange={(val) => setData(prev => ({ ...prev, priority: val }))}
                                        onLocationChange={(val) => setData(prev => ({ ...prev, location: val }))}
                                        onDescriptionChange={(val) => setData(prev => ({ ...prev, incident_description: val }))}
                                        getPriorityDescription={getPriorityDescription}
                                    />
                                    <AttachmentsCard
                                        newAttachments={newAttachments}
                                        existingAttachments={existingAttachments}
                                        previews={attachmentPreviews}
                                        onFileChange={handleFileChange}
                                        onRemoveNewFile={removeNewFile}
                                        onRemoveExistingFile={removeExistingFile}
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
                                        onToggle={(checked) => setData(prev => ({ ...prev, reporter_is_resident: checked }))}
                                        onResidentSelect={handleReporterResidentSelect}
                                        onResidentClear={handleReporterResidentClear}
                                        onNameChange={(val) => setData(prev => ({ ...prev, reporter_name: val }))}
                                        onContactChange={(val) => setData(prev => ({ ...prev, reporter_contact: val }))}
                                        onAddressChange={(val) => setData(prev => ({ ...prev, reporter_address: val }))}
                                        errors={errors}
                                    />
                                    <RespondentInfoCard
                                        residents={residents}
                                        isResident={data.respondent_is_resident}
                                        selectedResident={selectedRespondentResident}
                                        respondentName={data.respondent_name}
                                        respondentAddress={data.respondent_address}
                                        onToggle={(checked) => setData(prev => ({ ...prev, respondent_is_resident: checked }))}
                                        onResidentSelect={handleRespondentResidentSelect}
                                        onResidentClear={handleRespondentResidentClear}
                                        onNameChange={(val) => setData(prev => ({ ...prev, respondent_name: val }))}
                                        onAddressChange={(val) => setData(prev => ({ ...prev, respondent_address: val }))}
                                    />
                                    <AdditionalInfoCard
                                        witnesses={data.witnesses}
                                        evidence={data.evidence}
                                        onWitnessesChange={(val) => setData(prev => ({ ...prev, witnesses: val }))}
                                        onEvidenceChange={(val) => setData(prev => ({ ...prev, evidence: val }))}
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
                                    attachmentsCount={totalAttachmentsCount}
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
                                            disabled={isSubmitting}
                                            className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                                        >
                                            <Send className="h-4 w-4 mr-2" />
                                            {isSubmitting ? 'Updating...' : 'Update Blotter'}
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
                            attachmentsCount={totalAttachmentsCount}
                            status={blotter.status}
                            priority={data.priority}
                            createdAt={blotter.created_at}
                            updatedAt={blotter.updated_at}
                        />
                    </div>
                </div>
            </form>
        </AdminLayout>
    );
}