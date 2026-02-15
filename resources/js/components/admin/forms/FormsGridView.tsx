import { FormCard } from './FormCard';
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
    return (
        <div className="p-4">
            {forms.length === 0 ? (
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
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
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
                </div>
            )}
        </div>
    );
}