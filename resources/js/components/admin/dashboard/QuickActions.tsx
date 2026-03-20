// components/admin/dashboard/QuickActions.tsx
import { Link } from '@inertiajs/react';
import { QuickAction } from '@/components/admin/dashboard/types/dashboard';

interface QuickActionsProps {
    actions: QuickAction[];
}

export function QuickActions({ actions }: QuickActionsProps) {
    return (
        <div className="rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-gray-900">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {actions.map((action) => {
                    const Icon = action.icon;
                    return (
                        <Link
                            key={action.label}
                            href={action.href}
                            className="group flex flex-col items-center gap-2 rounded-lg p-3 text-center transition-all hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            <div className="rounded-lg bg-blue-50 p-3 text-blue-600 transition-colors group-hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:group-hover:bg-blue-900/30">
                                <Icon className="h-5 w-5" />
                            </div>
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                {action.label}
                            </span>
                            {action.badge && (
                                <span className="mt-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                                    {action.badge}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}