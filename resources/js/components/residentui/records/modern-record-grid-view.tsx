import { cn } from '@/lib/utils';
import { ModernRecordCard } from './modern-record-card';
import { ModernRecordGridCard } from './modern-record-grid-card';

interface ModernRecordGridViewProps {
    records: any[];
    selectMode?: boolean;
    selectedRecords?: number[];
    onSelectRecord?: (id: number) => void;
    getResidentName: (residentId: number, doc?: any) => string;
    onView: (doc: any) => void;
    onDownload: (doc: any) => void;
    onDelete?: (doc: any) => void;
    onCopyReference?: (ref: string) => void;
    isMobile?: boolean;
}

export function ModernRecordGridView({
    records,
    selectMode,
    selectedRecords = [],
    onSelectRecord,
    getResidentName,
    onView,
    onDownload,
    onDelete,
    onCopyReference,
    isMobile
}: ModernRecordGridViewProps) {
    return (
        <div className={cn(
            isMobile ? "space-y-3" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        )}>
            {records.map((record) => (
                isMobile ? (
                    <ModernRecordCard
                        key={`record-${record.id}`}
                        document={record}
                        selectMode={selectMode || false}
                        selectedRecords={selectedRecords || []}
                        toggleSelectRecord={(id) => onSelectRecord?.(id)}
                        getResidentName={getResidentName}
                        onView={onView}
                        onDownload={onDownload}
                        onDelete={onDelete}
                        onCopyReference={onCopyReference}
                        isMobile={isMobile}
                    />
                ) : (
                    <ModernRecordGridCard
                        key={`record-${record.id}`}
                        document={record}
                        selectMode={selectMode || false}
                        selectedRecords={selectedRecords || []}
                        toggleSelectRecord={(id) => onSelectRecord?.(id)}
                        getResidentName={getResidentName}
                        onView={onView}
                        onDownload={onDownload}
                        onDelete={onDelete}
                        onCopyReference={onCopyReference}
                    />
                )
            ))}
        </div>
    );
}