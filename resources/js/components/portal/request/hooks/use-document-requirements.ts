import { useMemo } from 'react';

export function useDocumentRequirements(selectedClearance: any, selectedDocumentTypes: Set<number>) {
    const hasDocumentRequirements = () => {
        if (!selectedClearance || !selectedClearance.document_types) {
            return false;
        }
        return selectedClearance.document_types.some((doc: any) => doc.is_required);
    };

    const checkDocumentRequirements = () => {
        if (!selectedClearance || !selectedClearance.document_types) {
            return { met: true, missing: [], fulfilled: [], requiredCount: 0, fulfilledCount: 0 };
        }
        
        const requiredDocuments = selectedClearance.document_types.filter((doc: any) => doc.is_required);
        
        if (requiredDocuments.length === 0) {
            return { met: true, missing: [], fulfilled: [], requiredCount: 0, fulfilledCount: 0 };
        }
        
        const fulfilledDocuments = requiredDocuments.filter((doc: any) => 
            selectedDocumentTypes.has(doc.id)
        );
        const missingDocuments = requiredDocuments.filter((doc: any) => 
            !selectedDocumentTypes.has(doc.id)
        ).map((doc: any) => doc.name);
        
        const met = missingDocuments.length === 0 && 
                    fulfilledDocuments.length === requiredDocuments.length;
        
        return {
            met,
            missing: missingDocuments,
            fulfilled: fulfilledDocuments.map((doc: any) => doc.name),
            requiredCount: requiredDocuments.length,
            fulfilledCount: fulfilledDocuments.length
        };
    };

    const requiresDocuments = hasDocumentRequirements();
    const documentRequirements = checkDocumentRequirements();

    return { requiresDocuments, documentRequirements, checkDocumentRequirements };
}