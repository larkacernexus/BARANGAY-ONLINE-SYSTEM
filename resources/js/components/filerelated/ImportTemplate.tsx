import React, { useState } from 'react';
import { Download, FileSpreadsheet, Info, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ImportTemplateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export default function ImportTemplateModal({
  open,
  onOpenChange,
  trigger,
}: ImportTemplateModalProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('required');

  // CSV template structure matching the residents table
  const csvTemplate = `first_name,last_name,middle_name,suffix,birth_date,gender,civil_status,contact_number,email,address,purok_id,household_id,occupation,education,religion,is_voter,is_pwd,is_senior,place_of_birth,remarks,status
Juan,Dela Cruz,Santos,Jr.,1990-05-15,male,single,09123456789,juan@example.com,123 Main Street,1,1,Farmer,College Graduate,Roman Catholic,1,0,0,Manila City,"Active resident",
Maria,Santos,,,1985-08-20,female,married,09187654321,maria@example.com,456 Oak Street,2,2,Teacher,College Graduate,Roman Catholic,1,0,0,Quezon City,,
Pedro,Gonzales,Reyes,,1978-03-10,male,married,09151112222,,789 Pine Street,3,,Driver,High School Graduate,Roman Catholic,0,1,0,Cebu City,PWD ID: 2023-001,
Ana,Ramos,Tan,,1955-11-30,female,widowed,09223334444,ana@example.com,321 Maple Street,4,3,Retired,College Graduate,Roman Catholic,1,0,1,Davao City,Senior Citizen`;

  // Field descriptions for guidance
  const fieldDescriptions = [
    { field: 'first_name', required: true, description: 'First name of the resident' },
    { field: 'last_name', required: true, description: 'Last name of the resident' },
    { field: 'middle_name', required: false, description: 'Middle name (optional)' },
    { field: 'suffix', required: false, description: 'Suffix (Jr., Sr., III, etc.)' },
    { field: 'birth_date', required: true, description: 'Date of birth in YYYY-MM-DD format' },
    { field: 'gender', required: true, description: 'male, female, or other' },
    { field: 'civil_status', required: true, description: 'single, married, widowed, separated, annulled' },
    { field: 'contact_number', required: true, description: '11-digit mobile number (e.g., 09123456789)' },
    { field: 'email', required: false, description: 'Email address (optional)' },
    { field: 'address', required: true, description: 'Complete address including house number and street' },
    { field: 'purok_id', required: true, description: 'Purok ID number (must exist in database)' },
    { field: 'household_id', required: false, description: 'Household ID number (if resident belongs to existing household)' },
    { field: 'occupation', required: false, description: 'Occupation/profession' },
    { field: 'education', required: false, description: 'Highest educational attainment' },
    { field: 'religion', required: false, description: 'Religion' },
    { field: 'is_voter', required: true, description: '1 if registered voter, 0 if not' },
    { field: 'is_pwd', required: true, description: '1 if person with disability, 0 if not' },
    { field: 'is_senior', required: true, description: '1 if senior citizen (60+ years old), 0 if not' },
    { field: 'place_of_birth', required: false, description: 'Place of birth (City/Municipality, Province)' },
    { field: 'remarks', required: false, description: 'Additional notes or comments' },
    { field: 'status', required: false, description: 'active or inactive (defaults to active if not specified)' },
  ];

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Download CSV template
  const downloadTemplate = () => {
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

  // Download detailed guide
  const downloadGuide = () => {
    const guideContent = `RESIDENTS IMPORT GUIDE
===========================

REQUIRED FORMAT: CSV (Comma Separated Values)
ENCODING: UTF-8

MANDATORY FIELDS (must be filled):
-----------------------------------
1. first_name    - First name
2. last_name     - Last name
3. birth_date    - Format: YYYY-MM-DD
4. gender        - Options: male, female, other
5. civil_status  - Options: single, married, widowed, separated, annulled
6. contact_number - 11-digit mobile number
7. address       - Complete address
8. purok_id      - Purok ID must exist in database
9. is_voter      - 1 for yes, 0 for no
10. is_pwd       - 1 for yes, 0 for no
11. is_senior    - 1 for yes, 0 for no

OPTIONAL FIELDS (can be left empty):
-------------------------------------
- middle_name
- suffix
- email
- household_id
- occupation
- education
- religion
- place_of_birth
- remarks
- status

IMPORTANT NOTES:
----------------
1. Do NOT include: id, resident_id, photo_path, age, created_at, updated_at
2. These are auto-generated or calculated
3. household_id must exist in households table or leave empty
4. purok_id must exist in puroks table
5. Boolean fields: 1 = true, 0 = false

VALIDATION RULES:
-----------------
- Email addresses must be valid format
- Contact numbers must be 11 digits
- Birth dates must be valid
- Age will be auto-calculated from birth_date
- Status defaults to 'active' if not specified

ERROR HANDLING:
---------------
If any row has errors, that specific row will be skipped.
Check the import report for details on any skipped rows.

SAMPLE DATA:
------------
first_name,last_name,middle_name,suffix,birth_date,gender,civil_status,contact_number,email,address,purok_id,household_id,occupation,education,religion,is_voter,is_pwd,is_senior,place_of_birth,remarks,status
Juan,Dela Cruz,Santos,Jr.,1990-05-15,male,single,09123456789,juan@example.com,123 Main Street,1,1,Farmer,College Graduate,Roman Catholic,1,0,0,Manila City,"Active resident",active`;

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

  // Download empty template
  const downloadEmptyTemplate = () => {
    const headers = fieldDescriptions.map(f => f.field).join(',');
    const emptyTemplate = headers + '\n' + ','.repeat(fieldDescriptions.length - 1);
    
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

  const TemplateContent = () => (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Download the template below and fill it with your residents data. Make sure to follow the format exactly.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-3">
        <Button onClick={downloadTemplate} className="w-full">
          <Download className="mr-2 h-4 w-4" />
          Template with Samples
        </Button>
        
        <Button onClick={downloadEmptyTemplate} variant="outline" className="w-full">
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Empty Template
        </Button>
        
        <Button onClick={downloadGuide} variant="secondary" className="w-full">
          <FileText className="mr-2 h-4 w-4" />
          Import Guide
        </Button>
      </div>

      {/* Required Fields Section */}
      <Card>
        <CardHeader className="cursor-pointer" onClick={() => toggleSection('required')}>
          <div className="flex items-center justify-between">
            <CardTitle>Required Fields (11 fields)</CardTitle>
            {expandedSection === 'required' ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </div>
          <CardDescription>Click to expand/collapse</CardDescription>
        </CardHeader>
        {expandedSection === 'required' && (
          <CardContent>
            <div className="space-y-2">
              {fieldDescriptions
                .filter(f => f.required)
                .map(field => (
                  <div key={field.field} className="grid grid-cols-3 gap-4 py-2 border-b">
                    <div className="font-medium">{field.field}</div>
                    <div className="col-span-2 text-gray-600">{field.description}</div>
                  </div>
                ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Optional Fields Section */}
      <Card>
        <CardHeader className="cursor-pointer" onClick={() => toggleSection('optional')}>
          <div className="flex items-center justify-between">
            <CardTitle>Optional Fields (10 fields)</CardTitle>
            {expandedSection === 'optional' ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </div>
          <CardDescription>Click to expand/collapse</CardDescription>
        </CardHeader>
        {expandedSection === 'optional' && (
          <CardContent>
            <div className="space-y-2">
              {fieldDescriptions
                .filter(f => !f.required)
                .map(field => (
                  <div key={field.field} className="grid grid-cols-3 gap-4 py-2 border-b">
                    <div className="font-medium">{field.field}</div>
                    <div className="col-span-2 text-gray-600">{field.description}</div>
                  </div>
                ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Sample Data Section */}
      <Card>
        <CardHeader className="cursor-pointer" onClick={() => toggleSection('sample')}>
          <div className="flex items-center justify-between">
            <CardTitle>Sample CSV Data</CardTitle>
            {expandedSection === 'sample' ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </div>
        </CardHeader>
        {expandedSection === 'sample' && (
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm overflow-x-auto">
              <pre className="whitespace-pre-wrap">{csvTemplate.split('\n').slice(0, 5).join('\n')}</pre>
              <p className="mt-2 text-gray-500 italic">... more sample data included in template</p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Important Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Important Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Auto-generated Fields (Do NOT include):</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                <code>id</code>
                <span className="ml-2 text-blue-600">- Auto-incremented</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                <code>resident_id</code>
                <span className="ml-2 text-blue-600">- Auto-generated</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                <code>photo_path</code>
                <span className="ml-2 text-blue-600">- Upload separately</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                <code>age</code>
                <span className="ml-2 text-blue-600">- Calculated</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                <code>created_at</code>
                <span className="ml-2 text-blue-600">- Timestamp</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                <code>updated_at</code>
                <span className="ml-2 text-blue-600">- Timestamp</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-lg">
            <h4 className="font-medium text-amber-800 mb-2">Validation & Limits:</h4>
            <ul className="text-sm text-amber-600 space-y-1 list-disc pl-5">
              <li>CSV must be UTF-8 encoded</li>
              <li>Dates: YYYY-MM-DD format only</li>
              <li>Boolean fields: 1 = true, 0 = false</li>
              <li>Maximum file size: 10MB</li>
              <li>Maximum rows: 1000 per import</li>
              <li>Rows with errors will be skipped</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Residents Import Template</DialogTitle>
          <DialogDescription>
            Download and use this template to import residents in bulk
          </DialogDescription>
        </DialogHeader>
        
        <TemplateContent />
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}