export interface Notification {
    id: string;
    type: string;
    notifiable_type: string;
    notifiable_id: number;
    data: {
        type: string;
        fee_id: number;
        fee_code: string;
        fee_type: string;
        payer_name: string;
        payer_type: string;
        amount: number;
        formatted_amount: string;
        action: string;
        message: string;
        bulk_count?: number;
        created_by: number;
        created_at: string;
        link: string;
    };
    read_at: string | null;
    created_at: string;
    updated_at: string;
}