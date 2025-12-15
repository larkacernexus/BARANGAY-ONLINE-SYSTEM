import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
    ArrowLeft,
    Save,
    CreditCard,
    Calculator,
    Receipt,
    User,
    Calendar,
    DollarSign
} from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function CreatePayment() {
    return (
        <AuthenticatedLayout
            title="Record Payment"
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Payments', href: '/payments' },
                { title: 'Record Payment', href: '/payments/create' }
            ]}
        >
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/payments">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Record New Payment</h1>
                            <p className="text-gray-500 dark:text-gray-400">
                                Record tax payments, fees, and other collections
                            </p>
                        </div>
                    </div>
                    <Button>
                        <Save className="h-4 w-4 mr-2" />
                        Save Payment
                    </Button>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left Column - Payment Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Payer Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Payer Information
                                </CardTitle>
                                <CardDescription>
                                    Who is making this payment?
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="payerType">Payer Type *</Label>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select payer type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="resident">Resident</SelectItem>
                                            <SelectItem value="business">Business Owner</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="payerName">Payer Name *</Label>
                                    <Input id="payerName" placeholder="Enter full name" required />
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="contactNumber">Contact Number</Label>
                                        <Input id="contactNumber" placeholder="09123456789" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="address">Address</Label>
                                        <Input id="address" placeholder="House No., Street, Purok" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" />
                                    Payment Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="paymentType">Payment Type *</Label>
                                        <Select>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select payment type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="business-tax">Business Tax</SelectItem>
                                                <SelectItem value="property-tax">Real Property Tax</SelectItem>
                                                <SelectItem value="clearance">Clearance Fee</SelectItem>
                                                <SelectItem value="certificate">Certificate Fee</SelectItem>
                                                <SelectItem value="rental">Space Rental</SelectItem>
                                                <SelectItem value="other">Other Fee</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="paymentDate">Payment Date *</Label>
                                        <Input id="paymentDate" type="date" required />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Input id="description" placeholder="e.g., Quarterly Business Tax for Q1 2024" />
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="amount">Amount *</Label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                                            <Input id="amount" type="number" placeholder="0.00" className="pl-10" required />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="receiptNumber">Receipt Number</Label>
                                        <Input id="receiptNumber" placeholder="Auto-generated if empty" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Payment Method *</Label>
                                    <RadioGroup defaultValue="cash" className="flex gap-4 flex-wrap">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="cash" id="cash" />
                                            <Label htmlFor="cash">Cash</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="check" id="check" />
                                            <Label htmlFor="check">Check</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="bank" id="bank" />
                                            <Label htmlFor="bank">Bank Transfer</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="gcash" id="gcash" />
                                            <Label htmlFor="gcash">GCash</Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="referenceNumber">Reference Number</Label>
                                    <Input id="referenceNumber" placeholder="Check number, transaction ID, etc." />
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
                                        <Label htmlFor="periodFrom">Period From</Label>
                                        <Input id="periodFrom" type="date" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="periodTo">Period To</Label>
                                        <Input id="periodTo" type="date" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="remarks">Remarks/Notes</Label>
                                    <Textarea 
                                        id="remarks" 
                                        placeholder="Additional notes about this payment..."
                                        rows={3}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Summary */}
                    <div className="space-y-6">
                        {/* Payment Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calculator className="h-5 w-5" />
                                    Payment Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Subtotal:</span>
                                        <span className="font-medium">₱0.00</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Surcharge:</span>
                                        <span className="font-medium">₱0.00</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Penalty:</span>
                                        <span className="font-medium">₱0.00</span>
                                    </div>
                                    <div className="flex justify-between border-t pt-2">
                                        <span className="font-bold">Total Amount:</span>
                                        <span className="text-2xl font-bold">₱0.00</span>
                                    </div>
                                </div>

                                <div className="mt-6 space-y-2">
                                    <Button className="w-full" variant="outline">
                                        <Calculator className="h-4 w-4 mr-2" />
                                        Calculate Taxes
                                    </Button>
                                    <Button className="w-full" variant="outline">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        Check Due Dates
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Receipt Preview */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Receipt className="h-5 w-5" />
                                    Receipt Preview
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="border rounded-lg p-4 bg-gray-50">
                                    <div className="text-center mb-4">
                                        <div className="font-bold text-lg">BARANGAY KIBAWE</div>
                                        <div className="text-sm text-gray-500">Official Receipt</div>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Receipt No:</span>
                                            <span>RCPT-2024-001</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Date:</span>
                                            <span>{new Date().toLocaleDateString()}</span>
                                        </div>
                                        <div className="border-t pt-2">
                                            <div className="text-gray-500">Amount in Words:</div>
                                            <div className="italic">Zero pesos only</div>
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
                                    Print Receipt
                                </Button>
                                <Button variant="outline" className="w-full justify-start">
                                    Send Receipt via SMS
                                </Button>
                                <Button variant="outline" className="w-full justify-start">
                                    Save as Template
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}