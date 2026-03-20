import React from 'react';

interface InfoRowProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
  noBorder?: boolean;
}

export const InfoRow = ({ 
  label, 
  value, 
  icon: Icon,
  className = '',
  noBorder = false
}: InfoRowProps) => (
  <div className={`flex flex-col sm:flex-row sm:items-start sm:justify-between py-3 gap-1 sm:gap-2 ${!noBorder ? 'border-b border-border/50' : ''} ${className}`}>
    <div className="flex items-center gap-2 text-muted-foreground">
      {Icon && <Icon className="h-4 w-4 flex-shrink-0" />}
      <span className="text-sm">{label}</span>
    </div>
    <div className="sm:text-right font-medium pl-6 sm:pl-0">
      {typeof value === 'string' || typeof value === 'number' ? (
        <span className="break-words">{value || '—'}</span>
      ) : (
        value
      )}
    </div>
  </div>
);