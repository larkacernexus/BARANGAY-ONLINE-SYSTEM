// /components/residentui/fees/fee-types-manager.tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Plus, Edit, Trash2, Eye, DollarSign, Calendar, Tag } from 'lucide-react';
import { FEE_TYPES, getCategoryLabel, getFrequencyLabel, FeeType, getDiscountRate, getPenaltyRate } from '@/types/fee-types';
import { cn } from '@/lib/utils';

interface FeeTypesManagerProps {
    onSelectFeeType?: (feeType: FeeType) => void;
    onEditFeeType?: (feeType: FeeType) => void;
    onDeleteFeeType?: (feeType: FeeType) => void;
    readOnly?: boolean;
}

export const FeeTypesManager = ({
    onSelectFeeType,
    onEditFeeType,
    onDeleteFeeType,
    readOnly = false
}: FeeTypesManagerProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    
    const categories = ['all', 'clearance', 'permit', 'tax', 'service', 'penalty'];
    
    const filteredFeeTypes = FEE_TYPES.filter(feeType => {
        const matchesSearch = feeType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             feeType.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             feeType.code.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || feeType.category === selectedCategory;
        return matchesSearch && matchesCategory && feeType.is_active;
    });
    
    const discountRate = getDiscountRate;
    const penaltyRate = getPenaltyRate;
    
    return (
        <div className="space-y-4">
            {/* Search and Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search fee types..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                    {categories.map(category => (
                        <Button
                            key={category}
                            variant={selectedCategory === category ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedCategory(category)}
                            className="capitalize"
                        >
                            {category === 'all' ? 'All' : getCategoryLabel(category)}
                        </Button>
                    ))}
                </div>
                {!readOnly && (
                    <Button className="shrink-0">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Fee Type
                    </Button>
                )}
            </div>
            
            {/* Fee Types Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFeeTypes.map((feeType) => {
                    const Icon = feeType.icon;
                    const discount = discountRate(feeType);
                    const penalty = penaltyRate(feeType);
                    
                    return (
                        <Card
                            key={feeType.id}
                            className={cn(
                                'hover:shadow-lg transition-all duration-200 cursor-pointer',
                                'border-l-4',
                                feeType.color === 'text-blue-600' && 'border-l-blue-500',
                                feeType.color === 'text-green-600' && 'border-l-green-500',
                                feeType.color === 'text-purple-600' && 'border-l-purple-500',
                                feeType.color === 'text-yellow-600' && 'border-l-yellow-500',
                                feeType.color === 'text-red-600' && 'border-l-red-500',
                                feeType.color === 'text-indigo-600' && 'border-l-indigo-500',
                                feeType.color === 'text-pink-600' && 'border-l-pink-500',
                                feeType.color === 'text-orange-600' && 'border-l-orange-500'
                            )}
                            onClick={() => onSelectFeeType?.(feeType)}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={cn('p-2 rounded-lg', feeType.bgColor)}>
                                            <Icon className={cn('h-5 w-5', feeType.color)} />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base">
                                                {feeType.name}
                                            </CardTitle>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {feeType.code}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="capitalize">
                                        {getCategoryLabel(feeType.category)}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {feeType.description}
                                </p>
                                
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="h-4 w-4 text-gray-400" />
                                        <span className="font-semibold text-gray-900 dark:text-white">
                                            ₱{feeType.amount.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-gray-400" />
                                        <span className="text-gray-600 dark:text-gray-400">
                                            {getFrequencyLabel(feeType.frequency)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Tag className="h-4 w-4 text-gray-400" />
                                        <span className="text-xs text-gray-500 capitalize">
                                            {feeType.applicable_to}
                                        </span>
                                    </div>
                                </div>
                                
                                {(discount > 0 || penalty > 0) && (
                                    <div className="flex gap-2 text-xs">
                                        {discount > 0 && (
                                            <Badge variant="success" className="bg-green-100 text-green-800">
                                                {discount * 100}% early discount
                                            </Badge>
                                        )}
                                        {penalty > 0 && (
                                            <Badge variant="destructive">
                                                {penalty * 100}% late penalty
                                            </Badge>
                                        )}
                                    </div>
                                )}
                                
                                {!readOnly && (
                                    <div className="flex gap-2 pt-2 border-t">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="flex-1"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onEditFeeType?.(feeType);
                                            }}
                                        >
                                            <Edit className="h-3 w-3 mr-1" />
                                            Edit
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="flex-1 text-red-600 hover:text-red-700"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteFeeType?.(feeType);
                                            }}
                                        >
                                            <Trash2 className="h-3 w-3 mr-1" />
                                            Delete
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
            
            {filteredFeeTypes.length === 0 && (
                <div className="text-center py-12">
                    <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                        <Search className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No fee types found</h3>
                    <p className="text-gray-500">
                        {searchTerm ? 'Try adjusting your search' : 'No fee types available'}
                    </p>
                </div>
            )}
        </div>
    );
};