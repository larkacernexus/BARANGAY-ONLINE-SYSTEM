import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { 
    Calculator, 
    Calendar, 
    Filter, 
    Info, 
    Scale, 
    Tag, 
    AlertCircle, 
    Users, 
    Home as HomeIcon, 
    User, 
    ExternalLink,
    Clock,
    FileText,
    HelpCircle
} from 'lucide-react';
import { FeeFormData, FeeType, Resident, Household, DocumentCategory, DiscountInfo } from '@/types/fees';
import { useMemo, useState, useEffect } from 'react';

interface LeftColumnProps {
    data: FeeFormData;
    setData: (key: keyof FeeFormData, value: any) => void;
    selectedFeeType: FeeType | null;
    showSurcharge: boolean;
    showPenalty: boolean;
    surchargeExplanation: string;
    penaltyExplanation: string;
    errors?: Record<string, string>;
    handleFeeTypeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    selectedCategory: string;
    setSelectedCategory: (value: string) => void;
    filteredFeeTypes: FeeType[];
    documentCategories: DocumentCategory[];
    getSelectedCategoryName: () => string;
    feeTypes: FeeType[];
    selectedPayer: Resident | Household | null;
    payerType: string;
    formatCurrency: (amount: any) => string;
    selectedFeeTypeId?: string | number;
    // Discount info for display only
    discountInfo?: DiscountInfo | null;
    // Bulk props
    bulkType: 'none' | 'residents' | 'households' | 'custom';
    handleBulkTypeChange: (type: 'none' | 'residents' | 'households' | 'custom') => void;
    totalPayersCount: number;
    totalEstimatedAmount: number;
    onOpenBulkModal: () => void;
}

// Helper function to ensure non-empty string values for Select.Item
const safeSelectValue = (value: any): string => {
    if (value === null || value === undefined || value === '') {
        return 'error-empty-value';
    }
    const str = String(value).trim();
    return str || 'error-empty-string';
};

// Helper function to filter items with valid IDs
const filterValidItems = <T,>(items: T[], getId: (item: T) => any): T[] => {
    return (items || []).filter(item => {
        const id = getId(item);
        return id !== null && 
               id !== undefined && 
               String(id).trim() !== '';
    });
};

// Helper component for safe SelectItem rendering
const SafeSelectItem = ({ value, children, ...props }: any) => {
    const safeValue = safeSelectValue(value);
    
    if (safeValue.startsWith('error-')) {
        console.warn('Skipping SelectItem with invalid value:', value);
        return null;
    }
    
    return (
        <SelectItem value={safeValue} {...props}>
            {children}
        </SelectItem>
    );
};

export default function LeftColumn({
    data,
    setData,
    selectedFeeType,
    showSurcharge,
    showPenalty,
    surchargeExplanation,
    penaltyExplanation,
    errors,
    handleFeeTypeChange,
    selectedCategory,
    setSelectedCategory,
    filteredFeeTypes,
    documentCategories,
    getSelectedCategoryName,
    feeTypes,
    selectedPayer,
    payerType,
    formatCurrency,
    selectedFeeTypeId,
    discountInfo,
    bulkType,
    handleBulkTypeChange,
    totalPayersCount,
    totalEstimatedAmount,
    onOpenBulkModal
}: LeftColumnProps) {
    const [hasError, setHasError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        console.log('LeftColumn mounted with:', {
            documentCategoriesCount: documentCategories?.length,
            filteredFeeTypesCount: filteredFeeTypes?.length,
            selectedCategory,
        });
    }, []);

    const parseNumber = (value: any): number => {
        if (value === null || value === undefined || value === '' || value === 'null') return 0;
        const num = parseFloat(value);
        return isNaN(num) ? 0 : num;
    };

    const safeString = (value: any): string => {
        if (value === null || value === undefined || value === 'null') return '';
        return String(value);
    };

    const safeDocumentCategories = useMemo(() => {
        return filterValidItems(documentCategories, cat => cat.id);
    }, [documentCategories]);

    const safeFilteredFeeTypes = useMemo(() => {
        return filterValidItems(filteredFeeTypes, ft => ft.id);
    }, [filteredFeeTypes]);

    const handleCategoryChange = (value: string) => {
        if (!value || value.trim() === '' || value === 'error-empty-value' || value === 'error-empty-string') {
            setSelectedCategory('all');
        } else {
            setSelectedCategory(value);
        }
    };

    const safeSelectedCategory = selectedCategory && selectedCategory.trim() !== '' 
        ? selectedCategory 
        : 'all';

    if (hasError) {
        return (
            <Card className="border-red-300 bg-red-50">
                <CardHeader>
                    <CardTitle className="text-red-700">Error Loading Component</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-red-600">{errorMessage}</p>
                    <Button 
                        onClick={() => window.location.reload()} 
                        className="mt-4"
                        variant="outline"
                    >
                        Reload Page
                    </Button>
                </CardContent>
            </Card>
        );
    }

    try {
        return (
            <div className="space-y-6">
                {/* Fee Type Selection Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Tag className="h-5 w-5" />
                            Fee Information
                        </CardTitle>
                        <CardDescription>
                            Select the type of fee to issue
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Document Category Filter */}
                        {safeDocumentCategories.length > 0 && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="flex items-center gap-2">
                                        <Filter className="h-4 w-4" />
                                        Filter by Category
                                    </Label>
                                    {safeSelectedCategory !== 'all' && (
                                        <button
                                            type="button"
                                            onClick={() => setSelectedCategory('all')}
                                            className="text-sm text-primary hover:underline"
                                        >
                                            Clear filter
                                        </button>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1">
                                        <Select
                                            value={safeSelectedCategory}
                                            onValueChange={handleCategoryChange}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue>
                                                    <div className="flex items-center gap-2">
                                                        <span>
                                                            {getSelectedCategoryName()}
                                                        </span>
                                                        {safeSelectedCategory !== 'all' && (
                                                            <Badge
                                                                variant="secondary"
                                                                className="ml-2"
                                                            >
                                                                {safeFilteredFeeTypes.length} fee type(s)
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SafeSelectItem value="all">
                                                    All Categories
                                                </SafeSelectItem>
                                                {safeDocumentCategories.map((category) => (
                                                    <SafeSelectItem
                                                        key={category.id}
                                                        value={category.id}
                                                    >
                                                        {category.name}
                                                    </SafeSelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="fee_type_id" className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Fee Type *
                            </Label>
                            <select
                                id="fee_type_id"
                                required
                                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                                value={safeString(data.fee_type_id)}
                                onChange={handleFeeTypeChange}
                            >
                                <option value="">
                                    Select Fee Type
                                </option>
                                {safeFilteredFeeTypes.map((feeType) => (
                                    <option
                                        key={feeType.id}
                                        value={feeType.id}
                                    >
                                        {feeType.code} - {feeType.name}
                                        {feeType.document_category && ` (${feeType.document_category.name})`}
                                        {feeType.has_penalty && ' [Has Penalty]'}
                                        {feeType.is_discountable && ' [Discountable]'}
                                    </option>
                                ))}
                            </select>
                            {errors?.fee_type_id && (
                                <p className="text-sm text-red-500">
                                    {errors.fee_type_id}
                                </p>
                            )}

                            {safeSelectedCategory !== 'all' && safeFilteredFeeTypes.length === 0 && (
                                <div className="mt-2 rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
                                    <p>
                                        No fee types found for this category.{' '}
                                        <button
                                            type="button"
                                            onClick={() => setSelectedCategory('all')}
                                            className="font-medium text-yellow-700 underline hover:text-yellow-900"
                                        >
                                            Show all fee types
                                        </button>
                                    </p>
                                </div>
                            )}
                        </div>

                        {selectedFeeType && (
                            <div className="rounded-md bg-gray-50 p-4 space-y-3">
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    {selectedFeeType.document_category && (
                                        <div>
                                            <span className="font-medium text-gray-600">
                                                Category:
                                            </span>{' '}
                                            <span className="font-semibold">
                                                {selectedFeeType.document_category.name}
                                            </span>
                                        </div>
                                    )}
                                    <div>
                                        <span className="font-medium text-gray-600">
                                            Base Amount:
                                        </span>{' '}
                                        <span className="font-semibold text-primary">
                                            {formatCurrency(selectedFeeType.base_amount)}
                                        </span>
                                    </div>
                                    {selectedFeeType.validity_days && (
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3 w-3 text-gray-500" />
                                            <span className="font-medium text-gray-600">Validity:</span>{' '}
                                            <span>{selectedFeeType.validity_days} days</span>
                                        </div>
                                    )}
                                    {selectedFeeType.has_penalty && (
                                        <div className="col-span-2">
                                            <Badge
                                                variant="outline"
                                                className="border-orange-200 bg-orange-50 text-orange-700"
                                            >
                                                <AlertCircle className="mr-1 h-3 w-3" />
                                                This fee type supports penalties for late payments
                                            </Badge>
                                        </div>
                                    )}
                                </div>
                                
                                {selectedFeeType.description && (
                                    <div className="text-sm border-t pt-2">
                                        <span className="font-medium text-gray-600">
                                            Description:
                                        </span>{' '}
                                        <span className="text-gray-700">{selectedFeeType.description}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Discount Information Card - DISPLAY ONLY */}
                {discountInfo && discountInfo.eligibleDiscounts.length > 0 && (
                    <Card className="border-blue-200 bg-blue-50/50">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2 text-blue-700">
                                <Scale className="h-4 w-4" />
                                Philippine Statutory Discounts (For Reference Only)
                            </CardTitle>
                            <CardDescription className="text-xs text-blue-600">
                                These discounts are available for this fee type. 
                                They will be applied during payment upon valid ID presentation.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {discountInfo.eligibleDiscounts.map((discount, idx) => (
                                    <div key={idx} className="bg-white rounded-md p-3 border border-blue-100">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-sm">{discount.name}</span>
                                                <Badge variant="outline" className="text-xs bg-blue-50">
                                                    {discount.percentage}%
                                                </Badge>
                                            </div>
                                            <Badge variant="secondary" className="text-xs">
                                                {discount.legalBasis}
                                            </Badge>
                                        </div>
                                        
                                        {discount.description && (
                                            <p className="text-xs text-gray-600 mt-1">
                                                {discount.description}
                                            </p>
                                        )}
                                        
                                        {discount.requirements && discount.requirements.length > 0 && (
                                            <div className="mt-2 text-xs text-gray-500">
                                                <span className="font-medium">Requirements: </span>
                                                {discount.requirements.join(' • ')}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                
                                {/* Legal Notes */}
                                {discountInfo.legalNotes && discountInfo.legalNotes.length > 0 && (
                                    <div className="mt-3 text-xs text-blue-600 bg-blue-100/50 p-2 rounded">
                                        {discountInfo.legalNotes.map((note, idx) => (
                                            <p key={idx} className="flex items-start gap-1">
                                                <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                                <span>{note}</span>
                                            </p>
                                        ))}
                                    </div>
                                )}
                                
                                {/* Warnings */}
                                {discountInfo.warnings && discountInfo.warnings.length > 0 && (
                                    <div className="mt-3 text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                                        {discountInfo.warnings.map((warning, idx) => (
                                            <p key={idx} className="flex items-start gap-1">
                                                <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                                <span>{warning}</span>
                                            </p>
                                        ))}
                                    </div>
                                )}
                                
                                {/* Important Note */}
                                <div className="mt-4 text-xs border-t border-blue-200 pt-3 text-blue-600">
                                    <p className="font-medium">⚠️ Important:</p>
                                    <ul className="list-disc pl-4 mt-1 space-y-1">
                                        <li>Discounts require valid government ID presentation at time of payment</li>
                                        <li>Senior and PWD discounts cannot be combined (max 20% total)</li>
                                        <li>Discounts are verified and applied during payment processing</li>
                                        <li>This information is for reference only</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Bulk Fee Creation Toggle Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Fee Creation Mode
                        </CardTitle>
                        <CardDescription>
                            Choose whether to create a single fee or multiple fees at once
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                            <button
                                type="button"
                                onClick={() => handleBulkTypeChange('none')}
                                className={`flex flex-col items-center justify-center rounded-md border p-4 transition-colors ${
                                    bulkType === 'none'
                                        ? 'border-primary bg-primary/10 text-primary shadow-sm'
                                        : 'border-gray-300 hover:bg-gray-50 hover:shadow'
                                }`}
                            >
                                <User className="mb-2 h-6 w-6" />
                                <span className="text-sm font-medium">Single Fee</span>
                                <span className="mt-1 text-xs text-gray-500">One payer</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleBulkTypeChange('residents')}
                                className={`flex flex-col items-center justify-center rounded-md border p-4 transition-colors ${
                                    bulkType === 'residents'
                                        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                                        : 'border-gray-300 hover:bg-gray-50 hover:shadow'
                                }`}
                            >
                                <Users className="mb-2 h-6 w-6" />
                                <span className="text-sm font-medium">Multiple Residents</span>
                                <span className="mt-1 text-xs text-gray-500">Select residents</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleBulkTypeChange('households')}
                                className={`flex flex-col items-center justify-center rounded-md border p-4 transition-colors ${
                                    bulkType === 'households'
                                        ? 'border-green-500 bg-green-50 text-green-700 shadow-sm'
                                        : 'border-gray-300 hover:bg-gray-50 hover:shadow'
                                }`}
                            >
                                <HomeIcon className="mb-2 h-6 w-6" />
                                <span className="text-sm font-medium">Multiple Households</span>
                                <span className="mt-1 text-xs text-gray-500">Select households</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleBulkTypeChange('custom')}
                                className={`flex flex-col items-center justify-center rounded-md border p-4 transition-colors ${
                                    bulkType === 'custom'
                                        ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-sm'
                                        : 'border-gray-300 hover:bg-gray-50 hover:shadow'
                                }`}
                            >
                                <User className="mb-2 h-6 w-6" />
                                <span className="text-sm font-medium">Custom Payers</span>
                                <span className="mt-1 text-xs text-gray-500">Manual entry</span>
                            </button>
                        </div>

                        {/* Bulk Selection Summary */}
                        {bulkType !== 'none' && (
                            <div className="rounded-md border bg-gray-50 p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-full bg-primary/10 p-2">
                                            {bulkType === 'residents' && <Users className="h-5 w-5 text-blue-600" />}
                                            {bulkType === 'households' && <HomeIcon className="h-5 w-5 text-green-600" />}
                                            {bulkType === 'custom' && <User className="h-5 w-5 text-purple-600" />}
                                        </div>
                                        <div>
                                            <div className="font-semibold">
                                                {bulkType === 'residents' && 'Multiple Residents'}
                                                {bulkType === 'households' && 'Multiple Households'}
                                                {bulkType === 'custom' && 'Custom Payers'}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {totalPayersCount > 0 ? (
                                                    <>
                                                        <Badge variant="secondary" className="mr-2">
                                                            {totalPayersCount} selected
                                                        </Badge>
                                                        <span className="text-primary font-medium">
                                                            {formatCurrency(totalEstimatedAmount)} total
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="text-gray-500">
                                                        No payers selected yet
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {totalPayersCount > 0 && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={onOpenBulkModal}
                                                className="gap-1"
                                            >
                                                <ExternalLink className="h-3 w-3" />
                                                View Details
                                            </Button>
                                        )}
                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={onOpenBulkModal}
                                            className="gap-1"
                                        >
                                            {totalPayersCount > 0 ? 'Edit Selection' : 'Select Payers'}
                                        </Button>
                                    </div>
                                </div>

                                {totalPayersCount === 0 && (
                                    <div className="mt-3 rounded-md bg-blue-50 p-3 text-sm text-blue-700">
                                        <Info className="mr-2 inline h-4 w-4" />
                                        Click "Select Payers" to choose who will receive this fee
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Amount Calculation Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calculator className="h-5 w-5" />
                            Amount Calculation
                        </CardTitle>
                        <CardDescription>
                            Configure the fee amount and adjustments
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="base_amount">
                                Base Amount *
                            </Label>
                            <div className="relative">
                                <span className="absolute top-1/2 left-3 -translate-y-1/2 transform font-bold text-gray-500">
                                    ₱
                                </span>
                                <Input
                                    id="base_amount"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    required
                                    className="pl-10"
                                    value={data.base_amount}
                                    onChange={(e) =>
                                        setData('base_amount', parseNumber(e.target.value))
                                    }
                                />
                            </div>
                            {errors?.base_amount && (
                                <p className="text-sm text-red-500">
                                    {errors.base_amount}
                                </p>
                            )}
                        </div>

                        {showSurcharge && (
                            <div className="space-y-2">
                                <div className="flex items-center">
                                    <Label htmlFor="surcharge_amount">
                                        Surcharge Amount
                                    </Label>
                                    {surchargeExplanation && (
                                        <div className="ml-2 group relative">
                                            <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-64 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10">
                                                {surchargeExplanation}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="relative">
                                    <span className="absolute top-1/2 left-3 -translate-y-1/2 transform font-bold text-gray-500">
                                        ₱
                                    </span>
                                    <Input
                                        id="surcharge_amount"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className="pl-10"
                                        value={data.surcharge_amount}
                                        onChange={(e) =>
                                            setData('surcharge_amount', parseNumber(e.target.value))
                                        }
                                    />
                                </div>
                                {surchargeExplanation && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        {surchargeExplanation}
                                    </p>
                                )}
                            </div>
                        )}

                        {showPenalty && (
                            <div className="space-y-2">
                                <div className="flex items-center">
                                    <Label htmlFor="penalty_amount">
                                        Penalty Amount
                                    </Label>
                                    {penaltyExplanation && (
                                        <div className="ml-2 group relative">
                                            <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-64 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10">
                                                {penaltyExplanation}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="relative">
                                    <span className="absolute top-1/2 left-3 -translate-y-1/2 transform font-bold text-gray-500">
                                        ₱
                                    </span>
                                    <Input
                                        id="penalty_amount"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className="pl-10"
                                        value={data.penalty_amount}
                                        onChange={(e) =>
                                            setData('penalty_amount', parseNumber(e.target.value))
                                        }
                                    />
                                </div>
                                {penaltyExplanation && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        {penaltyExplanation}
                                    </p>
                                )}
                                <div className="mt-2 rounded-md bg-yellow-50 p-2 text-xs text-yellow-700">
                                    <Info className="mr-1 inline h-3 w-3" />
                                    <strong>Note:</strong> New fees should typically have ₱0 penalty. 
                                    Penalties are added when processing late payments.
                                </div>
                            </div>
                        )}

                        <div className="border-t pt-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm text-gray-600">
                                    <span>Base Amount:</span>
                                    <span>{formatCurrency(data.base_amount)}</span>
                                </div>
                                {data.surcharge_amount > 0 && (
                                    <div className="flex items-center justify-between text-sm text-gray-600">
                                        <span>Surcharge:</span>
                                        <span className="text-orange-600">
                                            +{formatCurrency(data.surcharge_amount)}
                                        </span>
                                    </div>
                                )}
                                {data.penalty_amount > 0 && (
                                    <div className="flex items-center justify-between text-sm text-gray-600">
                                        <span>Penalty:</span>
                                        <span className="text-red-600">
                                            +{formatCurrency(data.penalty_amount)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between border-t pt-2">
                                    <span className="text-lg font-semibold text-gray-900">
                                        Total Fee Amount:
                                    </span>
                                    <span className="text-2xl font-bold text-primary">
                                        {formatCurrency(data.total_amount)}
                                    </span>
                                </div>
                                {totalPayersCount > 1 && (
                                    <div className="flex items-center justify-between border-t pt-2 mt-2 bg-purple-50 p-2 rounded">
                                        <span className="text-lg font-semibold text-purple-900">
                                            Bulk Total ({totalPayersCount} payers):
                                        </span>
                                        <span className="text-2xl font-bold text-purple-600">
                                            {formatCurrency(totalEstimatedAmount)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Dates Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Dates
                        </CardTitle>
                        <CardDescription>
                            Set issue and due dates
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="issue_date">
                                    Issue Date *
                                </Label>
                                <Input
                                    id="issue_date"
                                    type="date"
                                    required
                                    value={safeString(data.issue_date)}
                                    onChange={(e) =>
                                        setData('issue_date', e.target.value)
                                    }
                                />
                                {errors?.issue_date && (
                                    <p className="text-sm text-red-500">
                                        {errors.issue_date}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="due_date">
                                    Due Date *
                                </Label>
                                <Input
                                    id="due_date"
                                    type="date"
                                    required
                                    value={safeString(data.due_date)}
                                    onChange={(e) =>
                                        setData('due_date', e.target.value)
                                    }
                                    min={data.issue_date}
                                />
                                {errors?.due_date && (
                                    <p className="text-sm text-red-500">
                                        {errors.due_date}
                                    </p>
                                )}
                            </div>
                        </div>

                        <Alert className="border-blue-100 bg-blue-50">
                            <Info className="h-4 w-4" />
                            <AlertDescription className="text-sm">
                                <div className="font-medium">
                                    Important Date Information:
                                </div>
                                <ul className="mt-1 list-disc pl-5">
                                    <li>
                                        <strong>Issue Date:</strong> When the fee is created/issued
                                    </li>
                                    <li>
                                        <strong>Due Date:</strong> When payment is required
                                    </li>
                                    <li>
                                        <strong>Penalties apply</strong> only if payment is made AFTER the due date
                                    </li>
                                </ul>
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>
            </div>
        );
    } catch (error) {
        console.error('Error rendering LeftColumn:', error);
        setHasError(true);
        setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
        
        return (
            <Card className="border-red-300 bg-red-50">
                <CardHeader>
                    <CardTitle className="text-red-700">Error Rendering Component</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-red-600">An error occurred while rendering this component.</p>
                    <pre className="mt-2 text-xs text-red-800 bg-red-100 p-2 rounded">
                        {error instanceof Error ? error.stack : String(error)}
                    </pre>
                </CardContent>
            </Card>
        );
    }
}