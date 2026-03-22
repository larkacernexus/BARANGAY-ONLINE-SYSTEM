// resources/js/data/blotterIncidentTypes.ts

export interface BlotterIncidentType {
    id: string;
    code: string;
    name: string;
    category: string;
    description: string;
    priority_level: number; // 1-5 (1=highest, 5=lowest)
    resolution_days: number;
    requires_evidence: boolean;
    requires_respondent: boolean;
    is_active: boolean;
    icon?: string;
    color?: string;
    legal_basis?: string;
    penalties?: string[];
    filing_fee?: number;
}

export const BLOTTER_INCIDENT_TYPES: BlotterIncidentType[] = [
    // ========== CRIMES AGAINST PERSON ==========
    {
        id: '1',
        code: 'MURDER',
        name: 'Murder',
        category: 'Crimes Against Person',
        description: 'Unlawful killing of a person with intent',
        priority_level: 1,
        resolution_days: 60,
        requires_evidence: true,
        requires_respondent: true,
        is_active: true,
        icon: 'Skull',
        color: '#DC2626',
        legal_basis: 'Article 248, Revised Penal Code',
        penalties: ['Reclusion Perpetua', 'Life Imprisonment'],
        filing_fee: 0
    },
    {
        id: '2',
        code: 'HOMICIDE',
        name: 'Homicide',
        category: 'Crimes Against Person',
        description: 'Unlawful killing of a person without intent',
        priority_level: 1,
        resolution_days: 60,
        requires_evidence: true,
        requires_respondent: true,
        is_active: true,
        icon: 'Skull',
        color: '#B91C1C',
        legal_basis: 'Article 249, Revised Penal Code',
        penalties: ['Reclusion Temporal'],
        filing_fee: 0
    },
    {
        id: '3',
        code: 'PHYSICAL_INJURY',
        name: 'Physical Injury',
        category: 'Crimes Against Person',
        description: 'Causing physical harm to another person',
        priority_level: 2,
        resolution_days: 30,
        requires_evidence: true,
        requires_respondent: true,
        is_active: true,
        icon: 'Bandage',
        color: '#F97316',
        legal_basis: 'Articles 262-266, Revised Penal Code',
        penalties: ['Arresto Mayor to Prision Correccional', 'Fine'],
        filing_fee: 0
    },
    {
        id: '4',
        code: 'ASSAULT',
        name: 'Assault',
        category: 'Crimes Against Person',
        description: 'Attempted or threatened physical attack',
        priority_level: 2,
        resolution_days: 30,
        requires_evidence: false,
        requires_respondent: true,
        is_active: true,
        icon: 'Fist',
        color: '#F97316',
        legal_basis: 'Article 263, Revised Penal Code',
        penalties: ['Arresto Mayor', 'Fine'],
        filing_fee: 0
    },
    {
        id: '5',
        code: 'HARASSMENT',
        name: 'Harassment',
        category: 'Crimes Against Person',
        description: 'Repeated unwanted conduct that causes distress',
        priority_level: 3,
        resolution_days: 15,
        requires_evidence: false,
        requires_respondent: true,
        is_active: true,
        icon: 'AlertCircle',
        color: '#FBBF24',
        legal_basis: 'Anti-Harassment Act (RA 11313)',
        penalties: ['Fine', 'Community Service'],
        filing_fee: 0
    },
    {
        id: '6',
        code: 'THREATS',
        name: 'Threats',
        category: 'Crimes Against Person',
        description: 'Verbal or written threats to cause harm',
        priority_level: 2,
        resolution_days: 15,
        requires_evidence: false,
        requires_respondent: true,
        is_active: true,
        icon: 'AlertTriangle',
        color: '#F97316',
        legal_basis: 'Articles 282-283, Revised Penal Code',
        penalties: ['Arresto Mayor', 'Fine'],
        filing_fee: 0
    },
    {
        id: '7',
        code: 'DOMESTIC_VIOLENCE',
        name: 'Domestic Violence',
        category: 'Crimes Against Person',
        description: 'Violence committed within the family/home',
        priority_level: 1,
        resolution_days: 30,
        requires_evidence: true,
        requires_respondent: true,
        is_active: true,
        icon: 'Heart',
        color: '#DC2626',
        legal_basis: 'VAWC Act (RA 9262)',
        penalties: ['Imprisonment', 'Fine', 'Protection Order'],
        filing_fee: 0
    },
    {
        id: '8',
        code: 'CHILD_ABUSE',
        name: 'Child Abuse',
        category: 'Crimes Against Person',
        description: 'Physical, emotional, or sexual abuse of a minor',
        priority_level: 1,
        resolution_days: 45,
        requires_evidence: true,
        requires_respondent: true,
        is_active: true,
        icon: 'Baby',
        color: '#DC2626',
        legal_basis: 'Child Abuse Law (RA 7610)',
        penalties: ['Imprisonment', 'Fine', 'Loss of Parental Authority'],
        filing_fee: 0
    },
    {
        id: '9',
        code: 'SEXUAL_HARASSMENT',
        name: 'Sexual Harassment',
        category: 'Crimes Against Person',
        description: 'Unwanted sexual advances or conduct',
        priority_level: 1,
        resolution_days: 30,
        requires_evidence: true,
        requires_respondent: true,
        is_active: true,
        icon: 'Ban',
        color: '#DC2626',
        legal_basis: 'Anti-Sexual Harassment Act (RA 7877)',
        penalties: ['Imprisonment', 'Fine', 'Administrative Liability'],
        filing_fee: 0
    },

    // ========== CRIMES AGAINST PROPERTY ==========
    {
        id: '10',
        code: 'THEFT',
        name: 'Theft',
        category: 'Crimes Against Property',
        description: 'Taking of personal property without consent',
        priority_level: 2,
        resolution_days: 30,
        requires_evidence: true,
        requires_respondent: true,
        is_active: true,
        icon: 'Package',
        color: '#F97316',
        legal_basis: 'Article 308, Revised Penal Code',
        penalties: ['Prison Correccional', 'Fine', 'Restitution'],
        filing_fee: 0
    },
    {
        id: '11',
        code: 'ROBBERY',
        name: 'Robbery',
        category: 'Crimes Against Property',
        description: 'Taking of property through force or intimidation',
        priority_level: 1,
        resolution_days: 45,
        requires_evidence: true,
        requires_respondent: true,
        is_active: true,
        icon: 'Gun',
        color: '#DC2626',
        legal_basis: 'Article 293, Revised Penal Code',
        penalties: ['Reclusion Temporal', 'Fine'],
        filing_fee: 0
    },
    {
        id: '12',
        code: 'BURGLARY',
        name: 'Burglary',
        category: 'Crimes Against Property',
        description: 'Breaking and entering with intent to commit crime',
        priority_level: 2,
        resolution_days: 30,
        requires_evidence: true,
        requires_respondent: true,
        is_active: true,
        icon: 'Door',
        color: '#F97316',
        legal_basis: 'Article 299, Revised Penal Code',
        penalties: ['Prision Mayor', 'Fine'],
        filing_fee: 0
    },
    {
        id: '13',
        code: 'VANDALISM',
        name: 'Vandalism',
        category: 'Crimes Against Property',
        description: 'Willful destruction or defacement of property',
        priority_level: 3,
        resolution_days: 15,
        requires_evidence: true,
        requires_respondent: true,
        is_active: true,
        icon: 'Spray',
        color: '#FBBF24',
        legal_basis: 'Anti-Vandalism Act',
        penalties: ['Fine', 'Community Service', 'Restitution'],
        filing_fee: 0
    },
    {
        id: '14',
        code: 'TRESPASSING',
        name: 'Trespassing',
        category: 'Crimes Against Property',
        description: 'Unauthorized entry onto another\'s property',
        priority_level: 3,
        resolution_days: 15,
        requires_evidence: false,
        requires_respondent: true,
        is_active: true,
        icon: 'Footprints',
        color: '#FBBF24',
        legal_basis: 'Article 280, Revised Penal Code',
        penalties: ['Arresto Mayor', 'Fine'],
        filing_fee: 0
    },
    {
        id: '15',
        code: 'PROPERTY_DAMAGE',
        name: 'Property Damage',
        category: 'Crimes Against Property',
        description: 'Malicious destruction of property',
        priority_level: 3,
        resolution_days: 15,
        requires_evidence: true,
        requires_respondent: true,
        is_active: true,
        icon: 'Hammer',
        color: '#FBBF24',
        legal_basis: 'Article 327, Revised Penal Code',
        penalties: ['Fine', 'Restitution'],
        filing_fee: 0
    },
    {
        id: '16',
        code: 'ARSON',
        name: 'Arson',
        category: 'Crimes Against Property',
        description: 'Intentional setting of fires',
        priority_level: 1,
        resolution_days: 60,
        requires_evidence: true,
        requires_respondent: true,
        is_active: true,
        icon: 'Flame',
        color: '#DC2626',
        legal_basis: 'Presidential Decree 1613',
        penalties: ['Reclusion Perpetua', 'Fine'],
        filing_fee: 0
    },

    // ========== CRIMES AGAINST PUBLIC ORDER ==========
    {
        id: '17',
        code: 'ILLEGAL_GAMBLING',
        name: 'Illegal Gambling',
        category: 'Crimes Against Public Order',
        description: 'Unauthorized gambling activities',
        priority_level: 3,
        resolution_days: 15,
        requires_evidence: true,
        requires_respondent: true,
        is_active: true,
        icon: 'Dices',
        color: '#FBBF24',
        legal_basis: 'PD 1602',
        penalties: ['Fine', 'Imprisonment'],
        filing_fee: 0
    },
    {
        id: '18',
        code: 'ILLEGAL_DRUGS',
        name: 'Illegal Drugs',
        category: 'Crimes Against Public Order',
        description: 'Possession, use, or sale of illegal substances',
        priority_level: 1,
        resolution_days: 45,
        requires_evidence: true,
        requires_respondent: true,
        is_active: true,
        icon: 'Pill',
        color: '#DC2626',
        legal_basis: 'Comprehensive Dangerous Drugs Act (RA 9165)',
        penalties: ['Life Imprisonment', 'Fine'],
        filing_fee: 0
    },
    {
        id: '19',
        code: 'PUBLIC_INTOXICATION',
        name: 'Public Intoxication',
        category: 'Crimes Against Public Order',
        description: 'Being drunk in public places',
        priority_level: 4,
        resolution_days: 3,
        requires_evidence: false,
        requires_respondent: true,
        is_active: true,
        icon: 'Wine',
        color: '#9CA3AF',
        legal_basis: 'Barangay Ordinance',
        penalties: ['Fine', 'Community Service'],
        filing_fee: 0
    },
    {
        id: '20',
        code: 'PUBLIC_SCANDAL',
        name: 'Public Scandal',
        category: 'Crimes Against Public Order',
        description: 'Behavior that causes public disturbance',
        priority_level: 3,
        resolution_days: 7,
        requires_evidence: false,
        requires_respondent: true,
        is_active: true,
        icon: 'Megaphone',
        color: '#FBBF24',
        legal_basis: 'Article 153, Revised Penal Code',
        penalties: ['Arresto Mayor', 'Fine'],
        filing_fee: 0
    },

    // ========== DISPUTES ==========
    {
        id: '21',
        code: 'BOUNDARY_DISPUTE',
        name: 'Boundary Dispute',
        category: 'Disputes',
        description: 'Disagreement over property boundaries',
        priority_level: 3,
        resolution_days: 30,
        requires_evidence: true,
        requires_respondent: true,
        is_active: true,
        icon: 'MapPin',
        color: '#8B5CF6',
        legal_basis: 'Civil Code',
        penalties: ['Mediation', 'Arbitration'],
        filing_fee: 0
    },
    {
        id: '22',
        code: 'LAND_DISPUTE',
        name: 'Land Dispute',
        category: 'Disputes',
        description: 'Conflict over land ownership or rights',
        priority_level: 2,
        resolution_days: 45,
        requires_evidence: true,
        requires_respondent: true,
        is_active: true,
        icon: 'Mountain',
        color: '#8B5CF6',
        legal_basis: 'Property Registration Decree',
        penalties: ['Court Adjudication'],
        filing_fee: 0
    },
    {
        id: '23',
        code: 'COLLECTION_DISPUTE',
        name: 'Collection Dispute',
        category: 'Disputes',
        description: 'Disagreement over debt collection',
        priority_level: 3,
        resolution_days: 15,
        requires_evidence: true,
        requires_respondent: true,
        is_active: true,
        icon: 'Coins',
        color: '#10B981',
        legal_basis: 'Civil Code',
        penalties: ['Payment', 'Compromise'],
        filing_fee: 0
    },
    {
        id: '24',
        code: 'LOAN_DISPUTE',
        name: 'Loan Dispute',
        category: 'Disputes',
        description: 'Conflict over loan agreements',
        priority_level: 3,
        resolution_days: 15,
        requires_evidence: true,
        requires_respondent: true,
        is_active: true,
        icon: 'HandCoins',
        color: '#10B981',
        legal_basis: 'Civil Code',
        penalties: ['Payment', 'Interest'],
        filing_fee: 0
    },
    {
        id: '25',
        code: 'MARITAL_DISPUTE',
        name: 'Marital Dispute',
        category: 'Disputes',
        description: 'Conflict between spouses',
        priority_level: 3,
        resolution_days: 20,
        requires_evidence: false,
        requires_respondent: true,
        is_active: true,
        icon: 'Heart',
        color: '#EC4899',
        legal_basis: 'Family Code',
        penalties: ['Counseling', 'Mediation'],
        filing_fee: 0
    },
    {
        id: '26',
        code: 'CHILD_CUSTODY',
        name: 'Child Custody',
        category: 'Disputes',
        description: 'Dispute over child custody arrangements',
        priority_level: 2,
        resolution_days: 30,
        requires_evidence: true,
        requires_respondent: true,
        is_active: true,
        icon: 'Users',
        color: '#EC4899',
        legal_basis: 'Family Code',
        penalties: ['Court Order'],
        filing_fee: 0
    },
    {
        id: '27',
        code: 'SUPPORT_ISSUES',
        name: 'Support Issues',
        category: 'Disputes',
        description: 'Non-payment of child or spousal support',
        priority_level: 2,
        resolution_days: 20,
        requires_evidence: true,
        requires_respondent: true,
        is_active: true,
        icon: 'HeartHandshake',
        color: '#EC4899',
        legal_basis: 'Family Code',
        penalties: ['Wage Garnishment', 'Contempt'],
        filing_fee: 0
    },

    // ========== TRAFFIC/ACCIDENTS ==========
    {
        id: '28',
        code: 'TRAFFIC_ACCIDENT',
        name: 'Traffic Accident',
        category: 'Traffic/Accidents',
        description: 'Vehicular accident with or without injury',
        priority_level: 2,
        resolution_days: 15,
        requires_evidence: true,
        requires_respondent: true,
        is_active: true,
        icon: 'Car',
        color: '#3B82F6',
        legal_basis: 'Traffic Code',
        penalties: ['Fine', 'License Suspension'],
        filing_fee: 0
    },
    {
        id: '29',
        code: 'HIT_AND_RUN',
        name: 'Hit and Run',
        category: 'Traffic/Accidents',
        description: 'Leaving the scene of an accident',
        priority_level: 1,
        resolution_days: 30,
        requires_evidence: true,
        requires_respondent: true,
        is_active: true,
        icon: 'CarFront',
        color: '#DC2626',
        legal_basis: 'Revised Penal Code',
        penalties: ['Imprisonment', 'Fine'],
        filing_fee: 0
    },

    // ========== ORDINANCE VIOLATIONS ==========
    {
        id: '30',
        code: 'CURFEW_VIOLATION',
        name: 'Curfew Violation',
        category: 'Ordinance Violations',
        description: 'Violation of curfew hours',
        priority_level: 4,
        resolution_days: 2,
        requires_evidence: false,
        requires_respondent: true,
        is_active: true,
        icon: 'Clock',
        color: '#9CA3AF',
        legal_basis: 'Barangay Ordinance',
        penalties: ['Warning', 'Fine', 'Community Service'],
        filing_fee: 0
    },
    {
        id: '31',
        code: 'LIQUOR_BAN',
        name: 'Liquor Ban Violation',
        category: 'Ordinance Violations',
        description: 'Selling or drinking liquor during banned hours',
        priority_level: 4,
        resolution_days: 3,
        requires_evidence: true,
        requires_respondent: true,
        is_active: true,
        icon: 'Wine',
        color: '#9CA3AF',
        legal_basis: 'Barangay Ordinance',
        penalties: ['Fine', 'Confiscation'],
        filing_fee: 0
    },
    {
        id: '32',
        code: 'NOISE_ORDINANCE',
        name: 'Noise Ordinance Violation',
        category: 'Ordinance Violations',
        description: 'Excessive noise disturbing the peace',
        priority_level: 4,
        resolution_days: 3,
        requires_evidence: true,
        requires_respondent: true,
        is_active: true,
        icon: 'Volume2',
        color: '#9CA3AF',
        legal_basis: 'Barangay Ordinance',
        penalties: ['Warning', 'Fine'],
        filing_fee: 0
    },
    {
        id: '33',
        code: 'WASTE_MANAGEMENT',
        name: 'Waste Management Violation',
        category: 'Ordinance Violations',
        description: 'Improper waste disposal',
        priority_level: 4,
        resolution_days: 3,
        requires_evidence: true,
        requires_respondent: true,
        is_active: true,
        icon: 'Trash2',
        color: '#9CA3AF',
        legal_basis: 'Ecological Solid Waste Management Act',
        penalties: ['Fine', 'Community Service'],
        filing_fee: 0
    },

    // ========== OTHERS ==========
    {
        id: '34',
        code: 'OTHERS',
        name: 'Others',
        category: 'Others',
        description: 'Other incidents not classified above',
        priority_level: 5,
        resolution_days: 10,
        requires_evidence: false,
        requires_respondent: false,
        is_active: true,
        icon: 'HelpCircle',
        color: '#6B7280',
        filing_fee: 0
    }
];

// Helper functions
export const getIncidentTypeByCode = (code: string): BlotterIncidentType | undefined => {
    return BLOTTER_INCIDENT_TYPES.find(type => type.code === code);
};

export const getIncidentTypeById = (id: string): BlotterIncidentType | undefined => {
    return BLOTTER_INCIDENT_TYPES.find(type => type.id === id);
};

export const getIncidentTypesByCategory = (category: string): BlotterIncidentType[] => {
    return BLOTTER_INCIDENT_TYPES.filter(type => type.category === category);
};

export const getCategories = (): string[] => {
    return [...new Set(BLOTTER_INCIDENT_TYPES.map(type => type.category))];
};

export const getActiveIncidentTypes = (): BlotterIncidentType[] => {
    return BLOTTER_INCIDENT_TYPES.filter(type => type.is_active);
};

export const getPriorityLevelLabel = (level: number): string => {
    const labels: Record<number, string> = {
        1: 'Critical',
        2: 'High',
        3: 'Medium',
        4: 'Low',
        5: 'Very Low'
    };
    return labels[level] || 'Unknown';
};

export const getPriorityLevelColor = (level: number): string => {
    const colors: Record<number, string> = {
        1: 'bg-red-100 text-red-800 border-red-200',
        2: 'bg-orange-100 text-orange-800 border-orange-200',
        3: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        4: 'bg-blue-100 text-blue-800 border-blue-200',
        5: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
};