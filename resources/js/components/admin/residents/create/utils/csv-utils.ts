// utils/csv-utils.ts
export const downloadTemplate = () => {
    const csvTemplate = `first_name,last_name,middle_name,suffix,birth_date,gender,civil_status,contact_number,email,address,purok_id,household_id,occupation,education,religion,is_voter,place_of_birth,remarks,status,privileges
Juan,Dela Cruz,Santos,Jr.,1990-05-15,male,single,09123456789,juan@example.com,123 Main Street,1,1,Farmer,College Graduate,Roman Catholic,1,Manila City,"Active resident",active,"SC|PWD"
Maria,Santos,,,1985-08-20,female,married,09187654321,maria@example.com,456 Oak Street,2,2,Teacher,College Graduate,Roman Catholic,1,Quezon City,,active,"SP"
Pedro,Gonzales,Reyes,,1978-03-10,male,married,09151112222,,789 Pine Street,3,,Driver,High School Graduate,Roman Catholic,0,Cebu City,"PWD ID: 2023-001",active,"PWD"
Ana,Ramos,Tan,,1955-11-30,female,widowed,09223334444,ana@example.com,321 Maple Street,4,3,Retired,College Graduate,Roman Catholic,1,Davao City,Senior Citizen,active,"SC|OSP"`;

    const blob = new Blob([csvTemplate], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'residents_import_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
};

export const downloadEmptyTemplate = () => {
    const headers = 'first_name,last_name,middle_name,suffix,birth_date,gender,civil_status,contact_number,email,address,purok_id,household_id,occupation,education,religion,is_voter,place_of_birth,remarks,status,privileges';
    const emptyTemplate = headers + '\n' + ','.repeat(19);
    
    const blob = new Blob([emptyTemplate], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'residents_empty_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
};

export const downloadGuide = (privileges: any[] = []) => {
    const privilegeDetails = privileges.map(p => 
        `  ${p.code.padEnd(10)} - ${p.name}${p.discount_percentage ? ` (${p.discount_percentage}% discount)` : ''}`
    ).join('\n');

    const guideContent = `RESIDENTS IMPORT GUIDE
===========================

REQUIRED FORMAT: CSV (Comma Separated Values)
ENCODING: UTF-8

COLUMN ORDER (20 columns):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 1. first_name     - First name (required)
 2. last_name      - Last name (required)
 3. middle_name    - Middle name (optional)
 4. suffix         - Suffix: Jr., Sr., III, etc. (optional)
 5. birth_date     - Date of birth: YYYY-MM-DD (required)
 6. gender         - male, female, or other (required)
 7. civil_status   - single, married, widowed, separated (required)
 8. contact_number - 11-digit mobile number (required)
 9. email          - Email address (optional)
10. address        - Complete address (required)
11. purok_id       - Purok ID (must exist in database) (required)
12. household_id   - Household ID (optional, must exist or leave empty)
13. occupation     - Occupation/profession (optional)
14. education      - Highest education (optional)
15. religion       - Religion (optional)
16. is_voter       - 1 for yes, 0 for no (required)
17. place_of_birth - City/Municipality, Province (optional)
18. remarks        - Additional notes (optional)
19. status         - active or inactive (optional, defaults to active)
20. privileges     - Pipe-separated privilege codes (e.g., "SC|PWD|4PS") (optional)

AVAILABLE PRIVILEGE CODES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${privilegeDetails}

VALIDATION RULES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Email must be valid format
• Contact numbers must be 11 digits
• Birth dates must be valid (not future dates)
• Purok ID must exist in puroks table
• Household ID must exist in households table or be empty
• Privilege codes must exist in privileges table
• Boolean fields: 1 = yes/true, 0 = no/false

IMPORTANT NOTES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Do NOT include: id, resident_id, photo_path, age, created_at, updated_at
• Age is auto-calculated from birth_date
• Resident ID is auto-generated (format: BRGY-YYYY-XXXX)
• Maximum file size: 10MB
• Maximum rows per import: 1000
• For text containing commas, enclose in double quotes: "Manila, Philippines"

EXAMPLES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Single privilege:   "SC"
Multiple privileges: "SC|PWD|SP"
With special characters: "Manila, Philippines"
With quotes: "John \"Johnny\" Doe"`;

    const blob = new Blob([guideContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'residents_import_guide.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
};