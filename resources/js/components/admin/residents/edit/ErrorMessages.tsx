// components/residents/edit/ErrorMessages.tsx
interface Props {
    errors: Record<string, string>;
}

export default function ErrorMessages({ errors }: Props) {
    if (Object.keys(errors).length === 0) return null;

    return (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <p className="font-bold">Please fix the following errors:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
                {Object.entries(errors).map(([field, error]) => (
                    <li key={field} className="capitalize">
                        <strong>{field.replace(/_/g, ' ')}:</strong> {error}
                    </li>
                ))}
            </ul>
        </div>
    );
}