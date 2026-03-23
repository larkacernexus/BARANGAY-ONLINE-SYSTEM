// payment-show/components/dialogs/UploadAttachmentDialog.tsx
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

interface UploadAttachmentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    file: File | null;
    setFile: (file: File | null) => void;
    description: string;
    setDescription: (description: string) => void;
    onUpload: () => void;
    loading: boolean;
}

export function UploadAttachmentDialog({
    open,
    onOpenChange,
    file,
    setFile,
    description,
    setDescription,
    onUpload,
    loading
}: UploadAttachmentDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Upload Attachment</DialogTitle>
                    <DialogDescription>
                        Upload a file related to this payment. Max file size: 10MB
                    </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="file">File</Label>
                        <Input
                            id="file"
                            type="file"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                        />
                        <p className="text-xs text-gray-500">
                            Accepted formats: JPG, PNG, PDF, DOC, DOCX
                        </p>
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea
                            id="description"
                            placeholder="Enter a description for this file..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={2}
                        />
                    </div>
                </div>
                
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={onUpload} disabled={loading || !file}>
                        {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                        Upload
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}