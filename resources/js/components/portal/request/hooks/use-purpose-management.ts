import { useState } from 'react';
import { AlertCircle, PenSquare, Briefcase, GraduationCap, Building, Globe, DollarSign, Heart, Home, Car, Vote, Fingerprint } from 'lucide-react';

// Common purpose options with icons
export const COMMON_PURPOSE_OPTIONS = [
    { value: 'employment', label: 'Employment / Job Application', icon: Briefcase },
    { value: 'education', label: 'School Enrollment / Education', icon: GraduationCap },
    { value: 'business', label: 'Business / Permit', icon: Building },
    { value: 'government', label: 'Government ID / Requirements', icon: Globe },
    { value: 'travel', label: 'Travel / Passport', icon: Globe },
    { value: 'loan', label: 'Loan / Financial', icon: DollarSign },
    { value: 'marriage', label: 'Marriage / Wedding', icon: Heart },
    { value: 'housing', label: 'Housing / Real Estate', icon: Home },
    { value: 'vehicle', label: 'Vehicle Registration', icon: Car },
    { value: 'voter', label: 'Voter Registration', icon: Vote },
    { value: 'nbi', label: 'NBI Clearance', icon: Fingerprint },
];

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
                    { value: 'custom', label: 'Other / Custom Purpose', icon: PenSquare }
                ]);
            } else {
                setAvailablePurposes([
                    ...COMMON_PURPOSE_OPTIONS,
                    { value: 'custom', label: 'Other / Custom Purpose', icon: PenSquare }
                ]);
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
            return 'Please provide specific details about your purpose for this clearance request.';
        }
        
        const purposeObj = availablePurposes.find(p => p.value === purpose);
        if (!purposeObj) return '';
        
        switch (purposeObj.value) {
            case 'employment':
                return 'e.g., Job application at [Company Name], Requirements for new employment, Promotion requirements, COE requirement';
            case 'education':
                return 'e.g., School enrollment at [School Name], Scholarship application, School ID renewal, University admission';
            case 'business':
                return 'e.g., New business registration at DTI/BIR, Business permit renewal, Additional line of business';
            case 'government':
                return 'e.g., SSS application, PhilHealth registration, Pag-IBIG membership, Postal ID application';
            case 'travel':
                return 'e.g., Passport application/renewal, Travel abroad for [Destination], Visa requirements, Overseas employment';
            case 'loan':
                return 'e.g., Bank loan application at [Bank Name], SSS salary loan, Pag-IBIG housing loan, Car loan';
            case 'marriage':
                return 'e.g., Marriage license application, Church wedding requirements, Civil wedding at [Venue]';
            case 'housing':
                return 'e.g., Socialized housing application, NHA requirements, Transfer of property ownership';
            case 'vehicle':
                return 'e.g., New vehicle registration, Transfer of ownership, Renewal of registration';
            case 'voter':
                return 'e.g., Voter registration, Transfer of voting precinct, Election requirement';
            case 'nbi':
                return 'e.g., NBI clearance for employment, NBI clearance for travel abroad, Renewal of NBI clearance';
            default:
                return 'Please provide specific details about your purpose for this clearance.';
        }
    };

    const handlePurposeSelect = (value: string, label: string) => {
        if (value === 'custom') {
            setIsCustomPurpose(true);
        } else {
            setIsCustomPurpose(false);
        }
        setShowPurposeDropdown(false);
        setPurposeSearch('');
        return { value, label };
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