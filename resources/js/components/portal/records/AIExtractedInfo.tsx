// components/portal/records/AIExtractedInfo.tsx

import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Brain, CheckCircle } from 'lucide-react';
import { ExtractedInfo } from '@/types/portal/records/records';

interface AIExtractedInfoProps {
  extractedInfo: ExtractedInfo;
  onIgnore: () => void;
  onApply: () => void;
}

export function AIExtractedInfo({ extractedInfo, onIgnore, onApply }: AIExtractedInfoProps) {
  return (
    <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
      <div className="flex items-start gap-3">
        <Sparkles className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0" />
        <div className="flex-1">
          <AlertTitle className="text-green-800 dark:text-green-300">
            AI Analysis Complete!
            <Badge variant="outline" className="ml-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700">
              <Brain className="h-3 w-3 mr-1" />
              {Math.round(extractedInfo.confidence * 100)}% Confidence
            </Badge>
          </AlertTitle>
          <AlertDescription className="text-green-700 dark:text-green-400">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              {extractedInfo.documentName && (
                <div className="space-y-1">
                  <div className="font-medium text-sm">Document Name</div>
                  <div className="text-sm">{extractedInfo.documentName}</div>
                </div>
              )}
              {extractedInfo.issueDate && (
                <div className="space-y-1">
                  <div className="font-medium text-sm">Issue Date</div>
                  <div className="text-sm">{extractedInfo.issueDate}</div>
                </div>
              )}
              {extractedInfo.expiryDate && (
                <div className="space-y-1">
                  <div className="font-medium text-sm">Expiry Date</div>
                  <div className="text-sm">{extractedInfo.expiryDate}</div>
                </div>
              )}
              {extractedInfo.referenceNumber && (
                <div className="space-y-1">
                  <div className="font-medium text-sm">Reference Number</div>
                  <div className="text-sm">{extractedInfo.referenceNumber}</div>
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="border-green-300 text-green-700 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900/30"
                onClick={onIgnore}
              >
                Ignore
              </Button>
              <Button
                type="button"
                size="sm"
                variant="default"
                className="bg-green-600 hover:bg-green-700 gap-2 dark:bg-green-700 dark:hover:bg-green-800"
                onClick={onApply}
              >
                <CheckCircle className="h-4 w-4" />
                Apply All Suggestions
              </Button>
            </div>
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
}