import { RefObject } from 'react';
import { toast } from 'sonner';
import { ClearanceRequest } from '@/types/admin/clearances/clearance-types';

export function usePrintClearance(printRef: RefObject<HTMLDivElement | null>) { // Allow null
    const handlePrintClearance = (clearance: ClearanceRequest, onComplete?: () => void) => {
        if (!printRef.current) {
            toast.error('Print content not found');
            return;
        }

        setTimeout(() => {
            try {
                const printContent = printRef.current;
                
                if (!printContent) {
                    toast.error('Print content not found');
                    return;
                }

                const iframe = document.createElement('iframe');
                iframe.style.position = 'absolute';
                iframe.style.width = '0';
                iframe.style.height = '0';
                iframe.style.border = 'none';
                document.body.appendChild(iframe);

                const iframeWindow = iframe.contentWindow;
                if (!iframeWindow) {
                    toast.error('Failed to create print window');
                    document.body.removeChild(iframe);
                    return;
                }

                const iframeDoc = iframeWindow.document;
                
                // Get all styles from the main document
                const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
                
                // Write the content to the iframe
                iframeDoc.open();
                iframeDoc.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Clearance-${clearance.reference_number}</title>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <style>
                            @media print {
                                body { 
                                    margin: 0.5in;
                                    padding: 0;
                                    background: white;
                                }
                                .no-print {
                                    display: none !important;
                                }
                            }
                            body { 
                                font-family: serif; 
                                margin: 0; 
                                padding: 20px;
                                background: white;
                            }
                        </style>
                    </head>
                    <body>
                        ${printContent.outerHTML}
                    </body>
                    </html>
                `);
                
                // Copy styles to iframe head
                styles.forEach(style => {
                    if (style.tagName === 'STYLE') {
                        iframeDoc.head.appendChild(style.cloneNode(true));
                    } else if (style.tagName === 'LINK') {
                        const linkElement = style as HTMLLinkElement;
                        if (linkElement.rel === 'stylesheet' && linkElement.href) {
                            const link = iframeDoc.createElement('link');
                            link.rel = 'stylesheet';
                            link.href = linkElement.href;
                            iframeDoc.head.appendChild(link);
                        }
                    }
                });
                
                iframeDoc.close();

                setTimeout(() => {
                    try {
                        if (iframeWindow) {
                            iframeWindow.focus();
                            iframeWindow.print();
                            
                            iframeWindow.onafterprint = () => {
                                document.body.removeChild(iframe);
                                if (onComplete) onComplete();
                            };
                        } else {
                            toast.error('Print window not available');
                            document.body.removeChild(iframe);
                        }
                    } catch (printError) {
                        console.error('Print error:', printError);
                        toast.error('Print failed. Please try again.');
                        document.body.removeChild(iframe);
                    }
                }, 800);
            } catch (error) {
                console.error('Print setup error:', error);
                toast.error('Failed to prepare print. Please try again.');
            }
        }, 300);
    };

    return { handlePrintClearance };
}