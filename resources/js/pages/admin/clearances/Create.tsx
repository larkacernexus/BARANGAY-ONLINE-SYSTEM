import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
    ArrowLeft,
    Save,
    FileText,
    User,
    Calendar,
    DollarSign,
    Printer,
    Search
} from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function CreateClearance() {
    return (
        <AuthenticatedLayout
            title="Issue Clearance"
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Clearances', href: '/clearances' },
                { title: 'Issue Clearance', href: '/clearances/create' }
            ]}
        >
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/clearances">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Issue New Clearance</h1>
                            <p className="text-gray-500 dark:text-gray-400">
                                Create and issue barangay clearance or certificate
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline">
                            <Printer className="h-4 w-4 mr-2" />
                            Print Preview
                        </Button>
                        <Button>
                            <Save className="h-4 w-4 mr-2" />
                            Issue Clearance
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left Column - Clearance Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Applicant Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Applicant Information
                                </CardTitle>
                                <CardDescription>
                                    Information about the person requesting clearance
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex gap-2">
                                    <Input placeholder="Search resident by name or ID..." className="flex-1" />
                                    <Button variant="outline" size="sm">
                                        <Search className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="applicantName">Full Name *</Label>
                                        <Input id="applicantName" placeholder="Juan Dela Cruz" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="age">Age</Label>
                                        <Input id="age" type="number" placeholder="35" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="contactNumber">Contact Number</Label>
                                        <Input id="contactNumber" placeholder="09123456789" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="address">Address *</Label>
                                        <Input id="address" placeholder="House No., Street, Purok" required />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Clearance Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Clearance Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="clearanceType">Clearance Type *</Label>
                                        <Select>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="business">Business Clearance</SelectItem>
                                                <SelectItem value="residency">Residency Certificate</SelectItem>
                                                <SelectItem value="good-moral">Good Moral Character</SelectItem>
                                                <SelectItem value="indigency">Certificate of Indigency</SelectItem>
                                                <SelectItem value="non-derogatory">Non-Derogatory Record</SelectItem>
                                                <SelectItem value="barangay-id">Barangay ID</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="clearanceNumber">Clearance Number</Label>
                                        <Input id="clearanceNumber" placeholder="Auto-generated if empty" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="purpose">Purpose *</Label>
                                    <Textarea 
                                        id="purpose" 
                                        placeholder="Please specify the purpose of this clearance..."
                                        required
                                        rows={3}
                                    />
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="issueDate">Issue Date *</Label>
                                        <Input id="issueDate" type="date" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="validUntil">Valid Until *</Label>
                                        <Input id="validUntil" type="date" required />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="feeAmount">Fee Amount</Label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                                        <Input id="feeAmount" type="number" placeholder="0.00" className="pl-10" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Requirements Checklist */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Requirements Checklist</CardTitle>
                                <CardDescription>
                                    Verify that all requirements are met
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="req1" />
                                    <Label htmlFor="req1" className="text-sm">
                                        Valid ID presented
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="req2" />
                                    <Label htmlFor="req2" className="text-sm">
                                        Community tax certificate (cedula)
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="req3" />
                                    <Label htmlFor="req3" className="text-sm">
                                        Proof of residency
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="req4" />
                                    <Label htmlFor="req4" className="text-sm">
                                        Payment receipt (if applicable)
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="req5" />
                                    <Label htmlFor="req5" className="text-sm">
                                        No pending barangay cases
                                    </Label>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Additional Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Additional Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="remarks">Remarks/Notes</Label>
                                    <Textarea 
                                        id="remarks" 
                                        placeholder="Additional notes or special conditions..."
                                        rows={3}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="issuingOfficer">Issuing Officer *</Label>
                                    <Input id="issuingOfficer" placeholder="Name of barangay official" required />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Preview & Actions */}
                    <div className="space-y-6">
                        {/* Clearance Preview */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Clearance Preview</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="border-2 border-gray-200 rounded-lg p-4 bg-white">
                                    <div className="text-center mb-4">
                                        <div className="font-bold text-lg uppercase">BARANGAY KIBAWE</div>
                                        <div className="text-sm text-gray-500">Municipality of Kibawe, Bukidnon</div>
                                        <div className="text-lg font-bold mt-2">BARANGAY CLEARANCE</div>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div>TO WHOM IT MAY CONCERN:</div>
                                        <div className="mt-4">
                                            This is to certify that <span className="font-bold">[Applicant Name]</span>,
                                            of legal age, and a resident of <span className="font-bold">[Address]</span>,
                                            Barangay Kibawe, has no derogatory record in this barangay.
                                        </div>
                                        <div className="mt-4">
                                            This certification is issued upon the request of the above-named person
                                            for <span className="font-bold">[Purpose]</span>.
                                        </div>
                                        <div className="mt-8 flex justify-between">
                                            <div>
                                                <div>Issued on: <span className="font-bold">[Date]</span></div>
                                                <div>Valid until: <span className="font-bold">[Expiry Date]</span></div>
                                            </div>
                                            <div className="text-center">
                                                <div className="border-t border-black w-32 pt-2">
                                                    Barangay Captain
                                                </div>
                                            </div>
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
                                    Check Applicant Record
                                </Button>
                                <Button variant="outline" className="w-full justify-start">
                                    Calculate Fees
                                </Button>
                                <Button variant="outline" className="w-full justify-start">
                                    Save as Template
                                </Button>
                                <Button variant="outline" className="w-full justify-start">
                                    Email Clearance
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Requirements:</span>
                                        <span className="font-medium">3/5 completed</span>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 rounded-full" style={{ width: '60%' }}></div>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-2">
                                        Complete all requirements to issue clearance
                                    </div>
                                </div>
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
                        <Button variant="outline" type="button">
                            <Printer className="h-4 w-4 mr-2" />
                            Print
                        </Button>
                        <Button type="submit">
                            <Save className="h-4 w-4 mr-2" />
                            Issue & Save Clearance
                        </Button>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}