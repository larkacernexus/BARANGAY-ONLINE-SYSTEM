// components/document/mobile/mobile-security.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ModernCard } from '@/components/residentui/modern-card';
import { Shield, ChevronUp, ChevronDown, Lock, Globe, Fingerprint, FileLock, Download, Printer, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import {  Document } from '@/types/portal/records/document.types';

interface MobileSecurityProps {
    document: Document;
}

export function MobileSecurity({ document }: MobileSecurityProps) {
    const [isOpen, setIsOpen] = useState(false);
    const securityOptions = document.security_options || {};

    return (
        <div className="px-4">
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <ModernCard className="overflow-hidden">
                    <CollapsibleTrigger className="w-full">
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
                            <div className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-blue-500" />
                                <span className="font-semibold text-gray-900 dark:text-white">Security</span>
                            </div>
                            <Button variant="ghost" size="sm" className="rounded-full">
                                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                        </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <div className="p-4 pt-0 space-y-4">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Lock className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm">Password Protected</span>
                                    </div>
                                    {document.requires_password ? (
                                        <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-600">Yes</Badge>
                                    ) : (
                                        <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600">No</Badge>
                                    )}
                                </div>

                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Globe className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm">Access Level</span>
                                    </div>
                                    <Badge variant="outline" className={cn(document.is_public ? "border-blue-500/30 bg-blue-500/10 text-blue-600" : "border-gray-500/30 bg-gray-500/10 text-gray-600")}>
                                        {document.is_public ? 'Public' : 'Private'}
                                    </Badge>
                                </div>

                                {(securityOptions.add_watermark || securityOptions.enable_encryption) && (
                                    <div className="pt-2">
                                        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Advanced Security</h4>
                                        <div className="space-y-2">
                                            {securityOptions.add_watermark && (
                                                <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                                    <Fingerprint className="h-4 w-4 text-blue-500" />
                                                    <span className="text-sm">Watermark Protection</span>
                                                </div>
                                            )}
                                            {securityOptions.enable_encryption && (
                                                <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                                    <FileLock className="h-4 w-4 text-purple-500" />
                                                    <span className="text-sm">File Encryption</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {(securityOptions.restrict_download || securityOptions.restrict_print) && (
                                    <div className="pt-2">
                                        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Restrictions</h4>
                                        <div className="space-y-2">
                                            {securityOptions.restrict_download && (
                                                <div className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-950/30 rounded-lg text-rose-600 dark:text-rose-400">
                                                    <Download className="h-4 w-4" />
                                                    <span className="text-sm">Download Restricted</span>
                                                </div>
                                            )}
                                            {securityOptions.restrict_print && (
                                                <div className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-950/30 rounded-lg text-rose-600 dark:text-rose-400">
                                                    <Printer className="h-4 w-4" />
                                                    <span className="text-sm">Print Restricted</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CollapsibleContent>
                </ModernCard>
            </Collapsible>
        </div>
    );
}