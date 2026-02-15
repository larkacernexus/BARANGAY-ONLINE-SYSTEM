import { useCallback } from 'react';
import { FeeType } from '@/types/fees';

interface UseFeeCalculationsProps {
  data: any;
  setData: (key: string, value: any) => void;
  selectedFeeType: FeeType | null;
  setShowSurcharge: (value: boolean) => void;
  setShowPenalty: (value: boolean) => void;
  setSurchargeExplanation: (value: string) => void;
  setPenaltyExplanation: (value: string) => void;
}

export const useFeeCalculations = ({
  data,
  setData,
  selectedFeeType,
  setShowSurcharge,
  setShowPenalty,
  setSurchargeExplanation,
  setPenaltyExplanation,
}: UseFeeCalculationsProps) => {
  const parseNumber = (value: any): number => {
    if (value === null || value === undefined || value === '' || value === 'null') return 0;
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  const calculateTotalAmount = useCallback(() => {
    const base = parseNumber(data.base_amount);
    const surcharge = parseNumber(data.surcharge_amount);
    const penalty = parseNumber(data.penalty_amount);
    
    let total = base + surcharge + penalty;
    total = Math.max(0, total);

    setData('total_amount', total);
  }, [data.base_amount, data.surcharge_amount, data.penalty_amount, setData]);

  const updateFeeTypeCalculations = useCallback((feeType: FeeType) => {
    setShowSurcharge(feeType.has_surcharge);
    setShowPenalty(feeType.has_penalty);

    if (feeType.surcharge_description) {
      setSurchargeExplanation(feeType.surcharge_description);
    } else if (feeType.has_surcharge && feeType.surcharge_percentage) {
      setSurchargeExplanation(`A surcharge of ${feeType.surcharge_percentage}% may apply.`);
    } else {
      setSurchargeExplanation('');
    }
    
    if (feeType.penalty_description) {
      setPenaltyExplanation(feeType.penalty_description);
    } else if (feeType.has_penalty && feeType.penalty_fixed) {
      setPenaltyExplanation(`Penalties up to ₱${feeType.penalty_fixed}. Leave as ₱0 for new fees.`);
    } else {
      setPenaltyExplanation('');
    }

    if (feeType.has_surcharge && feeType.surcharge_percentage) {
      const surcharge = (feeType.base_amount * feeType.surcharge_percentage) / 100;
      setData('surcharge_amount', surcharge);
    } else {
      setData('surcharge_amount', 0);
    }

    setData('penalty_amount', 0);
  }, [setData, setShowSurcharge, setShowPenalty, setSurchargeExplanation, setPenaltyExplanation]);

  return {
    calculateTotalAmount,
    updateFeeTypeCalculations,
    parseNumber,
  };
};