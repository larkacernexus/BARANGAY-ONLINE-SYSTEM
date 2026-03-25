// /components/residentui/instructions/PaymentMethodsGrid.tsx
import React from 'react';
import { CreditCard } from 'lucide-react';

interface PaymentMethodsGridProps {
  methods: string[];
}

export const PaymentMethodsGrid: React.FC<PaymentMethodsGridProps> = ({ methods }) => {
  return (
    <div className="rounded-lg border border-gray-200 p-4 sm:p-6 dark:border-gray-700">
      <h3 className="mb-3 sm:mb-4 text-sm sm:text-lg font-semibold text-gray-900 dark:text-white break-words">Accepted Payment Methods</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {methods.map((method, idx) => (
          <div key={idx} className="rounded-lg bg-gray-50 p-2 sm:p-3 text-center dark:bg-gray-800">
            <CreditCard className="mx-auto mb-1 h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400" />
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 break-words">{method}</p>
          </div>
        ))}
      </div>
    </div>
  );
};