// components/community-report/ReportTypeSelector.tsx

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Clock, Camera, FileText, Shield, UserX, Check, ArrowRight, X, Search, AlertCircle, Megaphone, HelpCircle } from 'lucide-react';
import { ReportType } from '@/types/portal/community-report';
import { iconMap, pairItems, isOtherType, organizeReportTypes } from '@/types/portal/communityreports/utils/community-report-helpers';

interface ReportTypeSelectorProps {
    reportTypes: ReportType[];
    selectedTypeId: number | null;
    onTypeSelect: (typeId: number) => void;
    onTypeClear: () => void;
    activeTab: 'issues' | 'complaints';
    onTabChange: (tab: 'issues' | 'complaints') => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    isMobile: boolean;
}

export const ReportTypeSelector: React.FC<ReportTypeSelectorProps> = ({
    reportTypes,
    selectedTypeId,
    onTypeSelect,
    onTypeClear,
    activeTab,
    onTabChange,
    searchQuery,
    onSearchChange,
    isMobile
}) => {
    const activeReportTypes = reportTypes.filter(type => type.is_active);
    const organizedTypes = organizeReportTypes(activeReportTypes);
    const selectedType = activeReportTypes.find(type => type.id === selectedTypeId);

    const getFilteredTypes = () => {
        if (!searchQuery) return organizedTypes;
        
        const filteredIssues = organizedTypes.issues.filter(type => 
            type.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            type.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            type.code.toLowerCase().includes(searchQuery.toLowerCase())
        );
        
        const filteredComplaints = organizedTypes.complaints.filter(type => 
            type.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            type.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            type.code.toLowerCase().includes(searchQuery.toLowerCase())
        );
        
        return {
            issues: filteredIssues,
            complaints: filteredComplaints
        };
    };

    const filteredTypes = getFilteredTypes();
    const tabItems = activeTab === 'issues' ? filteredTypes.issues : filteredTypes.complaints;
    const pairedItems = pairItems(tabItems);

    return (
        <div className="space-y-6">
            {/* Search bar */}
            {activeReportTypes.length > 8 && (
                <div className="mb-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Search report types..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="pl-10 pr-10 h-11 rounded-lg"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => onSearchChange('')}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                            >
                                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                            </button>
                        )}
                    </div>
                    {filteredTypes.issues.length === 0 && filteredTypes.complaints.length === 0 && (
                        <div className="text-center py-6 text-gray-500">
                            No report types found matching "{searchQuery}"
                        </div>
                    )}
                </div>
            )}

            {/* Tab Navigation */}
            <div className="mb-4">
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <div className="flex space-x-1">
                        <button
                            type="button"
                            onClick={() => onTabChange('issues')}
                            className={`py-2.5 px-4 text-sm font-medium rounded-t-lg transition-all ${
                                activeTab === 'issues'
                                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-b-2 border-blue-500'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                <span>Issues</span>
                                <Badge 
                                    variant="secondary" 
                                    className="h-5 min-w-5 flex items-center justify-center px-1 text-xs"
                                >
                                    {filteredTypes.issues.length}
                                </Badge>
                            </div>
                        </button>
                        <button
                            type="button"
                            onClick={() => onTabChange('complaints')}
                            className={`py-2.5 px-4 text-sm font-medium rounded-t-lg transition-all ${
                                activeTab === 'complaints'
                                    ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-b-2 border-purple-500'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <Megaphone className="h-4 w-4" />
                                <span>Complaints</span>
                                <Badge 
                                    variant="secondary" 
                                    className="h-5 min-w-5 flex items-center justify-center px-1 text-xs"
                                >
                                    {filteredTypes.complaints.length}
                                </Badge>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Report type list - DISPLAYED IN PAIRS */}
            <div className={`${isMobile && tabItems.length > 6 ? 'max-h-[400px] overflow-y-auto pr-2' : ''}`}>
                <div className="space-y-3">
                    {pairedItems.length > 0 ? (
                        <>
                            {/* Regular report types */}
                            {pairedItems.filter(pair => 
                                pair.some(type => type && !isOtherType(type))
                            ).map((pair, pairIndex) => (
                                <div key={`regular-${pairIndex}`} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {pair.map((type, itemIndex) => {
                                        if (!type || isOtherType(type)) return null;
                                        
                                        const Icon = iconMap[type.icon] || iconMap.default;
                                        const isSelected = selectedTypeId === type.id;
                                        
                                        return (
                                            <button
                                                key={type.id}
                                                type="button"
                                                className={`w-full text-left p-4 rounded-lg border transition-all ${
                                                    isSelected
                                                        ? `border-blue-500 bg-gradient-to-r ${
                                                            activeTab === 'issues' 
                                                                ? 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20' 
                                                                : 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20'
                                                        } ring-2 ring-blue-500/20`
                                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900/50'
                                                }`}
                                                onClick={() => onTypeSelect(type.id)}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-start gap-3 min-w-0 flex-1">
                                                        <div className={`p-2.5 rounded-lg flex-shrink-0 mt-0.5 ${
                                                            isSelected 
                                                                ? (activeTab === 'issues' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-purple-100 dark:bg-purple-900/30')
                                                                : 'bg-gray-100 dark:bg-gray-900'
                                                        }`}>
                                                            <Icon className={`h-5 w-5 ${
                                                                isSelected 
                                                                    ? (activeTab === 'issues' ? 'text-blue-600 dark:text-blue-400' : 'text-purple-600 dark:text-purple-400')
                                                                    : 'text-gray-600 dark:text-gray-400'
                                                            }`} />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <h3 className="font-semibold text-sm truncate">
                                                                    {type.name}
                                                                </h3>
                                                                <Badge 
                                                                    style={{ backgroundColor: type.priority_color }}
                                                                    className="text-xs flex-shrink-0 h-5 px-1.5"
                                                                >
                                                                    {type.priority_label}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
                                                                {type.description}
                                                            </p>
                                                            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                                                <div className="flex items-center gap-1">
                                                                    <Clock className="h-3 w-3" />
                                                                    <span>{type.resolution_days}d</span>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    {type.requires_evidence ? (
                                                                        <Camera className="h-3 w-3 text-amber-600" />
                                                                    ) : (
                                                                        <FileText className="h-3 w-3 text-gray-400" />
                                                                    )}
                                                                    <span>{type.requires_evidence ? 'Evidence' : 'Optional'}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    {type.allows_anonymous ? (
                                                                        <Shield className="h-3 w-3 text-green-600" />
                                                                    ) : (
                                                                        <UserX className="h-3 w-3 text-gray-400" />
                                                                    )}
                                                                    <span>{type.allows_anonymous ? 'Anon' : 'ID'}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex-shrink-0 ml-2">
                                                        {isSelected ? (
                                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                                                activeTab === 'issues' ? 'bg-blue-600' : 'bg-purple-600'
                                                            }`}>
                                                                <Check className="h-3.5 w-3.5 text-white" />
                                                            </div>
                                                        ) : (
                                                            <ArrowRight className="h-4 w-4 text-gray-400" />
                                                        )}
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                    {pair.filter(type => type && !isOtherType(type)).length < 2 && (
                                        <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 min-h-[120px] bg-gray-50/50 dark:bg-gray-900/30 flex items-center justify-center">
                                            <div className="text-center text-gray-400 dark:text-gray-500">
                                                <div className="text-sm">No more items</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* "Other" report type - always at the bottom */}
                            {pairedItems.filter(pair => 
                                pair.some(type => type && isOtherType(type))
                            ).map((pair, pairIndex) => (
                                <div key={`other-${pairIndex}`} className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-700">
                                    <div className="mb-2">
                                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            <HelpCircle className="h-4 w-4 inline mr-2 text-gray-500" />
                                            Can't find what you're looking for?
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {pair.map((type, itemIndex) => {
                                            if (!type || !isOtherType(type)) return null;
                                            
                                            const Icon = HelpCircle;
                                            const isSelected = selectedTypeId === type.id;
                                            
                                            return (
                                                <button
                                                    key={type.id}
                                                    type="button"
                                                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                                                        isSelected
                                                            ? `border-amber-500 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 ring-2 ring-amber-500/20`
                                                            : 'border-gray-300 dark:border-gray-600 hover:border-amber-400 dark:hover:border-amber-600 hover:bg-amber-50/50 dark:hover:bg-amber-900/10'
                                                    }`}
                                                    onClick={() => onTypeSelect(type.id)}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-start gap-3 min-w-0 flex-1">
                                                            <div className={`p-2.5 rounded-lg flex-shrink-0 mt-0.5 ${
                                                                isSelected 
                                                                    ? 'bg-amber-100 dark:bg-amber-900/30'
                                                                    : 'bg-gray-100 dark:bg-gray-900'
                                                            }`}>
                                                                <Icon className={`h-5 w-5 ${
                                                                    isSelected 
                                                                        ? 'text-amber-600 dark:text-amber-400'
                                                                        : 'text-gray-600 dark:text-gray-400'
                                                                }`} />
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <h3 className="font-semibold text-sm truncate">
                                                                        {type.name}
                                                                    </h3>
                                                                    <Badge 
                                                                        variant="outline"
                                                                        className="text-xs flex-shrink-0 h-5 px-1.5 border-amber-300 text-amber-700 dark:text-amber-400"
                                                                    >
                                                                        Other
                                                                    </Badge>
                                                                </div>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
                                                                    {type.description || "Report a different issue not listed above"}
                                                                </p>
                                                                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                                                    <div className="flex items-center gap-1">
                                                                        <Clock className="h-3 w-3" />
                                                                        <span>{type.resolution_days}d</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-1">
                                                                        {type.requires_evidence ? (
                                                                            <Camera className="h-3 w-3 text-amber-600" />
                                                                        ) : (
                                                                            <FileText className="h-3 w-3 text-gray-400" />
                                                                        )}
                                                                        <span>{type.requires_evidence ? 'Evidence' : 'Optional'}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-1">
                                                                        {type.allows_anonymous ? (
                                                                            <Shield className="h-3 w-3 text-green-600" />
                                                                        ) : (
                                                                            <UserX className="h-3 w-3 text-gray-400" />
                                                                        )}
                                                                        <span>{type.allows_anonymous ? 'Anon' : 'ID'}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex-shrink-0 ml-2">
                                                            {isSelected ? (
                                                                <div className="w-6 h-6 rounded-full flex items-center justify-center bg-amber-600">
                                                                    <Check className="h-3.5 w-3.5 text-white" />
                                                                </div>
                                                            ) : (
                                                                <ArrowRight className="h-4 w-4 text-gray-400" />
                                                            )}
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                        {pair.filter(type => type && isOtherType(type)).length < 2 && (
                                            <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 min-h-[120px] bg-gray-50/50 dark:bg-gray-900/30 flex items-center justify-center">
                                                <div className="text-center text-gray-400 dark:text-gray-500">
                                                    <div className="text-sm">No other options</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </>
                    ) : (
                        <div className="text-center py-8 px-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
                                activeTab === 'issues' 
                                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-500' 
                                    : 'bg-purple-100 dark:bg-purple-900/30 text-purple-500'
                            }`}>
                                {activeTab === 'issues' ? (
                                    <AlertCircle className="h-6 w-6" />
                                ) : (
                                    <Megaphone className="h-6 w-6" />
                                )}
                            </div>
                            <h4 className="font-medium mb-1">No {activeTab} found</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {searchQuery 
                                    ? `Try a different search term or clear the search`
                                    : `No ${activeTab} are currently available`
                                }
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Selected Type Summary */}
            {selectedType && (
                <div className={`mt-4 p-4 rounded-lg border ${
                    selectedType.category === 'issue' 
                        ? isOtherType(selectedType)
                            ? 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20'
                            : 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
                        : isOtherType(selectedType)
                        ? 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20'
                        : 'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20'
                }`}>
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${
                                isOtherType(selectedType)
                                    ? 'bg-amber-100 dark:bg-amber-900/30'
                                    : selectedType.category === 'issue'
                                    ? 'bg-blue-100 dark:bg-blue-900/30'
                                    : 'bg-purple-100 dark:bg-purple-900/30'
                            }`}>
                                {(() => {
                                    const Icon = isOtherType(selectedType) ? HelpCircle : (iconMap[selectedType.icon] || iconMap.default);
                                    return <Icon className="h-5 w-5" style={{ color: isOtherType(selectedType) ? '#d97706' : selectedType.color }} />;
                                })()}
                            </div>
                            <div>
                                <h4 className="font-semibold flex items-center gap-2">
                                    {selectedType.name}
                                    {isOtherType(selectedType) ? (
                                        <Badge 
                                            variant="outline"
                                            className="text-xs border-amber-300 text-amber-700 dark:text-amber-400"
                                        >
                                            Other
                                        </Badge>
                                    ) : (
                                        <Badge 
                                            style={{ backgroundColor: selectedType.priority_color }}
                                            className="text-xs"
                                        >
                                            {selectedType.priority_label}
                                        </Badge>
                                    )}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {selectedType.description}
                                </p>
                            </div>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={onTypeClear}
                            className="h-8 w-8 p-0"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                        <div className="text-center p-2 bg-white dark:bg-gray-900 rounded">
                            <div className="font-medium">Resolution Time</div>
                            <div className="text-gray-600 dark:text-gray-400">{selectedType.resolution_days} days</div>
                        </div>
                        <div className="text-center p-2 bg-white dark:bg-gray-900 rounded">
                            <div className="font-medium">Evidence</div>
                            <div className={selectedType.requires_evidence ? 'text-red-600' : 'text-green-600'}>
                                {selectedType.requires_evidence ? 'Required' : 'Optional'}
                            </div>
                        </div>
                        <div className="text-center p-2 bg-white dark:bg-gray-900 rounded">
                            <div className="font-medium">Anonymous</div>
                            <div className={selectedType.allows_anonymous ? 'text-green-600' : 'text-gray-600'}>
                                {selectedType.allows_anonymous ? 'Allowed' : 'Not allowed'}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};