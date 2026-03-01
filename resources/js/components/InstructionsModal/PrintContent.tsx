// resources/js/Components/PrintContent.tsx
import React from 'react';
import { Printer } from 'lucide-react';

// Define Section type locally
export interface Section {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
}

interface PrintContentProps {
  sections: Section[];
  selectedSection: string;
  faqItems: { question: string; answer: string }[];
  shortcuts: { key: string; description: string }[];
}

const PrintContent: React.FC<PrintContentProps> = ({ 
  sections, 
  selectedSection, 
  faqItems, 
  shortcuts 
}) => {
  const selectedContent = sections.find(s => s.id === selectedSection) || sections[0];

  // Handle print
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Generate HTML content for printing
    const generatePrintHTML = () => {
      let content = '';

      // Header
      content += `
        <div class="print-header">
          <h1>Barangay Kibawe Management System</h1>
          <div class="subtitle">Complete User Guide</div>
          <div class="header-badge">Version 2.0</div>
        </div>

        <div class="metadata-section">
          <div class="metadata-grid">
            <div class="metadata-item">
              <span class="metadata-label">Generated:</span>
              <span class="metadata-value">${new Date().toLocaleDateString()}</span>
            </div>
            <div class="metadata-item">
              <span class="metadata-label">Time:</span>
              <span class="metadata-value">${new Date().toLocaleTimeString()}</span>
            </div>
            <div class="metadata-item">
              <span class="metadata-label">Document Type:</span>
              <span class="metadata-value">${selectedSection !== 'overview' ? 'Section Guide' : 'Full Guide'}</span>
            </div>
          </div>
        </div>

        <div class="stats-container">
          <h2>System Overview</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">5,234</div>
              <div class="stat-label">Active Residents</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">1,245</div>
              <div class="stat-label">Households</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">156</div>
              <div class="stat-label">Clearances Today</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">₱45.2K</div>
              <div class="stat-label">Today's Collection</div>
            </div>
          </div>
        </div>
      `;

      // Table of Contents
      content += `
        <div class="toc-section">
          <h2>Table of Contents</h2>
          <div class="toc-grid">
      `;
      
      sections.forEach((section, index) => {
        content += `
          <div class="toc-item">
            <span class="toc-number">${(index + 1).toString().padStart(2, '0')}</span>
            <div class="toc-details">
              <div class="toc-title">${section.title}</div>
              <div class="toc-description">${section.description}</div>
            </div>
          </div>
        `;
      });

      content += `
          </div>
        </div>
      `;

      // Main Content
      if (selectedSection !== 'overview' && selectedContent) {
        // Single section
        content += `
          <div class="section">
            <h2>${selectedContent.title}</h2>
            <div class="section-description">${selectedContent.description}</div>
            <div class="section-content">
              ${extractHTMLContent(selectedContent.content)}
            </div>
          </div>
        `;
      } else {
        // All sections
        sections.forEach((section, index) => {
          content += `
            <div class="section">
              <h2>${index + 1}. ${section.title}</h2>
              <div class="section-description">${section.description}</div>
              <div class="section-content">
                ${extractHTMLContent(section.content)}
              </div>
            </div>
          `;

          // Add FAQ section if it's the FAQ section
          if (section.id === 'faq') {
            content += `
              <div class="faq-section">
                <h3>Frequently Asked Questions</h3>
                <div class="faq-grid">
            `;
            
            faqItems.forEach((faq, idx) => {
              content += `
                <div class="faq-item">
                  <div class="faq-question">Q${idx + 1}: ${faq.question}</div>
                  <div class="faq-answer">${faq.answer}</div>
                </div>
              `;
            });

            content += `
                </div>
              </div>
            `;
          }

          // Add keyboard shortcuts section if it's the shortcuts section
          if (section.id === 'shortcuts') {
            content += `
              <div class="shortcuts-section">
                <h3>Keyboard Shortcuts</h3>
                <div class="shortcuts-grid">
            `;
            
            shortcuts.forEach(shortcut => {
              content += `
                <div class="shortcut-item">
                  <span class="shortcut-key">${shortcut.key}</span>
                  <span class="shortcut-description">${shortcut.description}</span>
                </div>
              `;
            });

            content += `
                </div>
              </div>
            `;
          }
        });
      }

      // Quick Tips
      content += `
        <div class="tips-section">
          <h2>Quick Tips & Best Practices</h2>
          <div class="tips-grid">
            <div class="tip-item">✓ Use keyboard shortcuts to speed up common tasks</div>
            <div class="tip-item">✓ Regular data backup ensures information safety</div>
            <div class="tip-item">✓ Verify resident information before issuing clearances</div>
            <div class="tip-item">✓ Daily reconciliation of collections is recommended</div>
            <div class="tip-item">✓ Review audit logs periodically for security</div>
          </div>
        </div>

        <div class="footer">
          <div class="footer-content">
            <div class="footer-copyright">
              © ${new Date().getFullYear()} Barangay Kibawe. All rights reserved.
            </div>
            <div class="footer-doc-id">
              Document ID: ${Math.random().toString(36).substring(2, 15).toUpperCase()}
            </div>
          </div>
        </div>
      `;

      return content;
    };

    // Helper to extract HTML content from React nodes (simplified version)
    const extractHTMLContent = (content: React.ReactNode): string => {
      if (typeof content === 'string') return content;
      if (typeof content === 'number') return content.toString();
      if (Array.isArray(content)) return content.map(extractHTMLContent).join('');
      if (React.isValidElement(content)) {
        const props = content.props as any;
        if (props.children) return extractHTMLContent(props.children);
        return '';
      }
      return '';
    };

    // Full HTML document
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Barangay Management System - User Guide</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }

            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6; 
              color: #333;
              background: #fff;
              max-width: 1200px;
              margin: 0 auto;
              padding: 40px 20px;
            }

            /* Header Styles */
            .print-header {
              text-align: center;
              margin-bottom: 40px;
              padding-bottom: 20px;
              border-bottom: 3px solid #2563eb;
            }

            .print-header h1 {
              font-size: 42px;
              color: #1e3a8a;
              margin-bottom: 10px;
              font-weight: 700;
            }

            .print-header .subtitle {
              font-size: 18px;
              color: #4b5563;
              margin-bottom: 10px;
            }

            .print-header .header-badge {
              display: inline-block;
              padding: 6px 12px;
              background: #2563eb;
              color: white;
              border-radius: 20px;
              font-size: 14px;
              font-weight: 600;
            }

            /* Metadata Styles */
            .metadata-section {
              background: #f3f4f6;
              border-radius: 12px;
              padding: 20px;
              margin-bottom: 30px;
            }

            .metadata-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 20px;
            }

            .metadata-item {
              display: flex;
              flex-direction: column;
            }

            .metadata-label {
              font-size: 12px;
              color: #6b7280;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }

            .metadata-value {
              font-size: 16px;
              font-weight: 600;
              color: #1e3a8a;
              margin-top: 4px;
            }

            /* Stats Styles */
            .stats-container {
              margin-bottom: 40px;
            }

            .stats-container h2 {
              font-size: 24px;
              color: #1e3a8a;
              margin-bottom: 20px;
              padding-bottom: 10px;
              border-bottom: 2px solid #e5e7eb;
            }

            .stats-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 20px;
            }

            .stat-card {
              background: linear-gradient(135deg, #f9fafb, #f3f4f6);
              border-radius: 16px;
              padding: 25px 20px;
              text-align: center;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }

            .stat-value {
              font-size: 36px;
              font-weight: 700;
              color: #1e3a8a;
              margin-bottom: 8px;
            }

            .stat-label {
              font-size: 14px;
              color: #6b7280;
              font-weight: 500;
            }

            /* TOC Styles */
            .toc-section {
              margin-bottom: 40px;
              page-break-after: avoid;
            }

            .toc-section h2 {
              font-size: 24px;
              color: #1e3a8a;
              margin-bottom: 20px;
              padding-bottom: 10px;
              border-bottom: 2px solid #e5e7eb;
            }

            .toc-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 15px;
            }

            .toc-item {
              display: flex;
              align-items: center;
              gap: 15px;
              padding: 12px;
              background: #f9fafb;
              border-radius: 10px;
            }

            .toc-number {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 40px;
              height: 40px;
              background: #2563eb;
              color: white;
              border-radius: 8px;
              font-weight: 600;
            }

            .toc-details {
              flex: 1;
            }

            .toc-title {
              font-weight: 600;
              color: #1e3a8a;
              margin-bottom: 4px;
            }

            .toc-description {
              font-size: 12px;
              color: #6b7280;
            }

            /* Section Styles */
            .section {
              margin-bottom: 40px;
              page-break-inside: avoid;
            }

            .section h2 {
              font-size: 28px;
              color: #1e3a8a;
              margin-bottom: 15px;
              padding-bottom: 10px;
              border-bottom: 2px solid #2563eb;
            }

            .section h3 {
              font-size: 20px;
              color: #374151;
              margin: 20px 0 10px;
            }

            .section-description {
              font-size: 16px;
              color: #6b7280;
              margin-bottom: 20px;
              font-style: italic;
            }

            .section-content {
              color: #374151;
            }

            .section-content ul, 
            .section-content ol {
              margin: 15px 0;
              padding-left: 25px;
            }

            .section-content li {
              margin-bottom: 8px;
            }

            .section-content .badge {
              display: inline-block;
              padding: 4px 10px;
              background: #f3f4f6;
              border-radius: 15px;
              font-size: 12px;
              color: #4b5563;
            }

            .section-content .alert {
              padding: 15px;
              margin: 20px 0;
              border-radius: 8px;
              background: #fef3c7;
              border-left: 4px solid #f59e0b;
            }

            .section-content .tip {
              padding: 15px;
              margin: 20px 0;
              border-radius: 8px;
              background: #dbeafe;
              border-left: 4px solid #3b82f6;
            }

            /* FAQ Styles */
            .faq-section {
              margin: 30px 0;
            }

            .faq-section h3 {
              font-size: 20px;
              color: #1e3a8a;
              margin-bottom: 20px;
            }

            .faq-grid {
              display: grid;
              gap: 20px;
            }

            .faq-item {
              background: #f9fafb;
              padding: 20px;
              border-radius: 10px;
              border: 1px solid #e5e7eb;
            }

            .faq-question {
              font-weight: 600;
              color: #1e3a8a;
              margin-bottom: 10px;
              font-size: 16px;
            }

            .faq-answer {
              color: #4b5563;
              font-size: 14px;
            }

            /* Shortcuts Styles */
            .shortcuts-section {
              margin: 30px 0;
            }

            .shortcuts-section h3 {
              font-size: 20px;
              color: #1e3a8a;
              margin-bottom: 20px;
            }

            .shortcuts-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 15px;
            }

            .shortcut-item {
              display: flex;
              align-items: center;
              gap: 15px;
              padding: 12px;
              background: #f9fafb;
              border-radius: 8px;
              border: 1px solid #e5e7eb;
            }

            .shortcut-key {
              font-family: 'Courier New', monospace;
              font-weight: 600;
              color: #2563eb;
              background: #dbeafe;
              padding: 4px 10px;
              border-radius: 6px;
              font-size: 14px;
              min-width: 100px;
              text-align: center;
            }

            .shortcut-description {
              color: #4b5563;
              font-size: 14px;
            }

            /* Tips Section */
            .tips-section {
              margin: 50px 0;
              page-break-inside: avoid;
            }

            .tips-section h2 {
              font-size: 24px;
              color: #1e3a8a;
              margin-bottom: 20px;
              padding-bottom: 10px;
              border-bottom: 2px solid #e5e7eb;
            }

            .tips-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 15px;
            }

            .tip-item {
              padding: 15px;
              background: #f0fdf4;
              border: 1px solid #86efac;
              border-radius: 8px;
              color: #166534;
              font-size: 14px;
            }

            /* Footer Styles */
            .footer {
              margin-top: 60px;
              padding: 30px 0;
              border-top: 2px solid #e5e7eb;
              text-align: center;
            }

            .footer-content {
              display: flex;
              justify-content: space-between;
              align-items: center;
              color: #6b7280;
              font-size: 12px;
            }

            .footer-doc-id {
              font-family: monospace;
              background: #f3f4f6;
              padding: 4px 8px;
              border-radius: 4px;
            }

            /* Table Styles */
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }

            th, td {
              border: 1px solid #e5e7eb;
              padding: 12px;
              text-align: left;
            }

            th {
              background: #f3f4f6;
              font-weight: 600;
              color: #374151;
            }

            tr:nth-child(even) {
              background: #f9fafb;
            }

            /* Print-specific styles */
            @media print {
              body {
                padding: 0.5in;
              }

              .no-print {
                display: none !important;
              }

              a {
                text-decoration: none;
                color: #000;
              }

              h1, h2, h3 {
                page-break-after: avoid;
              }

              .section {
                page-break-inside: avoid;
              }

              table, figure {
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="text-align: right; margin-bottom: 20px; position: sticky; top: 20px; z-index: 100;">
            <button onclick="window.print()" style="padding: 12px 24px; background: #2563eb; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; margin-right: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              🖨️ Print This Document
            </button>
            <button onclick="window.close()" style="padding: 12px 24px; background: #6b7280; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              ✕ Close
            </button>
          </div>

          ${generatePrintHTML()}
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  return (
    <button
      onClick={handlePrint}
      className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
    >
      <Printer className="h-4 w-4" />
      Print Guide
    </button>
  );
};

export default PrintContent;