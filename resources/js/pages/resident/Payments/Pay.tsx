import ResidentLayout from '@/layouts/resident-app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
    ArrowLeft,
    CreditCard,
    Smartphone,
    Building,
    Wallet,
    QrCode,
    Shield,
    CheckCircle,
    AlertCircle
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import { useState } from 'react';

export default function PayOnline() {
    const [paymentMethod, setPaymentMethod] = useState('gcash');
    const [paymentType, setPaymentType] = useState('barangay-fee');

    const paymentTypes = [
        { id: 'barangay-fee', name: 'Annual Barangay Fee', amount: '₱500.00', dueDate: 'Dec 31, 2024' },
        { id: 'business-permit', name: 'Business Permit', amount: '₱1,200.00', dueDate: 'Dec 20, 2024' },
        { id: 'certificate-fee', name: 'Certificate/Clearance Fee', amount: '₱200.00', dueDate: 'Ongoing' },
        { id: 'community-service', name: 'Community Service Fee', amount: '₱300.00', dueDate: 'Past Due' },
        { id: 'custom', name: 'Custom Payment', amount: 'Variable', dueDate: 'N/A' },
    ];

    const paymentMethods = [
        { id: 'gcash', name: 'GCash', icon: Smartphone, description: 'Pay using GCash mobile wallet' },
        { id: 'bank-transfer', name: 'Bank Transfer', icon: Building, description: 'Direct bank transfer' },
        { id: 'paymaya', name: 'PayMaya', icon: CreditCard, description: 'Pay using PayMaya wallet' },
        { id: 'cash', name: 'Cash Payment', icon: Wallet, description: 'Pay at barangay office' },
    ];

    const selectedType = paymentTypes.find(type => type.id === paymentType);

    return (
        <ResidentLayout
            title="Pay Online"
            breadcrumbs={[
                { title: 'Dashboard', href: '/resident/dashboard' },
                { title: 'My Payments', href: '/resident/payments' },
                { title: 'Pay Online', href: '/resident/payments/pay' }
            ]}
        >
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/resident/payments">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Payments
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Pay Online</h1>
                            <p className="text-gray-500 dark:text-gray-400">
                                Securely pay barangay fees and services
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left Column - Payment Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Payment Type Selection */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Select Payment Type</CardTitle>
                                <CardDescription>
                                    Choose what you want to pay for
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <RadioGroup value={paymentType} onValueChange={setPaymentType}>
                                    {paymentTypes.map((type) => (
                                        <div key={type.id} className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-gray-50">
                                            <RadioGroupItem value={type.id} id={type.id} />
                                            <Label htmlFor={type.id} className="flex-1 cursor-pointer">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <span className="font-medium">{type.name}</span>
                                                        <p className="text-sm text-gray-500">Due: {type.dueDate}</p>
                                                    </div>
                                                    <span className="font-bold">{type.amount}</span>
                                                </div>
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>

                                {paymentType === 'custom' && (
                                    <div className="space-y-4 pt-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="custom-description">Payment Description</Label>
                                            <Input id="custom-description" placeholder="Enter payment description" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="custom-amount">Amount (₱)</Label>
                                            <Input id="custom-amount" type="number" placeholder="0.00" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="custom-purpose">Purpose</Label>
                                            <Textarea id="custom-purpose" placeholder="Explain the purpose of this payment" />
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Payment Method */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Choose Payment Method</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-2">
                                    {paymentMethods.map((method) => (
                                        <div
                                            key={method.id}
                                            className={`border-2 rounded-lg p-4 cursor-pointer hover:border-blue-500 ${
                                                paymentMethod === method.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                                            }`}
                                            onClick={() => setPaymentMethod(method.id)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <method.icon className="h-5 w-5" />
                                                <div className="flex-1">
                                                    <div className="font-medium">{method.name}</div>
                                                    <div className="text-sm text-gray-500">{method.description}</div>
                                                </div>
                                                <div className={`h-4 w-4 rounded-full border ${paymentMethod === method.id ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>
                                                    {paymentMethod === method.id && (
                                                        <div className="h-2 w-2 rounded-full bg-white m-auto mt-1"></div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Payment Method Details */}
                                {paymentMethod === 'gcash' && (
                                    <div className="mt-6 p-4 border rounded-lg bg-blue-50">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Smartphone className="h-5 w-5 text-blue-600" />
                                            <h3 className="font-bold">GCash Payment Instructions</h3>
                                        </div>
                                        <ol className="list-decimal list-inside space-y-2 text-sm">
                                            <li>Open your GCash app</li>
                                            <li>Go to "Pay Bills"</li>
                                            <li>Select "Government" then "Barangay"</li>
                                            <li>Enter reference number: <strong>BARANGAY-KIBAWE</strong></li>
                                            <li>Enter amount: <strong>₱{selectedType?.amount.replace('₱', '')}</strong></li>
                                            <li>Complete the payment</li>
                                            <li>Take a screenshot of the confirmation</li>
                                        </ol>
                                        <div className="mt-4 flex items-center gap-4">
                                            <Input placeholder="Enter GCash Reference Number" />
                                            <Button>Verify Payment</Button>
                                        </div>
                                    </div>
                                )}

                                {paymentMethod === 'bank-transfer' && (
                                    <div className="mt-6 p-4 border rounded-lg bg-green-50">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Building className="h-5 w-5 text-green-600" />
                                            <h3 className="font-bold">Bank Account Details</h3>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span>Bank Name:</span>
                                                <span className="font-bold">BPI (Bank of the Philippine Islands)</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Account Name:</span>
                                                <span className="font-bold">Barangay Kibawe Treasury</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Account Number:</span>
                                                <span className="font-bold">1234-5678-90</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Swift Code:</span>
                                                <span className="font-bold">BOPIPHMM</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {paymentMethod === 'cash' && (
                                    <div className="mt-6 p-4 border rounded-lg bg-amber-50">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Wallet className="h-5 w-5 text-amber-600" />
                                            <h3 className="font-bold">Cash Payment Instructions</h3>
                                        </div>
                                        <div className="text-sm space-y-2">
                                            <p>Please visit the barangay office during office hours:</p>
                                            <ul className="list-disc list-inside">
                                                <li>Monday to Friday: 8:00 AM - 5:00 PM</li>
                                                <li>Saturday: 8:00 AM - 12:00 PM</li>
                                                <li>Bring a valid ID and this payment reference</li>
                                            </ul>
                                            <div className="mt-2 p-2 bg-white border rounded">
                                                <div className="font-bold">Payment Reference:</div>
                                                <div className="text-sm">PAY-{Date.now().toString().slice(-6)}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Payment Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Payment Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="payer-name">Payer's Full Name</Label>
                                    <Input id="payer-name" value="Juan Dela Cruz" readOnly className="bg-gray-50" />
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="contact-number">Contact Number</Label>
                                        <Input id="contact-number" value="09123456789" readOnly className="bg-gray-50" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input id="email" value="juan.delacruz@email.com" readOnly className="bg-gray-50" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="remarks">Payment Remarks (Optional)</Label>
                                    <Textarea id="remarks" placeholder="Add any notes about this payment" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="space-y-6">
                        {/* Order Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Payment Type:</span>
                                        <span className="font-medium">{selectedType?.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Amount:</span>
                                        <span className="font-bold text-lg">{selectedType?.amount}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Convenience Fee:</span>
                                        <span className="font-medium">₱10.00</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Total:</span>
                                        <span>
                                            {selectedType?.id === 'custom' ? '₱0.00' : 
                                             `₱${(parseFloat(selectedType?.amount?.replace('₱', '') || '0') + 10).toFixed(2)}`}
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        This amount will be charged to your selected payment method.
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Security Features */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    Secure Payment
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-green-600" />
                                        <span>SSL Encrypted Connection</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        <span>PCI DSS Compliant</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4 text-blue-600" />
                                        <span>Payment Protected</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* QR Code for Mobile */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <QrCode className="h-5 w-5" />
                                    Quick Pay with QR
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center">
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 inline-block mb-4">
                                        <div className="text-sm text-gray-500">Scan to pay with GCash</div>
                                        <div className="text-xs text-gray-400 mt-1">QR Code will appear here</div>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        Scan this QR code with your mobile wallet app
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment Button */}
                        <div className="sticky top-6">
                            <Card>
                                <CardContent className="pt-6">
                                    <Button className="w-full" size="lg">
                                        <CreditCard className="h-5 w-5 mr-2" />
                                        Pay Now
                                    </Button>
                                    <p className="text-xs text-gray-500 text-center mt-2">
                                        By clicking Pay Now, you agree to our Terms of Service and Privacy Policy
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </ResidentLayout>
    );
}