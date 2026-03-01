// hooks/useRecordsAIFeatures.ts

import { useState } from 'react';

interface AIFeaturesProps {
  ocr_enabled: boolean;
  auto_categorization: boolean;
  metadata_extraction: boolean;
  duplicate_detection: boolean;
}

export const useRecordsAIFeatures = (initialFeatures: AIFeaturesProps) => {
  const [ocrEnabled, setOcrEnabled] = useState(initialFeatures.ocr_enabled);
  const [validationEnabled, setValidationEnabled] = useState(true);
  const [enableDuplicateCheck, setEnableDuplicateCheck] = useState(initialFeatures.duplicate_detection);
  const [enableAutoCategorization, setEnableAutoCategorization] = useState(initialFeatures.auto_categorization);

  const handleToggleAllAIFeatures = (enabled: boolean) => {
    setOcrEnabled(enabled);
    setValidationEnabled(enabled);
    setEnableDuplicateCheck(enabled);
    setEnableAutoCategorization(enabled);
  };

  return {
    ocrEnabled,
    setOcrEnabled,
    validationEnabled,
    setValidationEnabled,
    enableDuplicateCheck,
    setEnableDuplicateCheck,
    enableAutoCategorization,
    setEnableAutoCategorization,
    handleToggleAllAIFeatures,
  };
};