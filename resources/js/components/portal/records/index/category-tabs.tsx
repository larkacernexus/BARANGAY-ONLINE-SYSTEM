// components/portal/records/index/category-tabs.tsx

import { FolderIcon, FileIcon, ImageIcon, FileTextIcon, ArchiveIcon } from 'lucide-react';

export const CATEGORY_TABS_CONFIG = [
    { id: 'all', label: 'All Documents', icon: FolderIcon, color: 'blue' },
];

interface Category {
    id: string;
    name: string;
    count: number;
    icon?: string;
    color?: string;
}

interface CategoryTabsProps {
    categoryFilter: string;
    handleTabChange: (categoryId: string) => void;
    tabCounts: Record<string, number>;
    categories: Category[];
}

// Map icon string to component
const getIconComponent = (iconName?: string) => {
    switch (iconName) {
        case 'file': return FileIcon;
        case 'image': return ImageIcon;
        case 'file-text': return FileTextIcon;
        case 'archive': return ArchiveIcon;
        default: return FolderIcon;
    }
};

export function CategoryTabs({ 
    categoryFilter, 
    handleTabChange, 
    tabCounts,
    categories
}: CategoryTabsProps) {
    if (!categories || categories.length === 0) {
        return null;
    }
    
    const activeTab = categories.some(cat => cat.id === categoryFilter) ? categoryFilter : 'all';
    
    const getTabStyles = (categoryId: string, color: string = 'blue', isActive: boolean) => {
        if (!isActive) {
            return 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800';
        }
        
        switch (color) {
            case 'green':
                return 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800';
            case 'red':
                return 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800';
            case 'yellow':
                return 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800';
            case 'purple':
                return 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800';
            case 'orange':
                return 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800';
            default:
                return 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800';
        }
    };

    const getCountStyles = (color: string = 'blue', isActive: boolean) => {
        if (!isActive) {
            return 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
        }
        
        switch (color) {
            case 'green':
                return 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300';
            case 'red':
                return 'bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300';
            case 'yellow':
                return 'bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-300';
            case 'purple':
                return 'bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300';
            case 'orange':
                return 'bg-orange-100 dark:bg-orange-800 text-orange-700 dark:text-orange-300';
            default:
                return 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300';
        }
    };

    return (
        <div className="overflow-x-auto scrollbar-hide">
            <div className="flex min-w-max space-x-1 pb-2">
                {categories.map((category) => {
                    const IconComponent = getIconComponent(category.icon);
                    const count = tabCounts[category.id] || 0;
                    const isActive = activeTab === category.id;
                    
                    return (
                        <button
                            key={category.id}
                            onClick={() => handleTabChange(category.id)}
                            className={`
                                flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap
                                ${getTabStyles(category.id, category.color, isActive)}
                                min-w-[70px]
                                hover:shadow-sm
                            `}
                        >
                            <IconComponent className="h-3.5 w-3.5 flex-shrink-0" />
                            <span className="hidden sm:inline">{category.name}</span>
                            <span className="sm:hidden">
                                {category.name.length > 8 ? category.name.slice(0, 6) + '..' : category.name}
                            </span>
                            <span className={`
                                px-1.5 py-0.5 rounded-full text-[10px] font-medium min-w-[20px] text-center transition-colors duration-200
                                ${getCountStyles(category.color, isActive)}
                            `}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}