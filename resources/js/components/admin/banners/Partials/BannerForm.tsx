// /components/admin/banners/Partials/BannerForm.tsx
import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Upload, X, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BannerFormProps {
    banner?: any;
    puroks: Array<{ id: number; name: string }>;
    isEditing?: boolean;
}

export default function BannerForm({ banner, puroks, isEditing = false }: BannerFormProps) {
    const [previewImage, setPreviewImage] = useState<string | null>(
        banner?.image_url || null
    );
    const [previewMobileImage, setPreviewMobileImage] = useState<string | null>(
        banner?.mobile_image_url || null
    );

    const { data, setData, post, processing, errors, clearErrors } = useForm({
        title: banner?.title || '',
        description: banner?.description || '',
        image: null as File | null,
        mobile_image: null as File | null,
        link_url: banner?.link_url || '',
        button_text: banner?.button_text || 'Learn More',
        alt_text: banner?.alt_text || '',
        sort_order: banner?.sort_order?.toString() || '0',
        is_active: banner?.is_active ?? true,
        start_date: banner?.start_date || '',
        end_date: banner?.end_date || '',
        target_audience: banner?.target_audience || 'all',
        target_puroks: banner?.target_puroks || [],
        _method: isEditing ? 'PUT' : 'POST',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        clearErrors();

        const formData = new FormData();
        
        // Append all form fields
        Object.keys(data).forEach(key => {
            if (key === 'image' && data.image instanceof File) {
                formData.append('image', data.image);
            } else if (key === 'mobile_image' && data.mobile_image instanceof File) {
                formData.append('mobile_image', data.mobile_image);
            } else if (key === 'target_puroks' && Array.isArray(data.target_puroks)) {
                data.target_puroks.forEach(purokId => {
                    formData.append('target_puroks[]', purokId);
                });
            } else if (key !== '_method' && data[key as keyof typeof data] !== null && data[key as keyof typeof data] !== undefined) {
                formData.append(key, String(data[key as keyof typeof data]));
            }
        });

        if (isEditing && banner?.id) {
            post(`/admin/banners/${banner.id}`, {
                data: formData,
                preserveScroll: true,
            });
        } else {
            post('/admin/banners', {
                data: formData,
                preserveScroll: true,
            });
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'mobile_image') => {
        const file = e.target.files?.[0];
        if (file) {
            setData(type, file);
            const reader = new FileReader();
            reader.onloadend = () => {
                if (type === 'image') {
                    setPreviewImage(reader.result as string);
                } else {
                    setPreviewMobileImage(reader.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = (type: 'image' | 'mobile_image') => {
        setData(type, null);
        if (type === 'image') {
            setPreviewImage(null);
        } else {
            setPreviewMobileImage(null);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
            {isEditing && <input type="hidden" name="_method" value="PUT" />}
            
            {/* Title */}
            <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                    id="title"
                    type="text"
                    value={data.title}
                    onChange={e => setData('title', e.target.value)}
                    className="mt-1"
                    required
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    value={data.description}
                    onChange={e => setData('description', e.target.value)}
                    rows={3}
                    className="mt-1"
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            {/* Desktop Image */}
            <div>
                <Label htmlFor="image">Desktop Image {!isEditing && '*'}</Label>
                <div className="mt-1 flex items-center gap-4">
                    {previewImage ? (
                        <div className="relative">
                            <img
                                src={previewImage}
                                alt="Preview"
                                className="h-32 w-auto rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                            />
                            <button
                                type="button"
                                onClick={() => removeImage('image')}
                                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800">
                            <Upload className="h-8 w-8 text-gray-400" />
                        </div>
                    )}
                    <Input
                        id="image"
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/jpg"
                        onChange={e => handleImageChange(e, 'image')}
                        className="flex-1"
                    />
                </div>
                <p className="text-xs text-gray-500 mt-1">Recommended size: 1920x1080px. Max: 5MB</p>
                {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
            </div>

            {/* Mobile Image */}
            <div>
                <Label htmlFor="mobile_image">Mobile Image (Optional)</Label>
                <div className="mt-1 flex items-center gap-4">
                    {previewMobileImage ? (
                        <div className="relative">
                            <img
                                src={previewMobileImage}
                                alt="Mobile Preview"
                                className="h-32 w-auto rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                            />
                            <button
                                type="button"
                                onClick={() => removeImage('mobile_image')}
                                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800">
                            <Upload className="h-8 w-8 text-gray-400" />
                        </div>
                    )}
                    <Input
                        id="mobile_image"
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/jpg"
                        onChange={e => handleImageChange(e, 'mobile_image')}
                        className="flex-1"
                    />
                </div>
                <p className="text-xs text-gray-500 mt-1">Recommended size: 750x1334px. Max: 5MB</p>
                {errors.mobile_image && <p className="text-red-500 text-sm mt-1">{errors.mobile_image}</p>}
            </div>

            {/* Link URL */}
            <div>
                <Label htmlFor="link_url">Link URL</Label>
                <Input
                    id="link_url"
                    type="text"
                    value={data.link_url}
                    onChange={e => setData('link_url', e.target.value)}
                    placeholder="/resident/dashboard or https://example.com"
                    className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">Internal path or external URL</p>
                {errors.link_url && <p className="text-red-500 text-sm mt-1">{errors.link_url}</p>}
            </div>

            {/* Button Text */}
            <div>
                <Label htmlFor="button_text">Button Text</Label>
                <Input
                    id="button_text"
                    type="text"
                    value={data.button_text}
                    onChange={e => setData('button_text', e.target.value)}
                    placeholder="Learn More"
                    className="mt-1"
                />
                {errors.button_text && <p className="text-red-500 text-sm mt-1">{errors.button_text}</p>}
            </div>

            {/* Alt Text */}
            <div>
                <Label htmlFor="alt_text">Alt Text (SEO)</Label>
                <Input
                    id="alt_text"
                    type="text"
                    value={data.alt_text}
                    onChange={e => setData('alt_text', e.target.value)}
                    placeholder="Descriptive text for accessibility"
                    className="mt-1"
                />
                {errors.alt_text && <p className="text-red-500 text-sm mt-1">{errors.alt_text}</p>}
            </div>

            {/* Sort Order & Active Status */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="sort_order">Sort Order</Label>
                    <Input
                        id="sort_order"
                        type="number"
                        value={data.sort_order}
                        onChange={e => setData('sort_order', e.target.value)}
                        min="0"
                        className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
                    {errors.sort_order && <p className="text-red-500 text-sm mt-1">{errors.sort_order}</p>}
                </div>

                <div className="flex items-center justify-between">
                    <Label htmlFor="is_active">Active</Label>
                    <Switch
                        id="is_active"
                        checked={data.is_active}
                        onCheckedChange={checked => setData('is_active', checked)}
                    />
                </div>
            </div>

            {/* Date Range - Simple input fields */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="start_date">Start Date (Optional)</Label>
                    <div className="relative mt-1">
                        <Input
                            id="start_date"
                            type="date"
                            value={data.start_date}
                            onChange={e => setData('start_date', e.target.value)}
                            className="pl-10"
                        />
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                    {errors.start_date && <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>}
                </div>

                <div>
                    <Label htmlFor="end_date">End Date (Optional)</Label>
                    <div className="relative mt-1">
                        <Input
                            id="end_date"
                            type="date"
                            value={data.end_date}
                            onChange={e => setData('end_date', e.target.value)}
                            className="pl-10"
                        />
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                    {errors.end_date && <p className="text-red-500 text-sm mt-1">{errors.end_date}</p>}
                </div>
            </div>

            {/* Target Audience */}
            <div>
                <Label htmlFor="target_audience">Target Audience</Label>
                <select
                    id="target_audience"
                    value={data.target_audience}
                    onChange={e => setData('target_audience', e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="all">All Users</option>
                    <option value="residents">Residents Only</option>
                    <option value="puroks">Specific Puroks</option>
                </select>
                {errors.target_audience && <p className="text-red-500 text-sm mt-1">{errors.target_audience}</p>}
            </div>

            {/* Target Puroks (conditional) */}
            {data.target_audience === 'puroks' && (
                <div>
                    <Label>Select Puroks</Label>
                    <div className="mt-2 grid grid-cols-2 gap-2 border border-gray-200 dark:border-gray-700 rounded-lg p-3 max-h-48 overflow-y-auto bg-gray-50 dark:bg-gray-800/50">
                        {puroks.map(purok => (
                            <label key={purok.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded">
                                <input
                                    type="checkbox"
                                    checked={data.target_puroks.includes(purok.id)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setData('target_puroks', [...data.target_puroks, purok.id]);
                                        } else {
                                            setData('target_puroks', data.target_puroks.filter((id: number) => id !== purok.id));
                                        }
                                    }}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">Purok {purok.name}</span>
                            </label>
                        ))}
                    </div>
                    {errors.target_puroks && <p className="text-red-500 text-sm mt-1">{errors.target_puroks}</p>}
                </div>
            )}

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button type="submit" disabled={processing}>
                    {processing 
                        ? (isEditing ? 'Updating...' : 'Creating...') 
                        : (isEditing ? 'Update Banner' : 'Create Banner')
                    }
                </Button>
                <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => window.history.back()}
                >
                    Cancel
                </Button>
            </div>
        </form>
    );
}