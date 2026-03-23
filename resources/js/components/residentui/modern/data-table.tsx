import { ReactNode } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface Column<T> {
    key: string;
    header: ReactNode;
    cell: (item: T, index: number) => ReactNode;
    className?: string;
}

interface DataTableProps<T, IdType = string | number> {
    data: T[];
    columns: Column<T>[];
    selectMode?: boolean;
    selectedItems?: Array<IdType>;
    onSelectItem?: (id: IdType) => void;
    onSelectAll?: () => void;
    getItemId: (item: T) => IdType;
    className?: string;
}

export function DataTable<T, IdType = string | number>({
    data,
    columns,
    selectMode,
    selectedItems = [],
    onSelectItem,
    onSelectAll,
    getItemId,
    className
}: DataTableProps<T, IdType>) {
    const allSelected = data.length > 0 && data.every(item => 
        selectedItems.includes(getItemId(item))
    );

    return (
        <div className={cn("overflow-x-auto", className)}>
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent border-gray-200 dark:border-gray-700">
                        {selectMode && onSelectAll && (
                            <TableHead className="w-12">
                                <input
                                    type="checkbox"
                                    checked={allSelected}
                                    onChange={onSelectAll}
                                    className="h-4 w-4 rounded border-gray-300 dark:border-gray-600"
                                />
                            </TableHead>
                        )}
                        {columns.map((column) => (
                            <TableHead 
                                key={column.key} 
                                className={cn("font-semibold text-gray-700 dark:text-gray-300", column.className)}
                            >
                                {column.header}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((item, index) => {
                        const itemId = getItemId(item);
                        const isSelected = selectedItems.includes(itemId);
                        
                        return (
                            <TableRow 
                                key={String(itemId)} 
                                className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors border-gray-200 dark:border-gray-700"
                            >
                                {selectMode && onSelectItem && (
                                    <TableCell>
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => onSelectItem(itemId)}
                                            className="h-4 w-4 rounded border-gray-300 dark:border-gray-600"
                                        />
                                    </TableCell>
                                )}
                                {columns.map((column) => (
                                    <TableCell key={column.key} className={column.className}>
                                        {column.cell(item, index)}
                                    </TableCell>
                                ))}
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}