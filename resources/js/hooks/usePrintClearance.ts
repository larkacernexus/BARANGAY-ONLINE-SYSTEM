import { RefObject } from 'react';
import { toast } from 'sonner';

export function usePrintClearance(printRef: RefObject<HTMLDivElement>) {
    const handlePrintClearance = (clearance: any, onComplete?: () => void) => {
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

                // Create an iframe for printing
                const iframe = document.createElement('iframe');
                iframe.style.position = 'absolute';
                iframe.style.width = '0';
                iframe.style.height = '0';
                iframe.style.border = 'none';
                document.body.appendChild(iframe);

                const iframeDoc = iframe.contentWindow.document;
                
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
                            /* Print-specific styles */
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
                    } else if (style.tagName === 'LINK' && style.rel === 'stylesheet') {
                        const link = iframeDoc.createElement('link');
                        link.rel = 'stylesheet';
                        link.href = style.href;
                        iframeDoc.head.appendChild(link);
                    }
                });
                
                iframeDoc.close();

                // Wait for everything to load
                setTimeout(() => {
                    try {
                        iframe.contentWindow.focus();
                        iframe.contentWindow.print();
                        
                        // Remove iframe after printing
                        iframe.contentWindow.onafterprint = () => {
                            document.body.removeChild(iframe);
                            if (onComplete) onComplete();
                        };
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