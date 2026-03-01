// components/community-report/DetailsForm.tsx

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileText, MapPin, Calendar, Clock } from 'lucide-react';
import { UrgencyLevel } from '@/types/portal/community-report';

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
}

export const DetailsForm: React.FC<DetailsFormProps> = ({
    data,
    errors,
    setData,
    today
}) => {
    return (
        <Card className="rounded-xl">
            <CardContent className="p-4 lg:p-6 pt-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-sm font-medium flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Report Title *
                        </Label>
                        <Input
                            id="title"
                            value={data.title}
                            onChange={e => setData('title', e.target.value)}
                            placeholder="Brief title for your report"
                            required
                            maxLength={255}
                            className="h-11 text-sm rounded-lg"
                        />
                        {errors.title && (
                            <p className="text-sm text-red-600">{errors.title}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="location" className="text-sm font-medium flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Location *
                        </Label>
                        <Input
                            id="location"
                            value={data.location}
                            onChange={e => setData('location', e.target.value)}
                            placeholder="Where did this occur?"
                            required
                            maxLength={255}
                            className="h-11 text-sm rounded-lg"
                        />
                        {errors.location && (
                            <p className="text-sm text-red-600">{errors.location}</p>
                        )}
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="incident_date" className="text-sm font-medium flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Date *
                        </Label>
                        <Input
                            id="incident_date"
                            type="date"
                            value={data.incident_date}
                            onChange={e => setData('incident_date', e.target.value)}
                            max={today}
                            required
                            className="h-11 text-sm rounded-lg"
                        />
                        {errors.incident_date && (
                            <p className="text-sm text-red-600">{errors.incident_date}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="incident_time" className="text-sm font-medium flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Time (Optional)
                        </Label>
                        <Input
                            id="incident_time"
                            type="time"
                            value={data.incident_time}
                            onChange={e => setData('incident_time', e.target.value)}
                            className="h-11 text-sm rounded-lg"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Detailed Description *
                    </Label>
                    <Textarea
                        id="description"
                        value={data.description}
                        onChange={e => setData('description', e.target.value)}
                        placeholder="Describe what happened in detail..."
                        rows={4}
                        required
                        className="text-sm min-h-[100px] rounded-lg"
                    />
                    {errors.description && (
                        <p className="text-sm text-red-600">{errors.description}</p>
                    )}
                    <p className="text-xs text-gray-500">
                        Include specific details, impacts, and any safety concerns (minimum 15 characters)
                    </p>
                </div>

                <div className="space-y-2">
                    <Label className="text-sm font-medium">Urgency Level</Label>
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
                                        flex flex-col items-center p-3 border rounded-lg cursor-pointer text-sm
                                        ${data.urgency === level ? 
                                            (level === 'low' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' :
                                             level === 'medium' ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' :
                                             'border-red-500 bg-red-50 dark:bg-red-900/20') : 
                                            'border-gray-200 hover:border-gray-300'}
                                    `}
                                >
                                    <span className="font-medium">
                                        {level.charAt(0).toUpperCase() + level.slice(1)}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {level === 'low' ? 'Can wait' : 
                                         level === 'medium' ? 'Normal' : 'Urgent'}
                                    </span>
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};