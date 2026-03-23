// forms-show/hooks/useFormPreview.ts
import { useState } from 'react';

export const useFormPreview = () => {
    const [zoomLevel, setZoomLevel] = useState(100);
    const [isLoadingPdf, setIsLoadingPdf] = useState(false);
    const [pdfError, setPdfError] = useState<string | null>(null);

    const handlePdfLoad = () => {
        setIsLoadingPdf(false);
        setPdfError(null);
    };

    const handlePdfError = () => {
        setIsLoadingPdf(false);
        setPdfError('Failed to load form preview. Please try downloading the file instead.');
    };

    return {
        zoomLevel,
        setZoomLevel,
        isLoadingPdf,
        pdfError,
        handlePdfLoad,
        handlePdfError,
    };
};