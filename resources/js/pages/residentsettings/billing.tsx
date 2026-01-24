import AppLayout from '@/layouts/resident-app-layout';
import SettingsLayout from '@/layouts/settings/residentlayout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { 
  CreditCard, 
  DollarSign, 
  Calendar,
  Download,
  FileText,
  Receipt,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Shield,
  MoreVertical,
  Bell,
  Eye,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Settings',
    href: '/residentsettings',
  },
  {
    title: 'Billing',
    href: '/residentsettings/billing',
  },
];

// Dummy data for payment methods
const paymentMethods = [
  {
    id: 1,
    type: 'credit_card',
    last4: '4242',
    brand: 'Visa',
    name: 'John Doe',
    expiry: '12/25',
    isDefault: true,
    status: 'active',
  },
  {
    id: 2,
    type: 'credit_card',
    last4: '8888',
    brand: 'Mastercard',
    name: 'John Doe',
    expiry: '08/24',
    isDefault: false,
    status: 'active',
  },
  {
    id: 3,
    type: 'paypal',
    email: 'john.doe@example.com',
    isDefault: false,
    status: 'active',
  },
];

// Dummy data for invoices
const invoices = [
  {
    id: 'INV-2023-001',
    date: 'Nov 15, 2023',
    amount: 149.99,
    status: 'paid',
    description: 'Monthly Subscription - Premium Plan',
    downloadUrl: '#',
  },
  {
    id: 'INV-2023-002',
    date: 'Oct 15, 2023',
    amount: 149.99,
    status: 'paid',
    description: 'Monthly Subscription - Premium Plan',
    downloadUrl: '#',
  },
  {
    id: 'INV-2023-003',
    date: 'Sep 15, 2023',
    amount: 149.99,
    status: 'paid',
    description: 'Monthly Subscription - Premium Plan',
    downloadUrl: '#',
  },
  {
    id: 'INV-2023-004',
    date: 'Aug 15, 2023',
    amount: 99.99,
    status: 'paid',
    description: 'Monthly Subscription - Basic Plan',
    downloadUrl: '#',
  },
];

// Dummy data for current plan
const currentPlan = {
  name: 'Premium Plan',
  price: 149.99,
  interval: 'month',
  features: [
    'Unlimited residents',
    'Priority support',
    'Advanced analytics',
    'Custom reports',
    'API access',
  ],
  nextBilling: 'Jan 15, 2024',
  status: 'active',
};

// Dummy data for billing history
const billingHistory = [
  { id: 1, date: 'Today', description: 'Auto-payment processed', amount: 149.99, status: 'success' },
  { id: 2, date: 'Dec 1, 2023', description: 'Plan upgrade to Premium', amount: 50.00, status: 'success' },
  { id: 3, date: 'Nov 15, 2023', description: 'Monthly subscription', amount: 149.99, status: 'success' },
  { id: 4, date: 'Nov 1, 2023', description: 'Payment declined', amount: 149.99, status: 'failed' },
  { id: 5, date: 'Oct 15, 2023', description: 'Monthly subscription', amount: 149.99, status: 'success' },
];

export default function Billing() {
  const handleAddPaymentMethod = () => {
    alert('Add payment method - This would open a payment modal');
  };

  const handleUpdatePlan = () => {
    alert('Update plan - This would show plan options');
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    alert(`Downloading invoice ${invoiceId}`);
  };

  const handleSetDefault = (methodId: number) => {
    alert(`Setting payment method ${methodId} as default`);
  };

  const handleRemoveMethod = (methodId: number) => {
    alert(`Removing payment method ${methodId}`);
  };

  const totalSpent = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Billing & Payments" />
      
      <SettingsLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CreditCard className="h-6 w-6 text-green-600" />
                </div>
                Billing & Payments
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage your payment methods, view invoices, and billing history
              </p>
            </div>
            <Badge variant="outline" className="hidden sm:flex">
              <CheckCircle className="mr-2 h-3 w-3 text-green-500" />
              Active Subscription
            </Badge>
          </div>

          {/* Current Plan Alert */}
          <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium">Current Plan: <span className="text-blue-600">{currentPlan.name}</span></div>
                  <div className="text-sm text-blue-700">
                    ${currentPlan.price}/{currentPlan.interval} • Next billing: {currentPlan.nextBilling}
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleUpdatePlan}>
                Change Plan
              </Button>
            </div>
          </Alert>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Payment Methods */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-blue-500" />
                      Payment Methods
                    </CardTitle>
                    <Button size="sm" onClick={handleAddPaymentMethod}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add New
                    </Button>
                  </div>
                  <CardDescription>
                    Manage your payment methods for automatic billing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div 
                      key={method.id} 
                      className={`p-4 rounded-lg border ${method.isDefault ? 'border-blue-300 bg-blue-50' : 'hover:bg-accent/50'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-lg ${method.type === 'paypal' ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                            {method.type === 'paypal' ? (
                              <div className="font-bold text-yellow-600">PayPal</div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-6 bg-blue-500 rounded flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">{method.brand?.slice(0, 1)}</span>
                                </div>
                                <div>
                                  <div className="font-medium">{method.brand} •••• {method.last4}</div>
                                  <div className="text-sm text-muted-foreground">
                                    Expires {method.expiry} • {method.name}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          {method.type === 'paypal' && (
                            <div>
                              <div className="font-medium">PayPal Account</div>
                              <div className="text-sm text-muted-foreground">{method.email}</div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {method.isDefault && (
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                              Default
                            </Badge>
                          )}
                          {!method.isDefault && method.type !== 'paypal' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleSetDefault(method.id)}
                            >
                              Set Default
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleRemoveMethod(method.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
                <CardFooter className="border-t bg-muted/30 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span>Your payment information is encrypted and secure</span>
                  </div>
                </CardFooter>
              </Card>

              {/* Recent Invoices */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-green-500" />
                    Recent Invoices
                  </CardTitle>
                  <CardDescription>
                    View and download your past invoices
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Invoice</th>
                          <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Date</th>
                          <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Description</th>
                          <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Amount</th>
                          <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
                          <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoices.map((invoice) => (
                          <tr key={invoice.id} className="border-b hover:bg-accent/30">
                            <td className="py-3 px-2">
                              <div className="font-medium">{invoice.id}</div>
                            </td>
                            <td className="py-3 px-2 text-sm text-muted-foreground">
                              {invoice.date}
                            </td>
                            <td className="py-3 px-2">
                              <div className="max-w-xs">{invoice.description}</div>
                            </td>
                            <td className="py-3 px-2 font-semibold">
                              ${invoice.amount.toFixed(2)}
                            </td>
                            <td className="py-3 px-2">
                              <Badge className="bg-green-100 text-green-800 border-green-200">
                                {invoice.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownloadInvoice(invoice.id)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
                <CardFooter className="border-t bg-muted/30">
                  <Button variant="outline" className="w-full">
                    <Receipt className="mr-2 h-4 w-4" />
                    View All Invoices
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Right Column - Stats & Info */}
            <div className="space-y-6">
              {/* Current Plan Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Plan Details</CardTitle>
                  <CardDescription>Your current subscription</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <div className="text-3xl font-bold text-blue-600">
                      ${currentPlan.price}
                      <span className="text-lg font-normal text-muted-foreground">/{currentPlan.interval}</span>
                    </div>
                    <div className="font-semibold mt-1">{currentPlan.name}</div>
                    <div className="text-sm text-muted-foreground mt-2">
                      Next billing: {currentPlan.nextBilling}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Plan usage</span>
                      <span className="font-medium">65% used</span>
                    </div>
                    <Progress value={65} className="h-2" />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="font-medium text-sm">Included Features:</div>
                    {currentPlan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={handleUpdatePlan}>
                    Upgrade Plan
                  </Button>
                </CardFooter>
              </Card>

              {/* Billing History */}
              <Card>
                <CardHeader>
                  <CardTitle>Billing History</CardTitle>
                  <CardDescription>Recent transactions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {billingHistory.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 hover:bg-accent/30 rounded">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${transaction.status === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
                          {transaction.status === 'success' ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{transaction.description}</div>
                          <div className="text-xs text-muted-foreground">{transaction.date}</div>
                        </div>
                      </div>
                      <div className={`font-semibold ${transaction.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                        ${transaction.amount.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Billing Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>Billing Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">4</div>
                      <div className="text-xs text-muted-foreground">Paid Invoices</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">${totalSpent.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">Total Spent</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{paymentMethods.length}</div>
                      <div className="text-xs text-muted-foreground">Payment Methods</div>
                    </div>
                    <div className="text-center p-3 bg-amber-50 rounded-lg">
                      <div className="text-2xl font-bold text-amber-600">0</div>
                      <div className="text-xs text-muted-foreground">Failed Payments</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Auto-Pay Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-blue-600" />
                    Auto-Pay Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Auto-pay enabled</div>
                      <div className="text-sm text-muted-foreground">
                        Next charge: {currentPlan.nextBilling}
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      Active
                    </Badge>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Never miss a payment</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      <span>Charges 3 days before due date</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    Manage Auto-Pay
                  </Button>
                </CardFooter>
              </Card>

              {/* Need Help Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Need Help?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    Billing FAQ
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Payment Issues
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Receipt className="mr-2 h-4 w-4" />
                    Request Refund
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Important Notice */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Important Billing Information:</p>
                <ul className="text-sm space-y-1">
                  <li>• All prices are in USD</li>
                  <li>• Invoices are generated monthly on the 15th</li>
                  <li>• Failed payments will retry automatically for 3 days</li>
                  <li>• Contact support for billing disputes within 30 days</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </SettingsLayout>
    </AppLayout>
  );
}