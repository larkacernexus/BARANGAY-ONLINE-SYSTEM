import { useState, useMemo, useCallback } from 'react';
import { Resident, Household } from '@/types/fees';

interface UseBulkFeeManagementProps {
  data: any;
  setData: (key: string, value: any) => void;
  residents: Resident[];
  households: Household[];
  // DYNAMIC: All privileges for reference
  allPrivileges?: any[];
}

// ========== DYNAMIC PRIVILEGE HELPER FUNCTIONS ==========

/**
 * Check if resident has any active privileges
 */
const hasAnyPrivilege = (resident: Resident): boolean => {
  if (!resident.privileges || !Array.isArray(resident.privileges)) {
    return false;
  }
  
  return resident.privileges.some((p: any) => 
    p.status === 'active' || p.status === 'expiring_soon'
  );
};

/**
 * Get active privileges from resident
 */
const getActivePrivileges = (resident: Resident): any[] => {
  if (!resident.privileges || !Array.isArray(resident.privileges)) {
    return [];
  }
  
  return resident.privileges.filter((p: any) => 
    p.status === 'active' || p.status === 'expiring_soon'
  );
};

/**
 * Check if resident has a specific privilege
 */
const hasPrivilege = (resident: Resident, privilegeCode: string): boolean => {
  if (!resident.privileges || !Array.isArray(resident.privileges)) {
    return false;
  }
  
  return resident.privileges.some((p: any) => {
    if (p.status !== 'active' && p.status !== 'expiring_soon') return false;
    const code = p.privilege?.code || p.code;
    return code?.toUpperCase() === privilegeCode?.toUpperCase();
  });
};

export const useBulkFeeManagement = ({
  data,
  setData,
  residents,
  households,
  allPrivileges = [] // DYNAMIC: All privileges from database
}: UseBulkFeeManagementProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectAllResidents, setSelectAllResidents] = useState(false);
  const [selectAllHouseholds, setSelectAllHouseholds] = useState(false);

  // DYNAMIC: Filter residents by discount eligibility (any privilege)
  const isDiscountEligible = useCallback((resident: Resident): boolean => {
    return hasAnyPrivilege(resident);
  }, []);

  const filteredResidents = useMemo(() => {
    let filtered = [...residents];
    
    if (data.filter_purok) {
      filtered = filtered.filter(resident => 
        resident.purok === data.filter_purok
      );
    }
    
    // DYNAMIC: Filter by discount eligibility (any privilege)
    if (data.filter_discount_eligible) {
      filtered = filtered.filter(resident => isDiscountEligible(resident));
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(resident =>
        resident.full_name.toLowerCase().includes(term) ||
        resident.contact_number?.toLowerCase().includes(term) ||
        resident.purok?.toLowerCase().includes(term) ||
        // Search in privileges
        resident.privileges?.some((p: any) => 
          p.name?.toLowerCase().includes(term) ||
          p.code?.toLowerCase().includes(term)
        )
      );
    }
    
    return filtered;
  }, [residents, data.filter_purok, data.filter_discount_eligible, searchTerm, isDiscountEligible]);

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
        household.purok?.toLowerCase().includes(term) ||
        // Search in head privileges
        household.head_privileges?.some((p: any) => 
          p.name?.toLowerCase().includes(term) ||
          p.code?.toLowerCase().includes(term)
        )
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

  // DYNAMIC: Get statistics about selected residents' privileges
  const selectedResidentsPrivileges = useMemo(() => {
    if (data.bulk_type !== 'residents' || data.selected_resident_ids.length === 0) {
      return { total: 0, byPrivilege: {} };
    }
    
    const privilegeCounts: Record<string, number> = {};
    let totalPrivileges = 0;
    
    residents
      .filter(r => data.selected_resident_ids.includes(r.id.toString()))
      .forEach(resident => {
        if (resident.privileges && Array.isArray(resident.privileges)) {
          resident.privileges.forEach((p: any) => {
            if (p.status === 'active' || p.status === 'expiring_soon') {
              const code = p.privilege?.code || p.code;
              if (code) {
                privilegeCounts[code] = (privilegeCounts[code] || 0) + 1;
                totalPrivileges++;
              }
            }
          });
        }
      });
    
    return { total: totalPrivileges, byPrivilege: privilegeCounts };
  }, [data.bulk_type, data.selected_resident_ids, residents]);

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
    // DYNAMIC: Additional data
    selectedResidentsPrivileges,
  };
};