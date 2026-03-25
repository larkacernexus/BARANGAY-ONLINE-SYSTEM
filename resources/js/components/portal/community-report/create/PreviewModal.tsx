// components/community-report/PreviewModal.tsx

import React from 'react';
import { Button } from '@/components/ui/button';
import { ImageIcon, Video, FileText, X } from 'lucide-react';

interface PreviewModalProps {
    isOpen: boolean;
    url: string;
    type: string;
    name: string;
    onClose: () => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
    isOpen,
    url,
    type,
    name,
    onClose
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center gap-3">
                        {type.startsWith('image/') ? (
                            <ImageIcon className="h-5 w-5 text-blue-500" />
                        ) : type.startsWith('video/') ? (
                            <Video className="h-5 w-5 text-purple-500" />
                        ) : (
                            <FileText className="h-5 w-5 text-gray-500" />
                        )}
                        <h3 className="font-semibold truncate">{name}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
                <div className="p-6 overflow-auto max-h-[calc(90vh-80px)]">
                    {type.startsWith('image/') ? (
                        <div className="flex items-center justify-center">
                            <img 
                                src={url} 
                                alt={name}
                                className="max-w-full max-h-[70vh] object-contain rounded-lg"
                            />
                        </div>
                    ) : type.startsWith('video/') ? (
                        <div className="aspect-video max-w-3xl mx-auto">
                            <video 
                                src={url} 
                                controls
                                className="w-full h-full rounded-lg bg-black"
                            >
                                Your browser does not support the video tag.
                            </video>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-12">
                            <FileText className="h-24 w-24 text-gray-400 mb-4" />
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                Preview not available for this file type
                            </p>
                            <a 
                                href={url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                            >
                                Open file in new tab
                            </a>
                        </div>
                    )}
                </div>
                <div className="p-4 border-t flex items-center justify-between">
                    <span className="text-sm text-gray-500">{type}</span>
                    <Button
                        type="button"
                        onClick={onClose}
                    >
                        Close Preview
                    </Button>
                </div>
            </div>
        </div>
    );
};