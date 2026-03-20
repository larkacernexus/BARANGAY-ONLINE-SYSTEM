// hooks/useResidentForm.ts
import { useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export interface PrivilegeAssignment {
    privilege_id: number;
    id_number?: string;
    verified_at?: string;
    expires_at?: string;
    remarks?: string;
}

export interface ResidentFormData {
    first_name: string;
    last_name: string;
    middle_name: string;
    suffix: string;
    birth_date: string;
    age: number;
    gender: string;
    civil_status: string;
    contact_number: string;
    email: string;
    address: string;
    purok_id: number | null;
    household_option: 'none' | 'new' | 'existing';
    household_id: number | null;
    new_household_name: string;
    relationship_to_head: string;
    occupation: string;
    education: string;
    religion: string;
    is_voter: boolean;
    place_of_birth: string;
    remarks: string;
    photo: File | null;
    privileges: PrivilegeAssignment[];
}

export function useResidentForm(initialData?: Partial<ResidentFormData>) {
    const { data, setData, post, processing, errors, reset } = useForm<ResidentFormData>({
        first_name: '',
        last_name: '',
        middle_name: '',
        suffix: '',
        birth_date: '',
        age: 0,
        gender: 'male',
        civil_status: 'single',
        contact_number: '',
        email: '',
        address: '',
        purok_id: null,
        household_option: 'none',
        household_id: null,
        new_household_name: '',
        relationship_to_head: 'head',
        occupation: '',
        education: '',
        religion: '',
        is_voter: false,
        place_of_birth: '',
        remarks: '',
        photo: null,
        privileges: [],
        ...initialData
    });

    // Calculate age from birth date
    useEffect(() => {
        if (data.birth_date) {
            const birthDate = new Date(data.birth_date);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            
            setData('age', age);
        }
    }, [data.birth_date]);

    // Handle household option changes
    useEffect(() => {
        if (data.household_option === 'existing') {
            if (data.gender === 'female') {
                setData('relationship_to_head', 'daughter');
            } else {
                setData('relationship_to_head', 'son');
            }
        } else if (data.household_option === 'new') {
            setData('relationship_to_head', 'head');
            setData('household_id', null);
        } else {
            setData('relationship_to_head', 'head');
            setData('household_id', null);
        }
    }, [data.household_option, data.gender]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setData('photo', file);
    };

    return {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        handleFileChange
    };
}