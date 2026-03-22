// components/community-report/PreviewModal.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

interface PreviewModalProps {
    isOpen: boolean;
    url: string | null;
    type: string;
    name: string;
    onClose: () => void;
}

export const PreviewModal = ({ isOpen, url, type, name, onClose }: PreviewModalProps) => {
    if (!isOpen || !url) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto bg-white dark:bg-gray-900">
                <DialogHeader>
                    <DialogTitle className="text-gray-900 dark:text-gray-100">{name}</DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                    {type.startsWith('image/') ? (
                        <img src={url} alt={name} className="max-w-full h-auto rounded-lg" />
                    ) : type === 'application/pdf' ? (
                        <iframe src={url} className="w-full h-[70vh] dark:bg-gray-900" title={name} />
                    ) : type.startsWith('video/') ? (
                        <video src={url} controls className="w-full rounded-lg">
                            Your browser does not support the video tag.
                        </video>
                    ) : (
                        <div className="text-center py-8">
                            <FileText className="h-24 w-24 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">Preview not available for this file type</p>
                            <a 
                                href={url} 
                                download={name}
                                className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                            >
                                Download File
                            </a>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};