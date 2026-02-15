import { FeeFormData, FeesCreateProps } from "./fees";

export interface BulkFeeFormData extends Omit<FeeFormData, 'resident_id' | 'household_id' | 'payer_name' | 'contact_number' | 'purok' | 'address'> {
    bulk_type: 'none' | 'residents' | 'households' | 'custom';
    selected_resident_ids: (string | number)[];
    selected_household_ids: (string | number)[];
    custom_payers: Array<{
        id: string;
        name: string;
        contact_number?: string;
        purok?: string;
        address?: string;
        type: 'custom';
    }>;
    apply_to_all_residents: boolean;
    apply_to_all_households: boolean;
    filter_purok?: string;
    filter_discount_eligible?: boolean;
}

// Props interface for the main component
export interface FeesCreateBulkProps extends FeesCreateProps {
    // Inherits all from FeesCreateProps, uses BulkFeeFormData
}

// Unified setData type for both FeeFormData and BulkFeeFormData
type SetDataFunction<T> = (key: keyof T, value: any) => void;
type AnySetDataFunction = SetDataFunction<FeeFormData> | SetDataFunction<BulkFeeFormData>;