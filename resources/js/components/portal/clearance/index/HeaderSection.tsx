// /components/residentui/clearances/HeaderSection.tsx
import { MobileHeader } from './MobileHeader';
import { DesktopHeader } from './DesktopHeader';

interface HeaderSectionProps {
    isMobile: boolean;
    statsTotal: number;
    householdNumber?: string;
    headOfFamily?: string;
    showStats: boolean;
    setShowStats: (show: boolean) => void;
    hasActiveFilters: boolean;
    setShowMobileFilters: (show: boolean) => void;
    onPrint: () => void;
    onExport: () => void;
    isExporting: boolean;
}

export const HeaderSection = ({
    isMobile,
    statsTotal,
    householdNumber,
    headOfFamily,
    showStats,
    setShowStats,
    hasActiveFilters,
    setShowMobileFilters,
    onPrint,
    onExport,
    isExporting
}: HeaderSectionProps) => {
    if (isMobile) {
        return (
            <MobileHeader
                statsTotal={statsTotal}
                householdNumber={householdNumber}
                showStats={showStats}
                setShowStats={setShowStats}
                hasActiveFilters={hasActiveFilters}
                setShowMobileFilters={setShowMobileFilters}
            />
        );
    }

    return (
        <DesktopHeader
            householdNumber={householdNumber}
            headOfFamily={headOfFamily}
            onPrint={onPrint}
            onExport={onExport}
            isExporting={isExporting}
        />
    );
};