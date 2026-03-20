import React from 'react';
import { Camera, Home, Users, Mail, Phone } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { getInitials, formatDate, getAvatarUrl } from './utils';
import { ProfileUserData } from './types';

interface ProfileSidebarProps {
  user: ProfileUserData;
  resident?: ProfileUserData['resident'];
  household?: ProfileUserData['resident']['household'];
  purok?: ProfileUserData['resident']['purok'] | ProfileUserData['resident']['household']['purok'];
  barangayEmail?: string;
  barangayContact?: string;
}

export const ProfileSidebar = ({ 
  user, 
  resident, 
  household, 
  purok,
  barangayEmail = "barangay.hall@example.com",
  barangayContact = "(02) 1234-5678",
}: ProfileSidebarProps) => {
  const avatarUrl = getAvatarUrl(resident?.photo_path);

  // Clean phone number for tel: link (remove non-numeric)
  const cleanPhone = barangayContact.replace(/\D/g, '');

  return (
    <div className="space-y-6">
      {/* Avatar Section */}
      <div className="flex flex-col items-center text-center">
        <Avatar className="h-24 w-24 border-4 border-background">
          <AvatarImage src={avatarUrl || ''} alt={user.full_name} />
          <AvatarFallback className="bg-primary/10 text-primary text-xl">
            {getInitials(user.full_name)}
          </AvatarFallback>
        </Avatar>
        <h3 className="mt-4 font-semibold text-lg">{user.full_name}</h3>
        {user.role && (
          <p className="text-sm text-muted-foreground">{user.role.name}</p>
        )}
        {resident?.resident_id && (
          <Badge variant="outline" className="mt-2 text-xs font-mono">
            ID: {resident.resident_id}
          </Badge>
        )}
      </div>

      <Separator />

      {/* Quick Stats */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Member since</span>
          <span className="font-medium">{formatDate(user.created_at).split(',')[0]}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Last updated</span>
          <span className="font-medium">{formatDate(user.updated_at).split(',')[0]}</span>
        </div>
        {household?.member_count && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Household size</span>
            <span className="font-medium">{household.member_count} members</span>
          </div>
        )}
        {purok && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Purok</span>
            <span className="font-medium">{purok.name}</span>
          </div>
        )}
      </div>

      {/* Photo Management Message */}
      <Alert className="bg-muted/50 border-0 p-3">
        <Camera className="h-4 w-4" />
        <AlertDescription className="text-xs">
          Profile photos are managed by the administration team.
        </AlertDescription>
      </Alert>

      {/* Simple Profile Change Reminder with Clickable Links */}
      <Alert className="border-amber-200 bg-amber-50 py-3">
        <AlertDescription>
          <div className="text-xs text-amber-800 space-y-2">
            <p className="font-medium">For profile corrections:</p>
            
            {/* Clickable Email */}
            <div className="flex items-center gap-2">
              <Mail className="h-3 w-3 flex-shrink-0" />
              <a 
                href={`mailto:${barangayEmail}`}
                className="hover:underline hover:text-amber-900 transition-colors break-all"
                title={`Send email to ${barangayEmail}`}
              >
                {barangayEmail}
              </a>
            </div>
            
            {/* Clickable Phone */}
            <div className="flex items-center gap-2">
              <Phone className="h-3 w-3 flex-shrink-0" />
              <a 
                href={`tel:${cleanPhone}`}
                className="hover:underline hover:text-amber-900 transition-colors"
                title={`Call ${barangayContact}`}
              >
                {barangayContact}
              </a>
            </div>
            
            <p className="text-[10px] text-amber-600 pt-1">
              Admin updates only
            </p>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};