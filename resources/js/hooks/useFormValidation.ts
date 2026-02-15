import { useMemo } from 'react';
import { FeeType } from '@/types/fees';

interface UseFormValidationProps {
  data: any;
  selectedFeeType: FeeType | null;
  totalPayersCount: number;
}

export const useFormValidation = ({
  data,
  selectedFeeType,
  totalPayersCount,
}: UseFormValidationProps) => {
  const getSupportedDiscounts = useMemo(() => {
    if (!selectedFeeType) return [];
    
    const supported = [];
    if (selectedFeeType.has_senior_discount) {
      supported.push({
        type: 'Senior Citizen',
        percentage: selectedFeeType.discount_percentage || 20,
        description: 'RA 9994'
      });
    }
    if (selectedFeeType.has_pwd_discount) {
      supported.push({
        type: 'PWD',
        percentage: selectedFeeType.discount_percentage || 20,
        description: 'RA 10754'
      });
    }
    if (selectedFeeType.has_solo_parent_discount) {
      supported.push({
        type: 'Solo Parent',
        percentage: selectedFeeType.discount_percentage || 10,
        description: 'RA 8972'
      });
    }
    if (selectedFeeType.has_indigent_discount) {
      supported.push({
        type: 'Indigent',
        percentage: selectedFeeType.discount_percentage || 0,
        description: 'Local Ordinance'
      });
    }
    
    return supported;
  }, [selectedFeeType]);

  const validateForm = () => {
    const errors: string[] = [];

    // Basic validations
    if (!data.fee_type_id) {
      errors.push('Please select a fee type');
    }

    if (data.bulk_type === 'none') {
      // Single payer validation
      if (!data.payer_type || data.payer_type === 'none') {
        errors.push('Please select a payer type');
      }
      
      if (data.payer_type === 'resident' && !data.resident_id) {
        errors.push('Please select a resident');
      }
      
      if (data.payer_type === 'household' && !data.household_id) {
        errors.push('Please select a household');
      }
      
      if (data.payer_type === 'business' && !data.business_name) {
        errors.push('Please enter business name');
      }
      
      if ((data.payer_type === 'visitor' || data.payer_type === 'other') && !data.payer_name) {
        errors.push('Please enter payer name');
      }
    } else {
      // Bulk mode validation
      if (totalPayersCount === 0) {
        errors.push('Please select at least one payer');
      }
      
      if (data.bulk_type === 'custom') {
        const invalidPayers = data.custom_payers.filter((p: any) => !p.name.trim());
        if (invalidPayers.length > 0) {
          errors.push('Please enter names for all custom payers');
        }
      }
    }

    // Amount validations
    if (data.total_amount <= 0) {
      errors.push('Total amount must be greater than 0');
    }

    // Date validations
    if (!data.issue_date) {
      errors.push('Issue date is required');
    }

    if (!data.due_date) {
      errors.push('Due date is required');
    }

    if (data.due_date && data.issue_date && new Date(data.due_date) < new Date(data.issue_date)) {
      errors.push('Due date must be after issue date');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  };

  return {
    validateForm,
    getSupportedDiscounts,
  };
};