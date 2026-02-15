import { useState, useMemo, useCallback } from 'react';
import { Resident, Household } from '@/types/fees';

interface UseBulkFeeManagementProps {
  data: any;
  setData: (key: string, value: any) => void;
  residents: Resident[];
  households: Household[];
}

export const useBulkFeeManagement = ({
  data,
  setData,
  residents,
  households
}: UseBulkFeeManagementProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectAllResidents, setSelectAllResidents] = useState(false);
  const [selectAllHouseholds, setSelectAllHouseholds] = useState(false);

  const filteredResidents = useMemo(() => {
    let filtered = [...residents];
    
    if (data.filter_purok) {
      filtered = filtered.filter(resident => 
        resident.purok === data.filter_purok
      );
    }
    
    if (data.filter_discount_eligible) {
      filtered = filtered.filter(resident => 
        resident.is_senior || 
        resident.is_pwd || 
        resident.is_solo_parent || 
        resident.is_indigent
      );
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(resident =>
        resident.full_name.toLowerCase().includes(term) ||
        resident.contact_number?.toLowerCase().includes(term) ||
        resident.purok?.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  }, [residents, data.filter_purok, data.filter_discount_eligible, searchTerm]);

  const filteredHouseholds = useMemo(() => {
    let filtered = [...households];
    
    if (data.filter_purok) {
      filtered = filtered.filter(household => 
        household.purok === data.filter_purok
      );
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(household =>
        household.name.toLowerCase().includes(term) ||
        household.contact_number?.toLowerCase().includes(term) ||
        household.purok?.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  }, [households, data.filter_purok, searchTerm]);

  const totalPayersCount = useMemo(() => {
    let count = 0;
    
    if (data.bulk_type === 'residents') {
      if (data.apply_to_all_residents) {
        count = filteredResidents.length;
      } else {
        count = data.selected_resident_ids.length;
      }
    } else if (data.bulk_type === 'households') {
      if (data.apply_to_all_households) {
        count = filteredHouseholds.length;
      } else {
        count = data.selected_household_ids.length;
      }
    } else if (data.bulk_type === 'custom') {
      count = data.custom_payers.length;
    } else {
      count = (data.payer_type && data.payer_type !== 'none' && 
              ((data.payer_type === 'resident' && data.resident_id) ||
               (data.payer_type === 'household' && data.household_id) ||
               (data.payer_type === 'business' && data.business_name) ||
               (data.payer_type === 'visitor' && data.payer_name) ||
               (data.payer_type === 'other' && data.payer_name))) ? 1 : 0;
    }
    
    return count;
  }, [
    data.bulk_type, 
    data.selected_resident_ids, 
    data.selected_household_ids, 
    data.custom_payers, 
    data.apply_to_all_residents, 
    data.apply_to_all_households,
    data.payer_type,
    data.resident_id,
    data.household_id,
    data.business_name,
    data.payer_name,
    filteredResidents.length,
    filteredHouseholds.length
  ]);

  const totalEstimatedAmount = useMemo(() => {
    return data.total_amount * totalPayersCount;
  }, [data.total_amount, totalPayersCount]);

  const handleBulkTypeChange = useCallback((bulkType: 'none' | 'residents' | 'households' | 'custom') => {
    const previousBulkType = data.bulk_type;
    setData('bulk_type', bulkType);
    
    if (previousBulkType !== 'none' && bulkType === 'none') {
      // Reset bulk selections
      setData('selected_resident_ids', []);
      setData('selected_household_ids', []);
      setData('custom_payers', []);
      setData('apply_to_all_residents', false);
      setData('apply_to_all_households', false);
      setSelectAllResidents(false);
      setSelectAllHouseholds(false);
    }
    
    if (bulkType !== 'residents') {
      setData('selected_resident_ids', []);
      setSelectAllResidents(false);
      setData('apply_to_all_residents', false);
    }
    if (bulkType !== 'households') {
      setData('selected_household_ids', []);
      setSelectAllHouseholds(false);
      setData('apply_to_all_households', false);
    }
    if (bulkType !== 'custom') {
      setData('custom_payers', []);
    }
  }, [data.bulk_type, setData]);

  const toggleResidentSelection = useCallback((residentId: string | number) => {
    const currentIds = [...data.selected_resident_ids];
    const idStr = residentId.toString();
    
    if (currentIds.includes(idStr)) {
      setData('selected_resident_ids', currentIds.filter(id => id !== idStr));
    } else {
      setData('selected_resident_ids', [...currentIds, idStr]);
    }
  }, [data.selected_resident_ids, setData]);

  const toggleHouseholdSelection = useCallback((householdId: string | number) => {
    const currentIds = [...data.selected_household_ids];
    const idStr = householdId.toString();
    
    if (currentIds.includes(idStr)) {
      setData('selected_household_ids', currentIds.filter(id => id !== idStr));
    } else {
      setData('selected_household_ids', [...currentIds, idStr]);
    }
  }, [data.selected_household_ids, setData]);

  const addCustomPayer = useCallback(() => {
    const newPayer = {
      id: `custom_${Date.now()}`,
      name: '',
      contact_number: '',
      purok: '',
      address: '',
      type: 'custom' as const,
    };
    setData('custom_payers', [...data.custom_payers, newPayer]);
  }, [data.custom_payers, setData]);

  const removeCustomPayer = useCallback((id: string) => {
    setData('custom_payers', data.custom_payers.filter((payer: any) => payer.id !== id));
  }, [data.custom_payers, setData]);

  const updateCustomPayer = useCallback((id: string, field: string, value: string) => {
    setData('custom_payers', data.custom_payers.map((payer: any) => 
      payer.id === id ? { ...payer, [field]: value } : payer
    ));
  }, [data.custom_payers, setData]);

  const handleSelectAllResidents = useCallback(() => {
    if (selectAllResidents) {
      setData('selected_resident_ids', []);
    } else {
      const allIds = filteredResidents.map(resident => resident.id.toString());
      setData('selected_resident_ids', allIds);
    }
    setSelectAllResidents(!selectAllResidents);
  }, [selectAllResidents, filteredResidents, setData]);

  const handleSelectAllHouseholds = useCallback(() => {
    if (selectAllHouseholds) {
      setData('selected_household_ids', []);
    } else {
      const allIds = filteredHouseholds.map(household => household.id.toString());
      setData('selected_household_ids', allIds);
    }
    setSelectAllHouseholds(!selectAllHouseholds);
  }, [selectAllHouseholds, filteredHouseholds, setData]);

  return {
    filteredResidents,
    filteredHouseholds,
    totalPayersCount,
    totalEstimatedAmount,
    handleBulkTypeChange,
    toggleResidentSelection,
    toggleHouseholdSelection,
    addCustomPayer,
    removeCustomPayer,
    updateCustomPayer,
    handleSelectAllResidents,
    handleSelectAllHouseholds,
    selectAllResidents,
    selectAllHouseholds,
    searchTerm,
    setSearchTerm,
  };
};