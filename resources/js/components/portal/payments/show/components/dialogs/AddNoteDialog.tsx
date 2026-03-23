// payment-show/components/dialogs/AddNoteDialog.tsx
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
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

interface AddNoteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    noteContent: string;
    setNoteContent: (content: string) => void;
    isPublic: boolean;
    setIsPublic: (isPublic: boolean) => void;
    onSave: () => void;
    loading: boolean;
}

export function AddNoteDialog({
    open,
    onOpenChange,
    noteContent,
    setNoteContent,
    isPublic,
    setIsPublic,
    onSave,
    loading
}: AddNoteDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Note</DialogTitle>
                    <DialogDescription>
                        Add a note to this payment. Notes can be public or private.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="note">Note Content</Label>
                        <Textarea
                            id="note"
                            placeholder="Enter your note here..."
                            value={noteContent}
                            onChange={(e) => setNoteContent(e.target.value)}
                            rows={4}
                        />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="isPublic"
                            checked={isPublic}
                            onChange={(e) => setIsPublic(e.target.checked)}
                            className="rounded border-gray-300"
                        />
                        <Label htmlFor="isPublic">Make this note public</Label>
                    </div>
                </div>
                
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={onSave} disabled={loading || !noteContent.trim()}>
                        {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                        Add Note
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}