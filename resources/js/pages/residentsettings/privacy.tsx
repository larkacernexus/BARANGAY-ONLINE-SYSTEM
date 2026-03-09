import AppLayout from '@/layouts/resident-app-layout';
import SettingsLayout from '@/layouts/settings/residentlayout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Settings',
    href: '/residentsettings',
  },
  {
    title: 'Privacy',
    href: '/residentsettings/privacy',
  },
];

// Types
interface ResidentData {
  id: number;
  fullName: string;
  birthDate: string;
  age: number;
  gender: string;
  civilStatus: string;
  address: string;
  zone: string;
  household: string;
  contactNumber: string;
  email: string;
  emergencyContact: {
    name: string;
    relation: string;
    number: string;
  };
  voterStatus: boolean;
  idNumbers: {
    philSys?: string;
    passport?: string;
    driversLicense?: string;
  };
  occupation?: string;
  monthlyIncome?: string;
  religion?: string;
  education?: string;
  philhealth?: string;
  tin?: string;
}

interface DataAccessLog {
  id: number;
  date: string;
  official: string;
  position: string;
  reason: string;
  dataAccessed: string[];
  department: string;
}

interface BarangayDocument {
  id: number;
  type: string;
  dateIssued: string;
  referenceNumber: string;
  purpose: string;
  status: 'active' | 'expired' | 'pending';
}

interface HouseholdMember {
  id: number;
  name: string;
  relation: string;
  age: number;
  occupation?: string;
}

interface DataCategory {
  name: string;
  description: string;
  icon: string;
  fields: string[];
  lastUpdated: string;
  retention: string;
  legalBasis: string;
}

interface PrivacyScore {
  score: number;
  recommendations: string[];
}

// Default values with empty states
const defaultResidentData: ResidentData = {
  id: 0,
  fullName: '—',
  birthDate: '—',
  age: 0,
  gender: '—',
  civilStatus: '—',
  address: '—',
  zone: '—',
  household: '—',
  contactNumber: '—',
  email: '—',
  emergencyContact: {
    name: '—',
    relation: '—',
    number: '—',
  },
  voterStatus: false,
  idNumbers: {},
  occupation: '—',
  monthlyIncome: '—',
  religion: '—',
  education: '—',
  philhealth: '—',
  tin: '—',
};

interface Props {
  residentData?: ResidentData;
  accessLogs?: DataAccessLog[];
  documents?: BarangayDocument[];
  household?: HouseholdMember[];
  dataCategories?: DataCategory[];
  privacyScore?: PrivacyScore;
}

export default function Privacy({ 
  residentData = defaultResidentData,
  accessLogs = [],
  documents = [],
  household = [],
  dataCategories = [],
  privacyScore: initialScore 
}: Props) {
  const [activeTab, setActiveTab] = useState<string>('my-data');
  const [notification, setNotification] = useState<{ 
    type: 'success' | 'error'; 
    message: string;
    id: number;
  } | null>(null);
  
  // Loading states
  const [exportLoading, setExportLoading] = useState(false);
  const [correctionLoading, setCorrectionLoading] = useState(false);

  // Notification timer
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({
      type,
      message,
      id: Date.now(),
    });
  };

  // Request data correction
  const handleRequestCorrection = async (field: string) => {
    setCorrectionLoading(true);
    try {
      await router.post('/resident/api/privacy/request-correction', {
        field,
        residentId: residentData.id
      }, {
        onSuccess: () => {
          showNotification('success', 'Correction request submitted. Barangay secretary will review.');
        },
        onError: (errors) => {
          showNotification('error', errors.message || 'Failed to submit request');
        }
      });
    } finally {
      setCorrectionLoading(false);
    }
  };

  // Export data
  const handleExportData = async () => {
    setExportLoading(true);
    try {
      await router.post('/resident/api/privacy/export-data', {}, {
        onSuccess: () => {
          showNotification('success', 'Your data export has been initiated. You will receive an email when ready.');
        },
        onError: (errors) => {
          showNotification('error', errors.message || 'Failed to export data');
        }
      });
    } finally {
      setExportLoading(false);
    }
  };

  // View document
  const handleViewDocument = (docId: number) => {
    window.location.href = `/resident/documents/${docId}`;
  };

  // Safe access helpers
  const emergencyContact = residentData.emergencyContact || { name: '—', relation: '—', number: '—' };
  const idNumbers = residentData.idNumbers || {};

  // Check if we have real data
  const hasRealData = residentData.id !== 0 && residentData.fullName !== '—';

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="My Data Privacy" />
      
      <SettingsLayout>
        <div className="space-y-8">
          {/* Notification Toast */}
          {notification && (
            <div 
              className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg animate-in slide-in-from-top-2 ${
                notification.type === 'success' 
                  ? 'bg-green-50 dark:bg-green-950/90 border border-green-200 dark:border-green-800' 
                  : 'bg-red-50 dark:bg-red-950/90 border border-red-200 dark:border-red-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-1 rounded-full ${
                  notification.type === 'success' 
                    ? 'bg-green-100 dark:bg-green-900' 
                    : 'bg-red-100 dark:bg-red-900'
                }`}>
                  {notification.type === 'success' ? '✓' : '⚠'}
                </div>
                <p className={notification.type === 'success' 
                  ? 'text-green-800 dark:text-green-200' 
                  : 'text-red-800 dark:text-red-200'
                }>
                  {notification.message}
                </p>
              </div>
            </div>
          )}

          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg text-white font-bold text-xl">
                  🛡️
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight dark:text-white">
                    Data Privacy Center
                  </h1>
                  <p className="text-muted-foreground dark:text-gray-400">
                    View your data, track access, and exercise your privacy rights
                  </p>
                </div>
              </div>
            </div>
            <Badge variant="outline" className="sm:self-center gap-2 px-3 py-1.5 dark:border-gray-700 dark:text-gray-300">
              <span>👆</span>
              RA 10173 Compliant
            </Badge>
          </div>

          {/* Privacy Score Card */}
          {initialScore && (
            <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 shadow-md">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white dark:bg-gray-900 rounded-xl shadow-sm text-blue-600 dark:text-blue-400 text-xl">
                      🛡️
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">Privacy Score</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-blue-700 dark:text-blue-300">{initialScore.score}</span>
                        <span className="text-sm text-blue-600 dark:text-blue-400">/100</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 max-w-md">
                    <Progress value={initialScore.score} className="h-2 dark:bg-gray-700" />
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
                      {initialScore.recommendations[0] || 'Your data privacy settings are well configured'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Privacy Notice Alert */}
          <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="p-1 bg-amber-100 dark:bg-amber-900 rounded-full text-amber-600 dark:text-amber-400 text-lg">
                  ℹ️
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
                  Your data is collected and stored in accordance with the Data Privacy Act of 2012 (RA 10173). 
                  As a government agency, we process your information based on legal mandate and public function, 
                  not on consent. This information is used solely for barangay governance and service delivery.
                </p>
              </div>
            </div>
          </div>

          {/* Main Tabs - Now only 3 tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 p-1 dark:bg-gray-800/50">
              <TabsTrigger value="my-data" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900">
                My Data
              </TabsTrigger>
              <TabsTrigger value="access-logs" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900">
                Access Logs
              </TabsTrigger>
              <TabsTrigger value="documents" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900">
                Documents
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: MY DATA */}
            <TabsContent value="my-data" className="space-y-6 mt-6">
              {/* Data Categories Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Personal Information */}
                <Card className="group hover:shadow-lg transition-all duration-300 dark:bg-gray-900/50 dark:border-gray-800">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg group-hover:scale-110 transition-transform text-blue-600 dark:text-blue-400 text-xl">
                        👤
                      </div>
                      <Badge variant="outline" className="text-xs dark:border-gray-700">
                        Updated Mar 08, 2026
                      </Badge>
                    </div>
                    <CardTitle className="text-lg mt-3 dark:text-white">Personal Information</CardTitle>
                    <CardDescription className="text-sm dark:text-gray-400">
                      Basic personal details
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground dark:text-gray-500">Retention:</span>
                        <span className="font-medium dark:text-gray-300">10 years</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground dark:text-gray-500">Legal Basis:</span>
                        <span className="font-medium dark:text-gray-300">CBMS Act / Barangay Registry</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Information */}
                <Card className="group hover:shadow-lg transition-all duration-300 dark:bg-gray-900/50 dark:border-gray-800">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="p-2.5 bg-green-50 dark:bg-green-900/30 rounded-lg group-hover:scale-110 transition-transform text-green-600 dark:text-green-400 text-xl">
                        📍
                      </div>
                      <Badge variant="outline" className="text-xs dark:border-gray-700">
                        Updated Mar 08, 2026
                      </Badge>
                    </div>
                    <CardTitle className="text-lg mt-3 dark:text-white">Contact Information</CardTitle>
                    <CardDescription className="text-sm dark:text-gray-400">
                      Address and contact details
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground dark:text-gray-500">Retention:</span>
                        <span className="font-medium dark:text-gray-300">10 years</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground dark:text-gray-500">Legal Basis:</span>
                        <span className="font-medium dark:text-gray-300">Barangay Ordinance</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Household Data */}
                <Card className="group hover:shadow-lg transition-all duration-300 dark:bg-gray-900/50 dark:border-gray-800">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="p-2.5 bg-purple-50 dark:bg-purple-900/30 rounded-lg group-hover:scale-110 transition-transform text-purple-600 dark:text-purple-400 text-xl">
                        🏠
                      </div>
                      <Badge variant="outline" className="text-xs dark:border-gray-700">
                        Updated Mar 08, 2026
                      </Badge>
                    </div>
                    <CardTitle className="text-lg mt-3 dark:text-white">Household Data</CardTitle>
                    <CardDescription className="text-sm dark:text-gray-400">
                      Household composition
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground dark:text-gray-500">Retention:</span>
                        <span className="font-medium dark:text-gray-300">10 years</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground dark:text-gray-500">Legal Basis:</span>
                        <span className="font-medium dark:text-gray-300">Housing and Land Use Registry</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Socioeconomic Data */}
                <Card className="group hover:shadow-lg transition-all duration-300 dark:bg-gray-900/50 dark:border-gray-800">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="p-2.5 bg-orange-50 dark:bg-orange-900/30 rounded-lg group-hover:scale-110 transition-transform text-orange-600 dark:text-orange-400 text-xl">
                        💼
                      </div>
                      <Badge variant="outline" className="text-xs dark:border-gray-700">
                        Updated Mar 08, 2026
                      </Badge>
                    </div>
                    <CardTitle className="text-lg mt-3 dark:text-white">Socioeconomic Data</CardTitle>
                    <CardDescription className="text-sm dark:text-gray-400">
                      Employment and income
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground dark:text-gray-500">Retention:</span>
                        <span className="font-medium dark:text-gray-300">5 years</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground dark:text-gray-500">Legal Basis:</span>
                        <span className="font-medium dark:text-gray-300">Social Services Eligibility</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Special Categories */}
                <Card className="group hover:shadow-lg transition-all duration-300 dark:bg-gray-900/50 dark:border-gray-800">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="p-2.5 bg-red-50 dark:bg-red-900/30 rounded-lg group-hover:scale-110 transition-transform text-red-600 dark:text-red-400 text-xl">
                        ❤️
                      </div>
                      <Badge variant="outline" className="text-xs dark:border-gray-700">
                        Updated Mar 08, 2026
                      </Badge>
                    </div>
                    <CardTitle className="text-lg mt-3 dark:text-white">Special Categories</CardTitle>
                    <CardDescription className="text-sm dark:text-gray-400">
                      Special classifications (PWD, Senior, etc.)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground dark:text-gray-500">Retention:</span>
                        <span className="font-medium dark:text-gray-300">5 years</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground dark:text-gray-500">Legal Basis:</span>
                        <span className="font-medium dark:text-gray-300">Social Welfare Laws</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Documents */}
                <Card className="group hover:shadow-lg transition-all duration-300 dark:bg-gray-900/50 dark:border-gray-800">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg group-hover:scale-110 transition-transform text-indigo-600 dark:text-indigo-400 text-xl">
                        📄
                      </div>
                      <Badge variant="outline" className="text-xs dark:border-gray-700">
                        Updated Mar 08, 2026
                      </Badge>
                    </div>
                    <CardTitle className="text-lg mt-3 dark:text-white">Documents</CardTitle>
                    <CardDescription className="text-sm dark:text-gray-400">
                      Uploaded documents
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground dark:text-gray-500">Retention:</span>
                        <span className="font-medium dark:text-gray-300">Permanent</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground dark:text-gray-500">Legal Basis:</span>
                        <span className="font-medium dark:text-gray-300">Document Management System</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Personal Information Card */}
              <Card className="dark:bg-gray-900/50 dark:border-gray-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-blue-600 dark:text-blue-400 text-xl">
                        👤
                      </div>
                      <div>
                        <CardTitle className="dark:text-white">Complete Resident Record</CardTitle>
                        <CardDescription className="dark:text-gray-400">
                          {hasRealData 
                            ? 'All information the barangay has on file'
                            : 'No resident data available'}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {!hasRealData ? (
                    <div className="text-center py-16">
                      <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center text-gray-400 dark:text-gray-600 text-2xl">
                        💾
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Data Available</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                        Your resident information has not been set up yet. Please contact the barangay hall to complete your registration.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Personal Info Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Personal Details */}
                        <div className="space-y-4">
                          <h3 className="font-medium text-blue-600 dark:text-blue-400 flex items-center gap-2 text-sm uppercase tracking-wider">
                            <span>👤</span>
                            Personal Details
                          </h3>
                          <div className="space-y-3">
                            <InfoRow label="Full Name" value={residentData.fullName} />
                            <InfoRow label="Birth Date" value={`${residentData.birthDate} (${residentData.age} y/o)`} />
                            <InfoRow label="Gender" value={residentData.gender} />
                            <InfoRow label="Civil Status" value={residentData.civilStatus} />
                            <InfoRow label="Religion" value={residentData.religion} />
                          </div>
                        </div>

                        {/* Address & Contact */}
                        <div className="space-y-4">
                          <h3 className="font-medium text-green-600 dark:text-green-400 flex items-center gap-2 text-sm uppercase tracking-wider">
                            <span>📍</span>
                            Address & Contact
                          </h3>
                          <div className="space-y-3">
                            <InfoRow label="Complete Address" value={residentData.address} />
                            <InfoRow label="Zone/Purok" value={residentData.zone} />
                            <InfoRow label="Household #" value={residentData.household} />
                            <InfoRow label="Contact Number" value={residentData.contactNumber} />
                            <InfoRow label="Email" value={residentData.email} />
                          </div>
                        </div>

                        {/* Government IDs */}
                        <div className="space-y-4">
                          <h3 className="font-medium text-purple-600 dark:text-purple-400 flex items-center gap-2 text-sm uppercase tracking-wider">
                            <span>💳</span>
                            Government IDs
                          </h3>
                          <div className="space-y-3">
                            {idNumbers.philSys && <InfoRow label="PhilSys ID" value={idNumbers.philSys} mono />}
                            {idNumbers.passport && <InfoRow label="Passport" value={idNumbers.passport} mono />}
                            {idNumbers.driversLicense && <InfoRow label="Driver's License" value={idNumbers.driversLicense} mono />}
                            {residentData.philhealth && residentData.philhealth !== '—' && (
                              <InfoRow label="PhilHealth" value={residentData.philhealth} mono />
                            )}
                            {residentData.tin && residentData.tin !== '—' && (
                              <InfoRow label="TIN" value={residentData.tin} mono />
                            )}
                            {!idNumbers.philSys && !idNumbers.passport && !idNumbers.driversLicense && 
                             (!residentData.philhealth || residentData.philhealth === '—') && 
                             (!residentData.tin || residentData.tin === '—') && (
                              <p className="text-sm text-muted-foreground dark:text-gray-500 italic">No ID numbers on file</p>
                            )}
                          </div>
                        </div>

                        {/* Emergency Contact */}
                        <div className="space-y-4">
                          <h3 className="font-medium text-red-600 dark:text-red-400 flex items-center gap-2 text-sm uppercase tracking-wider">
                            <span>📞</span>
                            Emergency Contact
                          </h3>
                          <div className="space-y-3">
                            <InfoRow label="Name" value={emergencyContact.name} />
                            <InfoRow label="Relationship" value={emergencyContact.relation} />
                            <InfoRow label="Contact Number" value={emergencyContact.number} />
                          </div>
                        </div>

                        {/* Employment & Social */}
                        <div className="space-y-4">
                          <h3 className="font-medium text-orange-600 dark:text-orange-400 flex items-center gap-2 text-sm uppercase tracking-wider">
                            <span>💼</span>
                            Employment & Social
                          </h3>
                          <div className="space-y-3">
                            <InfoRow label="Occupation" value={residentData.occupation} />
                            <InfoRow label="Monthly Income" value={residentData.monthlyIncome} />
                            <InfoRow label="Education" value={residentData.education} />
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground dark:text-gray-500">Voter Status</span>
                              {residentData.voterStatus ? (
                                <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                                  Registered
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="dark:border-gray-700 dark:text-gray-400">
                                  Not Registered
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
                {hasRealData && (
                  <CardFooter className="border-t bg-gray-50/50 dark:bg-gray-800/50 dark:border-gray-800 px-6 py-4">
                    <div className="flex items-center justify-between w-full">
                      <p className="text-sm text-muted-foreground dark:text-gray-500 flex items-center gap-2">
                        <span>ℹ️</span>
                        Found an error? Click "Request Correction" below
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRequestCorrection('personal-info')}
                        disabled={correctionLoading}
                        className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                      >
                        {correctionLoading ? (
                          <span className="mr-2 animate-spin">⏳</span>
                        ) : (
                          <span className="mr-2">✍️</span>
                        )}
                        Request Correction
                      </Button>
                    </div>
                  </CardFooter>
                )}
              </Card>

              {/* Household Members */}
              {household.length > 0 && (
                <Card className="dark:bg-gray-900/50 dark:border-gray-800">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg text-green-600 dark:text-green-400 text-xl">
                        👥
                      </div>
                      <div>
                        <CardTitle className="dark:text-white">Household Members</CardTitle>
                        <CardDescription className="dark:text-gray-400">
                          Family members listed in your household
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-lg border dark:border-gray-800 overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                            <TableHead className="dark:text-gray-400">Name</TableHead>
                            <TableHead className="dark:text-gray-400">Relationship</TableHead>
                            <TableHead className="dark:text-gray-400">Age</TableHead>
                            <TableHead className="dark:text-gray-400">Occupation</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {household.map((member) => (
                            <TableRow key={member.id} className="dark:border-gray-800">
                              <TableCell className="font-medium dark:text-white">{member.name}</TableCell>
                              <TableCell className="dark:text-gray-300">{member.relation}</TableCell>
                              <TableCell className="dark:text-gray-300">{member.age}</TableCell>
                              <TableCell className="dark:text-gray-300">{member.occupation || '—'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* TAB 2: ACCESS LOGS */}
            <TabsContent value="access-logs" className="space-y-6 mt-6">
              <Card className="dark:bg-gray-900/50 dark:border-gray-800">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg text-purple-600 dark:text-purple-400 text-xl">
                      📋
                    </div>
                    <div>
                      <CardTitle className="dark:text-white">Data Access History</CardTitle>
                      <CardDescription className="dark:text-gray-400">
                        Records of who accessed your information and why
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {accessLogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16">
                      <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full w-16 h-16 flex items-center justify-center text-gray-400 dark:text-gray-600 text-2xl mb-4">
                        📋
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Access Records</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto text-center">
                        No one has accessed your data in the last 30 days. All access is logged for your security.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {accessLogs.map((log) => (
                        <div key={log.id} className="p-4 rounded-lg border dark:border-gray-800 hover:bg-accent/50 dark:hover:bg-gray-800/50 transition-colors">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-10 w-10 ring-2 ring-purple-100 dark:ring-purple-900">
                              <AvatarFallback className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                                {log.official?.split(' ').map(n => n[0]).join('') || '??'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center justify-between flex-wrap gap-2">
                                <div>
                                  <h4 className="font-medium dark:text-white">{log.official}</h4>
                                  <p className="text-sm text-muted-foreground dark:text-gray-400">
                                    {log.position} • {log.department}
                                  </p>
                                </div>
                                <Badge variant="outline" className="text-xs dark:border-gray-700 dark:text-gray-400">
                                  <span className="mr-1">⏱️</span>
                                  {log.date}
                                </Badge>
                              </div>
                              <p className="text-sm mt-3 dark:text-gray-300">
                                <span className="font-medium dark:text-gray-200">Reason:</span> {log.reason}
                              </p>
                              <div className="mt-3">
                                <p className="text-xs font-medium text-muted-foreground dark:text-gray-400 mb-2">
                                  Data accessed:
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {log.dataAccessed?.map((item, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs dark:bg-gray-800 dark:text-gray-300">
                                      {item}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="border-t bg-gray-50/50 dark:bg-gray-800/50 dark:border-gray-800">
                  <div className="flex items-center gap-2 w-full">
                    <span className="text-muted-foreground dark:text-gray-500">ℹ️</span>
                    <p className="text-sm text-muted-foreground dark:text-gray-500">
                      All access to your data is logged as required by the Data Privacy Act.
                    </p>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* TAB 3: DOCUMENTS */}
            <TabsContent value="documents" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Documents List */}
                <Card className="lg:col-span-2 dark:bg-gray-900/50 dark:border-gray-800">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-blue-600 dark:text-blue-400 text-xl">
                        📄
                      </div>
                      <div>
                        <CardTitle className="dark:text-white">Issued Documents</CardTitle>
                        <CardDescription className="dark:text-gray-400">
                          Barangay certificates and clearances issued to you
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {documents.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16">
                        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full w-16 h-16 flex items-center justify-center text-gray-400 dark:text-gray-600 text-2xl mb-4">
                          📄
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Documents</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto text-center">
                          You don't have any issued documents yet. Visit the barangay hall to request certificates or clearances.
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-lg border dark:border-gray-800 overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                              <TableHead className="dark:text-gray-400">Document</TableHead>
                              <TableHead className="dark:text-gray-400">Date Issued</TableHead>
                              <TableHead className="dark:text-gray-400">Reference #</TableHead>
                              <TableHead className="dark:text-gray-400">Status</TableHead>
                              <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {documents.map((doc) => (
                              <TableRow key={doc.id} className="dark:border-gray-800">
                                <TableCell>
                                  <div>
                                    <p className="font-medium dark:text-white">{doc.type}</p>
                                    <p className="text-xs text-muted-foreground dark:text-gray-500 mt-0.5">{doc.purpose}</p>
                                  </div>
                                </TableCell>
                                <TableCell className="dark:text-gray-300">{doc.dateIssued}</TableCell>
                                <TableCell>
                                  <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                    {doc.referenceNumber}
                                  </code>
                                </TableCell>
                                <TableCell>
                                  <Badge 
                                    variant={
                                      doc.status === 'active' ? 'default' : 
                                      doc.status === 'expired' ? 'destructive' : 'secondary'
                                    }
                                    className="text-xs"
                                  >
                                    {doc.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleViewDocument(doc.id)}
                                    className="dark:text-gray-400 dark:hover:bg-gray-800"
                                  >
                                    <span className="mr-2">👁️</span>
                                    View
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Data Export Card */}
                <Card className="dark:bg-gray-900/50 dark:border-gray-800 h-fit">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg text-green-600 dark:text-green-400 text-xl">
                        ⬇️
                      </div>
                      <div>
                        <CardTitle className="dark:text-white">Export My Data</CardTitle>
                        <CardDescription className="dark:text-gray-400">
                          Right to Data Portability
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          Under RA 10173, you have the right to obtain a copy of all your personal data held by the barangay.
                        </p>
                      </div>
                      <Button 
                        className="w-full" 
                        onClick={handleExportData}
                        disabled={exportLoading}
                        size="lg"
                      >
                        {exportLoading ? (
                          <span className="mr-2 animate-spin">⏳</span>
                        ) : (
                          <span className="mr-2">⬇️</span>
                        )}
                        Request Data Export
                      </Button>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t bg-gray-50/50 dark:bg-gray-800/50 dark:border-gray-800">
                    <div className="flex items-center gap-1 w-full">
                      <span className="text-xs text-muted-foreground dark:text-gray-500">⏱️</span>
                      <p className="text-xs text-muted-foreground dark:text-gray-500">
                        You can request data export once every 30 days
                      </p>
                    </div>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Privacy Rights Footer */}
          <Card className="dark:bg-gray-900/50 dark:border-gray-800 border-2 border-blue-100 dark:border-blue-900/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 dark:text-white">
                <div className="p-1.5 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-blue-600 dark:text-blue-400 text-xl">
                  🔒
                </div>
                Your Rights Under the Data Privacy Act of 2012 (RA 10173)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { title: 'Right to be Informed', desc: 'Know what data is collected and why', color: 'blue' },
                  { title: 'Right to Access', desc: 'View and request copies of your data', color: 'green' },
                  { title: 'Right to Object', desc: 'Refuse processing of your data', color: 'purple' },
                  { title: 'Right to Erasure', desc: 'Request data deletion or blocking', color: 'red' },
                  { title: 'Right to Rectify', desc: 'Correct inaccurate data', color: 'orange' },
                  { title: 'Right to Data Portability', desc: 'Obtain and transfer your data', color: 'indigo' },
                ].map((right, index) => (
                  <div 
                    key={index} 
                    className={`p-4 bg-${right.color}-50 dark:bg-${right.color}-950/30 rounded-lg border border-${right.color}-100 dark:border-${right.color}-900/50`}
                  >
                    <h4 className={`font-medium text-${right.color}-700 dark:text-${right.color}-400 mb-1 flex items-center gap-2`}>
                      <span className={`text-${right.color}-500`}>✓</span>
                      {right.title}
                    </h4>
                    <p className={`text-sm text-${right.color}-600 dark:text-${right.color}-300`}>
                      {right.desc}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="border-t bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 dark:border-gray-800">
              <div className="flex items-center justify-between w-full">
                <p className="text-sm text-muted-foreground dark:text-gray-400 flex items-center gap-2">
                  <span>📧</span>
                  For privacy concerns, contact our Data Protection Officer
                </p>
                <Button variant="link" className="text-blue-600 dark:text-blue-400 gap-1">
                  dpo@barangay.gov.ph
                  <span>↗️</span>
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </SettingsLayout>
    </AppLayout>
  );
}

// Helper component for info rows
const InfoRow = ({ label, value, mono = false }: { label: string; value?: string; mono?: boolean }) => (
  <div className="flex justify-between items-start">
    <span className="text-sm text-muted-foreground dark:text-gray-500">{label}</span>
    <span className={`text-sm font-medium dark:text-white text-right ${mono ? 'font-mono' : ''}`}>
      {value || '—'}
    </span>
  </div>
);