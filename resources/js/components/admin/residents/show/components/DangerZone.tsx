import { 
    Card, 
    CardHeader, 
    CardTitle, 
    CardDescription, 
    CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Trash2 } from "lucide-react";
interface DangerZoneProps {
    residentName: string;
    onDelete: () => void;
}

export const DangerZone = ({ residentName, onDelete }: DangerZoneProps) => {
    return (
        <Card className="border-red-200 dark:border-red-900 dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="text-red-700 dark:text-red-400 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Danger Zone
                </CardTitle>
                <CardDescription className="text-red-600 dark:text-red-400">
                    Irreversible actions for this resident
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-red-50 dark:bg-red-950/30 rounded-md">
                    <div className="flex-1">
                        <div className="font-medium text-red-800 dark:text-red-300">
                            Delete this resident
                        </div>
                        <div className="text-sm text-red-600 dark:text-red-400 mt-1">
                            This will permanently delete the resident record and all associated data. This action cannot be undone.
                        </div>
                    </div>
                    <Button 
                        variant="destructive"
                        onClick={onDelete}
                        className="whitespace-nowrap bg-red-600 hover:bg-red-700 text-white"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Resident
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};