// services/AdvancedDocumentAIService.ts

import { DocumentType, ExtractedInfo } from '@/types/records';

export class AdvancedDocumentAIService {
  private documentPatterns: Record<string, RegExp[]> = {
    passport: [/passport/i, /international.*passport/i, /travel.*document/i],
    id_card: [/id.*card/i, /national.*id/i, /identification/i],
    license: [/driver.*license/i, /driving.*license/i, /permit/i],
    certificate: [/certificate/i, /certification/i, /diploma/i, /degree/i],
    bill: [/bill/i, /invoice/i, /receipt/i, /payment/i],
    contract: [/contract/i, /agreement/i, /lease/i, /deed/i],
    medical: [/medical/i, /health/i, /prescription/i, /vaccination/i],
    tax: [/tax/i, /irs/i, /return/i, /w-2/i, /1099/i],
    bank: [/bank/i, /statement/i, /transaction/i, /account/i],
  };

  async extractDocumentInfo(file: File, documentType?: DocumentType): Promise<ExtractedInfo> {
    const extractedInfo: ExtractedInfo = {
      confidence: 0,
      metadata: {},
      suggestedTags: [],
    };

    const filename = file.name;
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
    
    // Detect document type
    const detectedType = this.detectDocumentType(filename);
    if (detectedType) {
      extractedInfo.detectedType = detectedType;
      extractedInfo.confidence += 0.2;
    }

    // Extract document name
    extractedInfo.documentName = this.extractDocumentName(nameWithoutExt, documentType?.name || detectedType);
    if (extractedInfo.documentName) extractedInfo.confidence += 0.3;

    // Extract dates
    const dates = this.extractDates(filename);
    if (dates.issueDate) {
      extractedInfo.issueDate = dates.issueDate;
      extractedInfo.confidence += 0.15;
    }
    if (dates.expiryDate) {
      extractedInfo.expiryDate = dates.expiryDate;
      extractedInfo.confidence += 0.15;
    }

    // Extract reference numbers
    const refNumbers = this.extractReferenceNumbers(filename);
    if (refNumbers.length > 0) {
      extractedInfo.referenceNumber = refNumbers[0];
      extractedInfo.confidence += 0.15;
    }

    // Generate description
    extractedInfo.description = this.generateDescription(filename, documentType, detectedType);
    extractedInfo.confidence += 0.1;

    // Suggest tags
    const suggestions = this.suggestCategoryAndTags(filename, documentType);
    if (suggestions.category) {
      extractedInfo.suggestedCategory = suggestions.category;
      extractedInfo.confidence += 0.05;
    }
    if (suggestions.tags.length > 0) {
      extractedInfo.suggestedTags = suggestions.tags;
      extractedInfo.confidence += 0.05;
    }

    // Extract metadata
    extractedInfo.metadata = this.extractMetadata(filename);
    extractedInfo.confidence = Math.min(extractedInfo.confidence, 1.0);

    return extractedInfo;
  }

  private detectDocumentType(filename: string): string | null {
    const lowerFilename = filename.toLowerCase();
    
    for (const [type, patterns] of Object.entries(this.documentPatterns)) {
      for (const pattern of patterns) {
        if (pattern.test(lowerFilename)) {
          return type.replace('_', ' ').toUpperCase();
        }
      }
    }
    
    if (lowerFilename.includes('passport')) return 'PASSPORT';
    if (lowerFilename.includes('id') && lowerFilename.includes('card')) return 'ID CARD';
    if (lowerFilename.includes('driver') || lowerFilename.includes('license')) return 'DRIVER LICENSE';
    if (lowerFilename.includes('birth') && lowerFilename.includes('certificate')) return 'BIRTH CERTIFICATE';
    if (lowerFilename.includes('tax') || lowerFilename.includes('w2') || lowerFilename.includes('1099')) return 'TAX DOCUMENT';
    if (lowerFilename.includes('bank') || lowerFilename.includes('statement')) return 'BANK STATEMENT';
    if (lowerFilename.includes('medical') || lowerFilename.includes('health')) return 'MEDICAL RECORD';
    if (lowerFilename.includes('contract') || lowerFilename.includes('agreement')) return 'CONTRACT';
    
    return null;
  }

  private extractDocumentName(filename: string, documentType?: string): string {
    let cleanName = filename
      .replace(/[_-]/g, ' ')
      .replace(/\d{4}[-_]\d{2}[-_]\d{2}/g, '')
      .replace(/\b\d{4}\b/g, '')
      .replace(/\.(pdf|jpg|jpeg|png|gif|doc|docx|xls|xlsx|ppt|pptx|txt|rtf)$/i, '')
      .trim();

    const commonTerms = [
      'scan', 'copy', 'photo', 'image', 'picture', 'document', 'file',
      'final', 'draft', 'version', 'revised', 'updated', 'signed'
    ];
    
    commonTerms.forEach(term => {
      cleanName = cleanName.replace(new RegExp(`\\b${term}\\b`, 'gi'), '').trim();
    });

    const parts = cleanName.split(/\s+/).filter(part => part.length > 2);
    if (parts.length > 0) {
      return parts.map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
    }

    return documentType || 'Document';
  }

  private extractDates(filename: string): { issueDate?: string; expiryDate?: string } {
    const datePatterns = [
      /\b(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})\b/g,
      /\b(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})\b/g,
    ];

    const dates: string[] = [];
    
    datePatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(filename)) !== null) {
        try {
          let dateStr = this.parseDateMatch(match);
          if (dateStr) {
            dates.push(dateStr);
          }
        } catch (e) {
          // Skip invalid dates
        }
      }
    });

    dates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    
    const result: { issueDate?: string; expiryDate?: string } = {};
    if (dates.length >= 1) {
      result.issueDate = dates[0];
    }
    if (dates.length >= 2) {
      result.expiryDate = dates[dates.length - 1];
    }
    
    return result;
  }

  private parseDateMatch(match: RegExpExecArray): string | null {
    try {
      if (match[1].length === 4) {
        const year = match[1];
        const month = match[2].padStart(2, '0');
        const day = match[3].padStart(2, '0');
        return `${year}-${month}-${day}`;
      } else {
        const day = match[1].padStart(2, '0');
        const month = match[2].padStart(2, '0');
        let year = match[3];
        if (year.length === 2) {
          year = `20${year}`;
        }
        return `${year}-${month}-${day}`;
      }
    } catch (e) {
      return null;
    }
  }

  private extractReferenceNumbers(filename: string): string[] {
    const patterns = [
      /[A-Z]{2,4}[-_]\d{4}[-_]\d{3,5}/gi,
      /\b\d{4}[-_]\d{4}[-_]\d{4}\b/g,
      /\b[A-Z0-9]{8,12}\b/g,
    ];

    const results: string[] = [];
    
    patterns.forEach(pattern => {
      const matches = filename.match(pattern);
      if (matches) {
        matches.forEach(match => {
          if (match.length >= 5) {
            results.push(match);
          }
        });
      }
    });

    return [...new Set(results)];
  }

  private generateDescription(filename: string, documentType?: DocumentType, detectedType?: string): string {
    const typeName = documentType?.name || detectedType || 'document';
    const now = new Date();
    
    const formattedDate = now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return `${typeName} uploaded on ${formattedDate}. Original filename: ${filename}`;
  }

  private suggestCategoryAndTags(filename: string, documentType?: DocumentType): { category?: string; tags: string[] } {
    const tags: string[] = [];
    let category: string | undefined;
    
    const lowerFilename = filename.toLowerCase();
    
    if (lowerFilename.includes('passport') || lowerFilename.includes('visa')) {
      category = 'Travel';
      tags.push('travel', 'identification', 'international');
    } else if (lowerFilename.includes('license') || lowerFilename.includes('permit')) {
      category = 'Legal';
      tags.push('driving', 'government', 'identification');
    } else if (lowerFilename.includes('certificate') || lowerFilename.includes('diploma')) {
      category = 'Education';
      tags.push('education', 'achievement', 'certification');
    } else if (lowerFilename.includes('medical') || lowerFilename.includes('health')) {
      category = 'Medical';
      tags.push('health', 'insurance', 'records');
    } else if (lowerFilename.includes('tax') || lowerFilename.includes('irs')) {
      category = 'Financial';
      tags.push('taxes', 'finance', 'government');
    } else if (lowerFilename.includes('bank') || lowerFilename.includes('statement')) {
      category = 'Financial';
      tags.push('banking', 'finance', 'statements');
    } else if (lowerFilename.includes('contract') || lowerFilename.includes('agreement')) {
      category = 'Legal';
      tags.push('legal', 'contract', 'agreement');
    } else if (lowerFilename.includes('bill') || lowerFilename.includes('invoice')) {
      category = 'Financial';
      tags.push('bills', 'payments', 'utilities');
    }
    
    if (documentType?.tags) {
      tags.push(...documentType.tags);
    }
    
    if (filename.match(/\.(pdf)$/i)) tags.push('pdf');
    if (filename.match(/\.(jpg|jpeg|png|gif)$/i)) tags.push('image');
    if (filename.match(/\.(doc|docx)$/i)) tags.push('word', 'document');
    if (filename.match(/\.(xls|xlsx)$/i)) tags.push('excel', 'spreadsheet');
    
    return {
      category,
      tags: [...new Set(tags)],
    };
  }

  private extractMetadata(filename: string): Record<string, any> {
    return {
      originalFilename: filename,
      fileExtension: filename.split('.').pop()?.toLowerCase() || '',
      containsDates: /\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}/.test(filename),
      containsNumbers: /\d/.test(filename),
      wordCount: filename.split(/[_\-\s]+/).length,
    };
  }
}