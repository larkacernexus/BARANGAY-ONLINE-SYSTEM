interface QuickAction {
    label: string;
    action: () => void;
}

interface QuickActionsProps {
    actions: QuickAction[];
}

export default function QuickActions({ actions }: QuickActionsProps) {
    return (
        <div className="flex flex-wrap gap-2">
            {actions.map((action, index) => (
                <button
                    key={index}
                    onClick={action.action}
                    className="px-3 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                >
                    {action.label}
                </button>
            ))}
        </div>
    );
}