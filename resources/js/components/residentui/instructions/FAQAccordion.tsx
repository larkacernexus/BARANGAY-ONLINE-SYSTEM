// /components/residentui/instructions/FAQAccordion.tsx
import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
}

export const FAQAccordion: React.FC<FAQAccordionProps> = ({ items }) => {
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  return (
    <div className="space-y-2 sm:space-y-4">
      {items.map((faq, idx) => (
        <div
          key={idx}
          className="rounded-xl border border-gray-200 bg-white p-3 sm:p-4 dark:border-gray-700 dark:bg-gray-900"
        >
          <button
            onClick={() => toggleSection(`faq-${idx}`)}
            className="flex w-full items-center justify-between text-left gap-2"
          >
            <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white break-words flex-1">
              {faq.question}
            </h3>
            {expandedSections.includes(`faq-${idx}`) ? (
              <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 text-gray-500" />
            ) : (
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 text-gray-500" />
            )}
          </button>
          {expandedSections.includes(`faq-${idx}`) && (
            <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400 break-words">{faq.answer}</p>
          )}
        </div>
      ))}
    </div>
  );
};