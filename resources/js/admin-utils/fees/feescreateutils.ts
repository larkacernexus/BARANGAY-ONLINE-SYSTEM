import { DiscountType, FeeType, parseNumber, Resident } from '@/types/fees';

// Helper function to format currency
export const formatCurrency = (amount: any): string => {
    const num = parseNumber(amount);
    return `₱${num.toFixed(2)}`;
};

// Philippine Legal Discount Rules
export const PHILIPPINE_DISCOUNT_LAWS = {
    SENIOR: {
        code: 'RA 9994',
        name: 'Expanded Senior Citizens Act of 2010',
        maxPercentage: 20,
        description: 'For senior citizens aged 60 and above',
        requirements: ['Valid Senior Citizen ID', 'Age 60+'],
    },
    PWD: {
        code: 'RA 10754',
        name: 'Expanded PWD Benefits Act',
        maxPercentage: 20,
        description: 'For Persons With Disabilities',
        requirements: ['Valid PWD ID'],
    },
    SOLO_PARENT: {
        code: 'RA 8972',
        name: 'Solo Parents Welfare Act of 2000',
        maxPercentage: 10,
        description: 'For solo parents',
        requirements: ['Valid Solo Parent ID'],
    },
    INDIGENT: {
        code: 'RA 8425',
        name: 'Social Reform and Poverty Alleviation Act',
        maxPercentage: 20,
        description: 'For indigent families',
        requirements: ['Certificate of Indigency'],
    },
};

// PHILIPPINE LAW: Check if discount is legally valid based on Philippine rules
export const isDiscountLegallyValid = (
    discount: DiscountType,
    resident?: Resident | null,
    issueDate?: string,
): { valid: boolean; reason?: string; warning?: string } => {
    if (!discount.ph_law_applicable) {
        return { valid: true };
    }

    const today = issueDate ? new Date(issueDate) : new Date();

    switch (discount.code) {
        case 'SENIOR':
            if (!resident?.is_senior) {
                return {
                    valid: false,
                    reason: 'Resident is not registered as a senior citizen',
                };
            }
            if (
                resident.senior_id_number &&
                resident.senior_id_number.trim() === ''
            ) {
                return {
                    valid: false,
                    reason: 'No valid Senior Citizen ID number provided',
                };
            }
            if (resident.senior_discount_valid_until) {
                const validUntil = new Date(
                    resident.senior_discount_valid_until,
                );
                if (today > validUntil) {
                    return {
                        valid: false,
                        reason: `Senior Citizen discount validity expired on ${validUntil.toLocaleDateString()}`,
                    };
                }
            }
            // Senior discount is 20% by law (RA 9994)
            if (discount.default_percentage > 20) {
                return {
                    valid: true,
                    warning:
                        'Philippine Law (RA 9994) caps senior discount at 20%. Adjusting to legal limit.',
                };
            }
            break;

        case 'PWD':
            if (!resident?.is_pwd) {
                return {
                    valid: false,
                    reason: 'Resident is not registered as PWD',
                };
            }
            if (
                resident.pwd_id_number &&
                resident.pwd_id_number.trim() === ''
            ) {
                return {
                    valid: false,
                    reason: 'No valid PWD ID number provided',
                };
            }
            if (resident.pwd_discount_valid_until) {
                const validUntil = new Date(resident.pwd_discount_valid_until);
                if (today > validUntil) {
                    return {
                        valid: false,
                        reason: `PWD discount validity expired on ${validUntil.toLocaleDateString()}`,
                    };
                }
            }
            // PWD discount is 20% by law (RA 10754)
            if (discount.default_percentage > 20) {
                return {
                    valid: true,
                    warning:
                        'Philippine Law (RA 10754) caps PWD discount at 20%. Adjusting to legal limit.',
                };
            }
            break;

        case 'SOLO_PARENT':
            if (!resident?.is_solo_parent) {
                return {
                    valid: false,
                    reason: 'Resident is not registered as solo parent',
                };
            }
            if (
                resident.solo_parent_id_number &&
                resident.solo_parent_id_number.trim() === ''
            ) {
                return {
                    valid: false,
                    reason: 'No valid Solo Parent ID number provided',
                };
            }
            if (resident.solo_parent_discount_valid_until) {
                const validUntil = new Date(
                    resident.solo_parent_discount_valid_until,
                );
                if (today > validUntil) {
                    return {
                        valid: false,
                        reason: `Solo Parent discount validity expired on ${validUntil.toLocaleDateString()}`,
                    };
                }
            }
            // Solo Parent discount is typically 10% but varies
            if (
                discount.ph_max_percentage &&
                discount.default_percentage > discount.ph_max_percentage
            ) {
                return {
                    valid: true,
                    warning: `Solo Parent discount exceeds legal maximum of ${discount.ph_max_percentage}%`,
                };
            }
            break;

        case 'INDIGENT':
            if (!resident?.is_indigent) {
                return {
                    valid: false,
                    reason: 'Resident is not registered as indigent',
                };
            }
            if (
                resident.indigent_id_number &&
                resident.indigent_id_number.trim() === ''
            ) {
                return {
                    valid: false,
                    reason: 'No valid Certificate of Indigency number provided',
                };
            }
            if (resident.indigent_discount_valid_until) {
                const validUntil = new Date(
                    resident.indigent_discount_valid_until,
                );
                if (today > validUntil) {
                    return {
                        valid: false,
                        reason: `Indigent discount validity expired on ${validUntil.toLocaleDateString()}`,
                    };
                }
            }
            break;
    }

    return { valid: true };
};

// Get active discount types for a fee type with Philippine legal considerations
export const getActiveDiscountsForFeeType = (
    feeType: FeeType | null,
): DiscountType[] => {
    if (!feeType) return [];

    const activeDiscounts: DiscountType[] = [];

    // Check new discount_fee_types relationship
    if (feeType.discount_fee_types && feeType.discount_fee_types.length > 0) {
        feeType.discount_fee_types.forEach((dft) => {
            if (dft.is_active && dft.discount_type) {
                activeDiscounts.push({
                    ...dft.discount_type,
                    // Use the percentage from the pivot table
                    default_percentage: dft.percentage,
                });
            }
        });
    }

    // Also include legacy discounts for backward compatibility
    const addLegacyDiscount = (
        hasDiscount: boolean,
        code: string,
        name: string,
        description: string,
        percentage: number,
    ) => {
        if (hasDiscount) {
            const law =
                PHILIPPINE_DISCOUNT_LAWS[
                    code as keyof typeof PHILIPPINE_DISCOUNT_LAWS
                ];
            activeDiscounts.push({
                id: `${code.toLowerCase()}_legacy`,
                code: code,
                name: name,
                description: description,
                default_percentage: Math.min(
                    percentage,
                    law?.maxPercentage || 100,
                ),
                legal_basis: law?.code || null,
                requirements: law?.requirements || null,
                is_active: true,
                is_mandatory: false,
                ph_law_applicable: true,
                ph_law_code: law?.code,
                ph_law_description: law?.description,
                ph_max_percentage: law?.maxPercentage,
                ph_requirements_ph: law?.requirements,
            });
        }
    };

    addLegacyDiscount(
        feeType.has_senior_discount,
        'SENIOR',
        'Senior Citizen',
        'For senior citizens aged 60+',
        feeType.discount_percentage || 20,
    );

    addLegacyDiscount(
        feeType.has_pwd_discount,
        'PWD',
        'Person With Disability',
        'For persons with disabilities',
        feeType.discount_percentage || 20,
    );

    addLegacyDiscount(
        feeType.has_solo_parent_discount,
        'SOLO_PARENT',
        'Solo Parent',
        'For solo parents',
        feeType.discount_percentage || 10,
    );

    addLegacyDiscount(
        feeType.has_indigent_discount,
        'INDIGENT',
        'Indigent',
        'For indigent families',
        feeType.discount_percentage || 20,
    );

    return activeDiscounts;
};

// Get resident's eligible discounts based on their profile with Philippine legal validation
export const getResidentEligibleDiscounts = (
    resident: Resident | null,
    issueDate?: string,
): {
    eligible: string[];
    warnings: string[];
    reasons: Record<string, string>;
} => {
    if (!resident) return { eligible: [], warnings: [], reasons: {} };

    const eligibleDiscounts: string[] = [];
    const warnings: string[] = [];
    const reasons: Record<string, string> = {};

    // Check each discount type for eligibility
    const checkDiscount = (
        code: string,
        hasDiscount: boolean,
        idNumber?: string,
    ) => {
        if (hasDiscount) {
            const discountInfo = {
                code,
                ph_law_applicable: true,
                default_percentage: 20,
            } as DiscountType;

            const validation = isDiscountLegallyValid(
                discountInfo,
                resident,
                issueDate,
            );

            if (validation.valid) {
                eligibleDiscounts.push(code);
                if (validation.warning) {
                    warnings.push(`${code}: ${validation.warning}`);
                }
            } else if (validation.reason) {
                reasons[code] = validation.reason;
            }
        }
    };

    checkDiscount(
        'SENIOR',
        resident.is_senior || false,
        resident.senior_id_number,
    );
    checkDiscount('PWD', resident.is_pwd || false, resident.pwd_id_number);
    checkDiscount(
        'SOLO_PARENT',
        resident.is_solo_parent || false,
        resident.solo_parent_id_number,
    );
    checkDiscount(
        'INDIGENT',
        resident.is_indigent || false,
        resident.indigent_id_number,
    );

    // Also check the eligible_discounts array if provided
    if (resident.eligible_discounts && resident.eligible_discounts.length > 0) {
        resident.eligible_discounts.forEach((discountCode) => {
            if (!eligibleDiscounts.includes(discountCode)) {
                eligibleDiscounts.push(discountCode);
            }
        });
    }

    return { eligible: eligibleDiscounts, warnings, reasons };
};

// PHILIPPINE LAW: Calculate discounted amount with Senior+PWD rule according to Philippine jurisprudence
export const calculateDiscountedAmount = (
    baseAmount: number,
    selectedDiscountTypeIds: string[],
    availableDiscounts: DiscountType[],
    resident?: Resident | null,
    issueDate?: string,
): { discount: number; warnings: string[]; legalNotes: string } => {
    if (
        selectedDiscountTypeIds.length === 0 ||
        availableDiscounts.length === 0
    ) {
        return { discount: 0, warnings: [], legalNotes: '' };
    }

    // Get the selected discount objects
    const selectedDiscounts = availableDiscounts.filter((d) =>
        selectedDiscountTypeIds.includes(d.id.toString()),
    );

    let totalDiscountPercentage = 0;
    let warnings: string[] = [];
    let legalNotes = '';

    // PHILIPPINE RULE: Senior + PWD combination - According to Philippine jurisprudence,
    // they are considered separate and distinct benefits but cannot be combined cumulatively.
    // Most LGU interpretations: Apply the higher discount or 20% (not cumulative)
    const hasSeniorDiscount = selectedDiscounts.some(
        (d) => d.code === 'SENIOR',
    );
    const hasPWDDiscount = selectedDiscounts.some((d) => d.code === 'PWD');

    if (hasSeniorDiscount && hasPWDDiscount) {
        // PHILIPPINE JURISPRUDENCE: Senior and PWD discounts cannot be stacked
        // Common LGU practice: Apply 20% (maximum allowed by both laws)
        totalDiscountPercentage = 20;
        legalNotes =
            'Philippine Law Interpretation: Senior Citizen and PWD discounts cannot be combined cumulatively. Applying maximum allowable discount of 20% as per RA 9994 and RA 10754.';
        warnings.push(
            'Senior + PWD discounts combined: Applying 20% maximum discount (not 40%) per Philippine law interpretation.',
        );
    } else if (hasSeniorDiscount) {
        // Senior Citizen discount: 20% by law (RA 9994)
        const seniorDiscount = selectedDiscounts.find(
            (d) => d.code === 'SENIOR',
        );
        totalDiscountPercentage = Math.min(
            seniorDiscount?.default_percentage || 0,
            20,
        );
        legalNotes = `Senior Citizen Discount (RA 9994): ${totalDiscountPercentage}% applied.`;
    } else if (hasPWDDiscount) {
        // PWD discount: 20% by law (RA 10754)
        const pwdDiscount = selectedDiscounts.find((d) => d.code === 'PWD');
        totalDiscountPercentage = Math.min(
            pwdDiscount?.default_percentage || 0,
            20,
        );
        legalNotes = `PWD Discount (RA 10754): ${totalDiscountPercentage}% applied.`;
    } else {
        // Normal discount calculation for other combinations
        selectedDiscounts.forEach((discount) => {
            // Check if discount exceeds Philippine legal maximum
            if (
                discount.ph_max_percentage &&
                discount.default_percentage > discount.ph_max_percentage
            ) {
                warnings.push(
                    `${discount.name}: Exceeds Philippine legal maximum of ${discount.ph_max_percentage}%. Capping at legal limit.`,
                );
                totalDiscountPercentage += discount.ph_max_percentage;
            } else {
                totalDiscountPercentage += discount.default_percentage;
            }
        });

        // Cap discount at 100%
        totalDiscountPercentage = Math.min(totalDiscountPercentage, 100);
    }

    // Calculate discount amount
    let discountAmount = (baseAmount * totalDiscountPercentage) / 100;

    // Ensure discount doesn't exceed base amount
    discountAmount = Math.min(discountAmount, baseAmount);

    return { discount: discountAmount, warnings, legalNotes };
};

// Check if discount combination requires special handling
export const getDiscountNote = (
    selectedDiscountTypeIds: string[],
    availableDiscounts: DiscountType[],
): { note: string; type: 'info' | 'warning' | 'error' } => {
    if (selectedDiscountTypeIds.length < 2) return { note: '', type: 'info' };

    const selectedDiscounts = availableDiscounts.filter((d) =>
        selectedDiscountTypeIds.includes(d.id.toString()),
    );

    const hasSeniorDiscount = selectedDiscounts.some(
        (d) => d.code === 'SENIOR',
    );
    const hasPWDDiscount = selectedDiscounts.some((d) => d.code === 'PWD');

    if (hasSeniorDiscount && hasPWDDiscount) {
        return {
            note: 'Philippine Law (RA 9994 & RA 10754): Senior Citizen and PWD discounts cannot be combined cumulatively. Maximum discount applied: 20%.',
            type: 'warning',
        };
    }

    return { note: '', type: 'info' };
};

// Check if fee type is exempt from Philippine discounts
export const isFeeTypeExemptFromDiscount = (
    feeType: FeeType | null,
    discountCode: string,
): boolean => {
    if (!feeType) return false;

    // Some fees may be exempt from certain discounts per Philippine law
    // Example: Real property taxes, special assessments, etc.
    if (feeType.ph_law_exempt) {
        return true;
    }

    // Specific exemptions based on fee type
    const exemptCategories = [
        'real_property_tax',
        'special_assessment',
        'penalty_fee',
    ];
    if (
        feeType.document_category &&
        exemptCategories.includes(feeType.document_category.slug)
    ) {
        return true;
    }

    return false;
};

// Get Philippine legal basis for discount
export const getPhilippineLegalBasis = (discount: DiscountType): string => {
    if (!discount.ph_law_applicable) return 'Local Ordinance';

    switch (discount.code) {
        case 'SENIOR':
            return 'RA 9994 (Expanded Senior Citizens Act)';
        case 'PWD':
            return 'RA 10754 (Expanded PWD Benefits Act)';
        case 'SOLO_PARENT':
            return 'RA 8972 (Solo Parents Welfare Act)';
        case 'INDIGENT':
            return 'RA 8425 (Social Reform Act)';
        default:
            return discount.legal_basis || 'Local Ordinance';
    }
};