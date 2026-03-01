// components/portal/records/ResidentSelector.tsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { User } from 'lucide-react';
import { Resident } from '@/types/portal/records/records';

interface ResidentSelectorProps {
  residents: Resident[];
  value: string;
  onChange: (value: string) => void;
  processing: boolean;
  error?: string;
}

export function ResidentSelector({ residents, value, onChange, processing, error }: ResidentSelectorProps) {
  return (
    <Card className="dark:bg-gray-900 dark:border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 dark:text-white">
          <User className="h-5 w-5" />
          Resident Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="resident_id" className="dark:text-gray-300">Select Resident *</Label>
          <select
            id="resident_id"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
            required
            disabled={processing}
          >
            <option value="">Choose a resident...</option>
            {residents.map((resident) => (
              <option key={resident.id} value={resident.id}>
                {resident.first_name} {resident.last_name}
              </option>
            ))}
          </select>
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}