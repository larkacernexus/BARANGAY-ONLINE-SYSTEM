// payment-show/components/tabs/NotesTab.tsx
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ModernCard } from '@/components/residentui/modern-card';
import { ModernEmptyState } from '@/components/residentui/modern-empty-state';
import { formatDateTime } from '@/components/residentui/lib/resident-ui-utils';
import { Plus, MessageSquare } from 'lucide-react';
import { PaymentNote } from '@/utils/portal/payments/payment-utils';

interface NotesTabProps {
    notes: PaymentNote[];
    canAdd: boolean;
    onAdd: () => void;
}

export function NotesTab({ notes, canAdd, onAdd }: NotesTabProps) {
    return (
        <ModernCard
            title="Notes"
            description={`${notes?.length || 0} note(s)`}
            action={canAdd && (
                <Button variant="outline" size="sm" className="gap-2 rounded-xl" onClick={onAdd}>
                    <Plus className="h-4 w-4" />
                    Add Note
                </Button>
            )}
        >
            {notes && notes.length > 0 ? (
                <div className="space-y-3">
                    {notes.map((note) => (
                        <div key={note.id} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6">
                                        <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                                            {note.created_by?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-xs font-medium">
                                            {note.created_by?.name || 'System'}
                                            {!note.is_public && (
                                                <Badge variant="outline" className="ml-2 text-[8px] px-1 py-0">
                                                    Private
                                                </Badge>
                                            )}
                                        </p>
                                        <p className="text-[10px] text-gray-500">{note.created_at ? formatDateTime(note.created_at) : 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs whitespace-pre-line">{note.content}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <ModernEmptyState
                    status="default"
                    title="No Notes"
                    message="No notes have been added to this payment"
                    icon={MessageSquare}
                    actionLabel={canAdd ? "Add Note" : undefined}
                    onAction={canAdd ? onAdd : undefined}
                />
            )}
        </ModernCard>
    );
}