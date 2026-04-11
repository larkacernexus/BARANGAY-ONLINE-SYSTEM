// @/components/admin/residents/photo-view-modal.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Download } from 'lucide-react';
import { Resident } from '@/types/admin/residents/residents-types';

interface PhotoViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    resident: Resident | null;
    photoUrl: string | null;
}

export function PhotoViewModal({ isOpen, onClose, resident, photoUrl }: PhotoViewModalProps) {
    if (!resident || !photoUrl) return null;

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = photoUrl;
        link.download = `${resident.first_name}_${resident.last_name}_photo.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md md:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>{resident.first_name} {resident.last_name}'s Photo</span>
                        <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6">
                            <X className="h-4 w-4" />
                        </Button>
                    </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center gap-4">
                    <div className="relative w-full max-h-[60vh] overflow-auto rounded-lg border border-gray-200 dark:border-gray-700">
                        <img 
                            src={photoUrl} 
                            alt={`${resident.first_name} ${resident.last_name}`}
                            className="w-full h-auto object-contain"
                        />
                    </div>
                    <div className="flex justify-end gap-2 w-full">
                        <Button variant="outline" onClick={handleDownload} className="gap-2">
                            <Download className="h-4 w-4" />
                            Download
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}