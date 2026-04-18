// components/admin/officials/shared/contact-information.tsx
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Phone, Mail, Info } from 'lucide-react';
import { Resident } from '@/components/admin/officials/shared/types/official';

interface ContactInformationProps {
    contactNumber: string;
    email: string;
    selectedResident: Resident | null;
    onContactNumberChange: (value: string) => void;
    onEmailChange: (value: string) => void;
    disabled?: boolean;
}

export function ContactInformation({
    contactNumber,
    email,
    selectedResident,
    onContactNumberChange,
    onEmailChange,
    disabled = false
}: ContactInformationProps) {
    const hasResidentContact = selectedResident?.contact_number && selectedResident.contact_number !== contactNumber;
    const hasResidentEmail = selectedResident?.email && selectedResident.email !== email;

    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="contact_number" className="dark:text-gray-300">Contact Number</Label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <Input 
                            id="contact_number" 
                            placeholder="09123456789" 
                            value={contactNumber}
                            onChange={(e) => onContactNumberChange(e.target.value)}
                            disabled={disabled}
                            className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                        />
                    </div>
                    {hasResidentContact && (
                        <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 mt-1">
                            <Info className="h-3 w-3" />
                            <span>Resident's contact: {selectedResident?.contact_number}</span>
                            <button
                                type="button"
                                onClick={() => onContactNumberChange(selectedResident?.contact_number || '')}
                                className="underline hover:no-underline"
                            >
                                Use resident's
                            </button>
                        </div>
                    )}
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="email" className="dark:text-gray-300">Email Address</Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <Input 
                            id="email" 
                            type="email" 
                            placeholder="official@barangay.gov.ph" 
                            value={email}
                            onChange={(e) => onEmailChange(e.target.value)}
                            disabled={disabled}
                            className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                        />
                    </div>
                    {hasResidentEmail && (
                        <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 mt-1">
                            <Info className="h-3 w-3" />
                            <span>Resident's email: {selectedResident?.email}</span>
                            <button
                                type="button"
                                onClick={() => onEmailChange(selectedResident?.email || '')}
                                className="underline hover:no-underline"
                            >
                                Use resident's
                            </button>
                        </div>
                    )}
                </div>
            </div>
            
            {(hasResidentContact || hasResidentEmail) && (
                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs text-gray-500 dark:text-gray-400">
                    <p>💡 Tip: Contact information can be overridden for this official position.</p>
                </div>
            )}
        </div>
    );
}