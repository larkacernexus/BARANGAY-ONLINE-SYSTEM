// components/admin/feesEdit/LeftColumn.tsx

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
    User, 
    Clock,
    FileText,
    HelpCircle,
    Award,
    Shield
} from 'lucide-react';
import { FeeFormData, FeeType, Resident, Household, DocumentCategory, DiscountInfo, Privilege } from '@/types/fees';
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
    discountInfo?: DiscountInfo | null;
    hasPrivileges?: boolean;
    allPrivileges?: Privilege[];
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
    hasPrivileges,
    allPrivileges = []
}: LeftColumnProps) {
    const [hasError, setHasError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        console.log('LeftColumn (Edit) mounted with:', {
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
            <Card className="border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                <CardHeader>
                    <CardTitle className="text-red-700 dark:text-red-400">Error Loading Component</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-red-600 dark:text-red-400">{errorMessage}</p>
                    <Button 
                        onClick={() => window.location.reload()} 
                        className="mt-4 dark:border-gray-600 dark:text-gray-300"
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
                <Card className="dark:bg-gray-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                            <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 flex items-center justify-center">
                                <Tag className="h-3 w-3 text-white" />
                            </div>
                            Fee Information
                        </CardTitle>
                        <CardDescription className="dark:text-gray-400">
                            Fee type and amount details
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Document Category Filter */}
                        {safeDocumentCategories.length > 0 && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="flex items-center gap-2 dark:text-gray-300">
                                        <Filter className="h-4 w-4" />
                                        Filter by Category
                                    </Label>
                                    {safeSelectedCategory !== 'all' && (
                                        <button
                                            type="button"
                                            onClick={() => setSelectedCategory('all')}
                                            className="text-sm text-primary hover:underline dark:text-blue-400"
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
                                            <SelectTrigger className="w-full dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300">
                                                <SelectValue>
                                                    <div className="flex items-center gap-2">
                                                        <span>
                                                            {getSelectedCategoryName()}
                                                        </span>
                                                        {safeSelectedCategory !== 'all' && (
                                                            <Badge
                                                                variant="secondary"
                                                                className="ml-2 dark:bg-gray-700 dark:text-gray-300"
                                                            >
                                                                {safeFilteredFeeTypes.length} fee type(s)
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                                                <SafeSelectItem value="all" className="dark:text-gray-300 dark:focus:bg-gray-700">
                                                    All Categories
                                                </SafeSelectItem>
                                                {safeDocumentCategories.map((category) => (
                                                    <SafeSelectItem
                                                        key={category.id}
                                                        value={category.id}
                                                        className="dark:text-gray-300 dark:focus:bg-gray-700"
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
                            <Label htmlFor="fee_type_id" className="flex items-center gap-2 dark:text-gray-300">
                                <FileText className="h-4 w-4" />
                                Fee Type *
                            </Label>
                            <select
                                id="fee_type_id"
                                required
                                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
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
                                <p className="text-sm text-red-500 dark:text-red-400">
                                    {errors.fee_type_id}
                                </p>
                            )}

                            {safeSelectedCategory !== 'all' && safeFilteredFeeTypes.length === 0 && (
                                <div className="mt-2 rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400">
                                    <p>
                                        No fee types found for this category.{' '}
                                        <button
                                            type="button"
                                            onClick={() => setSelectedCategory('all')}
                                            className="font-medium text-yellow-700 underline hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                                        >
                                            Show all fee types
                                        </button>
                                    </p>
                                </div>
                            )}
                        </div>

                        {selectedFeeType && (
                            <div className="rounded-md bg-gray-50 dark:bg-gray-900/50 p-4 space-y-3 border border-gray-200 dark:border-gray-700">
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    {selectedFeeType.document_category && (
                                        <div>
                                            <span className="font-medium text-gray-600 dark:text-gray-400">
                                                Category:
                                            </span>{' '}
                                            <span className="font-semibold dark:text-gray-300">
                                                {selectedFeeType.document_category.name}
                                            </span>
                                        </div>
                                    )}
                                    <div>
                                        <span className="font-medium text-gray-600 dark:text-gray-400">
                                            Base Amount:
                                        </span>{' '}
                                        <span className="font-semibold text-primary dark:text-blue-400">
                                            {formatCurrency(selectedFeeType.base_amount)}
                                        </span>
                                    </div>
                                    {selectedFeeType.validity_days && (
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                                            <span className="font-medium text-gray-600 dark:text-gray-400">Validity:</span>{' '}
                                            <span className="dark:text-gray-300">{selectedFeeType.validity_days} days</span>
                                        </div>
                                    )}
                                    {selectedFeeType.has_penalty && (
                                        <div className="col-span-2">
                                            <Badge
                                                variant="outline"
                                                className="border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
                                            >
                                                <AlertCircle className="mr-1 h-3 w-3" />
                                                This fee type supports penalties for late payments
                                            </Badge>
                                        </div>
                                    )}
                                </div>
                                
                                {selectedFeeType.description && (
                                    <div className="text-sm border-t dark:border-gray-700 pt-2">
                                        <span className="font-medium text-gray-600 dark:text-gray-400">
                                            Description:
                                        </span>{' '}
                                        <span className="text-gray-700 dark:text-gray-300">{selectedFeeType.description}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Payer Privileges Card */}
                {hasPrivileges && (
                    <Card className="border-purple-200 bg-purple-50/50 dark:bg-purple-900/20 dark:border-purple-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2 text-purple-700 dark:text-purple-400">
                                <div className="h-5 w-5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700 flex items-center justify-center">
                                    <Award className="h-3 w-3 text-white" />
                                </div>
                                Active Payer Privileges
                            </CardTitle>
                            <CardDescription className="text-xs text-purple-600 dark:text-purple-400">
                                This payer has active privileges that may qualify for discounts
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {selectedPayer && 'privileges' in selectedPayer && 
                                 selectedPayer.privileges && selectedPayer.privileges.length > 0 ? (
                                    selectedPayer.privileges.map((privilege: any, idx: number) => (
                                        <div key={idx} className="bg-white dark:bg-gray-900 rounded-md p-3 border border-purple-100 dark:border-purple-900">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-sm dark:text-gray-200">{privilege.name}</span>
                                                    <Badge variant="outline" className="text-xs bg-purple-50 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800">
                                                        {privilege.code}
                                                    </Badge>
                                                </div>
                                                {privilege.id_number && (
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        ID: {privilege.id_number}
                                                    </span>
                                                )}
                                            </div>
                                            
                                            {privilege.expiry_date && (
                                                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                                    <span className="font-medium">Valid until: </span>
                                                    {new Date(privilege.expiry_date).toLocaleDateString()}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        No active privileges found.
                                    </p>
                                )}
                                
                                {/* Important Note */}
                                <div className="mt-3 text-xs border-t border-purple-200 dark:border-purple-800 pt-3 text-purple-600 dark:text-purple-400">
                                    <p className="flex items-start gap-1">
                                        <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                        <span>
                                            Discounts will be verified and applied during payment processing 
                                            upon presentation of valid IDs.
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Discount Information Card - For Reference Only */}
                {discountInfo && discountInfo.eligibleDiscounts.length > 0 && (
                    <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-900/20 dark:border-blue-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2 text-blue-700 dark:text-blue-400">
                                <div className="h-5 w-5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 flex items-center justify-center">
                                    <Scale className="h-3 w-3 text-white" />
                                </div>
                                Available Statutory Discounts
                            </CardTitle>
                            <CardDescription className="text-xs text-blue-600 dark:text-blue-400">
                                These discounts may apply to this fee type
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {discountInfo.eligibleDiscounts.map((discount, idx) => (
                                    <div key={idx} className="bg-white dark:bg-gray-900 rounded-md p-3 border border-blue-100 dark:border-blue-900">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-sm dark:text-gray-200">{discount.name}</span>
                                                <Badge variant="outline" className="text-xs bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">
                                                    {discount.percentage}%
                                                </Badge>
                                            </div>
                                            <Badge variant="secondary" className="text-xs dark:bg-gray-700 dark:text-gray-300">
                                                {discount.legalBasis}
                                            </Badge>
                                        </div>
                                        
                                        {discount.description && (
                                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                {discount.description}
                                            </p>
                                        )}
                                        
                                        {discount.requirements && discount.requirements.length > 0 && (
                                            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                                <span className="font-medium">Requirements: </span>
                                                {discount.requirements.join(' • ')}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                
                                {/* Warnings */}
                                {discountInfo.warnings && discountInfo.warnings.length > 0 && (
                                    <div className="mt-3 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded border border-amber-200 dark:border-amber-800">
                                        {discountInfo.warnings.map((warning, idx) => (
                                            <p key={idx} className="flex items-start gap-1">
                                                <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                                <span>{warning}</span>
                                            </p>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Amount Calculation Card */}
                <Card className="dark:bg-gray-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                            <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700 flex items-center justify-center">
                                <Calculator className="h-3 w-3 text-white" />
                            </div>
                            Amount Calculation
                        </CardTitle>
                        <CardDescription className="dark:text-gray-400">
                            Review and adjust fee amounts
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="base_amount" className="dark:text-gray-300">
                                Base Amount *
                            </Label>
                            <div className="relative">
                                <span className="absolute top-1/2 left-3 -translate-y-1/2 transform font-bold text-gray-500 dark:text-gray-400">
                                    ₱
                                </span>
                                <Input
                                    id="base_amount"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    required
                                    className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                    value={data.base_amount}
                                    onChange={(e) =>
                                        setData('base_amount', parseNumber(e.target.value))
                                    }
                                />
                            </div>
                            {errors?.base_amount && (
                                <p className="text-sm text-red-500 dark:text-red-400">
                                    {errors.base_amount}
                                </p>
                            )}
                        </div>

                        {showSurcharge && (
                            <div className="space-y-2">
                                <div className="flex items-center">
                                    <Label htmlFor="surcharge_amount" className="dark:text-gray-300">
                                        Surcharge Amount
                                    </Label>
                                    {surchargeExplanation && (
                                        <div className="ml-2 group relative">
                                            <HelpCircle className="h-4 w-4 text-gray-400 dark:text-gray-500 cursor-help" />
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-64 p-2 bg-gray-900 dark:bg-gray-900 text-white text-xs rounded shadow-lg z-10">
                                                {surchargeExplanation}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="relative">
                                    <span className="absolute top-1/2 left-3 -translate-y-1/2 transform font-bold text-gray-500 dark:text-gray-400">
                                        ₱
                                    </span>
                                    <Input
                                        id="surcharge_amount"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                        value={data.surcharge_amount}
                                        onChange={(e) =>
                                            setData('surcharge_amount', parseNumber(e.target.value))
                                        }
                                    />
                                </div>
                                {surchargeExplanation && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {surchargeExplanation}
                                    </p>
                                )}
                            </div>
                        )}

                        {showPenalty && (
                            <div className="space-y-2">
                                <div className="flex items-center">
                                    <Label htmlFor="penalty_amount" className="dark:text-gray-300">
                                        Penalty Amount
                                    </Label>
                                    {penaltyExplanation && (
                                        <div className="ml-2 group relative">
                                            <HelpCircle className="h-4 w-4 text-gray-400 dark:text-gray-500 cursor-help" />
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-64 p-2 bg-gray-900 dark:bg-gray-900 text-white text-xs rounded shadow-lg z-10">
                                                {penaltyExplanation}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="relative">
                                    <span className="absolute top-1/2 left-3 -translate-y-1/2 transform font-bold text-gray-500 dark:text-gray-400">
                                        ₱
                                    </span>
                                    <Input
                                        id="penalty_amount"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                        value={data.penalty_amount}
                                        onChange={(e) =>
                                            setData('penalty_amount', parseNumber(e.target.value))
                                        }
                                    />
                                </div>
                                {penaltyExplanation && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {penaltyExplanation}
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="discount_amount" className="dark:text-gray-300">
                                Discount Amount (if any)
                            </Label>
                            <div className="relative">
                                <span className="absolute top-1/2 left-3 -translate-y-1/2 transform font-bold text-gray-500 dark:text-gray-400">
                                    ₱
                                </span>
                                <Input
                                    id="discount_amount"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                    value={data.discount_amount}
                                    onChange={(e) =>
                                        setData('discount_amount', parseNumber(e.target.value))
                                    }
                                />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Note: Discounts are typically applied during payment processing.
                            </p>
                        </div>

                        <div className="border-t dark:border-gray-700 pt-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                                    <span>Base Amount:</span>
                                    <span className="dark:text-gray-300">{formatCurrency(data.base_amount)}</span>
                                </div>
                                {data.surcharge_amount > 0 && (
                                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                                        <span>Surcharge:</span>
                                        <span className="text-orange-600 dark:text-orange-400">
                                            +{formatCurrency(data.surcharge_amount)}
                                        </span>
                                    </div>
                                )}
                                {data.penalty_amount > 0 && (
                                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                                        <span>Penalty:</span>
                                        <span className="text-red-600 dark:text-red-400">
                                            +{formatCurrency(data.penalty_amount)}
                                        </span>
                                    </div>
                                )}
                                {data.discount_amount > 0 && (
                                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                                        <span>Discount:</span>
                                        <span className="text-green-600 dark:text-green-400">
                                            -{formatCurrency(data.discount_amount)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between border-t dark:border-gray-700 pt-2">
                                    <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        Total Fee Amount:
                                    </span>
                                    <span className="text-2xl font-bold text-primary dark:text-blue-400">
                                        {formatCurrency(data.total_amount)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Dates Card */}
                <Card className="dark:bg-gray-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                            <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-700 dark:to-orange-700 flex items-center justify-center">
                                <Calendar className="h-3 w-3 text-white" />
                            </div>
                            Dates
                        </CardTitle>
                        <CardDescription className="dark:text-gray-400">
                            Review and adjust issue and due dates
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="issue_date" className="dark:text-gray-300">
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
                                    className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                />
                                {errors?.issue_date && (
                                    <p className="text-sm text-red-500 dark:text-red-400">
                                        {errors.issue_date}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="due_date" className="dark:text-gray-300">
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
                                    className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                />
                                {errors?.due_date && (
                                    <p className="text-sm text-red-500 dark:text-red-400">
                                        {errors.due_date}
                                    </p>
                                )}
                            </div>
                        </div>

                        <Alert className="border-blue-100 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
                            <Info className="h-4 w-4 dark:text-blue-400" />
                            <AlertDescription className="text-sm dark:text-blue-400">
                                <div className="font-medium">
                                    Important Date Information:
                                </div>
                                <ul className="mt-1 list-disc pl-5">
                                    <li>
                                        <strong>Issue Date:</strong> When the fee was created/issued
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
            <Card className="border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                <CardHeader>
                    <CardTitle className="text-red-700 dark:text-red-400">Error Rendering Component</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-red-600 dark:text-red-400">An error occurred while rendering this component.</p>
                    <pre className="mt-2 text-xs text-red-800 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-2 rounded">
                        {error instanceof Error ? error.stack : String(error)}
                    </pre>
                </CardContent>
            </Card>
        );
    }
}