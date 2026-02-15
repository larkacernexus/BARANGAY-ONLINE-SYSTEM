// components/ui/generic-grid-view.tsx
import { GridContainer } from './grid-container';
import { GridCard } from './grid-card';
import { GridItemHeader } from './grid-item-header';
import { GridItemInfo } from './grid-item-info';
import { GridItemActions } from './grid-item-actions';
import { Checkbox } from '@/components/ui/checkbox';
import { ReactNode } from 'react';

interface GridColumn<T> {
  key: string;
  title: string;
  render: (item: T) => ReactNode;
  className?: string;
}

interface GenericGridViewProps<T> {
  data: T[];
  columns: GridColumn<T>[];
  isBulkMode?: boolean;
  selectedItems: number[];
  onItemSelect?: (id: number) => void;
  actions?: Array<{
    icon: ReactNode;
    label: string;
    onClick: (item: T) => void;
    variant?: 'default' | 'secondary' | 'destructive' | 'ghost';
    className?: string;
  }>;
  getId: (item: T) => number;
  gridColumns?: {
    base?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

export function GenericGridView<T>({
  data,
  columns,
  isBulkMode = false,
  selectedItems = [],
  onItemSelect,
  actions,
  getId,
  gridColumns = { base: 1, sm: 2, lg: 3, xl: 4 },
}: GenericGridViewProps<T>) {
  return (
    <GridContainer columns={gridColumns}>
      {data.map((item) => {
        const id = getId(item);
        const isSelected = selectedItems.includes(id);

        return (
          <GridCard
            key={id}
            isSelected={isSelected}
            onClick={() => isBulkMode && onItemSelect?.(id)}
          >
            {isBulkMode && onItemSelect && (
              <div className="flex justify-end mb-2">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => onItemSelect(id)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}

            <div className="space-y-3">
              {columns.map((column) => (
                <div key={column.key} className={column.className}>
                  {column.render(item)}
                </div>
              ))}

              {actions && actions.length > 0 && (
                <GridItemActions
                  actions={actions.map((action) => ({
                    ...action,
                    onClick: () => action.onClick(item),
                  }))}
                />
              )}
            </div>
          </GridCard>
        );
      })}
    </GridContainer>
  );
}