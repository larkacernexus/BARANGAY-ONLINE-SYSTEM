// resources/js/types/admin/blotters/display-attachment.ts

export interface DisplayAttachment {
    id?: number;
    name: string;
    file_name?: string;
    path?: string;
    file_path?: string;
    size: number;
    file_size?: number;
    type: string;
    file_type?: string;
    url?: string;
    preview?: string;
}