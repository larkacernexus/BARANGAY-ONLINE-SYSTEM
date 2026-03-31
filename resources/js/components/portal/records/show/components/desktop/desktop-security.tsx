// components/document/desktop/desktop-security.tsx
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ModernCard } from '@/components/residentui/modern-card';
import { Shield, Lock, Globe, Fingerprint, FileLock, History, Download, Printer, Scan } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Document } from '@/types/portal/records/records';

interface DesktopSecurityProps {
    document: Document;
}

export function DesktopSecurity({ document }: DesktopSecurityProps) {
    const securityOptions = document.security_options || {};

    return (
        <ModernCard title="Security & Access" icon={Shield} iconColor="from-amber-500 to-orange-500">
            <div className="space-y-4">
                {/* Basic Security */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                            <Lock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium">Password</span>
                        </div>
                        {document.requires_password ? (
                            <Badge className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400">
                                Protected
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600">
                                No Password
                            </Badge>
                        )}
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                            <Globe className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium">Access</span>
                        </div>
                        <Badge variant="outline" className={cn(document.is_public ? "border-blue-500/30 bg-blue-500/10 text-blue-600" : "border-gray-500/30 bg-gray-500/10 text-gray-600")}>
                            {document.is_public ? 'Public' : 'Private'}
                        </Badge>
                    </div>
                </div>

                {/* Advanced Security */}
                {(securityOptions.add_watermark || securityOptions.enable_encryption || securityOptions.audit_log_access) && (
                    <>
                        <Separator />
                        <div>
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Advanced Security</h4>
                            <div className="space-y-2">
                                {securityOptions.add_watermark && (
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                                        <Fingerprint className="h-5 w-5 text-blue-500" />
                                        <div>
                                            <p className="font-medium">Watermark Protection</p>
                                            <p className="text-xs text-gray-500">Document will display viewer information</p>
                                        </div>
                                    </div>
                                )}
                                {securityOptions.enable_encryption && (
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                                        <FileLock className="h-5 w-5 text-purple-500" />
                                        <div>
                                            <p className="font-medium">File Encryption</p>
                                            <p className="text-xs text-gray-500">AES-256 encryption enabled</p>
                                        </div>
                                    </div>
                                )}
                                {securityOptions.audit_log_access && (
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                                        <History className="h-5 w-5 text-amber-500" />
                                        <div>
                                            <p className="font-medium">Audit Logging</p>
                                            <p className="text-xs text-gray-500">All access is logged</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {/* Restrictions */}
                {(securityOptions.restrict_download || securityOptions.restrict_print) && (
                    <>
                        <Separator />
                        <div>
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Restrictions</h4>
                            <div className="space-y-2">
                                {securityOptions.restrict_download && (
                                    <div className="flex items-center gap-3 p-3 bg-rose-50 dark:bg-rose-950/30 rounded-xl text-rose-600 dark:text-rose-400">
                                        <Download className="h-5 w-5" />
                                        <div>
                                            <p className="font-medium">Download Restricted</p>
                                            <p className="text-xs opacity-80">Downloading is not permitted</p>
                                        </div>
                                    </div>
                                )}
                                {securityOptions.restrict_print && (
                                    <div className="flex items-center gap-3 p-3 bg-rose-50 dark:bg-rose-950/30 rounded-xl text-rose-600 dark:text-rose-400">
                                        <Printer className="h-5 w-5" />
                                        <div>
                                            <p className="font-medium">Print Restricted</p>
                                            <p className="text-xs opacity-80">Printing is not permitted</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {/* Scan Quality */}
                {securityOptions.scan_quality && (
                    <>
                        <Separator />
                        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                                <Scan className="h-4 w-4 text-gray-400" />
                                <span className="text-sm font-medium">Scan Quality</span>
                            </div>
                            <Badge variant="outline" className="capitalize">
                                {securityOptions.scan_quality.replace('_', ' ')}
                            </Badge>
                        </div>
                    </>
                )}
            </div>
        </ModernCard>
    );
}