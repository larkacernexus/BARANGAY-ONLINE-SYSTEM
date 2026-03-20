// components/admin/residents/edit/ContactInfoSection.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Phone, Mail, MapPin, Home, AlertCircle } from 'lucide-react';
import { ResidentFormData, Purok } from '@/components/admin/residents/edit/resident';

interface Props {
    data: ResidentFormData;
    setData: (key: keyof ResidentFormData, value: any) => void;
    errors: Record<string, string>;
    puroks: Purok[];
}

export default function ContactInfoSection({ data, setData, errors, puroks }: Props) {
    return (
        <Card className="dark:bg-gray-900">
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
                        <Label htmlFor="contact_number" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            <Phone className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                            Contact Number <span className="text-red-500">*</span>
                        </Label>
                        <Input 
                            id="contact_number" 
                            placeholder="09123456789" 
                            required 
                            value={data.contact_number}
                            onChange={(e) => setData('contact_number', e.target.value)}
                            className={`dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 ${errors.contact_number ? 'border-red-500 dark:border-red-800' : ''}`}
                        />
                        {errors.contact_number && (
                            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {errors.contact_number}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            <Mail className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                            Email Address
                        </Label>
                        <Input 
                            id="email" 
                            type="email" 
                            placeholder="juan@example.com" 
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className={`dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 ${errors.email ? 'border-red-500 dark:border-red-800' : ''}`}
                        />
                        {errors.email && (
                            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {errors.email}
                            </p>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="address" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <MapPin className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        Complete Address <span className="text-red-500">*</span>
                    </Label>
                    <Textarea 
                        id="address" 
                        placeholder="House No., Street, Purok, Barangay Kibawe" 
                        required 
                        rows={3}
                        value={data.address}
                        onChange={(e) => setData('address', e.target.value)}
                        className={`dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 ${errors.address ? 'border-red-500 dark:border-red-800' : ''}`}
                    />
                    {errors.address && (
                        <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.address}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="purok_id" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <Home className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        Purok <span className="text-red-500">*</span>
                    </Label>
                    <Select 
                        value={data.purok_id?.toString() || ''}
                        onValueChange={(value) => setData('purok_id', value ? parseInt(value) : null)}
                    >
                        <SelectTrigger className={`dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 ${errors.purok_id ? 'border-red-500 dark:border-red-800' : ''}`}>
                            <SelectValue placeholder="Select purok" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                            {puroks.length === 0 ? (
                                <div className="px-2 py-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                                    No puroks available. Please create puroks first.
                                </div>
                            ) : (
                                puroks.map((purok) => (
                                    <SelectItem key={purok.id} value={purok.id.toString()} className="dark:text-gray-300 dark:focus:bg-gray-700">
                                        {purok.name}
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                    {errors.purok_id && (
                        <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.purok_id}
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}