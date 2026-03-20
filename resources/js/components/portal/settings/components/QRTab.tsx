import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginQRCode } from './LoginQRCode';

interface QRTabProps {
  userId: number;
  qrCodeUrl?: string | null;
  qrToken?: string | null;
}

export const QRTab = ({ userId, qrCodeUrl, qrToken }: QRTabProps) => (
  <>
    <h3 className="text-lg font-semibold mb-4">Quick Login QR Code</h3>
    <p className="text-sm text-muted-foreground mb-4">
      Generate a QR code for faster login access. Scan it with your phone to automatically log in without typing your credentials.
    </p>
    
    <LoginQRCode 
      userId={userId}
      existingQrCodeUrl={qrCodeUrl}
      qrToken={qrToken}
    />
    
    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">How it works</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside text-sm space-y-1 text-muted-foreground">
            <li>Generate your unique QR code</li>
            <li>Download or print it</li>
            <li>Keep it on your phone</li>
            <li>Scan to instantly log in</li>
            <li>Automatically redirected to Portal/Dashboard</li>
          </ol>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Security</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
            <li>QR codes expire after 30 days</li>
            <li>You can regenerate anytime</li>
            <li>Disable QR login if needed</li>
            <li>Each code is unique to you</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  </>
);