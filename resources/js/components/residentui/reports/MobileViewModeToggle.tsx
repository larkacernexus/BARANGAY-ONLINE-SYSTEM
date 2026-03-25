// /components/residentui/reports/MobileViewModeToggle.tsx
import { Button } from '@/components/ui/button';
import { Grid, List, Square } from 'lucide-react';

interface MobileViewModeToggleProps {
    viewMode: 'grid' | 'list';
    setViewMode: (mode: 'grid' | 'list') => void;
    onToggleSelectMode: () => void;
}

export const MobileViewModeToggle = ({
    viewMode,
    setViewMode,
    onToggleSelectMode
}: MobileViewModeToggleProps) => (
    <div className="mb-4">
        <div className="flex gap-2">
            <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="flex-1 rounded-lg"
            >
                <Grid className="h-4 w-4 mr-2" />
                Grid View
            </Button>
            <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="flex-1 rounded-lg"
            >
                <List className="h-4 w-4 mr-2" />
                List View
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={onToggleSelectMode}
                className="flex-1 rounded-lg"
            >
                <Square className="h-4 w-4 mr-2" />
                Select
            </Button>
        </div>
    </div>
);