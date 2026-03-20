// pages/admin/residents/edit.tsx
import AppLayout from '@/layouts/admin-app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Save, User, Mail, Phone, MapPin, Calendar, Award, FileText, Home, Users, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Link, useForm } from '@inertiajs/react';
import { useEffect, useState, useRef } from 'react';
import { PageProps } from '@/types';

// Import new components
import PersonalInfoSection from '@/components/admin/residents/edit/PersonalInfoSection';
import ContactInfoSection from '@/components/admin/residents/edit/ContactInfoSection';
import AdditionalInfoSection from '@/components/admin/residents/edit/AdditionalInfoSection';
import PhotoSection from '@/components/admin/residents/edit/PhotoSection';
import PrivilegesSection from '@/components/admin/residents/edit/PrivilegesSection';
import FormProgressCard from '@/components/admin/residents/edit/FormProgressCard';
import ResidentInfoCard from '@/components/admin/residents/edit/ResidentInfoCard';
import ErrorMessages from '@/components/admin/residents/edit/ErrorMessages';

// Import types and utilities
import { Purok, Privilege, Resident, ResidentFormData } from '@/components/admin/residents/edit/resident';
import { formatDisplayDate, calculateAgeFromDate } from '@/components/admin/residents/edit/utils/date-utils';

interface EditResidentProps extends PageProps {
    resident: Resident;
    puroks: Purok[];
    all_privileges: Privilege[];
    civilStatusOptions: Array<{value: string, label: string}>;
    genderOptions: Array<{value: string, label: string}>;
    educationOptions: Array<{value: string, label: string}>;
}

export default function EditResident({ 
    resident,
    puroks, 
    all_privileges,
    civilStatusOptions, 
    genderOptions, 
    educationOptions
}: EditResidentProps) {
    const { data, setData, post, processing, errors } = useForm<ResidentFormData>({
        first_name: resident.first_name || '',
        last_name: resident.last_name || '',
        middle_name: resident.middle_name || '',
        suffix: resident.suffix || '',
        birth_date: resident.birth_date || '',
        age: resident.age || 0,
        gender: resident.gender || 'male',
        civil_status: resident.civil_status || 'single',
        contact_number: resident.contact_number || '',
        email: resident.email || '',
        address: resident.address || '',
        purok_id: resident.purok_id,
        occupation: resident.occupation || '',
        education: resident.education || '',
        religion: resident.religion || '',
        is_voter: resident.is_voter || false,
        place_of_birth: resident.place_of_birth || '',
        remarks: resident.remarks || '',
        status: resident.status || 'active',
        photo: null,
        privileges: resident.privileges || [],
        _method: 'PUT',
    });

    const [photoPreview, setPhotoPreview] = useState<string | null>(
        resident.photo_path ? `/storage/${resident.photo_path}` : null
    );
    
    // Refs to prevent event bubbling issues
    const fileInputRef = useRef<HTMLInputElement>(null);
    const formRef = useRef<HTMLFormElement>(null);

    // Calculate age when birth date changes
    useEffect(() => {
        if (data.birth_date) {
            const age = calculateAgeFromDate(data.birth_date);
            setData('age', age);
        }
    }, [data.birth_date]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const formData = new FormData();
        
        Object.entries(data).forEach(([key, value]) => {
            if (key === 'photo' && value instanceof File) {
                formData.append('photo', value);
            } else if (key === 'privileges') {
                formData.append('privileges', JSON.stringify(value));
            } else if (value !== null && value !== undefined) {
                formData.append(key, String(value));
            }
        });
        
        post(`/admin/residents/${resident.id}`, {
            data: formData,
            preserveScroll: true,
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation(); // Stop event from bubbling
        const file = e.target.files?.[0] || null;
        
        if (file) {
            setData('photo', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removePhoto = (e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        setData('photo', null);
        setPhotoPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Handle click on choose photo button
    const handleChoosePhotoClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        fileInputRef.current?.click();
    };

    // Calculate form completion
    const requiredFields = [
        'first_name', 'last_name', 'birth_date', 'gender', 
        'civil_status', 'contact_number', 'address', 'purok_id'
    ];
    
    const optionalFields = [
        'middle_name', 'suffix', 'email', 'occupation', 
        'education', 'religion', 'place_of_birth', 'remarks', 'status'
    ];

    const completedRequired = requiredFields.filter(field => {
        const value = data[field as keyof ResidentFormData];
        if (field === 'purok_id') {
            return value !== null && value !== undefined && value !== 0;
        }
        return value !== '' && value !== null && value !== undefined;
    }).length;

    const completedOptional = optionalFields.filter(field => {
        const value = data[field as keyof ResidentFormData];
        return value !== '' && value !== null && value !== undefined;
    }).length;

    const totalProgress = Math.round(
        ((completedRequired + completedOptional) / (requiredFields.length + optionalFields.length)) * 100
    );

    const getStatusColor = (status: string): string => {
        switch(status) {
            case 'active': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
            case 'inactive': return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
            case 'deceased': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
            default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700';
        }
    };

    const getStatusIcon = (status: string) => {
        switch(status) {
            case 'active': return <CheckCircle className="h-3 w-3" />;
            case 'inactive': return <AlertCircle className="h-3 w-3" />;
            case 'deceased': return <XCircle className="h-3 w-3" />;
            default: return <AlertCircle className="h-3 w-3" />;
        }
    };

    return (
        <AppLayout
            title={`Edit Resident: ${resident.first_name} ${resident.last_name}`}
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Residents', href: '/admin/residents' },
                { title: resident.resident_id || `Resident #${resident.id}`, href: `/admin/residents/${resident.id}` },
                { title: 'Edit', href: `/admin/residents/${resident.id}/edit` }
            ]}
        >
            <form onSubmit={handleSubmit} encType="multipart/form-data" ref={formRef}>
                <div className="space-y-6">
                    {/* Header with Actions */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Link href={`/admin/residents/${resident.id}`}>
                                <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Profile
                                </Button>
                            </Link>
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                    <User className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight dark:text-gray-100">
                                        Edit Resident
                                    </h1>
                                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                                        <Badge variant="outline" className="flex items-center gap-1 bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800">
                                            <FileText className="h-3 w-3" />
                                            {resident.resident_id || `ID: ${resident.id}`}
                                        </Badge>
                                        <Badge variant="outline" className={`flex items-center gap-1 ${getStatusColor(resident.status)}`}>
                                            {getStatusIcon(resident.status)}
                                            <span className="ml-1 capitalize">{resident.status}</span>
                                        </Badge>
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            {resident.first_name} {resident.last_name}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
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
                                    Update Resident
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Error Messages */}
                    <ErrorMessages errors={errors} />

                    {/* Form Progress Banner */}
                    <Card className="border-l-4 border-l-blue-500 dark:bg-gray-900">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                        <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
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
                        </CardContent>
                    </Card>

                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Left Column - Main Form */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Personal Information */}
                            <PersonalInfoSection 
                                data={data}
                                setData={setData}
                                errors={errors}
                                genderOptions={genderOptions}
                                civilStatusOptions={civilStatusOptions}
                                formatDisplayDate={formatDisplayDate}
                            />

                            {/* Contact Information */}
                            <ContactInfoSection 
                                data={data}
                                setData={setData}
                                errors={errors}
                                puroks={puroks}
                            />

                            {/* Additional Information */}
                            <AdditionalInfoSection 
                                data={data}
                                setData={setData}
                                educationOptions={educationOptions}
                            />
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            {/* Photo Upload - Updated with Avatar */}
                            <PhotoSection 
                                photoPreview={photoPreview}
                                residentName={`${resident.first_name} ${resident.last_name}`}
                                onFileChange={handleFileChange}
                                onRemovePhoto={removePhoto}
                                onChoosePhotoClick={handleChoosePhotoClick}
                                selectedFile={data.photo}
                                fileInputRef={fileInputRef}
                            />

                            {/* Resident Info Card */}
                            <ResidentInfoCard 
                                residentId={resident.resident_id}
                                createdAt={resident.created_at}
                                age={data.age}           
                                gender={data.gender}     
                                householdRelation={resident.household_relation}
                                formatDisplayDate={formatDisplayDate}
                            />

                            {/* Privileges/Benefits Card */}
                            <PrivilegesSection
                                privileges={all_privileges}
                                assignedPrivileges={data.privileges}
                                onAddPrivilege={(privilegeId) => {
                                    const privilege = all_privileges.find(p => p.id === privilegeId);
                                    const today = new Date().toISOString().split('T')[0];
                                    
                                    let expiresAt = '';
                                    if (privilege?.validity_years) {
                                        const expiryDate = new Date();
                                        expiryDate.setFullYear(expiryDate.getFullYear() + privilege.validity_years);
                                        expiresAt = expiryDate.toISOString().split('T')[0];
                                    }
                                    
                                    setData('privileges', [
                                        ...data.privileges,
                                        {
                                            privilege_id: privilegeId,
                                            id_number: '',
                                            verified_at: today,
                                            expires_at: expiresAt,
                                            remarks: '',
                                            discount_percentage: privilege?.discount_percentage,
                                        }
                                    ]);
                                }}
                                onRemovePrivilege={(privilegeId) => {
                                    setData('privileges', data.privileges.filter(p => p.privilege_id !== privilegeId));
                                }}
                                onUpdatePrivilege={(privilegeId, field, value) => {
                                    setData('privileges', data.privileges.map(p => 
                                        p.privilege_id === privilegeId ? { ...p, [field]: value } : p
                                    ));
                                }}
                            />

                            {/* Form Progress */}
                            <FormProgressCard 
                                data={data}
                                requiredFields={requiredFields}
                                optionalFields={optionalFields}
                            />
                        </div>
                    </div>

                    {/* Form Actions - Fixed at bottom */}
                    <div className="flex items-center justify-between pt-6 border-t dark:border-gray-700">
                        <Link href={`/admin/residents/${resident.id}`}>
                            <Button variant="outline" type="button" className="dark:border-gray-600 dark:text-gray-300">
                                Cancel
                            </Button>
                        </Link>
                        <Button 
                            type="submit" 
                            disabled={processing}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white dark:from-blue-700 dark:to-indigo-700"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {processing ? 'Saving Changes...' : 'Update Resident'}
                        </Button>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}