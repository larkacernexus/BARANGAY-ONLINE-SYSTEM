import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { 
    ArrowLeft,
    Save,
    Upload,
    Camera,
    UserPlus
} from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function CreateResident() {
    return (
        <AuthenticatedLayout
            title="Add Resident"
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Residents', href: '/residents' },
                { title: 'Add Resident', href: '/residents/create' }
            ]}
        >
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/residents">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Add New Resident</h1>
                            <p className="text-gray-500 dark:text-gray-400">
                                Register a new resident in the barangay database
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline">
                            <Upload className="h-4 w-4 mr-2" />
                            Import
                        </Button>
                        <Button>
                            <Save className="h-4 w-4 mr-2" />
                            Save Resident
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left Column - Personal Information */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Personal Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <UserPlus className="h-5 w-5" />
                                    Personal Information
                                </CardTitle>
                                <CardDescription>
                                    Basic details of the resident
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">First Name *</Label>
                                        <Input id="firstName" placeholder="Juan" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="middleName">Middle Name</Label>
                                        <Input id="middleName" placeholder="Santos" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Last Name *</Label>
                                        <Input id="lastName" placeholder="Dela Cruz" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="suffix">Suffix</Label>
                                        <Input id="suffix" placeholder="Jr." />
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="birthDate">Date of Birth *</Label>
                                        <Input id="birthDate" type="date" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="age">Age</Label>
                                        <Input id="age" type="number" placeholder="35" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Gender *</Label>
                                        <Select>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select gender" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="male">Male</SelectItem>
                                                <SelectItem value="female">Female</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="placeOfBirth">Place of Birth</Label>
                                    <Input id="placeOfBirth" placeholder="City/Municipality, Province" />
                                </div>

                                <div className="space-y-2">
                                    <Label>Civil Status *</Label>
                                    <RadioGroup defaultValue="single" className="flex gap-4">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="single" id="single" />
                                            <Label htmlFor="single">Single</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="married" id="married" />
                                            <Label htmlFor="married">Married</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="widowed" id="widowed" />
                                            <Label htmlFor="widowed">Widowed</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="separated" id="separated" />
                                            <Label htmlFor="separated">Separated</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Contact Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Contact Information</CardTitle>
                                <CardDescription>
                                    How to reach the resident
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="contactNumber">Contact Number *</Label>
                                        <Input id="contactNumber" placeholder="09123456789" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input id="email" type="email" placeholder="juan@example.com" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address">Complete Address *</Label>
                                    <Textarea 
                                        id="address" 
                                        placeholder="House No., Street, Purok, Barangay Kibawe" 
                                        required 
                                        rows={3}
                                    />
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="purok">Purok *</Label>
                                        <Select>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select purok" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                                                    <SelectItem key={num} value={`purok-${num}`}>
                                                        Purok {num}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="household">Household</Label>
                                        <Select>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select household" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="new">Create New Household</SelectItem>
                                                <SelectItem value="cruz">Cruz Family</SelectItem>
                                                <SelectItem value="santos">Santos Residence</SelectItem>
                                                <SelectItem value="reyes">Reyes Household</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Additional Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Additional Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="occupation">Occupation</Label>
                                        <Input id="occupation" placeholder="Farmer/Business Owner/Employee" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="education">Highest Education</Label>
                                        <Select>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select education" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="elementary">Elementary</SelectItem>
                                                <SelectItem value="highschool">High School</SelectItem>
                                                <SelectItem value="college">College</SelectItem>
                                                <SelectItem value="vocational">Vocational</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="religion">Religion</Label>
                                    <Input id="religion" placeholder="Roman Catholic" />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="voter" />
                                        <Label htmlFor="voter">Registered Voter in this Barangay</Label>
                                    </div>
                                    <div className="flex items-center space-x-2 mt-2">
                                        <Checkbox id="pwd" />
                                        <Label htmlFor="pwd">Person with Disability (PWD)</Label>
                                    </div>
                                    <div className="flex items-center space-x-2 mt-2">
                                        <Checkbox id="senior" />
                                        <Label htmlFor="senior">Senior Citizen</Label>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="remarks">Remarks/Notes</Label>
                                    <Textarea 
                                        id="remarks" 
                                        placeholder="Additional notes about the resident..."
                                        rows={3}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Photo Upload & Preview */}
                    <div className="space-y-6">
                        {/* Photo Upload */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Resident Photo</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                    <div className="mx-auto h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                        <Camera className="h-12 w-12 text-gray-400" />
                                    </div>
                                    <p className="text-sm text-gray-500 mb-2">
                                        Upload resident's photo (2x2 ID size recommended)
                                    </p>
                                    <Button variant="outline" size="sm">
                                        <Upload className="h-4 w-4 mr-2" />
                                        Upload Photo
                                    </Button>
                                    <p className="text-xs text-gray-400 mt-2">
                                        JPG, PNG up to 2MB
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="idNumber">Resident ID Number</Label>
                                    <Input id="idNumber" placeholder="BRGY-2024-001" />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Form Preview */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Form Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Required Fields:</span>
                                        <span className="font-medium">8/10 completed</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Optional Fields:</span>
                                        <span className="font-medium">5/12 completed</span>
                                    </div>
                                    <div className="pt-3 border-t">
                                        <div className="flex items-center justify-between font-medium">
                                            <span>Total Progress</span>
                                            <span>65%</span>
                                        </div>
                                        <div className="h-2 bg-gray-200 rounded-full mt-1 overflow-hidden">
                                            <div className="h-full bg-green-500 rounded-full" style={{ width: '65%' }}></div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button variant="outline" className="w-full justify-start">
                                    Add Family Members
                                </Button>
                                <Button variant="outline" className="w-full justify-start">
                                    Print Registration Form
                                </Button>
                                <Button variant="outline" className="w-full justify-start">
                                    Save as Template
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-between pt-6 border-t">
                    <div>
                        <Button variant="ghost" type="button">
                            Clear Form
                        </Button>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" type="button">
                            Save as Draft
                        </Button>
                        <Button type="submit">
                            <Save className="h-4 w-4 mr-2" />
                            Save & Register Resident
                        </Button>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}