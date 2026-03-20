import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// Icons
import { Edit, Award, Printer, Home, Users, Trash2 } from 'lucide-react';
interface QuickActionsProps {
    residentId: number;
    hasHousehold: boolean;
    householdId?: number;
    onAddToHousehold: () => void;
    onDelete: () => void;
}

export const QuickActions = ({ 
    residentId, 
    hasHousehold, 
    householdId, 
    onAddToHousehold, 
    onDelete 
}: QuickActionsProps) => {
    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="text-sm dark:text-gray-100">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <Link href={route('admin.residents.edit', residentId)} className="w-full">
                    <Button variant="outline" className="w-full justify-start dark:border-gray-600 dark:text-gray-300">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Resident
                    </Button>
                </Link>
                
                <Link href={route('admin.residents.edit', residentId)} className="w-full">
                    <Button variant="outline" className="w-full justify-start dark:border-gray-600 dark:text-gray-300">
                        <Award className="h-4 w-4 mr-2" />
                        Manage Benefits
                    </Button>
                </Link>
                
                <Button 
                    variant="outline" 
                    className="w-full justify-start dark:border-gray-600 dark:text-gray-300"
                    onClick={() => window.print()}
                >
                    <Printer className="h-4 w-4 mr-2" />
                    Print Profile
                </Button>
                
                <Separator className="dark:bg-gray-700" />
                
                {!hasHousehold && (
                    <Button 
                        variant="outline" 
                        className="w-full justify-start dark:border-gray-600 dark:text-gray-300"
                        onClick={onAddToHousehold}
                    >
                        <Home className="h-4 w-4 mr-2" />
                        Add to Household
                    </Button>
                )}
                
                {hasHousehold && householdId && (
                    <Link href={route('admin.households.show', householdId)} className="w-full">
                        <Button variant="outline" className="w-full justify-start dark:border-gray-600 dark:text-gray-300">
                            <Users className="h-4 w-4 mr-2" />
                            View Household
                        </Button>
                    </Link>
                )}
                
                <Separator className="dark:bg-gray-700" />
                
                <Button 
                    variant="ghost" 
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/50"
                    onClick={onDelete}
                >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Resident
                </Button>
            </CardContent>
        </Card>
    );
};