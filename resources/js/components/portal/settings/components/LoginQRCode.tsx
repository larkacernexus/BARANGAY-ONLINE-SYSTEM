import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { 
  QrCode, Download, Printer, RefreshCw, AlertTriangle, 
  AlertCircle, Info, CheckCircle, XCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface LoginQRCodeProps {
  userId: number;
  existingQrCodeUrl?: string | null;
  qrToken?: string | null;
}

export const LoginQRCode = ({ 
  userId,
  existingQrCodeUrl,
  qrToken 
}: LoginQRCodeProps) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(existingQrCodeUrl || null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEnabled, setIsEnabled] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);

  useEffect(() => {
    if (existingQrCodeUrl) {
      setQrCodeUrl(existingQrCodeUrl);
    }
  }, [existingQrCodeUrl]);

  const generateQRCode = async () => {
    setIsGenerating(true);
    setError(null);
    setImageError(false);
    
    try {
      router.post('/residentsettings/qr/generate', {}, {
        preserveScroll: true,
        preserveState: true,
        onSuccess: (page) => {
          router.reload({ 
            only: ['user'],
            onSuccess: () => {
              setIsGenerating(false);
            }
          });
        },
        onError: (errors) => {
          setError('Failed to generate QR code. Please try again.');
          setIsGenerating(false);
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate QR code');
      setIsGenerating(false);
    }
  };

  const regenerateQRCode = async () => {
    setIsGenerating(true);
    setError(null);
    setImageError(false);
    setShowRegenerateConfirm(false);
    
    try {
      router.post('/residentsettings/qr/regenerate', {}, {
        preserveScroll: true,
        preserveState: true,
        onSuccess: (page) => {
          router.reload({ 
            only: ['user'],
            onSuccess: () => {
              setIsGenerating(false);
            }
          });
        },
        onError: (errors) => {
          setError('Failed to regenerate QR code. Please try again.');
          setIsGenerating(false);
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to regenerate QR code');
      setIsGenerating(false);
    }
  };

  const toggleQrLogin = async () => {
    const route = isEnabled ? '/residentsettings/qr/disable' : '/residentsettings/qr/enable';
    
    router.post(route, {}, {
      preserveScroll: true,
      onSuccess: () => {
        setIsEnabled(!isEnabled);
      },
    });
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;
    
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `login-qrcode-user-${userId}.png`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printQRCode = () => {
    if (!qrCodeUrl) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow pop-ups to print the QR code');
      return;
    }
    
    const loginUrl = `${window.location.origin}/qr-login/${qrToken || 'user-token'}`;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Quick Login QR Code</title>
          <style>
            body { 
              display: flex; 
              justify-content: center; 
              align-items: center; 
              min-height: 100vh; 
              margin: 0;
              flex-direction: column; 
              font-family: Arial, sans-serif;
              background: #f5f5f5;
            }
            .container { 
              text-align: center; 
              background: white;
              padding: 40px;
              border-radius: 12px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              max-width: 500px;
            }
            h2 { 
              color: #333;
              margin-bottom: 10px;
            }
            .user-info { 
              color: #666;
              margin: 15px 0;
              font-size: 16px;
            }
            img { 
              max-width: 300px; 
              width: 100%;
              height: auto;
              margin: 20px 0;
              border: 2px solid #eee;
              border-radius: 8px;
            }
            .note { 
              color: #888; 
              font-size: 14px; 
              margin-top: 20px;
              border-top: 1px solid #eee;
              padding-top: 20px;
            }
            .instructions {
              text-align: left;
              background: #f9f9f9;
              padding: 15px;
              border-radius: 8px;
              margin-top: 20px;
              font-size: 14px;
            }
            .footer {
              margin-top: 20px;
              font-size: 12px;
              color: #999;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Quick Login QR Code</h2>
            <div class="user-info">
              <strong>User ID:</strong> ${userId}<br>
              <strong>Generated:</strong> ${new Date().toLocaleDateString()}
            </div>
            <img src="${qrCodeUrl}" alt="Login QR Code" />
            
            <div class="instructions">
              <strong>📱 How to use:</strong>
              <ol style="margin-top: 10px; padding-left: 20px;">
                <li>Open your phone's camera or QR scanner</li>
                <li>Scan this QR code</li>
                <li>You'll be automatically logged in</li>
                <li>Redirected to the Portal/Dashboard</li>
              </ol>
            </div>
            
            <p class="note">
              No need to type username and password<br>
              Just scan and go!
            </p>
            <div class="footer">
              This QR code expires in 30 days for security
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 500);
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <QrCode className="h-4 w-4" />
          Quick Login QR Code
        </CardTitle>
        <CardDescription>
          {qrCodeUrl 
            ? "Scan this QR code to log in instantly without typing credentials" 
            : "Generate a QR code for faster login access"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {!qrCodeUrl && !isGenerating && (
          <div className="flex flex-col items-center py-6 text-center">
            <div className="bg-muted rounded-full p-4 mb-4">
              <QrCode className="h-8 w-8 text-muted-foreground" />
            </div>
            <h4 className="font-medium mb-2">No QR Code Generated</h4>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs">
              Generate a QR code for quick login. Scan it with your phone to automatically log in without typing your credentials.
            </p>
            <Button onClick={generateQRCode} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <QrCode className="h-4 w-4 mr-2" />
                  Generate QR Code
                </>
              )}
            </Button>
          </div>
        )}
        
        {isGenerating && qrCodeUrl === null && (
          <div className="flex flex-col items-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-primary mb-3" />
            <p className="text-sm text-muted-foreground">Generating your QR code...</p>
          </div>
        )}
        
        {qrCodeUrl && !isGenerating && (
          <div className="flex flex-col items-center">
            <div className="bg-white p-4 rounded-lg shadow-sm mb-4 border">
              <img 
                src={qrCodeUrl} 
                alt="Login QR Code" 
                className="w-48 h-48 object-contain"
                onError={(e) => {
                  console.error('Failed to load QR code image:', qrCodeUrl);
                  setImageError(true);
                  setError('Failed to load QR code image. Please try regenerating.');
                }}
              />
            </div>
            
            <div className="flex flex-wrap gap-2 justify-center mb-3">
              <Button size="sm" variant="outline" onClick={downloadQRCode}>
                <Download className="h-3 w-3 mr-2" />
                Download
              </Button>
              <Button size="sm" variant="outline" onClick={printQRCode}>
                <Printer className="h-3 w-3 mr-2" />
                Print
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setShowRegenerateConfirm(true)}
                disabled={isGenerating}
                className="border-amber-500 text-amber-600 hover:bg-amber-50"
              >
                <RefreshCw className={`h-3 w-3 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                Regenerate
              </Button>
            </div>
            
            {showRegenerateConfirm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
                  <div className="flex items-center gap-3 text-amber-600 mb-4">
                    <AlertTriangle className="h-6 w-6" />
                    <h3 className="text-lg font-semibold">Regenerate QR Code?</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <Alert variant="warning" className="bg-amber-50 border-amber-200">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <AlertDescription className="text-amber-800">
                        <span className="font-medium">Warning:</span> Regenerating will immediately invalidate your existing QR code. Anyone with the old QR code will no longer be able to log in.
                      </AlertDescription>
                    </Alert>
                    
                    <p className="text-sm text-muted-foreground">
                      Are you sure you want to continue? This action cannot be undone.
                    </p>
                    
                    <div className="flex gap-3 justify-end pt-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setShowRegenerateConfirm(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        variant="default"
                        className="bg-amber-600 hover:bg-amber-700"
                        onClick={regenerateQRCode}
                        disabled={isGenerating}
                      >
                        {isGenerating ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Regenerating...
                          </>
                        ) : (
                          'Yes, Regenerate'
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm text-muted-foreground">QR Login:</span>
              <Button 
                size="sm" 
                variant={isEnabled ? "default" : "secondary"}
                onClick={toggleQrLogin}
              >
                {isEnabled ? 'Enabled' : 'Disabled'}
              </Button>
            </div>
            
            <Alert className="bg-green-50 border-green-200 mt-2">
              <Info className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-xs text-green-800">
                <strong>Quick tip:</strong> Save this QR code on your phone. Scan it anytime to instantly log in without typing your email and password.
              </AlertDescription>
            </Alert>
            
            <p className="text-xs text-muted-foreground mt-3 text-center">
              Scan with your phone camera to auto-login • Redirects to Portal/Dashboard • Expires in 30 days
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};