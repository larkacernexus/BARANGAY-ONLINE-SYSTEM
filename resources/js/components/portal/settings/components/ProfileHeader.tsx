import React from 'react';
import { CheckCircle, ShieldAlert, QrCode, UserCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ProfileHeaderProps {
  isHeadOfHousehold: boolean;
  emailVerifiedAt?: string;
  qrCodeUrl?: string | null;
  mustVerifyEmail: boolean;
  status?: string;
}

export const ProfileHeader = ({ 
  isHeadOfHousehold, 
  emailVerifiedAt, 
  qrCodeUrl,
  mustVerifyEmail,
  status
}: ProfileHeaderProps) => {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Profile</h2>
          <p className="text-sm text-muted-foreground mt-1">
            View your personal information and account details
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isHeadOfHousehold && (
            <Badge variant="secondary" className="gap-1">
              <UserCheck className="h-3 w-3" />
              Head of Household
            </Badge>
          )}
          <Badge 
            variant={emailVerifiedAt ? "default" : "destructive"}
            className="gap-1"
          >
            {emailVerifiedAt ? (
              <CheckCircle className="h-3 w-3" />
            ) : (
              <ShieldAlert className="h-3 w-3" />
            )}
            {emailVerifiedAt ? 'Verified' : 'Unverified'}
          </Badge>
          {qrCodeUrl && (
            <Badge variant="outline" className="gap-1 border-green-500 text-green-600">
              <QrCode className="h-3 w-3" />
              QR Ready
            </Badge>
          )}
        </div>
      </div>

      {mustVerifyEmail && !emailVerifiedAt && (
        <Alert variant="warning" className="mt-4 bg-yellow-50 border-yellow-200">
          <ShieldAlert className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800 text-sm">
            <span className="font-medium">Your email address is unverified.</span>
            {status === 'verification-link-sent' && (
              <span className="ml-2 text-green-600">
                A new verification link has been sent.
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};