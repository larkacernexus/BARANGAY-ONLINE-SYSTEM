// components/ui/mobile-fab.tsx
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface MobileFABProps {
    onClick?: () => void;
    href?: string;
    icon?: React.ReactNode;
    label?: string;
    className?: string;
}

export function MobileFAB({
    onClick,
    href,
    icon = <Plus className="h-6 w-6" />,
    label,
    className = ''
}: MobileFABProps) {
    const content = (
        <Button 
            size="lg" 
            className={`rounded-full h-14 w-14 shadow-lg shadow-primary/20 ${className}`}
        >
            {icon}
            {label && <span className="sr-only">{label}</span>}
        </Button>
    );

    if (href) {
        return (
            <a href={href} className="fixed bottom-24 right-6 z-50 safe-bottom">
                {content}
            </a>
        );
    }

    return (
        <div className="fixed bottom-24 right-6 z-50 safe-bottom" onClick={onClick}>
            {content}
        </div>
    );
}