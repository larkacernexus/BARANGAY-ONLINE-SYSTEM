import { useState } from 'react';

export function useSelection<T>(items: T[], getId: (item: T) => string | number) {
    const [selectedItems, setSelectedItems] = useState<(string | number)[]>([]);
    const [selectMode, setSelectMode] = useState(false);

    const toggleSelect = (id: string | number) => {
        setSelectedItems(prev =>
            prev.includes(id)
                ? prev.filter(itemId => itemId !== id)
                : [...prev, id]
        );
    };

    const selectAll = () => {
        if (selectedItems.length === items.length && items.length > 0) {
            setSelectedItems([]);
        } else {
            setSelectedItems(items.map(getId));
        }
    };

    const clearSelection = () => {
        setSelectedItems([]);
        setSelectMode(false);
    };

    const toggleSelectMode = () => {
        if (selectMode) {
            clearSelection();
        } else {
            setSelectMode(true);
        }
    };

    return {
        selectedItems,
        selectMode,
        toggleSelect,
        selectAll,
        clearSelection,
        toggleSelectMode,
        setSelectMode
    };
}