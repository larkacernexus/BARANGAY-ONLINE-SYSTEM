// components/admin/forms/create/settings-tab.tsx
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Settings, HelpCircle, Shield, Eye, Download, TrendingUp, Calendar } from 'lucide-react';
import type { FormFormData } from '@/types/admin/forms/forms.types';

interface SettingsTabProps {
    formData: FormFormData;
    errors: Record<string, string>;
    onSwitchChange: (name: string, checked: boolean) => void;
    isSubmitting: boolean;
    // Optional props for edit mode
    downloads?: number;
    viewCount?: number;
    createdAt?: string;
    updatedAt?: string;
    originalIsActive?: boolean;
}

export function SettingsTab({
    formData,
    errors,
    onSwitchChange,
    isSubmitting,
    downloads = 0,
    viewCount = 0,
    createdAt,
    updatedAt,
    originalIsActive
}: SettingsTabProps) {
    const isActiveModified = originalIsActive !== undefined && formData.is_active !== originalIsActive;

    // Format date for display
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    return (
        <div className="space-y-6">
            {/* Statistics Section (for edit mode) */}
            {(downloads > 0 || viewCount > 0) && (
                <div className="grid gap-4 md:grid-cols-2">
                    {downloads > 0 && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <Download className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Total Downloads</p>
                                <p className="text-xl font-bold dark:text-gray-200">{downloads.toLocaleString()}</p>
                            </div>
                        </div>
                    )}
                    {viewCount > 0 && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                <Eye className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Total Views</p>
                                <p className="text-xl font-bold dark:text-gray-200">{viewCount.toLocaleString()}</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Date Information (for edit mode) */}
            {(createdAt || updatedAt) && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="space-y-2">
                        {createdAt && (
                            <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                <span className="text-gray-500 dark:text-gray-400">Created:</span>
                                <span className="font-medium dark:text-gray-300">{formatDate(createdAt)}</span>
                            </div>
                        )}
                        {updatedAt && (
                            <div className="flex items-center gap-2 text-sm">
                                <TrendingUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                <span className="text-gray-500 dark:text-gray-400">Last Updated:</span>
                                <span className="font-medium dark:text-gray-300">{formatDate(updatedAt)}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Active Status Toggle */}
            <div className="space-y-4">
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
                            Make this form available for residents to download
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
            </div>

            <Separator className="dark:bg-gray-700" />

            {/* Feature Status Info */}
            <div className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <div className="space-y-0.5">
                    <Label className="dark:text-gray-300">Featured Status</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Featured forms appear prominently on the homepage
                    </p>
                </div>
                <div className={`px-2 py-1 rounded-md text-xs font-medium ${
                    formData.is_featured 
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                }`}>
                    {formData.is_featured ? 'Featured' : 'Not Featured'}
                </div>
            </div>

            {/* Help Card */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                    <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="flex-1">
                        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">⚙️ Settings Guide</h4>
                        <ul className="list-disc list-inside space-y-1 text-xs text-blue-700 dark:text-blue-300">
                            <li><strong>Active Status:</strong> Only active forms appear in the downloads section</li>
                            <li><strong>Featured Status:</strong> Featured forms are highlighted on the homepage</li>
                            <li>Inactive forms are hidden from residents but remain in the system</li>
                            <li>You can reactivate a form at any time</li>
                            <li>Download and view counts help track form popularity</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Form Guidelines */}
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 className="font-medium text-sm dark:text-gray-300 mb-3 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Form Guidelines
                </h4>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <p><strong className="dark:text-gray-300">Title:</strong> Clear, descriptive title for the form.</p>
                    <p><strong className="dark:text-gray-300">Category:</strong> Helps residents find forms easily.</p>
                    <p><strong className="dark:text-gray-300">Agency:</strong> Identifies which government office issues the form.</p>
                    <p><strong className="dark:text-gray-300">File Format:</strong> PDF is recommended for universal compatibility.</p>
                    <p><strong className="dark:text-gray-300">File Size:</strong> Keep files under 10MB for faster downloads.</p>
                </div>
            </div>
        </div>
    );
}