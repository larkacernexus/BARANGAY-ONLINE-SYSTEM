// components/admin/residents/create/forms/ContactInfoForm.tsx
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Phone, Mail, MapPin, Home } from 'lucide-react';
import { ResidentFormData } from '@/components/admin/residents/create/hooks/useResidentForm';

interface Props {
    data: ResidentFormData;
    setData: (key: keyof ResidentFormData, value: any) => void;
    errors: Record<string, string>;
    puroks: Array<{id: number, name: string}>;
}

export default function ContactInfoForm({ data, setData, errors, puroks }: Props) {
    return (
        <>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700 flex items-center justify-center">
                        <Phone className="h-3 w-3 text-white" />
                    </div>
                    Contact Information
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                    How to reach the resident
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="contact_number" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            Contact Number <span className="text-red-500">*</span>
                        </Label>
                        <Input 
                            id="contact_number" 
                            placeholder="09123456789" 
                            required 
                            value={data.contact_number}
                            onChange={(e) => setData('contact_number', e.target.value)}
                            className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                        />
                        {errors.contact_number && (
                            <p className="text-sm text-red-600 dark:text-red-400">{errors.contact_number}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            Email Address
                        </Label>
                        <Input 
                            id="email" 
                            type="email" 
                            placeholder="juan@example.com" 
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                        />
                        {errors.email && (
                            <p className="text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="address" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Complete Address <span className="text-red-500">*</span>
                    </Label>
                    <Textarea 
                        id="address" 
                        placeholder="House No., Street, Purok, Barangay Kibawe" 
                        required 
                        rows={3}
                        value={data.address}
                        onChange={(e) => setData('address', e.target.value)}
                        className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                    />
                    {errors.address && (
                        <p className="text-sm text-red-600 dark:text-red-400">{errors.address}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="purok_id" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                        <Home className="h-3 w-3" />
                        Purok <span className="text-red-500">*</span>
                    </Label>
                    <select 
                        id="purok_id"
                        value={data.purok_id?.toString() || ''}
                        onChange={(e) => setData('purok_id', e.target.value ? parseInt(e.target.value) : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                    >
                        <option value="">Select purok</option>
                        {puroks.map((purok) => (
                            <option key={purok.id} value={purok.id}>
                                {purok.name}
                            </option>
                        ))}
                    </select>
                    {errors.purok_id && (
                        <p className="text-sm text-red-600 dark:text-red-400">{errors.purok_id}</p>
                    )}
                </div>
            </CardContent>
        </>
    );
}