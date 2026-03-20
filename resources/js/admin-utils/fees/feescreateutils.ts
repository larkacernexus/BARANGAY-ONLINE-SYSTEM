import { DiscountType, FeeType, parseNumber, Resident } from '@/types/fees';

// Helper function to format currency
export const formatCurrency = (amount: any): string => {
    const num = parseNumber(amount);
    return `₱${num.toFixed(2)}`;
};

// ========== DYNAMIC PRIVILEGE HELPER FUNCTIONS ==========

/**
 * Get resident's active privileges
 */
export const getActivePrivileges = (resident: Resident | null): any[] => {
    if (!resident || !resident.privileges || !Array.isArray(resident.privileges)) {
        return [];
    }
    
    return resident.privileges.filter((p: any) => 
        p.status === 'active' || p.status === 'expiring_soon'
    );
};

/**
 * Check if resident has a specific privilege
 */
export const hasPrivilege = (resident: Resident | null, privilegeCode: string): boolean => {
    if (!resident || !resident.privileges) return false;
    
    return resident.privileges.some((p: any) => 
        p.code?.toUpperCase() === privilegeCode?.toUpperCase() &&
        (p.status === 'active' || p.status === 'expiring_soon')
    );
};

/**
 * Get privilege ID number if available
 */
export const getPrivilegeIdNumber = (resident: Resident | null, privilegeCode: string): string | null => {
    if (!resident || !resident.privileges) return null;
    
    const priv = resident.privileges.find((p: any) => 
        p.code?.toUpperCase() === privilegeCode?.toUpperCase()
    );
    
    return priv?.id_number || null;
};

/**
 * Get privilege expiry date if available
 */
export const getPrivilegeExpiry = (resident: Resident | null, privilegeCode: string): string | null => {
    if (!resident || !resident.privileges) return null;
    
    const priv = resident.privileges.find((p: any) => 
        p.code?.toUpperCase() === privilegeCode?.toUpperCase()
    );
    
    return priv?.expires_at || null;
};

// ========== PHILIPPINE LEGAL DISCOUNT RULES (Still needed for legal compliance) ==========

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
            if (!hasPrivilege(resident, 'SENIOR') && !hasPrivilege(resident, 'SC') && !hasPrivilege(resident, 'OSP')) {
                return {
                    valid: false,
                    reason: 'Resident does not have Senior Citizen privilege',
                };
            }
            const seniorId = getPrivilegeIdNumber(resident, 'SENIOR') || 
                            getPrivilegeIdNumber(resident, 'SC') || 
                            getPrivilegeIdNumber(resident, 'OSP');
            if (!seniorId) {
                return {
                    valid: false,
                    reason: 'No valid Senior Citizen ID number provided',
                };
            }
            const seniorExpiry = getPrivilegeExpiry(resident, 'SENIOR') || 
                                getPrivilegeExpiry(resident, 'SC') || 
                                getPrivilegeExpiry(resident, 'OSP');
            if (seniorExpiry) {
                const validUntil = new Date(seniorExpiry);
                if (today > validUntil) {
                    return {
                        valid: false,
                        reason: `Senior Citizen privilege expired on ${validUntil.toLocaleDateString()}`,
                    };
                }
            }
            if (discount.default_percentage > 20) {
                return {
                    valid: true,
                    warning:
                        'Philippine Law (RA 9994) caps senior discount at 20%. Adjusting to legal limit.',
                };
            }
            break;

        case 'PWD':
            if (!hasPrivilege(resident, 'PWD')) {
                return {
                    valid: false,
                    reason: 'Resident does not have PWD privilege',
                };
            }
            const pwdId = getPrivilegeIdNumber(resident, 'PWD');
            if (!pwdId) {
                return {
                    valid: false,
                    reason: 'No valid PWD ID number provided',
                };
            }
            const pwdExpiry = getPrivilegeExpiry(resident, 'PWD');
            if (pwdExpiry) {
                const validUntil = new Date(pwdExpiry);
                if (today > validUntil) {
                    return {
                        valid: false,
                        reason: `PWD privilege expired on ${validUntil.toLocaleDateString()}`,
                    };
                }
            }
            if (discount.default_percentage > 20) {
                return {
                    valid: true,
                    warning:
                        'Philippine Law (RA 10754) caps PWD discount at 20%. Adjusting to legal limit.',
                };
            }
            break;

        case 'SOLO_PARENT':
            if (!hasPrivilege(resident, 'SOLO_PARENT') && !hasPrivilege(resident, 'SP')) {
                return {
                    valid: false,
                    reason: 'Resident does not have Solo Parent privilege',
                };
            }
            const soloId = getPrivilegeIdNumber(resident, 'SOLO_PARENT') || 
                          getPrivilegeIdNumber(resident, 'SP');
            if (!soloId) {
                return {
                    valid: false,
                    reason: 'No valid Solo Parent ID number provided',
                };
            }
            const soloExpiry = getPrivilegeExpiry(resident, 'SOLO_PARENT') || 
                              getPrivilegeExpiry(resident, 'SP');
            if (soloExpiry) {
                const validUntil = new Date(soloExpiry);
                if (today > validUntil) {
                    return {
                        valid: false,
                        reason: `Solo Parent privilege expired on ${validUntil.toLocaleDateString()}`,
                    };
                }
            }
            if (discount.ph_max_percentage && discount.default_percentage > discount.ph_max_percentage) {
                return {
                    valid: true,
                    warning: `Solo Parent discount exceeds legal maximum of ${discount.ph_max_percentage}%`,
                };
            }
            break;

        case 'INDIGENT':
            if (!hasPrivilege(resident, 'INDIGENT') && !hasPrivilege(resident, 'IND')) {
                return {
                    valid: false,
                    reason: 'Resident does not have Indigent privilege',
                };
            }
            const indigentId = getPrivilegeIdNumber(resident, 'INDIGENT') || 
                              getPrivilegeIdNumber(resident, 'IND');
            if (!indigentId) {
                return {
                    valid: false,
                    reason: 'No valid Certificate of Indigency number provided',
                };
            }
            const indigentExpiry = getPrivilegeExpiry(resident, 'INDIGENT') || 
                                  getPrivilegeExpiry(resident, 'IND');
            if (indigentExpiry) {
                const validUntil = new Date(indigentExpiry);
                if (today > validUntil) {
                    return {
                        valid: false,
                        reason: `Indigent privilege expired on ${validUntil.toLocaleDateString()}`,
                    };
                }
            }
            break;
            
        default:
            // For any other discount type, check if resident has the privilege
            if (!hasPrivilege(resident, discount.code)) {
                return {
                    valid: false,
                    reason: `Resident does not have ${discount.name || discount.code} privilege`,
                };
            }
            const id = getPrivilegeIdNumber(resident, discount.code);
            if (discount.requires_verification && !id) {
                return {
                    valid: false,
                    reason: `No valid ID number provided for ${discount.name || discount.code}`,
                };
            }
            const expiry = getPrivilegeExpiry(resident, discount.code);
            if (expiry) {
                const validUntil = new Date(expiry);
                if (today > validUntil) {
                    return {
                        valid: false,
                        reason: `${discount.name || discount.code} privilege expired on ${validUntil.toLocaleDateString()}`,
                    };
                }
            }
    }

    return { valid: true };
};

// Get active discount types for a fee type - DYNAMIC
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
                    default_percentage: dft.percentage,
                });
            }
        });
    }

    // DYNAMIC: Look for any discount-related fields in feeType
    Object.keys(feeType).forEach(key => {
        // Check for has_X_discount pattern
        if (key.startsWith('has_') && key.endsWith('_discount') && feeType[key] === true) {
            const privilegeCode = key.replace('has_', '').replace('_discount', '').toUpperCase();
            
            // Find the percentage field
            const percentageKey = `${privilegeCode.toLowerCase()}_discount_percentage`;
            const percentage = feeType[percentageKey] || 20;
            
            // Check if this matches any known Philippine law
            const lawKey = Object.keys(PHILIPPINE_DISCOUNT_LAWS).find(
                law => law.toLowerCase() === privilegeCode.toLowerCase()
            );
            const law = lawKey ? PHILIPPINE_DISCOUNT_LAWS[lawKey as keyof typeof PHILIPPINE_DISCOUNT_LAWS] : null;
            
            activeDiscounts.push({
                id: `${privilegeCode.toLowerCase()}_dynamic`,
                code: privilegeCode,
                name: feeType[`${privilegeCode.toLowerCase()}_discount_name`] || 
                      (law?.name || privilegeCode),
                description: feeType[`${privilegeCode.toLowerCase()}_discount_description`] || 
                            (law?.description || `Discount for ${privilegeCode}`),
                default_percentage: Math.min(percentage, law?.maxPercentage || 100),
                legal_basis: law?.code || null,
                requirements: law?.requirements || null,
                is_active: true,
                is_mandatory: false,
                ph_law_applicable: !!law,
                ph_law_code: law?.code,
                ph_law_description: law?.description,
                ph_max_percentage: law?.maxPercentage,
                ph_requirements_ph: law?.requirements,
            });
        }
    });

    return activeDiscounts;
};

// Get resident's eligible discounts based on their privileges - DYNAMIC
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

    // Get all active privileges
    const activePrivileges = getActivePrivileges(resident);
    
    // Check each privilege for discount eligibility
    activePrivileges.forEach(priv => {
        const discountInfo = {
            code: priv.code,
            ph_law_applicable: true,
            default_percentage: priv.discount_percentage || 20,
            requires_verification: !!priv.requires_verification,
        } as DiscountType;

        const validation = isDiscountLegallyValid(
            discountInfo,
            resident,
            issueDate,
        );

        if (validation.valid) {
            eligibleDiscounts.push(priv.code);
            if (validation.warning) {
                warnings.push(`${priv.name || priv.code}: ${validation.warning}`);
            }
        } else if (validation.reason) {
            reasons[priv.code] = validation.reason;
        }
    });

    // Also check eligible_discounts array if provided (backward compatibility)
    if (resident.eligible_discounts && resident.eligible_discounts.length > 0) {
        resident.eligible_discounts.forEach((discountCode) => {
            if (!eligibleDiscounts.includes(discountCode)) {
                eligibleDiscounts.push(discountCode);
            }
        });
    }

    return { eligible: eligibleDiscounts, warnings, reasons };
};

// PHILIPPINE LAW: Calculate discounted amount with Senior+PWD rule
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

    // PHILIPPINE RULE: Senior + PWD combination
    const hasSeniorDiscount = selectedDiscounts.some(
        (d) => d.code === 'SENIOR' || d.code === 'SC' || d.code === 'OSP',
    );
    const hasPWDDiscount = selectedDiscounts.some((d) => d.code === 'PWD');

    if (hasSeniorDiscount && hasPWDDiscount) {
        // Senior and PWD discounts cannot be stacked
        totalDiscountPercentage = 20;
        legalNotes =
            'Philippine Law Interpretation: Senior Citizen and PWD discounts cannot be combined cumulatively. Applying maximum allowable discount of 20% as per RA 9994 and RA 10754.';
        warnings.push(
            'Senior + PWD discounts combined: Applying 20% maximum discount (not 40%) per Philippine law interpretation.',
        );
    } else if (hasSeniorDiscount) {
        // Senior Citizen discount: 20% by law
        const seniorDiscount = selectedDiscounts.find(
            (d) => d.code === 'SENIOR' || d.code === 'SC' || d.code === 'OSP',
        );
        totalDiscountPercentage = Math.min(
            seniorDiscount?.default_percentage || 20,
            20,
        );
        legalNotes = `Senior Citizen Discount (RA 9994): ${totalDiscountPercentage}% applied.`;
    } else if (hasPWDDiscount) {
        // PWD discount: 20% by law
        const pwdDiscount = selectedDiscounts.find((d) => d.code === 'PWD');
        totalDiscountPercentage = Math.min(
            pwdDiscount?.default_percentage || 20,
            20,
        );
        legalNotes = `PWD Discount (RA 10754): ${totalDiscountPercentage}% applied.`;
    } else {
        // Normal discount calculation for other combinations
        selectedDiscounts.forEach((discount) => {
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
        (d) => d.code === 'SENIOR' || d.code === 'SC' || d.code === 'OSP',
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
        case 'SC':
        case 'OSP':
            return 'RA 9994 (Expanded Senior Citizens Act)';
        case 'PWD':
            return 'RA 10754 (Expanded PWD Benefits Act)';
        case 'SOLO_PARENT':
        case 'SP':
            return 'RA 8972 (Solo Parents Welfare Act)';
        case 'INDIGENT':
        case 'IND':
            return 'RA 8425 (Social Reform Act)';
        default:
            return discount.legal_basis || 'Local Ordinance';
    }
};