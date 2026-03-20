import React from 'react';
import { Home, Users, UserCheck, Briefcase, Phone, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoRow } from './InfoRow';
import { ProfileUserData } from './types';

interface HouseholdTabProps {
  household?: ProfileUserData['resident']['household'];
  purok?: ProfileUserData['resident']['purok'] | ProfileUserData['resident']['household']['purok'];
  isHeadOfHousehold: boolean;
}

export const HouseholdTab = ({ household, purok, isHeadOfHousehold }: HouseholdTabProps) => {
  if (!household) {
    return (
      <Alert>
        <AlertDescription>No household assigned.</AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <h3 className="text-lg font-semibold mb-4">Household Information</h3>
      <p className="text-sm text-muted-foreground mb-4">Your household details</p>
      
      <div className="space-y-6">
        <div className="divide-y divide-border/50">
          {household.household_number && (
            <InfoRow label="Household Number" value={household.household_number} icon={Home} />
          )}
          <InfoRow label="Address" value={household.full_address || household.address} icon={Home} />
          {purok && <InfoRow label="Purok" value={purok.name} icon={Home} />}
          {household.member_count !== undefined && (
            <InfoRow label="Member Count" value={household.member_count} icon={Users} />
          )}
          {household.head_of_household?.full_name && (
            <InfoRow 
              label="Head of Household" 
              value={
                <span>
                  {household.head_of_household.full_name}
                  {isHeadOfHousehold && <Badge className="ml-2 text-xs">You</Badge>}
                </span>
              } 
              icon={UserCheck} 
            />
          )}
          {household.income_range && (
            <InfoRow label="Income Range" value={household.income_range} icon={Briefcase} />
          )}
          
          <div className="py-3">
            <p className="text-sm text-muted-foreground mb-3">Amenities</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <span className="text-xs text-muted-foreground">Electricity</span>
                <Badge variant={household.electricity ? "default" : "secondary"} className="mt-1 block w-fit">
                  {household.electricity ? 'Available' : 'Not Available'}
                </Badge>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Internet</span>
                <Badge variant={household.internet ? "default" : "secondary"} className="mt-1 block w-fit">
                  {household.internet ? 'Available' : 'Not Available'}
                </Badge>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Vehicle</span>
                <Badge variant={household.vehicle ? "default" : "secondary"} className="mt-1 block w-fit">
                  {household.vehicle ? 'Available' : 'Not Available'}
                </Badge>
              </div>
            </div>
          </div>
          
          {household.contact_number && (
            <InfoRow label="Household Contact" value={household.contact_number} icon={Phone} />
          )}
          {household.email && (
            <InfoRow label="Household Email" value={household.email} icon={Mail} />
          )}
          {household.remarks && (
            <div className="py-3">
              <p className="text-sm text-muted-foreground mb-2">Household Remarks</p>
              <p className="text-sm bg-muted/30 p-3 rounded-md">{household.remarks}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};