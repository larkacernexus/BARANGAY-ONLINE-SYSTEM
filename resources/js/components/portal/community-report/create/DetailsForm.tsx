// components/community-report/DetailsForm.tsx

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileText, MapPin, Calendar, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { UrgencyLevel } from '@/types/portal/reports/community-report';

interface DetailsFormProps {
    data: {
        title: string;
        location: string;
        incident_date: string;
        incident_time: string;
        description: string;
        urgency: UrgencyLevel;
    };
    errors: Record<string, string>;
    setData: (key: string, value: any) => void;
    today: string;
    onValidationChange?: (isValid: boolean) => void;
}

export const DetailsForm: React.FC<DetailsFormProps> = ({
    data,
    errors,
    setData,
    today,
    onValidationChange
}) => {
    const [touched, setTouched] = useState<Record<string, boolean>>({
        title: false,
        location: false,
        incident_date: false,
        description: false
    });

    // Validation functions
    const validateTitle = (title: string): boolean => {
        return title.trim().length >= 5 && title.trim().length <= 255;
    };

    const validateLocation = (location: string): boolean => {
        return location.trim().length >= 5 && location.trim().length <= 255;
    };

    const validateDescription = (description: string): boolean => {
        const trimmed = description.trim();
        return trimmed.length >= 15 && trimmed.length <= 5000;
    };

    const validateDate = (date: string): boolean => {
        if (!date) return false;
        const selectedDate = new Date(date);
        const currentDate = new Date(today);
        return selectedDate <= currentDate;
    };

    // Get validation states
    const validation = {
        title: validateTitle(data.title),
        location: validateLocation(data.location),
        incident_date: validateDate(data.incident_date),
        description: validateDescription(data.description)
    };

    const isFormValid = validation.title && validation.location && validation.incident_date && validation.description;

    // Notify parent of validation status whenever it changes
    useEffect(() => {
        if (onValidationChange) {
            onValidationChange(isFormValid);
        }
    }, [isFormValid, onValidationChange]);

    // Handle blur to mark field as touched
    const handleBlur = (field: string) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    // Get field error message
    const getFieldError = (field: string, value: string): string | null => {
        if (!touched[field]) return null;

        switch(field) {
            case 'title':
                if (!value.trim()) return 'Title is required';
                if (value.trim().length < 5) return 'Title must be at least 5 characters';
                if (value.trim().length > 255) return 'Title must not exceed 255 characters';
                break;
            case 'location':
                if (!value.trim()) return 'Location is required';
                if (value.trim().length < 5) return 'Location must be at least 5 characters';
                if (value.trim().length > 255) return 'Location must not exceed 255 characters';
                break;
            case 'description':
                if (!value.trim()) return 'Description is required';
                if (value.trim().length < 15) return `Description must be at least 15 characters (currently ${value.trim().length})`;
                if (value.trim().length > 5000) return 'Description must not exceed 5000 characters';
                break;
            case 'incident_date':
                if (!value) return 'Date is required';
                if (!validateDate(value)) return 'Date cannot be in the future';
                break;
        }
        return null;
    };

    // Character count for description
    const descriptionLength = data.description?.trim().length || 0;
    const isDescriptionValid = descriptionLength >= 15;

    return (
        <Card className="rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <CardContent className="p-4 lg:p-6 pt-6 space-y-6">
                {/* Validation Summary - Shows when form is invalid */}
                {touched.title && touched.location && touched.incident_date && touched.description && !isFormValid && (
                    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                                    Please complete all required fields correctly:
                                </p>
                                <ul className="text-xs text-amber-700 dark:text-amber-400 mt-1 space-y-1 list-disc list-inside">
                                    {!validation.title && <li>Title must be at least 5 characters</li>}
                                    {!validation.location && <li>Location must be at least 5 characters</li>}
                                    {!validation.incident_date && <li>Please select a valid date</li>}
                                    {!validation.description && (
                                        <li>Description must be at least 15 characters (currently {descriptionLength})</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                    {/* Title Field */}
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300">
                            <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            Report Title *
                        </Label>
                        <div className="relative">
                            <Input
                                id="title"
                                value={data.title}
                                onChange={e => setData('title', e.target.value)}
                                onBlur={() => handleBlur('title')}
                                placeholder="Brief title for your report"
                                required
                                maxLength={255}
                                className={`h-11 text-sm rounded-lg pr-8 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 ${
                                    touched.title && !validation.title
                                        ? 'border-red-500 focus:ring-red-500 dark:border-red-500'
                                        : touched.title && validation.title
                                        ? 'border-green-500 focus:ring-green-500 dark:border-green-500'
                                        : ''
                                }`}
                            />
                            {touched.title && validation.title && (
                                <CheckCircle className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500 dark:text-green-400" />
                            )}
                        </div>
                        {touched.title && !validation.title && (
                            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {getFieldError('title', data.title)}
                            </p>
                        )}
                        {!touched.title && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Minimum 5 characters
                            </p>
                        )}
                    </div>

                    {/* Location Field */}
                    <div className="space-y-2">
                        <Label htmlFor="location" className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300">
                            <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            Location *
                        </Label>
                        <div className="relative">
                            <Input
                                id="location"
                                value={data.location}
                                onChange={e => setData('location', e.target.value)}
                                onBlur={() => handleBlur('location')}
                                placeholder="Where did this occur?"
                                required
                                maxLength={255}
                                className={`h-11 text-sm rounded-lg pr-8 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 ${
                                    touched.location && !validation.location
                                        ? 'border-red-500 focus:ring-red-500 dark:border-red-500'
                                        : touched.location && validation.location
                                        ? 'border-green-500 focus:ring-green-500 dark:border-green-500'
                                        : ''
                                }`}
                            />
                            {touched.location && validation.location && (
                                <CheckCircle className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500 dark:text-green-400" />
                            )}
                        </div>
                        {touched.location && !validation.location && (
                            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {getFieldError('location', data.location)}
                            </p>
                        )}
                        {!touched.location && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Minimum 5 characters
                            </p>
                        )}
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    {/* Date Field */}
                    <div className="space-y-2">
                        <Label htmlFor="incident_date" className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300">
                            <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            Date *
                        </Label>
                        <div className="relative">
                            <Input
                                id="incident_date"
                                type="date"
                                value={data.incident_date}
                                onChange={e => setData('incident_date', e.target.value)}
                                onBlur={() => handleBlur('incident_date')}
                                max={today}
                                required
                                className={`h-11 text-sm rounded-lg pr-8 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 ${
                                    touched.incident_date && !validation.incident_date
                                        ? 'border-red-500 focus:ring-red-500 dark:border-red-500'
                                        : touched.incident_date && validation.incident_date
                                        ? 'border-green-500 focus:ring-green-500 dark:border-green-500'
                                        : ''
                                }`}
                            />
                            {touched.incident_date && validation.incident_date && (
                                <CheckCircle className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500 dark:text-green-400" />
                            )}
                        </div>
                        {touched.incident_date && !validation.incident_date && (
                            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {getFieldError('incident_date', data.incident_date)}
                            </p>
                        )}
                    </div>

                    {/* Time Field (Optional) */}
                    <div className="space-y-2">
                        <Label htmlFor="incident_time" className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300">
                            <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            Time (Optional)
                        </Label>
                        <Input
                            id="incident_time"
                            type="time"
                            value={data.incident_time}
                            onChange={e => setData('incident_time', e.target.value)}
                            className="h-11 text-sm rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Include time if known
                        </p>
                    </div>
                </div>

                {/* Description Field */}
                <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        Detailed Description *
                    </Label>
                    <div className="relative">
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={e => setData('description', e.target.value)}
                            onBlur={() => handleBlur('description')}
                            placeholder="Describe what happened in detail..."
                            rows={4}
                            required
                            maxLength={5000}
                            className={`text-sm min-h-[100px] rounded-lg pr-8 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 ${
                                touched.description && !validation.description
                                    ? 'border-red-500 focus:ring-red-500 dark:border-red-500'
                                    : touched.description && validation.description
                                    ? 'border-green-500 focus:ring-green-500 dark:border-green-500'
                                    : ''
                            }`}
                        />
                        {touched.description && validation.description && (
                            <CheckCircle className="absolute right-2 top-3 h-4 w-4 text-green-500 dark:text-green-400" />
                        )}
                    </div>
                    
                    {/* Character counter with progress */}
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full transition-all duration-300 ${
                                        isDescriptionValid ? 'bg-green-500 dark:bg-green-400' : 'bg-amber-500 dark:bg-amber-400'
                                    }`}
                                    style={{ width: `${Math.min(100, (descriptionLength / 15) * 100)}%` }}
                                />
                            </div>
                        </div>
                        <span className={`text-xs ml-2 ${
                            isDescriptionValid ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'
                        }`}>
                            {descriptionLength}/15 min
                        </span>
                    </div>

                    {touched.description && !validation.description && (
                        <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {getFieldError('description', data.description)}
                        </p>
                    )}

                    {!touched.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Include specific details, impacts, and any safety concerns (minimum 15 characters)
                        </p>
                    )}
                </div>

                {/* Urgency Level */}
                <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Urgency Level *</Label>
                    <div className="grid grid-cols-3 gap-2">
                        {(['low', 'medium', 'high'] as const).map((level) => (
                            <div key={level}>
                                <input
                                    type="radio"
                                    id={`urgency-${level}`}
                                    name="urgency"
                                    value={level}
                                    checked={data.urgency === level}
                                    onChange={(e) => setData('urgency', e.target.value as UrgencyLevel)}
                                    className="sr-only peer"
                                />
                                <Label 
                                    htmlFor={`urgency-${level}`}
                                    className={`
                                        flex flex-col items-center p-3 border rounded-lg cursor-pointer text-sm transition-all
                                        ${data.urgency === level ? 
                                            (level === 'low' ? 'border-green-500 bg-green-50 dark:bg-green-950/30 ring-2 ring-green-500/20 dark:text-gray-100' :
                                             level === 'medium' ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30 ring-2 ring-amber-500/20 dark:text-gray-100' :
                                             'border-red-500 bg-red-50 dark:bg-red-950/30 ring-2 ring-red-500/20 dark:text-gray-100') : 
                                            'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'}
                                    `}
                                >
                                    <span className="font-medium">
                                        {level.charAt(0).toUpperCase() + level.slice(1)}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {level === 'low' ? 'Can wait' : 
                                         level === 'medium' ? 'Normal' : 'Urgent'}
                                    </span>
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Status */}
                {touched.title && touched.location && touched.incident_date && touched.description && (
                    <div className={`p-3 rounded-lg text-sm ${
                        isFormValid 
                            ? 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800' 
                            : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                    }`}>
                        <div className="flex items-center gap-2">
                            {isFormValid ? (
                                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                            ) : (
                                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            )}
                            <span>
                                {isFormValid 
                                    ? 'All fields are complete! You can proceed to the next step.' 
                                    : 'Please complete all required fields correctly before proceeding.'}
                            </span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};