// components/admin/officials/shared/contact-information.tsx
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Phone, Mail } from 'lucide-react';
import { Resident } from '@/components/admin/officials/shared/types/official';

interface ContactInformationProps {
    contactNumber: string;
    email: string;
    selectedResident: Resident | null;
    onContactNumberChange: (value: string) => void;
    onEmailChange: (value: string) => void;
}

export function ContactInformation({
    contactNumber,
    email,
    selectedResident,
    onContactNumberChange,
    onEmailChange
}: ContactInformationProps) {
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
                            className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                        />
                    </div>
                    {selectedResident?.contact_number && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Pre-filled from resident record
                        </p>
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
                            className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                        />
                    </div>
                    {selectedResident?.email && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Pre-filled from resident record
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}