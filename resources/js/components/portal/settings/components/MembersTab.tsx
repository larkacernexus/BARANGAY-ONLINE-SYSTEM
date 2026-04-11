import React, { useState } from 'react';
import { 
  Info, ChevronDown, ChevronUp, User, Calendar, Phone, Mail, 
  Heart, Briefcase, MapPin, Award, Hash, Users, Shield, 
  BookOpen, Home, AlertCircle, IdCard, Church, Sparkles
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ProfileUserData } from './types';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface MembersTabProps {
  household?: ProfileUserData['resident'];
  residentId?: number;
}

// Extend the member type to include all Resident model fields
interface MemberDetails {
  id: number;
  resident_id?: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  suffix?: string;
  full_name: string;
  birth_date?: string;
  age?: number;
  gender?: string;
  civil_status?: string;
  contact_number?: string;
  email?: string;
  address?: string;
  purok_id?: number;
  household_id?: number;
  occupation?: string;
  education?: string;
  religion?: string;
  is_voter?: boolean;
  place_of_birth?: string;
  remarks?: string;
  status?: string;
  photo_path?: string;
  
  // DYNAMIC: Privilege data
  privileges?: Array<{
    id: number;
    privilege_id: number;
    code: string;
    name: string;
    id_number?: string;
    discount_percentage?: number;
    status?: string;
    expires_at?: string;
    verified_at?: string;
    discount_type?: {
      id: number;
      code: string;
      name: string;
      percentage: number;
    };
  }>;
  privileges_count?: number;
  has_privileges?: boolean;
  
  // For backward compatibility
  discount_eligibilities?: any[];
  
  relationship_to_head: string;
  is_head: boolean;
  
  // From HouseholdMember relationship
  membership?: {
    id: number;
    household_id: number;
    resident_id: number;
    relationship_to_head: string;
    is_head: boolean;
    joined_at?: string;
  };
  
  // DYNAMIC: Individual privilege flags will be added dynamically
  [key: string]: any;
}

// ========== DYNAMIC PRIVILEGE HELPER FUNCTIONS ==========

/**
 * Get privilege icon based on code
 */
function getPrivilegeIcon(code: string): string {
  const codeUpper = (code || '').toUpperCase();
  
  const iconMap: Record<string, string> = {
    'SC': '👴',
    'SENIOR': '👴',
    'OSP': '👴',
    'PWD': '♿',
    'SP': '👨‍👧',
    'SOLO_PARENT': '👨‍👧',
    'IND': '🏠',
    'INDIGENT': '🏠',
    '4PS': '📦',
    'IP': '🌿',
    'FRM': '🌾',
    'FSH': '🎣',
    'OFW': '✈️',
    'SCH': '📚',
    'STUDENT': '📚',
    'UNE': '💼',
    'VETERAN': '🎖️',
  };
  
  // Check for exact match first
  if (iconMap[codeUpper]) {
    return iconMap[codeUpper];
  }
  
  // Check first character as fallback
  const firstChar = codeUpper[0] || 'A';
  const fallbackMap: Record<string, string> = {
    'S': '👴',
    'P': '♿',
    'I': '🏠',
    'F': '🌾',
    'O': '✈️',
    '4': '📦',
    'U': '💼',
    'V': '🎖️',
  };
  
  return fallbackMap[firstChar] || '🎫';
}

/**
 * Get privilege color based on code
 */
function getPrivilegeColor(code: string): string {
  const codeUpper = (code || '').toUpperCase();
  
  const colorMap: Record<string, string> = {
    'SC': 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
    'SENIOR': 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
    'OSP': 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
    'PWD': 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300',
    'SP': 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300',
    'SOLO_PARENT': 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300',
    'IND': 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300',
    'INDIGENT': 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300',
    '4PS': 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300',
    'IP': 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300',
    'VETERAN': 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300',
  };
  
  if (colorMap[codeUpper]) {
    return colorMap[codeUpper];
  }
  
  // Default color
  return 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300';
}

/**
 * Get active privileges from member
 */
function getActivePrivileges(member: MemberDetails): any[] {
  if (!member.privileges || !Array.isArray(member.privileges)) {
    return [];
  }
  
  return member.privileges.filter((p: any) => {
    // If status is explicitly set, use it
    if (p.status) {
      return p.status === 'active' || p.status === 'expiring_soon';
    }
    
    // Otherwise, infer status from verified_at and expires_at
    const isVerified = p.verified_at;
    const isExpired = p.expires_at && new Date(p.expires_at) <= new Date();
    const isExpiringSoon = p.expires_at && new Date(p.expires_at) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    
    return isVerified && !isExpired;
  });
}

/**
 * Get privilege badges for display
 */
function getPrivilegeBadges(member: MemberDetails): Array<{ 
  code: string; 
  name: string; 
  icon: string; 
  color: string; 
  id_number?: string;
  discount_percentage?: number;
  expires_at?: string;
  status?: string;
}> {
  const activePrivileges = getActivePrivileges(member);
  
  return activePrivileges.map((p: any) => {
    // Handle both nested and flat privilege data structures
    const privilege = p.privilege || p;
    const code = privilege.code || p.code;
    const discountPercentage = p.discount_percentage ?? privilege.discount_percentage ?? 0;
    const name = privilege.name || p.name || code;
    
    return {
      code: code,
      name: name,
      icon: getPrivilegeIcon(code),
      color: getPrivilegeColor(code),
      id_number: p.id_number,
      discount_percentage: typeof discountPercentage === 'number' ? discountPercentage : parseFloat(discountPercentage) || 0,
      expires_at: p.expires_at,
      status: p.status
    };
  });
}

/**
 * Check if member has any active privileges
 */
function hasAnyPrivilege(member: MemberDetails): boolean {
  return getActivePrivileges(member).length > 0;
}

/**
 * Format date helper
 */
function formatDate(dateString?: string): string | null {
  if (!dateString) return null;
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
}

/**
 * Get initials from name
 */
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Get status badge
 */
function getStatusBadge(status?: string) {
  if (!status) return null;
  
  const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string, className?: string }> = {
    active: { variant: "default", label: "Active", className: "bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800" },
    inactive: { variant: "secondary", label: "Inactive", className: "bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700" },
    pending: { variant: "outline", label: "Pending", className: "border-yellow-500 text-yellow-600 dark:text-yellow-400 dark:border-yellow-400" },
    archived: { variant: "destructive", label: "Archived" },
    expired: { variant: "destructive", label: "Expired" },
    expiring_soon: { variant: "outline", label: "Expiring Soon", className: "border-orange-500 text-orange-600 dark:text-orange-400 dark:border-orange-400" }
  };
  
  const config = variants[status.toLowerCase()] || { variant: "outline", label: status };
  
  return (
    <Badge variant={config.variant} className={cn("text-xs", config.className)}>
      {config.label}
    </Badge>
  );
}

export const MembersTab = ({ household, residentId }: MembersTabProps) => {
  const [openMemberId, setOpenMemberId] = useState<number | null>(null);

  if (!household?.members || household.members.length === 0) {
    return (
      <Alert className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
        <Info className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        <AlertDescription className="text-gray-600 dark:text-gray-400">
          No household members found.
        </AlertDescription>
      </Alert>
    );
  }

  const toggleMember = (memberId: number) => {
    setOpenMemberId(openMemberId === memberId ? null : memberId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Household Members</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {household.members.length} {household.members.length === 1 ? 'member' : 'members'} in this household
          </p>
        </div>
        {household.household_number && (
          <Badge variant="outline" className="text-sm border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300">
            <Hash className="h-3 w-3 mr-1 text-gray-400 dark:text-gray-500" />
            <span>#{household.household_number}</span>
          </Badge>
        )}
      </div>

      <div className="space-y-3">
        {household.members.map((member: MemberDetails) => {
          const isOpen = openMemberId === member.id;
          const activePrivileges = getActivePrivileges(member);
          const privilegeBadges = getPrivilegeBadges(member);
          const hasDiscountEligibility = activePrivileges.length > 0;
          
          return (
            <Card 
              key={member.id} 
              className={cn(
                "overflow-hidden transition-colors bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800",
                member.is_head && "border-gray-300 dark:border-gray-700"
              )}
            >
              {/* Member Header - Always Visible */}
              <div 
                className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                onClick={() => toggleMember(member.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border border-gray-200 dark:border-gray-700">
                      <AvatarFallback className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                        {getInitials(member.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900 dark:text-white">{member.full_name}</span>
                        {member.is_head && (
                          <Badge variant="secondary" className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                            Head
                          </Badge>
                        )}
                        {member.id === residentId && (
                          <Badge variant="outline" className="text-xs border-blue-500 text-blue-600 dark:text-blue-400">
                            You
                          </Badge>
                        )}
                        {getStatusBadge(member.status)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <span>{member.relationship_to_head}</span>
                        {member.age && (
                          <>
                            <span>•</span>
                            <span>{member.age} years old</span>
                          </>
                        )}
                        {member.gender && (
                          <>
                            <span>•</span>
                            <span className="capitalize">{member.gender}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                    {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>

                {/* Quick badges for privileges */}
                {privilegeBadges.length > 0 && (
                  <div className="flex gap-1 mt-2 ml-14 flex-wrap">
                    {privilegeBadges.map((badge, idx) => (
                      <TooltipProvider key={idx}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "text-xs px-2 py-0.5 cursor-help",
                                badge.color
                              )}
                            >
                              <span className="mr-1">{badge.icon}</span>
                              {badge.name.length > 10 ? badge.name.substring(0, 8) + '…' : badge.name}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="font-medium">{badge.name}</p>
                            {badge.discount_percentage !== undefined && badge.discount_percentage > 0 && (
                              <p className="text-xs text-green-600 dark:text-green-400">{badge.discount_percentage}% discount</p>
                            )}
                            {badge.id_number && (
                              <p className="text-xs text-gray-500">ID: {badge.id_number}</p>
                            )}
                            {badge.expires_at && (
                              <p className="text-xs text-orange-500">Expires: {formatDate(badge.expires_at)}</p>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                    
                    {/* Voter badge */}
                    {member.is_voter && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="outline" className="text-xs px-2 py-0.5 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700">
                              <span className="mr-1">🗳️</span>
                              Voter
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Registered Voter</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                )}
              </div>

              {/* Dropdown Details - Shows when open */}
              {isOpen && (
                <CardContent className="border-t border-gray-100 dark:border-gray-800 p-4 bg-gray-50/30 dark:bg-gray-800/30">
                  <div className="space-y-4">
                    
                    {/* Personal Information Section */}
                    <div>
                      <h4 className="text-sm font-medium mb-3 flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <User className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        Personal Information
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        
                        {/* Resident ID */}
                        {member.resident_id && (
                          <div className="flex items-start gap-2">
                            <IdCard className="h-4 w-4 text-gray-400 dark:text-gray-500 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Resident ID</p>
                              <p className="text-sm font-mono text-gray-900 dark:text-white">{member.resident_id}</p>
                            </div>
                          </div>
                        )}

                        {/* Full Name with details */}
                        <div className="flex items-start gap-2">
                          <User className="h-4 w-4 text-gray-400 dark:text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Full Name</p>
                            <p className="text-sm text-gray-900 dark:text-white">
                              {member.first_name} {member.middle_name ? member.middle_name + ' ' : ''}{member.last_name}
                              {member.suffix && <span className="text-gray-500 dark:text-gray-400">, {member.suffix}</span>}
                            </p>
                          </div>
                        </div>

                        {/* Birth Date */}
                        {member.birth_date && (
                          <div className="flex items-start gap-2">
                            <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Birth Date</p>
                              <p className="text-sm text-gray-900 dark:text-white">{formatDate(member.birth_date)}</p>
                              {member.age && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">Age: {member.age} years</p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Place of Birth */}
                        {member.place_of_birth && (
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-gray-400 dark:text-gray-500 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Place of Birth</p>
                              <p className="text-sm text-gray-900 dark:text-white">{member.place_of_birth}</p>
                            </div>
                          </div>
                        )}

                        {/* Gender */}
                        {member.gender && (
                          <div className="flex items-start gap-2">
                            <Users className="h-4 w-4 text-gray-400 dark:text-gray-500 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Gender</p>
                              <p className="text-sm capitalize text-gray-900 dark:text-white">{member.gender}</p>
                            </div>
                          </div>
                        )}

                        {/* Civil Status */}
                        {member.civil_status && (
                          <div className="flex items-start gap-2">
                            <Heart className="h-4 w-4 text-gray-400 dark:text-gray-500 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Civil Status</p>
                              <p className="text-sm capitalize text-gray-900 dark:text-white">{member.civil_status}</p>
                            </div>
                          </div>
                        )}

                        {/* Religion */}
                        {member.religion && (
                          <div className="flex items-start gap-2">
                            <Church className="h-4 w-4 text-gray-400 dark:text-gray-500 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Religion</p>
                              <p className="text-sm text-gray-900 dark:text-white">{member.religion}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <Separator className="bg-gray-100 dark:bg-gray-800" />

                    {/* Contact Information Section */}
                    <div>
                      <h4 className="text-sm font-medium mb-3 flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <Phone className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        Contact Information
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        
                        {/* Contact Number */}
                        {member.contact_number && (
                          <div className="flex items-start gap-2">
                            <Phone className="h-4 w-4 text-gray-400 dark:text-gray-500 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Contact Number</p>
                              <p className="text-sm text-gray-900 dark:text-white">{member.contact_number}</p>
                            </div>
                          </div>
                        )}

                        {/* Email */}
                        {member.email && (
                          <div className="flex items-start gap-2">
                            <Mail className="h-4 w-4 text-gray-400 dark:text-gray-500 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                              <p className="text-sm break-all text-gray-900 dark:text-white">{member.email}</p>
                            </div>
                          </div>
                        )}

                        {/* Address */}
                        {member.address && (
                          <div className="flex items-start gap-2 sm:col-span-2">
                            <Home className="h-4 w-4 text-gray-400 dark:text-gray-500 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Address</p>
                              <p className="text-sm text-gray-900 dark:text-white">{member.address}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <Separator className="bg-gray-100 dark:bg-gray-800" />

                    {/* Professional & Education Section */}
                    <div>
                      <h4 className="text-sm font-medium mb-3 flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <Briefcase className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        Professional & Education
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        
                        {/* Occupation */}
                        {member.occupation && (
                          <div className="flex items-start gap-2">
                            <Briefcase className="h-4 w-4 text-gray-400 dark:text-gray-500 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Occupation</p>
                              <p className="text-sm text-gray-900 dark:text-white">{member.occupation}</p>
                            </div>
                          </div>
                        )}

                        {/* Education */}
                        {member.education && (
                          <div className="flex items-start gap-2">
                            <BookOpen className="h-4 w-4 text-gray-400 dark:text-gray-500 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Education</p>
                              <p className="text-sm text-gray-900 dark:text-white">{member.education}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Special Classifications & Discount Eligibility Section - DYNAMIC */}
                    {hasDiscountEligibility && (
                      <>
                        <Separator className="bg-gray-100 dark:bg-gray-800" />
                        <div>
                          <h4 className="text-sm font-medium mb-3 flex items-center gap-2 text-gray-700 dark:text-gray-300">
                            <Award className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                            Special Classifications & Discount Eligibility
                          </h4>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            
                            {/* DYNAMIC: Render all privileges */}
                            {privilegeBadges.map((privilege, idx) => (
                              <div 
                                key={idx}
                                className={cn(
                                  "flex items-start gap-2 p-2 rounded-lg border",
                                  privilege.color
                                )}
                              >
                                <span className="text-lg mt-0.5">{privilege.icon}</span>
                                <div className="flex-1">
                                  <p className="text-xs font-medium text-gray-900 dark:text-white">{privilege.name}</p>
                                  {privilege.discount_percentage !== undefined && privilege.discount_percentage > 0 && (
                                    <p className="text-xs font-semibold text-green-600 dark:text-green-400">
                                      {privilege.discount_percentage}% Discount
                                    </p>
                                  )}
                                  {privilege.id_number && (
                                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                      ID: {privilege.id_number}
                                    </p>
                                  )}
                                  {privilege.expires_at && (
                                    <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                                      Expires: {formatDate(privilege.expires_at)}
                                    </p>
                                  )}
                                  {privilege.status === 'expiring_soon' && (
                                    <p className="text-xs text-orange-500 mt-1">⚠️ Expiring soon</p>
                                  )}
                                </div>
                              </div>
                            ))}

                            {/* Registered Voter - kept separately */}
                            {member.is_voter && (
                              <div className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                                <Shield className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-0.5" />
                                <div>
                                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Registered Voter</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Remarks/Notes */}
                    {member.remarks && (
                      <>
                        <Separator className="bg-gray-100 dark:bg-gray-800" />
                        <div>
                          <h4 className="text-sm font-medium mb-2 flex items-center gap-2 text-gray-700 dark:text-gray-300">
                            <AlertCircle className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                            Remarks
                          </h4>
                          <p className="text-sm italic bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                            {member.remarks}
                          </p>
                        </div>
                      </>
                    )}

                    {/* Membership Information */}
                    {member.membership && (
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-3">
                        <p>Member since: {member.membership.joined_at ? formatDate(member.membership.joined_at) : 'N/A'}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      <Alert className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
        <Info className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        <AlertDescription className="text-sm text-gray-600 dark:text-gray-400">
          Click on each member to view their complete profile information. 
          For updates or corrections, please contact the barangay hall.
        </AlertDescription>
      </Alert>
    </div>
  );
};