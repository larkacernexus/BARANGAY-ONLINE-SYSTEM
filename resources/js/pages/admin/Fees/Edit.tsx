import AdminLayout from '@/layouts/resident-app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
    ArrowLeft,
    Save,
    DollarSign,
    Calendar,
    Percent,
    FileText,
    Tag,
    Users,
    Clock
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function FeeTypesEdit({ feeType, categories, amountTypes, frequencies, applicableTo, puroks }) {
    const { data, setData, put, processing, errors } = useForm({
        code: feeType.code,
        name: feeType.name,
        short_name: feeType.short_name || '',
        category: feeType.category,
        base_amount: feeType.base_amount,
        amount_type: feeType.amount_type,
        unit: feeType.unit || '',
        description: feeType.description || '',
        frequency: feeType.frequency,
        validity_days: feeType.validity_days || null,
        applicable_to: feeType.applicable_to,
        applicable_puroks: feeType.applicable_puroks || [],
        requirements: feeType.requirements || [],
        effective_date: feeType.effective_date.split('T')[0],
        expiry_date: feeType.expiry_date ? feeType.expiry_date.split('T')[0] : '',
        is_active: feeType.is_active,
        is_mandatory: feeType.is_mandatory,
        auto_generate: feeType.auto_generate,
        due_day: feeType.due_day || null,
        sort_order: feeType.sort_order || 0,
        has_senior_discount: feeType.has_senior_discount,
        has_pwd_discount: feeType.has_pwd_discount,
        has_solo_parent_discount: feeType.has_solo_parent_discount,
        has_indigent_discount: feeType.has_indigent_discount,
        discount_percentage: feeType.discount_percentage || null,
        has_surcharge: feeType.has_surcharge,
        surcharge_percentage: feeType.surcharge_percentage || null,
        surcharge_fixed: feeType.surcharge_fixed || null,
        has_penalty: feeType.has_penalty,
        penalty_percentage: feeType.penalty_percentage || null,
        penalty_fixed: feeType.penalty_fixed || null,
        notes: feeType.notes || '',
    });

    const [selectedPuroks, setSelectedPuroks] = useState(feeType.applicable_puroks || []);
    const [selectedRequirements, setSelectedRequirements] = useState(feeType.requirements || []);
    const [newRequirement, setNewRequirement] = useState('');

    useEffect(() => {
        setSelectedPuroks(data.applicable_puroks);
    }, [data.applicable_puroks]);

    useEffect(() => {
        setSelectedRequirements(data.requirements);
    }, [data.requirements]);

    const submit = (e) => {
        e.preventDefault();
        put(route('fee-types.update', feeType.id), {
            onSuccess: () => {
                // Success handling
            },
        });
    };

    const addRequirement = () => {
        if (newRequirement.trim()) {
            const newRequirements = [...selectedRequirements, newRequirement.trim()];
            setSelectedRequirements(newRequirements);
            setData('requirements', newRequirements);
            setNewRequirement('');
        }
    };

    const removeRequirement = (index) => {
        const newRequirements = selectedRequirements.filter((_, i) => i !== index);
        setSelectedRequirements(newRequirements);
        setData('requirements', newRequirements);
    };

    const getCategoryColor = (category) => {
        const colors = {
            tax: 'bg-red-100 text-red-800',
            clearance: 'bg-blue-100 text-blue-800',
            certificate: 'bg-green-100 text-green-800',
            service: 'bg-yellow-100 text-yellow-800',
            rental: 'bg-purple-100 text-purple-800',
            fine: 'bg-orange-100 text-orange-800',
            contribution: 'bg-indigo-100 text-indigo-800',
            other: 'bg-gray-100 text-gray-800',
        };
        return colors[category] || colors.other;
    };

    return (
        <AdminLayout>
            <Head title={`Edit Fee Type: ${feeType.name}`} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Link href={route('fee-types.show', feeType.id)}>
                                    <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Back
                                    </button>
                                </Link>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Edit Fee Type</h1>
                                    <div className="flex items-center gap-2 mt-1">
                                        <code className="px-2 py-1 bg-gray-100 rounded text-sm">{feeType.code}</code>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(feeType.category)}`}>
                                            {categories[feeType.category] || feeType.category}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button
                                type="submit"
                                form="feeTypeForm"
                                disabled={processing}
                                className="inline-flex items-center px-4 py-2 bg-primary-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-primary-700 focus:bg-primary-700 active:bg-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition ease-in-out duration-150 disabled:opacity-50"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                {processing ? 'Saving...' : 'Update Fee Type'}
                            </button>
                        </div>
                    </div>

                    <form id="feeTypeForm" onSubmit={submit} className="space-y-6">
                        {/* Same form as Create.jsx but pre-filled */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left Column - Basic Info */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Basic Information */}
                                <div className="bg-white rounded-lg shadow p-6">
                                    <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                        <FileText className="h-5 w-5 mr-2" />
                                        Basic Information
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Code *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full border-gray-300 rounded-md focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                                                value={data.code}
                                                onChange={(e) => setData('code', e.target.value)}
                                            />
                                            {errors.code && (
                                                <p className="mt-1 text-sm text-red-600">{errors.code}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Name *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full border-gray-300 rounded-md focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                            />
                                            {errors.name && (
                                                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Short Name
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full border-gray-300 rounded-md focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                                                value={data.short_name}
                                                onChange={(e) => setData('short_name', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Category *
                                            </label>
                                            <select
                                                required
                                                className="w-full border-gray-300 rounded-md focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                                                value={data.category}
                                                onChange={(e) => setData('category', e.target.value)}
                                            >
                                                {Object.entries(categories).map(([value, label]) => (
                                                    <option key={value} value={value}>
                                                        {label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Description
                                            </label>
                                            <textarea
                                                rows={3}
                                                className="w-full border-gray-300 rounded-md focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                                                value={data.description}
                                                onChange={(e) => setData('description', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Pricing */}
                                <div className="bg-white rounded-lg shadow p-6">
                                    <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                        <DollarSign className="h-5 w-5 mr-2" />
                                        Pricing
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Base Amount *
                                            </label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    required
                                                    className="pl-10 w-full border-gray-300 rounded-md focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                                                    value={data.base_amount}
                                                    onChange={(e) => setData('base_amount', parseFloat(e.target.value) || 0)}
                                                />
                                            </div>
                                            {errors.base_amount && (
                                                <p className="mt-1 text-sm text-red-600">{errors.base_amount}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Amount Type *
                                            </label>
                                            <select
                                                required
                                                className="w-full border-gray-300 rounded-md focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                                                value={data.amount_type}
                                                onChange={(e) => setData('amount_type', e.target.value)}
                                            >
                                                {Object.entries(amountTypes).map(([value, label]) => (
                                                    <option key={value} value={value}>
                                                        {label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Unit (Optional)
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g., per square meter, per month"
                                                className="w-full border-gray-300 rounded-md focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                                                value={data.unit}
                                                onChange={(e) => setData('unit', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Frequency & Validity */}
                                <div className="bg-white rounded-lg shadow p-6">
                                    <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                        <Calendar className="h-5 w-5 mr-2" />
                                        Frequency & Validity
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Frequency *
                                            </label>
                                            <select
                                                required
                                                className="w-full border-gray-300 rounded-md focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                                                value={data.frequency}
                                                onChange={(e) => setData('frequency', e.target.value)}
                                            >
                                                {Object.entries(frequencies).map(([value, label]) => (
                                                    <option key={value} value={value}>
                                                        {label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Validity Days (for certificates)
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                className="w-full border-gray-300 rounded-md focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                                                value={data.validity_days || ''}
                                                onChange={(e) => setData('validity_days', e.target.value ? parseInt(e.target.value) : null)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Effective Date *
                                            </label>
                                            <input
                                                type="date"
                                                required
                                                className="w-full border-gray-300 rounded-md focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                                                value={data.effective_date}
                                                onChange={(e) => setData('effective_date', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Expiry Date (Optional)
                                            </label>
                                            <input
                                                type="date"
                                                className="w-full border-gray-300 rounded-md focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                                                value={data.expiry_date}
                                                onChange={(e) => setData('expiry_date', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Settings */}
                            <div className="space-y-6">
                                {/* Applicability */}
                                <div className="bg-white rounded-lg shadow p-6">
                                    <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                        <Users className="h-5 w-5 mr-2" />
                                        Applicability
                                    </h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Applicable To *
                                            </label>
                                            <select
                                                required
                                                className="w-full border-gray-300 rounded-md focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                                                value={data.applicable_to}
                                                onChange={(e) => {
                                                    setData('applicable_to', e.target.value);
                                                    if (e.target.value !== 'specific_purok') {
                                                        setSelectedPuroks([]);
                                                        setData('applicable_puroks', []);
                                                    }
                                                }}
                                            >
                                                {Object.entries(applicableTo).map(([value, label]) => (
                                                    <option key={value} value={value}>
                                                        {label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        {data.applicable_to === 'specific_purok' && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Select Puroks
                                                </label>
                                                <div className="space-y-2">
                                                    {puroks.map((purok) => (
                                                        <div key={purok} className="flex items-center">
                                                            <input
                                                                type="checkbox"
                                                                id={`purok-${purok}`}
                                                                checked={selectedPuroks.includes(purok)}
                                                                onChange={(e) => {
                                                                    let newPuroks;
                                                                    if (e.target.checked) {
                                                                        newPuroks = [...selectedPuroks, purok];
                                                                    } else {
                                                                        newPuroks = selectedPuroks.filter(p => p !== purok);
                                                                    }
                                                                    setSelectedPuroks(newPuroks);
                                                                    setData('applicable_puroks', newPuroks);
                                                                }}
                                                                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                                            />
                                                            <label htmlFor={`purok-${purok}`} className="ml-2 text-sm">
                                                                Purok {purok}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Requirements */}
                                <div className="bg-white rounded-lg shadow p-6">
                                    <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                        <Tag className="h-5 w-5 mr-2" />
                                        Requirements
                                    </h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Add Requirements
                                            </label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    className="flex-1 border-gray-300 rounded-md focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                                                    placeholder="e.g., Valid ID, Proof of Residency"
                                                    value={newRequirement}
                                                    onChange={(e) => setNewRequirement(e.target.value)}
                                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={addRequirement}
                                                    className="px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                                                >
                                                    Add
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Selected Requirements
                                            </label>
                                            <div className="space-y-2">
                                                {selectedRequirements.map((req, index) => (
                                                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                                        <span className="text-sm">{req}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeRequirement(index)}
                                                            className="text-red-600 hover:text-red-800"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ))}
                                                {selectedRequirements.length === 0 && (
                                                    <p className="text-sm text-gray-500 italic">No requirements added</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Status & Settings */}
                                <div className="bg-white rounded-lg shadow p-6">
                                    <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                        <Clock className="h-5 w-5 mr-2" />
                                        Status & Settings
                                    </h2>
                                    <div className="space-y-4">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="is_active"
                                                checked={data.is_active}
                                                onChange={(e) => setData('is_active', e.target.checked)}
                                                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                            />
                                            <label htmlFor="is_active" className="ml-2 text-sm">
                                                Active
                                            </label>
                                        </div>
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="is_mandatory"
                                                checked={data.is_mandatory}
                                                onChange={(e) => setData('is_mandatory', e.target.checked)}
                                                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                            />
                                            <label htmlFor="is_mandatory" className="ml-2 text-sm">
                                                Mandatory
                                            </label>
                                        </div>
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="auto_generate"
                                                checked={data.auto_generate}
                                                onChange={(e) => setData('auto_generate', e.target.checked)}
                                                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                            />
                                            <label htmlFor="auto_generate" className="ml-2 text-sm">
                                                Auto-generate bills
                                            </label>
                                        </div>
                                        {data.auto_generate && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Due Day of Month
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="31"
                                                    className="w-full border-gray-300 rounded-md focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                                                    value={data.due_day || ''}
                                                    onChange={(e) => setData('due_day', e.target.value ? parseInt(e.target.value) : null)}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Discounts & Late Payments */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Discounts & Late Payments</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Discounts */}
                                <div className="space-y-4">
                                    <h3 className="font-medium text-gray-700">Discounts</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id="has_senior_discount"
                                                    checked={data.has_senior_discount}
                                                    onChange={(e) => setData('has_senior_discount', e.target.checked)}
                                                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                                />
                                                <label htmlFor="has_senior_discount" className="ml-2 text-sm">
                                                    Senior Citizen Discount
                                                </label>
                                            </div>
                                            <Percent className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id="has_pwd_discount"
                                                    checked={data.has_pwd_discount}
                                                    onChange={(e) => setData('has_pwd_discount', e.target.checked)}
                                                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                                />
                                                <label htmlFor="has_pwd_discount" className="ml-2 text-sm">
                                                    PWD Discount
                                                </label>
                                            </div>
                                            <Percent className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id="has_solo_parent_discount"
                                                    checked={data.has_solo_parent_discount}
                                                    onChange={(e) => setData('has_solo_parent_discount', e.target.checked)}
                                                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                                />
                                                <label htmlFor="has_solo_parent_discount" className="ml-2 text-sm">
                                                    Solo Parent Discount
                                                </label>
                                            </div>
                                            <Percent className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id="has_indigent_discount"
                                                    checked={data.has_indigent_discount}
                                                    onChange={(e) => setData('has_indigent_discount', e.target.checked)}
                                                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                                />
                                                <label htmlFor="has_indigent_discount" className="ml-2 text-sm">
                                                    Indigent Discount
                                                </label>
                                            </div>
                                            <Percent className="h-4 w-4 text-gray-400" />
                                        </div>
                                        {(data.has_senior_discount || data.has_pwd_discount || data.has_solo_parent_discount || data.has_indigent_discount) && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Discount Percentage
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        max="100"
                                                        className="pl-10 w-full border-gray-300 rounded-md focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                                                        value={data.discount_percentage || ''}
                                                        onChange={(e) => setData('discount_percentage', e.target.value ? parseFloat(e.target.value) : null)}
                                                    />
                                                    <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Late Payments */}
                                <div className="space-y-4">
                                    <h3 className="font-medium text-gray-700">Late Payments</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id="has_surcharge"
                                                    checked={data.has_surcharge}
                                                    onChange={(e) => setData('has_surcharge', e.target.checked)}
                                                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                                />
                                                <label htmlFor="has_surcharge" className="ml-2 text-sm">
                                                    Apply Surcharge
                                                </label>
                                            </div>
                                            <Percent className="h-4 w-4 text-gray-400" />
                                        </div>
                                        {data.has_surcharge && (
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Surcharge Rate
                                                </label>
                                                <div className="flex gap-2">
                                                    <div className="relative flex-1">
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            placeholder="Percentage"
                                                            className="pl-10 w-full border-gray-300 rounded-md focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                                                            value={data.surcharge_percentage || ''}
                                                            onChange={(e) => setData('surcharge_percentage', e.target.value ? parseFloat(e.target.value) : null)}
                                                        />
                                                        <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                                                    </div>
                                                    <span className="self-center">or</span>
                                                    <div className="relative flex-1">
                                                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            placeholder="Fixed Amount"
                                                            className="pl-10 w-full border-gray-300 rounded-md focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                                                            value={data.surcharge_fixed || ''}
                                                            onChange={(e) => setData('surcharge_fixed', e.target.value ? parseFloat(e.target.value) : null)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id="has_penalty"
                                                    checked={data.has_penalty}
                                                    onChange={(e) => setData('has_penalty', e.target.checked)}
                                                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                                />
                                                <label htmlFor="has_penalty" className="ml-2 text-sm">
                                                    Apply Penalty
                                                </label>
                                            </div>
                                            <DollarSign className="h-4 w-4 text-gray-400" />
                                        </div>
                                        {data.has_penalty && (
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Penalty Amount
                                                </label>
                                                <div className="flex gap-2">
                                                    <div className="relative flex-1">
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            placeholder="Percentage"
                                                            className="pl-10 w-full border-gray-300 rounded-md focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                                                            value={data.penalty_percentage || ''}
                                                            onChange={(e) => setData('penalty_percentage', e.target.value ? parseFloat(e.target.value) : null)}
                                                        />
                                                        <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                                                    </div>
                                                    <span className="self-center">or</span>
                                                    <div className="relative flex-1">
                                                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            placeholder="Fixed Amount"
                                                            className="pl-10 w-full border-gray-300 rounded-md focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                                                            value={data.penalty_fixed || ''}
                                                            onChange={(e) => setData('penalty_fixed', e.target.value ? parseFloat(e.target.value) : null)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Additional Notes</h2>
                            <textarea
                                rows={3}
                                className="w-full border-gray-300 rounded-md focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                placeholder="Any additional notes or instructions for this fee type..."
                            />
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}