import { FormCard } from './FormCard';
import { GridLayout } from '@/components/adminui/grid-layout';
import { EmptyState } from '@/components/adminui/empty-state';
import { FileText } from 'lucide-react';
import { router } from '@inertiajs/react';
import { Form } from '@/types';
import { formUtils } from '@/admin-utils/form-utils';

interface FormsGridViewProps {
    forms: Form[];
    isBulkMode: boolean;
    selectedForms: number[];
    isMobile: boolean;
    onItemSelect: (id: number) => void;
    onDelete: (form: Form) => void;
    onToggleStatus: (form: Form) => void;
    onDownload: (form: Form) => void;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
}

export default function FormsGridView({
    forms,
    isBulkMode,
    selectedForms,
    isMobile,
    onItemSelect,
    onDelete,
    onToggleStatus,
    onDownload,
    hasActiveFilters,
    onClearFilters
}: FormsGridViewProps) {
    
    const emptyState = (
        <EmptyState
            title="No forms found"
            description={hasActiveFilters 
                ? 'Try changing your filters or search criteria.'
                : 'Get started by uploading a form.'}
            icon={<FileText className="h-12 w-12 text-gray-300 dark:text-gray-700" />}
            hasFilters={hasActiveFilters}
            onClearFilters={onClearFilters}
            onCreateNew={() => router.get('/forms/create')}
            createLabel="Upload Form"
        />
    );

    return (
        <GridLayout
            isEmpty={forms.length === 0}
            emptyState={emptyState}
            gridCols={{ base: 1, sm: 2, lg: 3, xl: 4 }}
            gap={{ base: '3', sm: '4' }}
            padding="p-4"
        >
            {forms.map(form => (
                <FormCard
                    key={form.id}
                    form={form}
                    isSelected={selectedForms.includes(form.id)}
                    isBulkMode={isBulkMode}
                    isMobile={isMobile}
                    onSelect={onItemSelect}
                    onDelete={onDelete}
                    onToggleStatus={onToggleStatus}
                    onDownload={onDownload}
                    truncateText={formUtils.truncateText}
                    formatFileSize={formUtils.formatFileSize}
                    getCategoryColor={formUtils.getCategoryColor}
                    formatDateTime={formUtils.formatDateTime}
                />
            ))}
        </GridLayout>
    );
}