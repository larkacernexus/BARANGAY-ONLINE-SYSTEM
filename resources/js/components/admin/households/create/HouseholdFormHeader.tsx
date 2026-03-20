// components/admin/households/create/HouseholdFormHeader.tsx
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Save, Upload } from 'lucide-react';

interface Props {
    processing: boolean;
    onImportClick: () => void;
}

export default function HouseholdFormHeader({ processing, onImportClick }: Props) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Link href="/admin/households">
                    <Button variant="ghost" size="sm" type="button">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Register New Household</h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Register a new household in the barangay database
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Button 
                    variant="outline" 
                    type="button"
                    onClick={onImportClick}
                >
                    <Upload className="h-4 w-4 mr-2" />
                    Import CSV
                </Button>
                <Button type="submit" disabled={processing}>
                    <Save className="h-4 w-4 mr-2" />
                    {processing ? 'Saving...' : 'Register Household'}
                </Button>
            </div>
        </div>
    );
}