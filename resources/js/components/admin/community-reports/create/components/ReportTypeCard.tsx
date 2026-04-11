// components/community-report/ReportTypeCard.tsx
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, X, AlertCircle, Megaphone, Clock, Camera, Check } from 'lucide-react';
import { ReportType } from '@/types/admin/reports/community-report';

const iconMap: Record<string, any> = {
    'alert-circle': AlertCircle,
    'megaphone': Megaphone,
    'help-circle': AlertCircle,
    default: AlertCircle
};

interface ReportTypeCardProps {
    reportTypes: ReportType[];
    selectedType: ReportType | null;
    onTypeSelect: (typeId: number) => void;
}

export const ReportTypeCard = ({ reportTypes, selectedType, onTypeSelect }: ReportTypeCardProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'issues' | 'complaints'>('issues');

    return (
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                    <AlertCircle className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                    Select Report Type
                </CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400">
                    Choose the type of report that best describes the incident
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-600" />
                    <Input
                        type="text"
                        placeholder="Search report types by name, code, or category..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-10 h-11 rounded-lg bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <div className="flex space-x-1">
                        <button
                            type="button"
                            onClick={() => setActiveTab('issues')}
                            className={`py-2.5 px-4 text-sm font-medium rounded-t-lg transition-all ${
                                activeTab === 'issues'
                                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-b-2 border-blue-500'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                <span>Issues & Concerns</span>
                            </div>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('complaints')}
                            className={`py-2.5 px-4 text-sm font-medium rounded-t-lg transition-all ${
                                activeTab === 'complaints'
                                    ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-b-2 border-purple-500'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <Megaphone className="h-4 w-4" />
                                <span>Complaints</span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Report Types List */}
                <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-3">
                        {reportTypes
                            .filter((type) => 
                                activeTab === 'issues' 
                                    ? type.category?.toLowerCase().includes('issue')
                                    : type.category?.toLowerCase().includes('complaint')
                            )
                            .filter((type) => 
                                searchQuery === '' || 
                                type.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                type.description?.toLowerCase().includes(searchQuery.toLowerCase())
                            )
                            .map((type) => {
                                const Icon = iconMap[type.icon || 'default'] || iconMap.default;
                                const isSelected = selectedType?.id === type.id;
                                
                                return (
                                    <button
                                        key={type.id}
                                        type="button"
                                        className={`w-full text-left p-4 rounded-lg border transition-all ${
                                            isSelected
                                                ? `border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 ring-2 ring-blue-500/20`
                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900/50 bg-white dark:bg-gray-900'
                                        }`}
                                        onClick={() => onTypeSelect(type.id)}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`p-2.5 rounded-lg flex-shrink-0 ${
                                                isSelected 
                                                    ? 'bg-blue-100 dark:bg-blue-900/50'
                                                    : 'bg-gray-100 dark:bg-gray-900'
                                            }`}>
                                                <Icon className={`h-5 w-5 ${
                                                    isSelected 
                                                        ? 'text-blue-600 dark:text-blue-400'
                                                        : 'text-gray-600 dark:text-gray-400'
                                                }`} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{type.name}</h3>
                                                    {type.priority_label && (
                                                        <Badge 
                                                            style={{ backgroundColor: type.priority_color || '#6b7280' }}
                                                            className="text-xs text-white"
                                                        >
                                                            {type.priority_label}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {type.description}
                                                </p>
                                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {type.resolution_days || 3} days
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Camera className="h-3 w-3" />
                                                        {type.requires_evidence ? 'Required' : 'Optional'}
                                                    </span>
                                                </div>
                                            </div>
                                            {isSelected && (
                                                <Check className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
};