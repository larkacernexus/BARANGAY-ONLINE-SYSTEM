import React from 'react';
import { Calendar, User, Heart, Briefcase, Book, Home, Award, Shield, HeartHandshake, Baby, HandHeart, Users, MapPin, Hash, FileText, Phone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoRow } from './InfoRow';
import { formatDate, calculateAge } from './utils';
import { ProfileUserData } from './types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AdditionalTabProps {
  resident?: ProfileUserData['resident'];
}

// ========== PRIVILEGE HELPER FUNCTIONS ==========

function getPrivilegeIcon(code: string): React.ReactNode {
  const firstChar = (code?.[0] || 'A').toUpperCase();
  
  const iconMap: Record<string, React.ReactNode> = {
    'S': <Award className="h-4 w-4" />,
    'P': <HeartHandshake className="h-4 w-4" />,
    'I': <Home className="h-4 w-4" />,
    'F': <Briefcase className="h-4 w-4" />,
    'O': <Users className="h-4 w-4" />,
    '4': <Heart className="h-4 w-4" />,
    'U': <User className="h-4 w-4" />,
    'A': <Award className="h-4 w-4" />,
    'B': <Award className="h-4 w-4" />,
    'C': <Award className="h-4 w-4" />,
    'D': <Award className="h-4 w-4" />,
    'E': <Award className="h-4 w-4" />,
  };
  
  return iconMap[firstChar] || <Award className="h-4 w-4" />;
}

function getPrivilegeColor(code: string): string {
  const firstChar = (code?.[0] || 'A').toUpperCase().charCodeAt(0);
  const colorIndex = firstChar % 8;
  
  const colors = [
    'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400',
    'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400',
    'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400',
    'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400',
    'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400',
    'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400',
    'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-400',
    'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400',
  ];
  
  return colors[colorIndex] || 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-400';
}

/**
 * Get active privileges from resident
 */
function getActivePrivileges(resident: ProfileUserData['resident']): any[] {
  if (!resident?.privileges || !Array.isArray(resident.privileges)) {
    return [];
  }
  
  return resident.privileges.filter((p: any) => 
    p.status === 'active' || p.status === 'expiring_soon'
  );
}

/**
 * Get privilege badges for display
 */
function getPrivilegeBadges(resident: ProfileUserData['resident']): Array<{ 
  code: string; 
  name: string; 
  icon: React.ReactNode; 
  color: string; 
  id_number?: string;
  discount_percentage?: number;
  expires_at?: string;
}> {
  const activePrivileges = getActivePrivileges(resident);
  
  return activePrivileges.map((p: any) => {
    const privilege = p.privilege || p;
    return {
      code: privilege.code || p.code,
      name: privilege.name || p.name || privilege.code || p.code,
      icon: getPrivilegeIcon(privilege.code || p.code),
      color: getPrivilegeColor(privilege.code || p.code),
      id_number: p.id_number,
      discount_percentage: p.discount_percentage,
      expires_at: p.expires_at
    };
  });
}

export const AdditionalTab = ({ resident }: AdditionalTabProps) => {
  const age = resident?.birth_date ? calculateAge(resident.birth_date) : null;
  
  // Get privilege badges
  const privilegeBadges = resident ? getPrivilegeBadges(resident) : [];

  if (!resident) {
    return (
      <Alert>
        <AlertDescription>No resident profile found.</AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
      <p className="text-sm text-muted-foreground mb-4">Additional personal details</p>
      
      <div className="divide-y divide-border/50">
        <InfoRow 
          label="Birth Date" 
          value={
            <div>
              <div>{formatDate(resident.birth_date)}</div>
              {age && <div className="text-xs text-muted-foreground">{age} years old</div>}
            </div>
          } 
          icon={Calendar} 
        />
        <InfoRow label="Gender" value={resident.gender} icon={User} />
        <InfoRow label="Civil Status" value={resident.civil_status} icon={Heart} />
        <InfoRow label="Occupation" value={resident.occupation} icon={Briefcase} />
        <InfoRow label="Education" value={resident.education} icon={Book} />
        <InfoRow label="Religion" value={resident.religion} icon={Heart} />
        
        {/* DYNAMIC: Privilege badges */}
        {privilegeBadges.length > 0 && (
          <div className="py-3">
            <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
              <Award className="h-4 w-4" />
              Privileges & Benefits
            </h4>
            <div className="flex flex-wrap gap-2">
              {privilegeBadges.map((badge, index) => (
                <TooltipProvider key={index}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge 
                        variant="outline" 
                        className={`text-xs px-2 py-1 cursor-help ${badge.color}`}
                      >
                        <span className="mr-1">{badge.icon}</span>
                        {badge.name.length > 15 ? badge.name.substring(0, 12) + '…' : badge.name}
                        {badge.discount_percentage && (
                          <span className="ml-1 text-[10px] opacity-80">
                            ({badge.discount_percentage}%)
                          </span>
                        )}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="font-medium">{badge.name}</p>
                      {badge.discount_percentage && (
                        <p className="text-xs text-green-600 dark:text-green-400">
                          {badge.discount_percentage}% discount eligible
                        </p>
                      )}
                      {badge.id_number && (
                        <p className="text-xs text-muted-foreground mt-1">
                          <span className="font-medium">ID:</span> {badge.id_number}
                        </p>
                      )}
                      {badge.expires_at && (
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium">Expires:</span> {new Date(badge.expires_at).toLocaleDateString()}
                        </p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>
        )}
        
        {/* Registered Voter badge - kept separately */}
        {resident.is_voter && (
          <div className="py-3">
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400">
              <Shield className="h-3 w-3 mr-1" />
              Registered Voter
            </Badge>
          </div>
        )}
        
        {/* Additional fields */}
        {resident.place_of_birth && (
          <InfoRow label="Place of Birth" value={resident.place_of_birth} icon={Home} />
        )}
        
        {resident.household_number && (
          <InfoRow label="Household Number" value={resident.household_number} icon={Hash} />
        )}
        
        {/* FIXED: Purok object handling - extract name property instead of passing entire object */}
        {resident.purok && (
          <>
            <InfoRow label="Purok" value={resident.purok.name || resident.purok.id || 'Unknown'} icon={MapPin} />
            
            {/* Optional: Show additional purok details if available */}
            {resident.purok.leader_name && (
              <InfoRow label="Purok Leader" value={resident.purok.leader_name} icon={User} />
            )}
            
            {resident.purok.leader_contact && (
              <InfoRow label="Leader Contact" value={resident.purok.leader_contact} icon={Phone} />
            )}
            
            {resident.purok.google_maps_url && (
              <div className="py-3">
                <a 
                  href={resident.purok.google_maps_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <MapPin className="h-4 w-4 mr-1" />
                  View Purok Location on Maps
                </a>
              </div>
            )}
          </>
        )}
        
        {resident.remarks && (
          <div className="py-3">
            <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Remarks
            </p>
            <p className="text-sm bg-muted/30 p-3 rounded-md">{resident.remarks}</p>
          </div>
        )}
      </div>
    </>
  );
};