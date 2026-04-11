// // app/Pages/Admin/Payments/types.ts

// // ==================== DYNAMIC PRIVILEGE TYPES ====================

// export interface Privilege {
//     id: number;
//     name: string;
//     code: string;
//     description?: string;
//     default_discount_percentage?: number;
//     requires_id_number?: boolean;
//     requires_verification?: boolean;
//     validity_years?: number;
//     is_active: boolean;
// }

// export interface ResidentPrivilege {
//     id: number;
//     resident_id: number;
//     privilege_id: number;
//     privilege?: Privilege;
//     id_number?: string;
//     verified_at?: string | null;
//     expires_at?: string | null;
//     remarks?: string;
//     discount_percentage?: number;
//     status: 'pending' | 'active' | 'expired' | 'expiring_soon';
//     is_active: boolean;
// }

// // ==================== UPDATED DISCOUNT RULE TYPES ====================

// export interface DiscountRule {
//     id: number;
//     code: string;
//     name: string;
//     description: string | null;
//     discount_type: string; // Dynamic - can be any privilege code
//     value_type: 'percentage' | 'fixed';
//     discount_value: number;
//     maximum_discount_amount: number | null;
//     minimum_purchase_amount: number | null;
//     priority: number;
//     requires_verification: boolean;
//     verification_document: string | null;
//     applicable_to: string | null;
//     stackable: boolean;
//     exclusive_with: string[] | null;
//     effective_date: string | null;
//     expiry_date: string | null;
//     formatted_value: string;
//     status: string;
//     type_label: string;
//     is_expired: boolean;
//     // Link to privilege
//     privilege_id?: number;
//     privilege?: Privilege;
//     privilege_code?: string;
// }

// // ==================== UPDATED RESIDENT DISCOUNT TYPES ====================

// export interface ResidentDiscount {
//     type: string; // Dynamic - any privilege code
//     label: string;
//     percentage: number;
//     id_number?: string;
//     has_id: boolean;
//     privilege_code?: string;
//     expires_at?: string;
// }

// // ==================== UPDATED FEE TYPE TYPES ====================

// export interface FeeType {
//     id: string | number;
//     name: string;
//     code: string;
//     description?: string;
//     base_amount: number | string;
//     category: string;
//     frequency: string;
//     is_discountable: boolean;
//     has_surcharge: boolean;
//     surcharge_rate?: number;
//     surcharge_fixed?: number;
//     has_penalty: boolean;
//     penalty_rate?: number;
//     penalty_fixed?: number;
//     validity_days?: number;
//     // DYNAMIC: All discount fields will be added dynamically
//     // e.g., has_SENIOR_discount, SENIOR_discount_percentage, etc.
//     [key: string]: any;
// }

// // ==================== UPDATED BACKEND FEE TYPES ====================

// export interface BackendFee {
//     id: string | number;
//     fee_type_id: string | number;
//     fee_code: string;
//     payer_type: 'resident' | 'household' | 'business' | 'App\\Models\\Resident' | 'App\\Models\\Household' | 'App\\Models\\Business';
//     resident_id: string | number | null;
//     household_id: string | number | null;
//     business_id: string | number | null;
//     business_name: string | null;
//     payer_name: string;
//     payer_id?: string | number;
//     contact_number: string | null;
//     address: string | null;
//     purok: string | null;
//     zone: string | null;
//     billing_period: string | null;
//     period_start: string | null;
//     period_end: string | null;
//     issue_date: string;
//     due_date: string;
//     base_amount: number;
//     surcharge_amount: number;
//     penalty_amount: number;
//     discount_amount: number;
//     discount_type: string | null;
//     total_amount: number;
//     status: 'pending' | 'issued' | 'partially_paid' | 'overdue' | 'paid' | 'cancelled' | 'waived';
//     amount_paid: number | null;
//     balance: number;
//     purpose: string | null;
//     fee_type_name?: string;
//     fee_type_category?: string;
    
//     // DYNAMIC: Discount applicability
//     applicableDiscounts?: Array<{
//         type: string;
//         label: string;
//         percentage: number;
//         applicablePercentage: number;
//         has_id: boolean;
//         id_number?: string;
//         privilege_code?: string;
//     }>;
//     canApplyDiscount?: boolean;
    
//     // DYNAMIC: Resident details with privileges
//     resident_details?: {
//         privileges?: Array<{
//             code: string;
//             name: string;
//             id_number?: string;
//         }>;
//         [key: string]: any; 
//     };
    
//     // Business specific fields
//     business_type?: string;
//     business_type_label?: string;
//     dti_sec_number?: string;
//     tin_number?: string;
//     mayors_permit_number?: string;
//     employee_count?: number;
//     capital_amount?: number;
//     monthly_gross?: number;
//     formatted_capital?: string;
//     formatted_monthly_gross?: string;
    
//     // DYNAMIC: All discount fields will be added dynamically
//     [key: string]: any;
// }

// // ==================== UPDATED OUTSTANDING FEE TYPES ====================

// export interface OutstandingFee {
//     id: string | number;
//     fee_type_id: string | number;
//     fee_type?: FeeType;
//     fee_code: string;
//     payer_name: string;
//     payer_type: 'resident' | 'household' | 'business';
//     payer_id?: string | number;
//     resident_id?: string | number;
//     household_id?: string | number;
//     business_id?: string | number;
//     due_date: string;
//     base_amount: string | number;
//     surcharge_amount: string | number;
//     penalty_amount: string | number;
//     discount_amount: string | number;
//     amount_paid: string | number;
//     balance: string | number;
//     total_amount?: string | number;
//     status: string;
//     purpose?: string;
//     fee_type_name?: string;
//     fee_type_category?: string;
//     billing_period?: string;
//     period_start?: string;
//     period_end?: string;
//     category?: string;
    
//     // Business specific fields
//     business_name?: string;
//     business_type?: string;
//     contact_number?: string;
//     address?: string;
//     purok?: string;
    
//     // DYNAMIC: Discount fields
//     applicableDiscounts?: Array<{
//         type: string;
//         label: string;
//         percentage: number;
//         applicablePercentage: number;
//         has_id: boolean;
//         id_number?: string;
//         privilege_code?: string;
//     }>;
//     canApplyDiscount?: boolean;
    
//     // DYNAMIC: All discount flags will be added dynamically
//     [key: string]: any;
// }

// // ==================== UPDATED CLEARANCE TYPE TYPES ====================

// export interface ClearanceType {
//     id: string | number;
//     name: string;
//     code: string;
//     description?: string;
//     fee: number | string;
//     formatted_fee?: string;
//     processing_days?: number;
//     validity_days: number;
//     requires_payment: boolean;
//     requires_approval: boolean;
//     is_online_only: boolean;
//     is_discountable?: boolean;
//     eligibility_criteria?: string;
//     purpose_options?: string[];
//     requirements?: string[];
    
//     // DYNAMIC: All discount fields will be added dynamically
//     [key: string]: any;
// }

// // ==================== UPDATED CLEARANCE REQUEST TYPES ====================

// export interface ClearanceRequest {
//     id: string | number;
//     resident_id: string | number;
//     clearance_type_id: string | number;
//     reference_number: string;
//     purpose: string;
//     specific_purpose?: string;
//     fee_amount: number | string;
//     status: string;
//     status_display?: string;
//     clearance_type?: ClearanceType;
//     resident?: Resident;
//     can_be_paid?: boolean;
//     already_paid?: boolean;
    
//     // DYNAMIC: Discount fields
//     applicableDiscounts?: Array<{
//         type: string;
//         label: string;
//         percentage: number;
//         applicablePercentage: number;
//         has_id: boolean;
//         id_number?: string;
//         privilege_code?: string;
//     }>;
//     canApplyDiscount?: boolean;
// }

// // ==================== UPDATED RESIDENT TYPES ====================

// export interface Resident {
//     id: string | number;
//     name: string;
//     first_name?: string;
//     last_name?: string;
//     middle_name?: string;
//     suffix?: string;
//     contact_number?: string;
//     email?: string;
//     address?: string;
//     birth_date?: string;
//     age?: number;
//     gender?: string;
//     civil_status?: string;
//     occupation?: string;
//     household_number?: string;
//     purok?: string;
//     purok_id?: string | number;
//     household_id?: string | number;
//     household_info?: any;
//     outstanding_fees?: OutstandingFee[];
//     has_outstanding_fees?: boolean;
//     outstanding_fee_count?: number;
//     total_outstanding_balance?: string;
//     is_voter?: boolean;
    
//     // DYNAMIC: Privilege data
//     privileges?: ResidentPrivilege[];
//     privileges_count?: number;
//     active_privileges_count?: number;
//     has_privileges?: boolean;
//     discount_eligibility_list?: ResidentDiscount[];
//     has_special_classification?: boolean;
    
//     // Business ownership
//     businesses?: Business[];
//     is_business_owner?: boolean;
//     is_household_head?: boolean;
    
//     // DYNAMIC: Individual privilege flags will be added dynamically
//     [key: string]: any;
// }

// // ==================== UPDATED HOUSEHOLD TYPES ====================

// export interface Household {
//     id: string | number;
//     household_number: string;
//     head_name: string;
//     head_id?: string | number;
//     contact_number?: string;
//     email?: string;
//     address: string;
//     full_address?: string;
//     purok?: string;
//     purok_id?: string | number;
//     member_count?: number;
//     outstanding_fees?: OutstandingFee[];
//     has_outstanding_fees?: boolean;
//     outstanding_fee_count?: number;
//     total_outstanding_balance?: string;
    
//     // DYNAMIC: Household members with privileges
//     members?: HouseholdMember[];
//     head_of_household?: any;
//     family_composition?: {
//         total_members: number;
//         adults: number;
//         minors: number;
//         [key: string]: any; // Dynamic composition fields like seniors, pwd, etc.
//     };
    
//     has_user_account?: boolean;
//     user_account?: any;
    
//     // DYNAMIC: Head resident's privileges
//     head_privileges?: Array<{
//         code: string;
//         name: string;
//         id_number?: string;
//     }>;
//     has_discount_eligible_head?: boolean;
// }

// export interface HouseholdMember {
//     id: string | number;
//     resident_id: string | number;
//     name: string;
//     contact_number?: string;
//     relationship_to_head: string;
//     is_head: boolean;
//     age?: number;
//     gender?: string;
    
//     // DYNAMIC: Privilege flags will be added dynamically
//     [key: string]: any;
// }

// // ==================== UPDATED BUSINESS TYPES ====================

// export interface Business {
//     id: string | number;
//     business_name: string;
//     owner_name: string;
//     owner_id?: string | number;
//     contact_number?: string;
//     email?: string;
//     address: string;
//     purok?: string;
//     purok_id?: string | number;
//     business_type?: string;
//     business_type_label?: string;
//     status?: 'active' | 'closed' | 'pending';
//     permit_expiry_date?: string;
//     is_permit_valid?: boolean;
//     dti_sec_number?: string;
//     tin_number?: string;
//     mayors_permit_number?: string;
//     employee_count?: number;
//     capital_amount?: number;
//     monthly_gross?: number;
//     formatted_capital?: string;
//     formatted_monthly_gross?: string;
    
//     // Outstanding fees
//     outstanding_fees?: OutstandingFee[];
//     has_outstanding_fees?: boolean;
//     outstanding_fee_count?: number;
//     total_outstanding_balance?: string;
    
//     // Owner details
//     owner?: Resident;
    
//     // DYNAMIC: Owner's privileges
//     owner_privileges?: Array<{
//         code: string;
//         name: string;
//         id_number?: string;
//     }>;
//     owner_has_privileges?: boolean;
// }

// // ==================== UPDATED PAYMENT ITEM TYPES ====================

// export interface PaymentItem {
//     id: number;
//     fee_id: string | number;
//     fee_name: string;
//     fee_code: string;
//     description: string;
//     base_amount: number;
//     surcharge: number;
//     penalty: number;
//     discount: number;
//     total_amount: number;
//     category: string;
//     period_covered: string;
//     months_late: number;
//     fee_type_id?: string | number;
//     metadata?: {
//         is_clearance_fee?: boolean;
//         clearance_request_id?: string | number;
//         clearance_type_id?: string | number;
//         clearance_type_code?: string;
//         clearance_type_name?: string;
//         is_outstanding_fee?: boolean;
//         original_fee_id?: string | number;
//         payer_type?: string;
//         payer_id?: string | number;
//         resident_id?: string | number;
//         household_id?: string | number;
//         is_business_fee?: boolean;
//         business_id?: string | number;
//         business_name?: string;
//         original_fee_data?: {
//             base_amount: number;
//             surcharge_amount: number;
//             penalty_amount: number;
//             discount_amount: number;
//             amount_paid: number;
//             balance: number;
//             total_amount?: number;
//         };
//         appliedDiscount?: {
//             rule_id?: number;
//             code?: string;
//             type?: string;
//             percentage?: number;
//             amount: number;
//             residentId?: string | number;
//             residentName?: string;
//             verification_id?: string;
//             verified_at?: string;
//             privilege_code?: string;
//             id_number?: string;
//         };
//         resident_privileges?: Array<{
//             privilege_code: string;
//             id_number?: string;
//             discount_percentage?: number;
//         }>;
//         // DYNAMIC: Discount flags
//         [key: string]: any;
//     };
// }

// // ==================== UPDATED PAYMENT FORM DATA ====================

// export interface PaymentFormData {
//     payer_type: string;
//     payer_id: string | number;
//     payer_name: string;
//     contact_number: string;
//     address: string;
//     household_number: string;
//     purok: string;
//     items: PaymentItem[];
//     payment_date: string;
//     period_covered: string;
//     or_number: string;
//     payment_method: string;
//     reference_number: string;
//     subtotal: number;
//     surcharge: number;
//     penalty: number;
//     discount: number;
//     discount_code: string;
//     discount_id?: number;
//     discount_type: string;
//     total_amount: number;
//     purpose: string;
//     remarks: string;
//     is_cleared: boolean;
//     clearance_type: string;
//     clearance_type_id: string | number;
//     clearance_code: string;
//     validity_date: string;
//     collection_type: 'manual' | 'system';
//     clearance_request_id?: string | number;
//     verification_id_number?: string;
//     verification_remarks?: string;
//     amount_paid?: number;
//     resident_id?: string | number;
//     resident_name?: string;
    
//     // DYNAMIC: Applied discounts tracking
//     applied_discounts?: Array<{
//         privilege_code: string;
//         discount_percentage: number;
//         discount_amount: number;
//         id_number?: string;
//     }>;
// }

// // ==================== UPDATED PRE-FILLED FEE DATA ====================

// export interface PreFilledFeeData {
//     fee_id?: number;
//     fee_type_id?: number;
//     payer_type?: string;
//     payer_id?: number;
//     payer_name?: string;
//     contact_number?: string;
//     address?: string;
//     purok?: string;
//     fee_code?: string;
//     fee_name?: string;
//     description?: string;
//     total_amount?: number;
//     balance?: number;
//     clearance_request_id?: string | number;
//     clearance_type_id?: string | number;
//     clearance_type?: string;
//     clearance_code?: string;
//     business_name?: string;
//     business_id?: string | number;
// }

// // ==================== UPDATED SELECTED FEE DETAILS ====================

// export interface SelectedFeeDetails {
//     id: string | number;
//     fee_code: string;
//     fee_type_id: string | number;
//     fee_type_name: string;
//     fee_type_category: string;
//     payer_name: string;
//     payer_type: string;
//     payer_id: string | number;
//     contact_number: string;
//     address: string;
//     purok: string;
//     base_amount: number;
//     surcharge_amount: number;
//     penalty_amount: number;
//     total_discounts: number;
//     total_amount: number;
//     balance: number;
//     status: string;
//     issue_date: string;
//     due_date: string;
//     purpose: string;
//     remarks: string;
//     business_name?: string;
//     business_type?: string;
    
//     // DYNAMIC: Discount fields
//     applicable_discounts?: Array<{
//         type: string;
//         label: string;
//         percentage: number;
//         id_number?: string;
//         has_id: boolean;
//         privilege_code?: string;
//     }>;
//     discount_eligibility_text?: string;
    
//     resident_discount_info?: {
//         id: string | number;
//         name: string;
//         has_special_classification: boolean;
//         discount_eligibility_list: ResidentDiscount[];
//         privileges?: Array<{
//             code: string;
//             name: string;
//             id_number?: string;
//             discount_percentage?: number;
//         }>;
//         // DYNAMIC: Individual privilege flags
//         [key: string]: any;
//     };
    
//     household_info?: any;
//     is_household_head?: boolean;
    
//     // DYNAMIC: All discount flags will be added dynamically
//     [key: string]: any;
// }

// // ==================== UPDATED PAGE PROPS ====================

// export interface PageProps {
//     residents: Resident[];
//     households: Household[];
//     businesses?: Business[];
//     fees: BackendFee[];
//     feeTypes?: FeeType[];
//     discountRules?: DiscountRule[];
//     discountTypes?: Record<string, string>;
//     discountCodeToIdMap?: Record<string, number>;
//     privileges?: Privilege[];
//     allPrivileges?: Privilege[];
//     pre_filled_data?: PreFilledFeeData;
//     clearance_request?: ClearanceRequest | null;
//     clearance_fee_type?: any;
//     clearanceTypes?: Record<string, string>;
//     clearanceTypesDetails?: ClearanceType[];
//     clearance_requests?: ClearanceRequest[];
//     selected_fee_details?: SelectedFeeDetails | null;
//     selected_fee_type_id?: string | number;
//     payer_counts?: {
//         residents: number;
//         households: number;
//         businesses: number;
//         total: number;
//     };
//     hasClearanceTypes?: boolean;
//     isCombinedPayment?: boolean;
//     isClearanceMode?: boolean;
//     isBusinessMode?: boolean;
//     isFeePayment?: boolean;
//     payerClearanceRequests?: ClearanceRequest[];
    
// }

// // ==================== UTILITY TYPES ====================

// export interface DiscountApplication {
//     rule: DiscountRule;
//     amount: number;
//     verification_id?: string;
//     verified_at?: string;
//     privilege_code?: string;
//     privilege_id?: number;
//     id_number?: string;
// }

// export interface DiscountCalculationResult {
//     discountAmount: number;
//     appliedRule?: DiscountRule;
//     appliedDiscounts?: Array<{
//         privilege_code: string;
//         discount_percentage: number;
//         discount_amount: number;
//         id_number?: string;
//     }>;
//     items: PaymentItem[];
//     subtotal: number;
//     surcharge: number;
//     penalty: number;
//     total: number;
// }

// export interface BusinessPaymentSummary {
//     business_id: string | number;
//     business_name: string;
//     owner_name: string;
//     contact_number?: string;
//     address?: string;
//     purok?: string;
//     permit_status?: string;
//     permit_expiry_date?: string;
//     total_fees: number;
//     fee_count: number;
// }

// export interface PaymentMethodDetails {
//     id: string;
//     name: string;
//     icon: string;
//     color: string;
//     description?: string;
// }
