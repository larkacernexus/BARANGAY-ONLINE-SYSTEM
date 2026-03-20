import React from 'react';
import { User, Mail, Phone, Home, Briefcase } from 'lucide-react';
import { InfoRow } from './InfoRow';
import { ProfileUserData } from './types';

interface PersonalTabProps {
  user: ProfileUserData;
  resident?: ProfileUserData['resident'];
}

export const PersonalTab = ({ user, resident }: PersonalTabProps) => (
  <>
    <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
    <p className="text-sm text-muted-foreground mb-4">Your basic personal details</p>
    <div className="divide-y divide-border/50">
      <InfoRow label="Full Name" value={user.full_name} icon={User} />
      <InfoRow label="Email Address" value={user.email} icon={Mail} />
      <InfoRow label="Contact Number" value={resident?.contact_number || user.contact_number} icon={Phone} />
      <InfoRow label="Address" value={resident?.address} icon={Home} />
      {user.position && <InfoRow label="Position" value={user.position} icon={Briefcase} />}
      {user.department && <InfoRow label="Department" value={user.department.name} icon={Briefcase} />}
    </div>
  </>
);