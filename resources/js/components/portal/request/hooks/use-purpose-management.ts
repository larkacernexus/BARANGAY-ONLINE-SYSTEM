import { useState } from 'react';
import { AlertCircle, PenSquare } from 'lucide-react';
import { COMMON_PURPOSE_OPTIONS } from '@/components/portal/request/constants';

export function usePurposeManagement(selectedClearance: any) {
    const [availablePurposes, setAvailablePurposes] = useState<Array<{value: string, label: string, icon: any}>>([]);
    const [isCustomPurpose, setIsCustomPurpose] = useState(false);
    const [purposeSearch, setPurposeSearch] = useState('');
    const [showPurposeDropdown, setShowPurposeDropdown] = useState(false);

    const updatePurposes = () => {
        if (selectedClearance) {
            if (selectedClearance.purpose_options && selectedClearance.purpose_options.length > 0) {
                const mappedPurposes = selectedClearance.purpose_options.map((option: string) => {
                    const commonPurpose = COMMON_PURPOSE_OPTIONS.find(
                        common => common.label.toLowerCase() === option.toLowerCase() || 
                                   common.value.toLowerCase() === option.toLowerCase()
                    );
                    
                    if (commonPurpose) return commonPurpose;
                    
                    return {
                        value: option.toLowerCase().replace(/\s+/g, '_'),
                        label: option,
                        icon: AlertCircle
                    };
                });
                
                setAvailablePurposes([
                    ...mappedPurposes,
                    { value: 'custom', label: 'Other/Custom', icon: PenSquare }
                ]);
            } else {
                setAvailablePurposes(COMMON_PURPOSE_OPTIONS);
            }
        } else {
            setAvailablePurposes([]);
        }
        
        setIsCustomPurpose(false);
        setPurposeSearch('');
    };

    const getPurposeSuggestions = (purpose: string, isCustom: boolean) => {
        if (!purpose && !isCustom) return '';
        
        if (isCustom) {
            return 'Please provide specific details about your purpose...';
        }
        
        const purposeObj = availablePurposes.find(p => p.value === purpose);
        if (!purposeObj) return '';
        
        switch (purposeObj.value) {
            case 'employment':
                return 'e.g., Job application at [Company Name], Requirements for new employment at [Company], Promotion requirements...';
            case 'education':
                return 'e.g., School enrollment at [School Name], Scholarship application, School ID renewal, University admission...';
            case 'business':
                return 'e.g., New business registration at DTI, Business permit renewal, Additional line of business...';
            case 'government':
                return 'e.g., SSS application, PhilHealth registration, NBI clearance, Postal ID application...';
            case 'travel':
                return 'e.g., Passport application, Travel authorization, Visa requirements, Overseas employment...';
            case 'loan':
                return 'e.g., Bank loan application at [Bank Name], SSS loan, Pag-IBIG housing loan, Car loan...';
            case 'marriage':
                return 'e.g., Marriage license application, Church wedding requirements, Civil wedding...';
            case 'housing':
                return 'e.g., Socialized housing application, NHA requirements, Transfer of ownership...';
            case 'vehicle':
                return 'e.g., New vehicle registration, Transfer of ownership, Renewal of registration...';
            case 'voter':
                return 'e.g., Voter\'s registration, Transfer of voting precinct, Election requirements...';
            case 'nbi':
                return 'e.g., NBI clearance for employment, NBI clearance for travel, Renewal of NBI clearance...';
            default:
                return 'Please provide specific details about your purpose...';
        }
    };

    const handlePurposeSelect = (value: string, label: string, onSelect?: (value: string, label: string) => void) => {
        if (value === 'custom') {
            setIsCustomPurpose(true);
        } else {
            setIsCustomPurpose(false);
        }
        setShowPurposeDropdown(false);
        setPurposeSearch('');
        if (onSelect) onSelect(value, label);
    };

    return {
        availablePurposes,
        isCustomPurpose,
        setIsCustomPurpose,
        purposeSearch,
        setPurposeSearch,
        showPurposeDropdown,
        setShowPurposeDropdown,
        getPurposeSuggestions,
        handlePurposeSelect,
        updatePurposes
    };
}