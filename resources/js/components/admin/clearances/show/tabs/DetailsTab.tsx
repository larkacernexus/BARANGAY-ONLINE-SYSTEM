import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
    FileText, 
    Calendar, 
    CalendarDays, 
    User, 
    Phone, 
    Mail, 
    MapPin, 
    FileCheck,
    DollarSign
} from 'lucide-react';
import { ClearanceRequest, ClearanceType, Resident } from '@/types/clearance';

interface DetailsTabProps {
    clearance: ClearanceRequest;
    clearanceType?: ClearanceType;
    resident?: Resident;
    formatDate: (date?: string) => string;
    formatCurrency: (amount?: number) => string;
    getUrgencyVariant: (urgency: string) => any;
}

export function DetailsTab({ 
    clearance, 
    clearanceType, 
    resident, 
    formatDate, 
    formatCurrency, 
    getUrgencyVariant 
}: DetailsTabProps) {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Request Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-500">Clearance Type</p>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-sm">
                                    {clearanceType?.name || 'N/A'}
                                </Badge>
                                <span className="text-xs text-gray-500">({clearanceType?.code})</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-500">Purpose</p>
                            <p className="text-sm">{clearance.purpose}</p>
                            {clearance.specific_purpose && (
                                <p className="text-sm text-gray-500">{clearance.specific_purpose}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-500">Urgency</p>
                            <Badge variant={getUrgencyVariant(clearance.urgency)}>
                                {clearance.urgency_display || clearance.urgency}
                            </Badge>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-500">Fee Amount</p>
                            <div className="flex items-center gap-2">
                                <p className="text-lg font-semibold">
                                    {formatCurrency(clearance.fee_amount)}
                                </p>
                                {clearanceType?.requires_payment === false && (
                                    <Badge variant="outline" className="text-xs text-green-600">
                                        Free
                                    </Badge>
                                )}
                                {clearanceType?.requires_payment === true && clearance.payment_status === 'paid' && (
                                    <Badge variant="outline" className="text-xs text-green-600">
                                        Paid
                                    </Badge>
                                )}
                                {clearanceType?.requires_payment === true && clearance.payment_status === 'unpaid' && (
                                    <Badge variant="outline" className="text-xs text-amber-600">
                                        Unpaid
                                    </Badge>
                                )}
                                {clearanceType?.requires_payment === true && clearance.payment_status === 'partially_paid' && (
                                    <Badge variant="outline" className="text-xs text-blue-600">
                                        Partially Paid
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-500">Requested Date</p>
                            <div className="flex items-center gap-1 text-sm">
                                <Calendar className="h-3 w-3" />
                                {formatDate(clearance.created_at)}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-500">Needed By</p>
                            <div className="flex items-center gap-1 text-sm">
                                <CalendarDays className="h-3 w-3" />
                                {clearance.needed_date ? formatDate(clearance.needed_date) : 'Not specified'}
                            </div>
                        </div>
                    </div>

                    {clearance.additional_requirements && (
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-500">Additional Requirements</p>
                            <p className="text-sm text-gray-600">{clearance.additional_requirements}</p>
                        </div>
                    )}

                    {clearance.requirements_met && clearance.requirements_met.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-500">Requirements Met</p>
                            <div className="flex flex-wrap gap-2">
                                {clearance.requirements_met.map((req: string, index: number) => (
                                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                                        <FileCheck className="h-3 w-3" />
                                        {req}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Resident Information
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {resident ? (
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                {resident.photo_path ? (
                                    <img
                                        src={resident.photo_path}
                                        alt={resident.full_name}
                                        className="h-16 w-16 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                                        <User className="h-8 w-8 text-gray-400" />
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-semibold text-lg">{resident.full_name}</h3>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                        {resident.contact_number && (
                                            <span className="flex items-center gap-1">
                                                <Phone className="h-3 w-3" />
                                                {resident.contact_number}
                                            </span>
                                        )}
                                        {resident.email && (
                                            <span className="flex items-center gap-1">
                                                <Mail className="h-3 w-3" />
                                                {resident.email}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-500">Address</p>
                                    <p className="text-sm flex items-start gap-1">
                                        <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                        {resident.address || 'No address provided'}
                                    </p>
                                </div>
                                {resident.birth_date && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                                        <p className="text-sm">{formatDate(resident.birth_date)}</p>
                                    </div>
                                )}
                                {resident.gender && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-500">Gender</p>
                                        <p className="text-sm capitalize">{resident.gender}</p>
                                    </div>
                                )}
                                {resident.civil_status && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-500">Civil Status</p>
                                        <p className="text-sm capitalize">{resident.civil_status}</p>
                                    </div>
                                )}
                                {resident.occupation && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-500">Occupation</p>
                                        <p className="text-sm">{resident.occupation}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-500">Resident information not available</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}