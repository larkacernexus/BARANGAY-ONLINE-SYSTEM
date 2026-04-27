// components/admin/households/create/hooks/useHouseholdForm.ts
import { Resident } from '@/types/admin/households/household.types';
import { useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';

interface Member {
    id: number;
    name: string;
    relationship: string;
    age: number;
    resident_id?: number;
    purok_id?: number;
    purok_name?: string;
    photo_path?: string;
    photo_url?: string;
}

interface HouseholdFormData {
    household_number: string;
    head_of_family: string;
    head_resident_id: number | null;
    contact_number: string;
    email: string;
    address: string;
    purok_id: number | null;
    purok_name: string;
    total_members: number;
    income_range: string;
    housing_type: string;
    ownership_status: string;
    water_source: string;
    electricity: boolean;
    internet: boolean;
    vehicle: boolean;
    remarks: string;
    members: Member[];
    create_user_account: boolean;
}

export function useHouseholdForm(p0: { selected_head: Resident; head_of_family: string; } | undefined) {
    const { data, setData, post, processing, errors, reset } = useForm<HouseholdFormData>({
        household_number: '',
        head_of_family: '',
        head_resident_id: null,
        contact_number: '',
        email: '',
        address: '',
        purok_id: null,
        purok_name: '',
        total_members: 0,
        income_range: '',
        housing_type: '',
        ownership_status: '',
        water_source: '',
        electricity: false,
        internet: false,
        vehicle: false,
        remarks: '',
        members: [],
        create_user_account: true,
    });

    // Update total_members when members change
    useEffect(() => {
        setData('total_members', data.members.length);
    }, [data.members]);

    const addMember = (member: Omit<Member, 'id'>) => {
        const newId = data.members.length > 0 
            ? Math.max(...data.members.map(m => m.id)) + 1 
            : 1;
        
        setData('members', [
            ...data.members,
            { id: newId, ...member }
        ]);
    };

    const updateMember = (id: number, field: string, value: string | number | undefined) => {
        setData('members', data.members.map(member => 
            member.id === id ? { ...member, [field]: value } : member
        ));
    };

    const removeMember = (id: number) => {
        const memberToRemove = data.members.find(m => m.id === id);
        if (memberToRemove?.relationship === 'Head') {
            alert('Cannot remove the head of family. Change the head first.');
            return;
        }
        
        setData('members', data.members.filter(member => member.id !== id));
    };

    const setHeadResident = (residentId: number | null, residentName: string) => {
        setData('head_resident_id', residentId);
        setData('head_of_family', residentName);
        
        // Update or add head in members
        const existingHeadIndex = data.members.findIndex(m => m.relationship === 'Head');
        
        if (existingHeadIndex !== -1) {
            // Update existing head
            const updatedMembers = [...data.members];
            updatedMembers[existingHeadIndex] = {
                ...updatedMembers[existingHeadIndex],
                name: residentName,
                resident_id: residentId || undefined,
            };
            setData('members', updatedMembers);
        } else if (residentId) {
            // Add new head as first member
            const newHeadMember = {
                id: data.members.length > 0 ? Math.max(...data.members.map(m => m.id)) + 1 : 1,
                name: residentName,
                relationship: 'Head',
                age: 0,
                resident_id: residentId,
            };
            setData('members', [newHeadMember, ...data.members]);
        }
    };

    const addMultipleMembers = (residents: any[], relationship: string) => {
        const newId = data.members.length > 0 
            ? Math.max(...data.members.map(m => m.id)) + 1 
            : 1;
        
        const newMembers = residents.map((resident, index) => ({
            id: newId + index,
            name: `${resident.first_name} ${resident.last_name}`.trim(),
            relationship,
            age: resident.age || 0,
            resident_id: resident.id,
            purok_id: resident.purok_id,
            purok_name: resident.purok_name,
            photo_path: resident.photo_path,
            photo_url: resident.photo_url,
        }));

        setData('members', [...data.members, ...newMembers]);
    };

    return {
        data,
        setData,
        post,
        processing,
        errors,
        reset: () => {
            reset();
            setData('members', []);
        },
        addMember,
        updateMember,
        removeMember,
        setHeadResident,
        addMultipleMembers,
    };
}