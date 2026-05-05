import React, { useState, useEffect } from 'react';
import { router, useForm } from '@inertiajs/react';
import { 
  QrCode, Download, Printer, RefreshCw, AlertTriangle, 
  AlertCircle, Info, Shield, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { Spinner } from '@/components/ui/spinner';

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
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<'generate' | 'regenerate' | null>(null);

  // Password confirmation form
  const { data, setData, post, processing, errors, reset } = useForm({
    password: '',
  });

  useEffect(() => {
    if (existingQrCodeUrl) {
      setQrCodeUrl(existingQrCodeUrl);
    }
  }, [existingQrCodeUrl]);

  const generateQRCode = async () => {
    setIsGenerating(true);
    setError(null);
    setImageError(false);
    setShowPasswordModal(false);
    reset();
    
    try {
      router.post('/residentsettings/qr/generate', {}, {
        preserveScroll: true,
        preserveState: true,
        onSuccess: (page) => {
          router.reload({ 
            only: ['user'],
            onSuccess: () => {
              setIsGenerating(false);
              setPendingAction(null);
            }
          });
        },
        onError: (errors) => {
          setError('Failed to generate QR code. Please try again.');
          setIsGenerating(false);
          setPendingAction(null);
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate QR code');
      setIsGenerating(false);
      setPendingAction(null);
    }
  };

  const regenerateQRCode = async () => {
    setIsGenerating(true);
    setError(null);
    setImageError(false);
    setShowRegenerateConfirm(false);
    setShowPasswordModal(false);
    reset();
    
    try {
      router.post('/residentsettings/qr/regenerate', {}, {
        preserveScroll: true,
        preserveState: true,
        onSuccess: (page) => {
          router.reload({ 
            only: ['user'],
            onSuccess: () => {
              setIsGenerating(false);
              setPendingAction(null);
            }
          });
        },
        onError: (errors) => {
          setError('Failed to regenerate QR code. Please try again.');
          setIsGenerating(false);
          setPendingAction(null);
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to regenerate QR code');
      setIsGenerating(false);
      setPendingAction(null);
    }
  };

  const handlePasswordConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    
    post('/resident/password/confirm', {
      preserveScroll: true,
      onSuccess: () => {
        // Password confirmed, proceed with the pending action
        if (pendingAction === 'generate') {
          generateQRCode();
        } else if (pendingAction === 'regenerate') {
          regenerateQRCode();
        }
        setShowPasswordModal(false);
      },
      onError: (errors) => {
        // Password confirmation failed
        console.error('Password confirmation failed:', errors);
      },
    });
  };

  const handleGenerateClick = () => {
    setPendingAction('generate');
    setShowPasswordModal(true);
    setError(null);
  };

  const handleRegenerateClick = () => {
    setShowRegenerateConfirm(true);
  };

  const confirmRegenerate = () => {
    setShowRegenerateConfirm(false);
    setPendingAction('regenerate');
    setShowPasswordModal(true);
    setError(null);
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setPendingAction(null);
    reset();
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
    <>
      <Card className="border-primary/20 bg-primary/5 dark:border-primary/30 dark:bg-primary/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 dark:text-white">
            <QrCode className="h-4 w-4" />
            Quick Login QR Code
          </CardTitle>
          <CardDescription className="dark:text-gray-400">
            {qrCodeUrl 
              ? "Scan this QR code to log in instantly without typing credentials" 
              : "Generate a QR code for faster login access"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4 dark:bg-red-900/50 dark:border-red-800 dark:text-red-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {!qrCodeUrl && !isGenerating && (
            <div className="flex flex-col items-center py-6 text-center">
              <div className="bg-muted dark:bg-gray-800 rounded-full p-4 mb-4">
                <QrCode className="h-8 w-8 text-muted-foreground dark:text-gray-400" />
              </div>
              <h4 className="font-medium mb-2 dark:text-white">No QR Code Generated</h4>
              <p className="text-sm text-muted-foreground dark:text-gray-400 mb-4 max-w-xs">
                Generate a QR code for quick login. Scan it with your phone to automatically log in without typing your credentials.
              </p>
              <Button onClick={handleGenerateClick} disabled={isGenerating}>
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
              <RefreshCw className="h-8 w-8 animate-spin text-primary dark:text-primary-foreground mb-3" />
              <p className="text-sm text-muted-foreground dark:text-gray-400">Generating your QR code...</p>
            </div>
          )}
          
          {qrCodeUrl && !isGenerating && (
            <div className="flex flex-col items-center">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-4 border dark:border-gray-700">
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
                <Button size="sm" variant="outline" onClick={downloadQRCode} className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800">
                  <Download className="h-3 w-3 mr-2" />
                  Download
                </Button>
                <Button size="sm" variant="outline" onClick={printQRCode} className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800">
                  <Printer className="h-3 w-3 mr-2" />
                  Print
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleRegenerateClick}
                  disabled={isGenerating}
                  className="border-amber-500 text-amber-600 hover:bg-amber-50 dark:border-amber-600 dark:text-amber-400 dark:hover:bg-amber-950"
                >
                  <RefreshCw className={`h-3 w-3 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                  Regenerate
                </Button>
              </div>
              
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm text-muted-foreground dark:text-gray-400">QR Login:</span>
                <Button 
                  size="sm" 
                  variant={isEnabled ? "default" : "secondary"}
                  onClick={toggleQrLogin}
                  className={isEnabled ? "" : "dark:bg-gray-700 dark:text-gray-300"}
                >
                  {isEnabled ? 'Enabled' : 'Disabled'}
                </Button>
              </div>
              
              <Alert className="bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-800 mt-2">
                <Info className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-xs text-green-800 dark:text-green-200">
                  <strong>Quick tip:</strong> Save this QR code on your phone. Scan it anytime to instantly log in without typing your email and password.
                </AlertDescription>
              </Alert>
              
              <p className="text-xs text-muted-foreground dark:text-gray-400 mt-3 text-center">
                Scan with your phone camera to auto-login • Redirects to Portal/Dashboard • Expires in 30 days
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Password Confirmation Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
            onClick={closePasswordModal}
          />
          
          {/* Modal Content */}
          <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full mx-4 p-6 z-10 animate-in fade-in zoom-in duration-200">
            {/* Close Button */}
            <button
              onClick={closePasswordModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-primary/10 dark:bg-primary/20 rounded-full p-2">
                <Shield className="h-6 w-6 text-primary dark:text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Confirm Your Password
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {pendingAction === 'generate' ? 'Verify your identity to generate QR code' : 'Verify your identity to regenerate QR code'}
                </p>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handlePasswordConfirm}>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="password" className="dark:text-gray-300">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    name="password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    autoFocus
                    className="dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
                  />
                  <InputError message={errors.password} />
                </div>

                {errors.password && (
                  <Alert variant="destructive" className="dark:bg-red-900/50 dark:border-red-800">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="dark:text-red-200">
                      {errors.password}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Modal Footer */}
                <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={closePasswordModal}
                    disabled={processing}
                    className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={processing || !data.password}
                    className="min-w-[140px]"
                  >
                    {processing ? (
                      <>
                        <Spinner className="mr-2 h-4 w-4" />
                        Confirming...
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4 mr-2" />
                        Confirm Password
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Regenerate Confirmation Modal */}
      {showRegenerateConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
            onClick={() => setShowRegenerateConfirm(false)}
          />
          
          {/* Modal Content */}
          <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full mx-4 p-6 z-10 animate-in fade-in zoom-in duration-200">
            {/* Close Button */}
            <button
              onClick={() => setShowRegenerateConfirm(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-amber-100 dark:bg-amber-900/30 rounded-full p-2">
                <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Regenerate QR Code?
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  This action cannot be undone
                </p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="space-y-4">
              <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <AlertDescription className="text-amber-800 dark:text-amber-200">
                  <span className="font-medium">Warning:</span> Regenerating will immediately invalidate your existing QR code. Anyone with the old QR code will no longer be able to log in.
                </AlertDescription>
              </Alert>
              
              <p className="text-sm text-gray-600 dark:text-gray-400">
                You'll need to confirm your password to proceed with regeneration.
              </p>

              {/* Modal Footer */}
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button 
                  variant="outline" 
                  onClick={() => setShowRegenerateConfirm(false)}
                  className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button 
                  variant="default"
                  className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700"
                  onClick={confirmRegenerate}
                >
                  Continue
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};