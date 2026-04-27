// resources/js/Pages/Admin/Fees/components/fee-requirements-tab.tsx

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    FileCheck,
    FileText,
    CheckCircle,
    ClipboardList,
    Upload,
    AlertCircle,
    XCircle,
} from 'lucide-react';
import { Fee } from '@/types/admin/fees/fees';

// ========== TYPES ==========
interface FeeRequirementsTabProps {
    fee: Fee;
    submittedRequirements: string[];
}

export const FeeRequirementsTab: React.FC<FeeRequirementsTabProps> = ({ 
    fee, 
    submittedRequirements 
}) => {
    // Parse requirements from fee type
    const parseRequirements = (): string[] => {
        const requirements = fee.fee_type?.requirements;
        
        if (!requirements) {
            return [];
        }
        
        if (Array.isArray(requirements)) {
            return requirements;
        }
        
        if (typeof requirements === 'string') {
            try {
                const parsed = JSON.parse(requirements);
                return Array.isArray(parsed) ? parsed : [];
            } catch {
                // If it's a plain string, treat it as a single requirement
                return [requirements];
            }
        }
        
        return [];
    };

    const requiredRequirements = parseRequirements();
    
    // Check if a requirement has been submitted
    const isRequirementSubmitted = (requirement: string): boolean => {
        return submittedRequirements.some(
            submitted => submitted.toLowerCase().includes(requirement.toLowerCase()) ||
                       requirement.toLowerCase().includes(submitted.toLowerCase())
        );
    };

    // Get submission status counts
    const submittedCount = submittedRequirements.length;
    const requiredCount = requiredRequirements.length;
    const completedCount = requiredRequirements.filter(req => isRequirementSubmitted(req)).length;
    const pendingCount = requiredCount - completedCount;
    
    // Calculate completion percentage
    const completionPercentage = requiredCount > 0 
        ? Math.round((completedCount / requiredCount) * 100) 
        : 100;

    return (
        <div className="space-y-6">
            {/* Requirements Overview Card */}
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <ClipboardList className="h-5 w-5" />
                        Requirements Overview
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                        Track required documents and submission status
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Progress Summary */}
                    {requiredCount > 0 && (
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Completion Progress
                                </span>
                                <span className="text-sm font-semibold dark:text-gray-300">
                                    {completedCount} of {requiredCount} completed
                                </span>
                            </div>
                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full rounded-full transition-all duration-300 ${
                                        completionPercentage === 100 
                                            ? 'bg-green-500' 
                                            : completionPercentage >= 50 
                                                ? 'bg-yellow-500' 
                                                : 'bg-red-500'
                                    }`}
                                    style={{ width: `${completionPercentage}%` }}
                                />
                            </div>
                            <div className="flex justify-between mt-1">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {completionPercentage}% complete
                                </span>
                                {pendingCount > 0 && (
                                    <span className="text-xs text-amber-600 dark:text-amber-400">
                                        {pendingCount} pending
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Status Badges */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                            <FileText className="h-3 w-3 mr-1" />
                            Required: {requiredCount}
                        </Badge>
                        <Badge variant="outline" className="text-green-600 dark:text-green-400 border-green-200 dark:border-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Submitted: {submittedCount}
                        </Badge>
                        {pendingCount > 0 && (
                            <Badge variant="outline" className="text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Pending: {pendingCount}
                            </Badge>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Required Requirements Card */}
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <FileCheck className="h-5 w-5" />
                        Required Documents
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                        Documents required for {fee.fee_type?.name || 'this fee type'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {requiredRequirements.length > 0 ? (
                        <div className="space-y-1">
                            {requiredRequirements.map((requirement, index) => {
                                const isSubmitted = isRequirementSubmitted(requirement);
                                
                                return (
                                    <div 
                                        key={index}
                                        className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                                            isSubmitted 
                                                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                                                : 'bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700'
                                        }`}
                                    >
                                        <div className="flex-shrink-0 mt-0.5">
                                            {isSubmitted ? (
                                                <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
                                            ) : (
                                                <XCircle className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm ${
                                                isSubmitted 
                                                    ? 'text-gray-900 dark:text-gray-100' 
                                                    : 'text-gray-600 dark:text-gray-400'
                                            }`}>
                                                {requirement}
                                            </p>
                                            {isSubmitted && (
                                                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                                    ✓ Document submitted
                                                </p>
                                            )}
                                        </div>
                                        {isSubmitted && (
                                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs">
                                                Complete
                                            </Badge>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <FileText className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-3" />
                            <p className="text-gray-500 dark:text-gray-400">
                                No specific requirements for this fee type.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Submitted Documents Card */}
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <Upload className="h-5 w-5" />
                        Submitted Documents
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                        Documents that have been submitted for this fee
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {submittedRequirements.length > 0 ? (
                        <div className="space-y-1">
                            {submittedRequirements.map((document, index) => {
                                // Check if this document matches a required requirement
                                const matchesRequirement = requiredRequirements.some(
                                    req => req.toLowerCase().includes(document.toLowerCase()) ||
                                          document.toLowerCase().includes(req.toLowerCase())
                                );
                                
                                return (
                                    <div 
                                        key={index}
                                        className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                                    >
                                        <div className="flex-shrink-0 mt-0.5">
                                            <CheckCircle className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-gray-900 dark:text-gray-100">
                                                {document}
                                            </p>
                                            {matchesRequirement && (
                                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                                    ✓ Matches required document
                                                </p>
                                            )}
                                        </div>
                                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-xs">
                                            Submitted
                                        </Badge>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Upload className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-3" />
                            <p className="text-gray-500 dark:text-gray-400">
                                No documents have been submitted yet.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Summary Section */}
            {requiredCount > 0 && (
                <Card className="dark:bg-gray-900">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Requirements Status
                                </p>
                                <p className="text-2xl font-bold dark:text-gray-100 mt-1">
                                    {completedCount} / {requiredCount}
                                </p>
                            </div>
                            <div className={`px-4 py-2 rounded-full ${
                                completionPercentage === 100 
                                    ? 'bg-green-100 dark:bg-green-900/30' 
                                    : 'bg-yellow-100 dark:bg-yellow-900/30'
                            }`}>
                                <span className={`text-sm font-medium ${
                                    completionPercentage === 100 
                                        ? 'text-green-800 dark:text-green-400' 
                                        : 'text-yellow-800 dark:text-yellow-400'
                                }`}>
                                    {completionPercentage === 100 
                                        ? 'All Requirements Met' 
                                        : `${pendingCount} Requirement${pendingCount !== 1 ? 's' : ''} Pending`}
                                </span>
                            </div>
                        </div>
                        
                        {completionPercentage === 100 && (
                            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                <p className="text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4" />
                                    All required documents have been submitted. This fee is ready for processing.
                                </p>
                            </div>
                        )}
                        
                        {pendingCount > 0 && (
                            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                                <p className="text-sm text-amber-700 dark:text-amber-400 flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4" />
                                    {pendingCount} document{pendingCount !== 1 ? 's' : ''} still required before processing can continue.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};