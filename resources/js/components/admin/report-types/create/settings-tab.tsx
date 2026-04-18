// components/admin/report-types/create/settings-tab.tsx
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Users, HelpCircle, Shield, Camera, Eye, AlertCircle, CheckCircle } from 'lucide-react';
import type { ReportType } from '@/types/admin/report-types/report-types';

interface SettingsTabProps {
    formData: {
        is_active: boolean;
        requires_immediate_action: boolean;
        requires_evidence: boolean;
        allows_anonymous: boolean;
        assigned_to_roles: string[];
        [key: string]: any;
    };
    errors: Record<string, string>;
    roleOptions: Record<string, string>;
    assignedRoles: string[];
    onSwitchChange: (name: string, checked: boolean) => void;
    onToggleRole: (role: string) => void;
    getRoleLabel: (role: string) => string;
    isSubmitting: boolean;
    // Optional props for edit mode
    originalIsActive?: boolean;
    originalRequiresImmediateAction?: boolean;
    originalRequiresEvidence?: boolean;
    originalAllowsAnonymous?: boolean;
}

export function SettingsTab({
    formData,
    errors,
    roleOptions,
    assignedRoles,
    onSwitchChange,
    onToggleRole,
    getRoleLabel,
    isSubmitting,
    originalIsActive,
    originalRequiresImmediateAction,
    originalRequiresEvidence,
    originalAllowsAnonymous
}: SettingsTabProps) {
    // Check if values have been modified
    const isActiveModified = originalIsActive !== undefined && formData.is_active !== originalIsActive;
    const isImmediateActionModified = originalRequiresImmediateAction !== undefined && formData.requires_immediate_action !== originalRequiresImmediateAction;
    const isEvidenceModified = originalRequiresEvidence !== undefined && formData.requires_evidence !== originalRequiresEvidence;
    const isAnonymousModified = originalAllowsAnonymous !== undefined && formData.allows_anonymous !== originalAllowsAnonymous;

    const activeSettingsCount = [
        formData.is_active,
        formData.requires_immediate_action,
        formData.requires_evidence,
        formData.allows_anonymous
    ].filter(Boolean).length;

    return (
        <div className="space-y-6">
            {/* Settings Summary */}
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium dark:text-gray-300">Active Settings</span>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                        {activeSettingsCount} active
                    </Badge>
                </div>
            </div>

            {/* Toggle Switches */}
            <div className="space-y-4">
                {/* Active Status */}
                <div className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                            <Label className="dark:text-gray-300">Active Status</Label>
                            {isActiveModified && (
                                <Badge variant="outline" className="text-xs text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                                    Modified
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Enable this report type for submission
                        </p>
                    </div>
                    <Switch
                        checked={formData.is_active}
                        onCheckedChange={(checked) => onSwitchChange('is_active', checked)}
                        disabled={isSubmitting}
                        className="dark:data-[state=checked]:bg-green-600"
                    />
                </div>
                {originalIsActive !== undefined && isActiveModified && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 pl-3">
                        Was: {originalIsActive ? 'Active' : 'Inactive'}
                    </p>
                )}

                {/* Requires Immediate Action */}
                <div className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                            <Label className="dark:text-gray-300">Requires Immediate Action</Label>
                            {isImmediateActionModified && (
                                <Badge variant="outline" className="text-xs text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                                    Modified
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Mark as high priority requiring immediate response
                        </p>
                    </div>
                    <Switch
                        checked={formData.requires_immediate_action}
                        onCheckedChange={(checked) => onSwitchChange('requires_immediate_action', checked)}
                        disabled={isSubmitting}
                        className="dark:data-[state=checked]:bg-orange-600"
                    />
                </div>
                {originalRequiresImmediateAction !== undefined && isImmediateActionModified && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 pl-3">
                        Was: {originalRequiresImmediateAction ? 'Required' : 'Not Required'}
                    </p>
                )}

                {/* Requires Evidence */}
                <div className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                            <Label className="dark:text-gray-300">Requires Evidence</Label>
                            {isEvidenceModified && (
                                <Badge variant="outline" className="text-xs text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                                    Modified
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Require photo/video evidence when submitting
                        </p>
                    </div>
                    <Switch
                        checked={formData.requires_evidence}
                        onCheckedChange={(checked) => onSwitchChange('requires_evidence', checked)}
                        disabled={isSubmitting}
                        className="dark:data-[state=checked]:bg-blue-600"
                    />
                </div>
                {originalRequiresEvidence !== undefined && isEvidenceModified && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 pl-3">
                        Was: {originalRequiresEvidence ? 'Required' : 'Not Required'}
                    </p>
                )}

                {/* Allows Anonymous Reports */}
                <div className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                            <Label className="dark:text-gray-300">Allows Anonymous Reports</Label>
                            {isAnonymousModified && (
                                <Badge variant="outline" className="text-xs text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                                    Modified
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Allow residents to submit reports anonymously
                        </p>
                    </div>
                    <Switch
                        checked={formData.allows_anonymous}
                        onCheckedChange={(checked) => onSwitchChange('allows_anonymous', checked)}
                        disabled={isSubmitting}
                        className="dark:data-[state=checked]:bg-purple-600"
                    />
                </div>
                {originalAllowsAnonymous !== undefined && isAnonymousModified && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 pl-3">
                        Was: {originalAllowsAnonymous ? 'Allowed' : 'Not Allowed'}
                    </p>
                )}
            </div>

            <Separator className="dark:bg-gray-700" />

            {/* Assigned Roles */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label className="dark:text-gray-300 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Assigned Roles
                    </Label>
                    {assignedRoles.length > 0 && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            {assignedRoles.length} assigned
                        </Badge>
                    )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    Select which roles can handle this type of report
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {Object.entries(roleOptions).map(([value, label]) => {
                        const isAssigned = assignedRoles.includes(value);
                        return (
                            <Button
                                key={value}
                                type="button"
                                variant={isAssigned ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => onToggleRole(value)}
                                disabled={isSubmitting}
                                className={`justify-start ${
                                    isAssigned
                                        ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white dark:from-orange-700 dark:to-red-700'
                                        : 'dark:border-gray-600 dark:text-gray-300'
                                }`}
                            >
                                {isAssigned ? (
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                ) : (
                                    <Shield className="h-4 w-4 mr-2" />
                                )}
                                {label}
                            </Button>
                        );
                    })}
                </div>
                {assignedRoles.length === 0 && (
                    <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
                            <div className="text-sm text-amber-700 dark:text-amber-300">
                                <p className="font-medium">Warning</p>
                                <p className="text-xs">No roles assigned. Reports may not be properly routed to the right personnel.</p>
                            </div>
                        </div>
                    </div>
                )}
                {assignedRoles.length > 0 && (
                    <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5" />
                            <div className="text-sm text-green-700 dark:text-green-300">
                                <p className="font-medium">Roles Assigned</p>
                                <p className="text-xs">{assignedRoles.length} role(s) will receive notifications for this report type.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Help Card */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                    <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="flex-1">
                        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">⚙️ Settings Guide</h4>
                        <ul className="list-disc list-inside space-y-1 text-xs text-blue-700 dark:text-blue-300">
                            <li><strong>Active Status:</strong> Only active report types appear in forms</li>
                            <li><strong>Immediate Action:</strong> Triggers urgent notification to assigned roles</li>
                            <li><strong>Requires Evidence:</strong> Mandates file uploads with submissions</li>
                            <li><strong>Anonymous Reports:</strong> Allows submissions without login (useful for sensitive reports)</li>
                            <li><strong>Assigned Roles:</strong> Determines who can view and process reports</li>
                            <li>Only users with assigned roles can access and process these reports</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Feature Preview */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/30 dark:to-gray-800/10 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Feature Preview
                </h4>
                <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                    <p>• <strong>Active reports</strong> will appear in the resident reporting form</p>
                    <p>• <strong>Immediate action</strong> reports trigger push notifications to assigned personnel</p>
                    <p>• <strong>Evidence requirement</strong> ensures proper documentation of incidents</p>
                    <p>• <strong>Anonymous mode</strong> encourages reporting of sensitive issues</p>
                </div>
            </div>
        </div>
    );
}