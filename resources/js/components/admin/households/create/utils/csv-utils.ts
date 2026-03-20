// components/admin/households/create/utils/csv-utils.ts
export const downloadTemplate = () => {
    const headers = [
        'household_number',
        'head_first_name',
        'head_last_name',
        'head_middle_name',
        'contact_number',
        'email',
        'address',
        'purok_name',
        'member_count',
        'income_range',
        'housing_type',
        'ownership_status',
        'water_source',
        'electricity',
        'internet',
        'vehicle',
        'remarks',
        'member_1_name',
        'member_1_relationship',
        'member_1_age',
        'member_2_name',
        'member_2_relationship',
        'member_2_age',
        'member_3_name',
        'member_3_relationship',
        'member_3_age',
        'member_4_name',
        'member_4_relationship',
        'member_4_age',
        'member_5_name',
        'member_5_relationship',
        'member_5_age',
    ];

    const sampleData = [
        [
            'HH-2024-00001',
            'Juan',
            'Dela Cruz',
            'Santos',
            '09123456789',
            'juan.delacruz@email.com',
            '123 Mabini St.',
            'Purok 1',
            '4',
            '₱10,000 - ₱20,000',
            'Concrete',
            'Owned',
            'Level III (Waterworks System)',
            'TRUE',
            'TRUE',
            'FALSE',
            '',
            'Maria Dela Cruz',
            'Spouse',
            '35',
            'Jose Dela Cruz',
            'Son',
            '10',
            'Ana Dela Cruz',
            'Daughter',
            '8',
            '',
            '',
            '',
            '',
            '',
            '',
        ]
    ];

    const csvContent = [
        headers.join(','),
        ...sampleData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'household_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
};

export const downloadEmptyTemplate = () => {
    const headers = [
        'household_number',
        'head_first_name',
        'head_last_name',
        'head_middle_name',
        'contact_number',
        'email',
        'address',
        'purok_name',
        'member_count',
        'income_range',
        'housing_type',
        'ownership_status',
        'water_source',
        'electricity',
        'internet',
        'vehicle',
        'remarks',
        'member_1_name',
        'member_1_relationship',
        'member_1_age',
        'member_2_name',
        'member_2_relationship',
        'member_2_age',
        'member_3_name',
        'member_3_relationship',
        'member_3_age',
        'member_4_name',
        'member_4_relationship',
        'member_4_age',
        'member_5_name',
        'member_5_relationship',
        'member_5_age',
    ];

    const csvContent = headers.join(',');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'household_import_template_empty.csv';
    a.click();
    window.URL.revokeObjectURL(url);
};

export const downloadGuide = () => {
    const guideContent = `HOUSEHOLD IMPORT GUIDE

This guide explains how to properly format your CSV file for importing households.

FILE FORMAT: CSV (Comma Separated Values)
Maximum file size: 10MB
Maximum rows: 1000

COLUMN DESCRIPTIONS:

1. household_number - Optional. Format: HH-YYYY-XXXXX (e.g., HH-2024-00001)
2. head_first_name - Required. First name of household head
3. head_last_name - Required. Last name of household head
4. head_middle_name - Optional. Middle name of household head
5. contact_number - Required. Primary contact number (e.g., 09123456789)
6. email - Optional. Email address
7. address - Required. Complete street address
8. purok_name - Required. Must match existing purok names in system
9. member_count - Required. Total number of household members (including head)
10. income_range - Optional. One of: Below ₱10,000, ₱10,000 - ₱20,000, ₱20,000 - ₱30,000, ₱30,000 - ₱50,000, ₱50,000 - ₱100,000, Above ₱100,000
11. housing_type - Optional. One of: Concrete, Semi-concrete, Wood, Nipa/Bamboo, Mixed Materials, Others
12. ownership_status - Optional. One of: Owned, Rented, Free Use, With Consent, Government Housing
13. water_source - Optional. One of: Level I (Point Source), Level II (Communal Faucet), Level III (Waterworks System), Deep Well, Shallow Well, Spring, Others
14. electricity - Optional. TRUE or FALSE
15. internet - Optional. TRUE or FALSE
16. vehicle - Optional. TRUE or FALSE
17. remarks - Optional. Additional notes

MEMBER COLUMNS (member_1_name to member_5_age):
- You can include up to 5 members per row (excluding head)
- For each member, provide: name, relationship, age
- Relationship options: Spouse, Son, Daughter, Father, Mother, Brother, Sister, Grandparent, Grandchild, Other Relative, Non-relative

IMPORTANT NOTES:
1. The household head is specified separately and should NOT be included in member columns
2. Member count must equal 1 (head) + number of members provided
3. All TRUE/FALSE values must be in uppercase
4. Dates should be in YYYY-MM-DD format
5. Existing residents will be matched by name (first + last) if they exist
6. New residents will be created automatically if they don't exist

For technical support, contact the system administrator.`;

    const blob = new Blob([guideContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'household_import_guide.txt';
    a.click();
    window.URL.releaseObjectURL(url);
};