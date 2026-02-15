// app/utils/payment-utils.ts
import type { OutstandingFee, PaymentFormData, PaymentItem } from '@/types/payment-types';
import { getOutstandingFeeBalance, parseAmount, getAmountPaid, getTotalOriginalAmount, getDiscountPercentageForFeeType, calculateMonthsLate } from './payment-helpers';

/**
 * Validate form data before submission
 */
export function validateFormData(data: PaymentFormData): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check items
  if (!data.items || data.items.length === 0) {
    errors.push('Please add at least one payment item');
  }

  // Validate each item's calculations
  data.items?.forEach((item, index) => {
    const calculatedTotal = item.base_amount + item.surcharge + item.penalty - item.discount;
    const diff = Math.abs(calculatedTotal - item.total_amount);

    if (diff > 0.01) {
      errors.push(
        `Item ${index + 1} (${item.fee_name}): ` +
        `Calculated total ₱${calculatedTotal.toFixed(2)} doesn't match item total ₱${item.total_amount.toFixed(2)}`
      );
    }
  });

  // Validate overall totals
  const calculatedTotal = (data.subtotal || 0) + (data.surcharge || 0) + (data.penalty || 0) - (data.discount || 0);
  const totalDiff = Math.abs(calculatedTotal - (data.total_amount || 0));

  if (totalDiff > 0.01) {
    errors.push(`Total amount mismatch: Calculated ₱${calculatedTotal.toFixed(2)} vs Stored ₱${data.total_amount?.toFixed(2)}`);
  }

  // Other validations
  if (!data.payer_id || String(data.payer_id).trim() === '') {
    errors.push('Missing payer information');
  }

  if (!data.payer_name || data.payer_name.trim() === '') {
    errors.push('Missing payer name');
  }

  if (!data.payment_date || data.payment_date.trim() === '') {
    errors.push('Payment date is required');
  }

  if (!data.total_amount || data.total_amount <= 0) {
    errors.push('Total amount must be greater than 0');
  }

  if (!data.purpose || data.purpose.trim() === '') {
    errors.push('Purpose of payment is required');
  }

  if (data.clearance_type_id && !data.clearance_type) {
    errors.push('Clearance type is required for clearance payments');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Prepare submission data with proper formatting
 */
export function prepareSubmissionData(data: PaymentFormData) {
  return {
    ...data,
    clearance_request_id: data.clearance_request_id || null,
    ...(data.clearance_type && {
      clearance_type: data.clearance_type || '',
      clearance_type_id: data.clearance_type_id || '',
      clearance_code: data.clearance_code || '',
      is_cleared: data.is_cleared || false,
      validity_date: data.validity_date || '',
    }),
    items: data.items?.map(item => ({
      ...item,
      item_type: item.metadata?.is_clearance_fee ? 'clearance' : 'fee',
      outstanding_fee_id: item.metadata?.is_outstanding_fee ? item.fee_id : null,
      metadata: item.metadata,
      applied_discount: item.metadata?.appliedDiscount || null
    })) || []
  };
}

/**
 * Handle submission errors with user-friendly messages
 */
export function handleSubmissionError(errors: Record<string, any>): string[] {
  const messages: string[] = [];

  if (errors.discount_type) {
    messages.push(`Discount Error: ${errors.discount_type}. Please select a valid discount type or remove the discount.`);
  } else if (errors.applied_discount) {
    messages.push(`Discount Application Error: ${errors.applied_discount}. The discount could not be applied.`);
  } else if (errors.payer_id) {
    messages.push(`Error: ${errors.payer_id}. Please go back to step 1 and select a payer.`);
  } else if (errors.payer_name) {
    messages.push(`Error: ${errors.payer_name}. Please ensure payer name is valid.`);
  } else if (errors.total_amount) {
    messages.push(`Error: ${errors.total_amount}. Please check the payment amount.`);
  } else if (errors.purpose) {
    messages.push(`Error: ${errors.purpose}. Please enter a valid purpose.`);
  } else if (errors.clearance_type_id) {
    messages.push(`Error: ${errors.clearance_type_id}. Please select a valid clearance type.`);
  } else if (errors.clearance_request_id) {
    messages.push(`Error with clearance request: ${errors.clearance_request_id}`);
  } else if (errors.items) {
    messages.push(`Error with payment items: ${errors.items}. Please add at least one payment item.`);
  } else {
    messages.push('Failed to process payment. Please check all required fields and try again.');
  }

  return messages;
}

/**
 * Create payment item from outstanding fee
 */
export function createPaymentItemFromOutstandingFee(
  outstandingFee: OutstandingFee,
  discountType?: string
): PaymentItem {
  const balanceToPay = getOutstandingFeeBalance(outstandingFee);
  const baseAmount = parseAmount(outstandingFee.base_amount);
  const surchargeAmount = parseAmount(outstandingFee.surcharge_amount || 0);
  const penaltyAmount = parseAmount(outstandingFee.penalty_amount || 0);
  const discountAmount = parseAmount(outstandingFee.discount_amount || 0);
  const amountPaid = getAmountPaid(outstandingFee);
  const totalOriginal = getTotalOriginalAmount(outstandingFee);

  // Calculate additional discount if specified
  let additionalDiscount = 0;
  if (discountType) {
    const discountPercentage = getDiscountPercentageForFeeType(outstandingFee, discountType);
    additionalDiscount = (baseAmount * discountPercentage) / 100;
  }
  const totalDiscount = discountAmount + additionalDiscount;

  // Calculate unpaid portions
  const paidRatio = totalOriginal > 0 ? amountPaid / totalOriginal : 0;
  const unpaidBase = Math.max(0, baseAmount * (1 - paidRatio));
  const unpaidSurcharge = Math.max(0, surchargeAmount * (1 - paidRatio));
  const unpaidPenalty = Math.max(0, penaltyAmount * (1 - paidRatio));
  const unpaidTotalDiscount = Math.max(0, totalDiscount * (1 - paidRatio));

  const item: PaymentItem = {
    id: Date.now(),
    fee_id: outstandingFee.id,
    fee_name: outstandingFee.fee_type_name || outstandingFee.fee_type?.name || 'Fee',
    fee_code: outstandingFee.fee_code,
    description: outstandingFee.purpose || `Payment for ${outstandingFee.fee_type_name || 'Fee'}`,
    base_amount: parseFloat(unpaidBase.toFixed(2)),
    surcharge: parseFloat(unpaidSurcharge.toFixed(2)),
    penalty: parseFloat(unpaidPenalty.toFixed(2)),
    discount: parseFloat(unpaidTotalDiscount.toFixed(2)),
    total_amount: parseFloat((unpaidBase + unpaidSurcharge + unpaidPenalty - unpaidTotalDiscount).toFixed(2)),
    category: outstandingFee.fee_type_category || outstandingFee.fee_type?.category || outstandingFee.category || 'other',
    period_covered: outstandingFee.billing_period || '',
    months_late: calculateMonthsLate(outstandingFee.due_date),
    metadata: {
      is_outstanding_fee: true,
      original_fee_id: outstandingFee.id,
      payer_type: outstandingFee.payer_type,
      payer_id: outstandingFee.payer_id,
      original_fee_data: {
        base_amount: baseAmount,
        surcharge_amount: surchargeAmount,
        penalty_amount: penaltyAmount,
        discount_amount: discountAmount,
        amount_paid: amountPaid,
        balance: balanceToPay,
        total_amount: totalOriginal
      }
    }
  };

  if (discountType) {
    item.description += ` (${discountType.replace('_', ' ')} discount applied)`;
    item.metadata!.appliedDiscount = {
      type: discountType,
      percentage: getDiscountPercentageForFeeType(outstandingFee, discountType),
      amount: additionalDiscount,
      residentId: outstandingFee.payer_id,
      residentName: outstandingFee.payer_name
    };
  }

  return item;
}