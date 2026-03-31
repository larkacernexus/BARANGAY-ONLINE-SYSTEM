// pages/admin/officials/edit/[id].tsx

import AppLayout from '@/layouts/admin-app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Link, router, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Save, UserPlus, Shield, Phone, Info, Camera } from 'lucide-react';

// Import types from shared officials types
import { 
    Resident, 
    Position, 
    Committee, 
    Role, 
    Official, 
    User,
    OfficialFormData 
} from '@/types/admin/officials/officials';

// Import shared components
import { OfficialFormHeader } from '@/components/admin/officials/shared/official-form-header';
import { ErrorMessages } from '@/components/admin/officials/shared/error-messages';
import { ResidentSelection } from '@/components/admin/officials/shared/resident-selection';
import { PositionInformation } from '@/components/admin/officials/shared/position-information';
import { ContactInformation } from '@/components/admin/officials/shared/contact-information';
import { UserAssignment } from '@/components/admin/officials/shared/user-assignment';
import { PhotoUpload } from '@/components/admin/officials/shared/photo-upload';
import { PreviewCard } from '@/components/admin/officials/shared/preview-card';
import { QuickStats } from '@/components/admin/officials/shared/quick-stats';

interface EditOfficialProps {
    official: Official & {
        resident: Resident;
        positionData: Position;
        committeeData?: Committee;
        user?: User;
    };
    positions: Position[];
    committees: Committee[];
    availableResidents: Resident[];
    availableUsers: User[];
    roles: Role[];
    statusOptions: Array<{ value: string; label: string }>;
}

export default function EditOfficial({ 
    official,
    positions, 
    committees, 
    availableResidents,
    availableUsers = [],
    roles,
    statusOptions,
}: EditOfficialProps) {
    // Initialize form with EXISTING official data

        const initialFormData: OfficialFormData = {
            resident_id: official.resident_id,
            position_id: official.position_id,
            committee_id: official.committee_id ?? null,  // Convert undefined to null
            term_start: official.term_start,
            term_end: official.term_end,
            status: official.status,
            order: official.order || 0,
            responsibilities: official.responsibilities || '',
            contact_number: official.contact_number || official.resident?.contact_number || '',
            email: official.email || official.resident?.email || '',
            achievements: official.achievements || '',
            photo: null,
            use_resident_photo: !official.photo_path && !!official.resident?.photo_path,
            is_regular: official.is_regular ?? true,
            user_id: official.user_id ?? null,  // Convert undefined to null
        };
    const { data, setData, processing, errors } = useForm<OfficialFormData>(initialFormData);

    const [selectedResident, setSelectedResident] = useState<Resident | null>(official.resident || null);
    const [selectedUser, setSelectedUser] = useState<User | null>(official.user || null);
    const [currentPosition, setCurrentPosition] = useState<Position | null>(
        positions.find(p => p.id === official.position_id) || null
    );
    const [photoPreview, setPhotoPreview] = useState<string | null>(
        official.photo_url || official.resident?.photo_url || null
    );

    // Effect to handle position changes
    useEffect(() => {
        if (data.position_id) {
            const positionData = positions.find(p => p.id === data.position_id);
            setCurrentPosition(positionData || null);
            
            // Only update order if position changed
            if (positionData && positionData.order !== official.order) {
                setData('order', positionData.order);
            }
        }
    }, [data.position_id]);

    // Effect to handle photo preview
    useEffect(() => {
        if (data.use_resident_photo && selectedResident?.photo_url) {
            setPhotoPreview(selectedResident.photo_url);
        } else if (data.photo && data.photo instanceof File) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(data.photo);
        } else {
            setPhotoPreview(official.photo_url || null);
        }
    }, [selectedResident, data.use_resident_photo, data.photo]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Create FormData
        const formData = new FormData();
        
        // Add method spoofing
        formData.append('_method', 'PUT');
        
        // Add ALL fields
        formData.append('resident_id', String(data.resident_id || ''));
        formData.append('position_id', String(data.position_id || ''));
        formData.append('committee_id', data.committee_id ? String(data.committee_id) : '');
        formData.append('term_start', data.term_start || '');
        formData.append('term_end', data.term_end || '');
        formData.append('status', data.status || '');
        formData.append('order', String(data.order || 0));
        formData.append('responsibilities', data.responsibilities || '');
        formData.append('contact_number', data.contact_number || '');
        formData.append('email', data.email || '');
        formData.append('achievements', data.achievements || '');
        
        // Send boolean fields as 1/0
        formData.append('is_regular', data.is_regular ? '1' : '0');
        formData.append('user_id', data.user_id ? String(data.user_id) : '');
        formData.append('use_resident_photo', data.use_resident_photo ? '1' : '0');
        
        // Handle photo - ONLY append if it's a File
        if (data.photo && data.photo instanceof File) {
            formData.append('photo', data.photo);
        }
        
        // Use POST with _method=PUT
        router.post(`/admin/officials/${official.id}`, formData, {
            preserveScroll: true,
            forceFormData: true,
            onError: (errors) => {
                console.log('Submission errors:', errors);
                toast.error('Failed to update official');
            },
            onSuccess: (response) => {
                toast.success('Official updated successfully');
                router.visit('/admin/officials');
            },
        });
    };

    const handleResidentSelect = (residentId: number) => {
        setData('resident_id', residentId);
        const resident = availableResidents.find(r => r.id === residentId);
        setSelectedResident(resident || null);
        
        if (resident) {
            // Only update contact fields if they're empty
            if (!data.contact_number && resident.contact_number) {
                setData('contact_number', resident.contact_number);
            }
            
            if (!data.email && resident.email) {
                setData('email', resident.email);
            }
        }
    };

    const handleUserSelect = (userId: number) => {
        setData('user_id', userId);
        const user = availableUsers.find(u => u.id === userId);
        setSelectedUser(user || null);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setData('photo', file);
        if (file) {
            setData('use_resident_photo', false);
        }
    };

    const handleUseResidentPhoto = (checked: boolean) => {
        setData('use_resident_photo', checked);
        if (checked && selectedResident?.photo_url) {
            setData('photo', null);
        }
    };

    const clearPhoto = () => {
        setData('photo', null);
        setData('use_resident_photo', false);
        setPhotoPreview(null);
    };

    const isCaptain = currentPosition?.code === 'CAPTAIN';
    const isKeyPosition = currentPosition && ['CAPTAIN', 'SECRETARY', 'TREASURER', 'SK-CHAIRMAN'].includes(currentPosition.code);

    return (
        <AppLayout
            title="Edit Official"
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Officials', href: '/admin/officials' },
                { title: 'Edit Official', href: `/admin/officials/${official.id}/edit` }
            ]}
        >
            <form onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="space-y-6">
                    <OfficialFormHeader
                        title={`Edit Official: ${official.resident?.last_name || ''}, ${official.resident?.first_name || ''}`}
                        subtitle="Update position account assignment"
                        processing={processing}
                        submitButtonText="Update Official"
                    />

                    <ErrorMessages errors={errors} />

                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Left Column - Official Information */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Resident Selection */}
                            <Card className="dark:bg-gray-900">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                        <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 flex items-center justify-center">
                                            <UserPlus className="h-3 w-3 text-white" />
                                        </div>
                                        Resident
                                    </CardTitle>
                                    <CardDescription className="dark:text-gray-400">
                                        The resident holding this position
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResidentSelection
                                        residents={availableResidents}
                                        selectedResidentId={data.resident_id}
                                        selectedResident={selectedResident}
                                        onResidentSelect={handleResidentSelect}
                                        error={errors.resident_id}
                                    />
                                </CardContent>
                            </Card>

                            {/* Position Information */}
                            <Card className="dark:bg-gray-900">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                        <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700 flex items-center justify-center">
                                            <Shield className="h-3 w-3 text-white" />
                                        </div>
                                        Position Details
                                    </CardTitle>
                                    <CardDescription className="dark:text-gray-400">
                                        Position and term information
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <PositionInformation
                                        positions={positions}
                                        committees={committees}
                                        selectedPositionId={data.position_id}
                                        selectedCommitteeId={data.committee_id}
                                        termStart={data.term_start}
                                        termEnd={data.term_end}
                                        status={data.status}
                                        order={data.order}
                                        responsibilities={data.responsibilities}
                                        onPositionChange={(value) => setData('position_id', parseInt(value))}
                                        onCommitteeChange={(value) => setData('committee_id', value ? parseInt(value) : null)}
                                        onTermStartChange={(value) => setData('term_start', value)}
                                        onTermEndChange={(value) => setData('term_end', value)}
                                        onStatusChange={(value) => setData('status', value as 'active' | 'inactive' | 'former')}
                                        onOrderChange={(value) => setData('order', value)}
                                        onResponsibilitiesChange={(value) => setData('responsibilities', value)}
                                        errors={{
                                            position_id: errors.position_id,
                                            term_start: errors.term_start,
                                            term_end: errors.term_end,
                                            status: errors.status
                                        }}
                                    />
                                </CardContent>
                            </Card>

                            {/* Position Account Assignment */}
                            <Card className="dark:bg-gray-900">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                        <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-700 dark:to-blue-700 flex items-center justify-center">
                                            <Shield className="h-3 w-3 text-white" />
                                        </div>
                                        Position Account
                                    </CardTitle>
                                    <CardDescription className="dark:text-gray-400">
                                        The position account assigned to this resident
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <UserAssignment
                                        availableUsers={availableUsers}
                                        selectedResident={selectedResident}
                                        selectedPosition={currentPosition}
                                        selectedUserId={data.user_id}
                                        selectedUser={selectedUser}
                                        onUserSelect={handleUserSelect}
                                        error={errors.user_id}
                                    />
                                </CardContent>
                            </Card>

                            {/* Contact Information */}
                            <Card className="dark:bg-gray-900">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                        <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700 flex items-center justify-center">
                                            <Phone className="h-3 w-3 text-white" />
                                        </div>
                                        Contact Information
                                    </CardTitle>
                                    <CardDescription className="dark:text-gray-400">
                                        Contact details for this official
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ContactInformation
                                        contactNumber={data.contact_number}
                                        email={data.email}
                                        selectedResident={selectedResident}
                                        onContactNumberChange={(value) => setData('contact_number', value)}
                                        onEmailChange={(value) => setData('email', value)}
                                    />
                                </CardContent>
                            </Card>

                            {/* Additional Information */}
                            <Card className="dark:bg-gray-900">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                        <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-700 dark:to-orange-700 flex items-center justify-center">
                                            <Info className="h-3 w-3 text-white" />
                                        </div>
                                        Additional Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="achievements" className="dark:text-gray-300">Achievements & Recognition</Label>
                                        <Textarea 
                                            id="achievements" 
                                            placeholder="List any achievements, awards, or recognition received..."
                                            rows={4}
                                            value={data.achievements}
                                            onChange={(e) => setData('achievements', e.target.value)}
                                            className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                        />
                                    </div>

                                    <div className="flex items-center space-x-2 p-3 border rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                                        <Checkbox 
                                            id="is_regular" 
                                            checked={data.is_regular}
                                            onCheckedChange={(checked) => setData('is_regular', checked as boolean)}
                                            className="dark:border-gray-600"
                                        />
                                        <Label htmlFor="is_regular" className="cursor-pointer dark:text-gray-300">
                                            Regular Official (elected)
                                        </Label>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column - Photo & Preview */}
                        <div className="space-y-6">
                            {/* Photo Upload */}
                            <Card className="dark:bg-gray-900">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                        <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700 flex items-center justify-center">
                                            <Camera className="h-3 w-3 text-white" />
                                        </div>
                                        Official Photo
                                    </CardTitle>
                                    <CardDescription className="dark:text-gray-400">
                                        Upload a photo or use resident's existing photo
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <PhotoUpload
                                        photoPreview={photoPreview}
                                        useResidentPhoto={data.use_resident_photo}
                                        selectedResident={selectedResident}
                                        onUseResidentPhotoChange={handleUseResidentPhoto}
                                        onFileChange={handleFileChange}
                                        onClearPhoto={clearPhoto}
                                    />
                                </CardContent>
                            </Card>

                            {/* Preview Card */}
                            <PreviewCard
                                selectedResident={selectedResident}
                                selectedUser={selectedUser}
                                selectedPosition={currentPosition}
                                photoPreview={photoPreview}
                                positionId={data.position_id}
                                committeeId={data.committee_id}
                                termStart={data.term_start}
                                termEnd={data.term_end}
                                useResidentPhoto={data.use_resident_photo}
                                photo={data.photo}
                                isRegular={data.is_regular}
                                userAssigned={!!data.user_id}
                                positions={positions}
                                committees={committees}
                                roles={roles}
                            />

                            <QuickStats
                                availableResidents={availableResidents}
                                positions={positions}
                                committees={committees}
                                isCaptain={isCaptain}
                                isKeyPosition={!!isKeyPosition}
                            />
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex items-center justify-between pt-6 border-t dark:border-gray-700">
                        <Link href="/admin/officials">
                            <Button variant="outline" type="button" className="dark:border-gray-600 dark:text-gray-300">
                                Cancel
                            </Button>
                        </Link>
                        <div className="flex items-center gap-2">
                            <Button 
                                type="submit" 
                                disabled={processing}
                                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white dark:from-amber-700 dark:to-orange-700"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                {processing ? 'Updating...' : 'Update Official'}
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}