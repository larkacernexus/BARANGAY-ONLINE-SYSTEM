// resources/js/pages/resident/Records/Create.tsx
import ResidentLayout from '@/layouts/resident-app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState, useRef, ChangeEvent, useEffect } from 'react';

import {
  Upload,
  File,
  FileText,
  User,
  Calendar,
  Lock,
  Globe,
  AlertCircle,
  ArrowLeft,
  X,
  CheckCircle,
  Loader2,
  Info,
  Shield,
  Briefcase,
  GraduationCap,
  Heart,
  Home,
  Award,
  DollarSign,
} from 'lucide-react';

interface DocumentCategory {
  id: number;
  name: string;
  slug: string;
  icon: string;
  color: string;
  description?: string;
  is_active: boolean;
  order: number;
  document_types?: DocumentType[];
}

interface DocumentType {
  id: number;
  name: string;
  code: string;
  description?: string;
  category: string;
  accepted_formats: string[];
  max_file_size: number;
  is_active: boolean;
  sort_order: number;
  document_category_id?: number;
}

interface Resident {
  id: number;
  first_name: string;
  last_name: string;
  middle_name?: string;
}

interface PageProps {
  categories: DocumentCategory[];
  residents: Resident[];
  maxFileSize: number;
  allowedTypes: string[];
}

interface FormData {
  resident_id: string;
  document_type_id: string;
  name: string;
  description: string;
  file: File | null;
  issue_date: string;
  expiry_date: string;
  is_public: boolean;
  requires_password: boolean;
  password: string;
  confirm_password: string;
  reference_number: string;
}

// Icon mapping based on category name
const getCategoryIcon = (iconName: string) => {
  const iconMap: Record<string, any> = {
    'User': User,
    'Shield': Shield,
    'Briefcase': Briefcase,
    'GraduationCap': GraduationCap,
    'Heart': Heart,
    'Home': Home,
    'Award': Award,
    'DollarSign': DollarSign,
    'FileText': FileText,
  };
  return iconMap[iconName] || File;
};

export default function DocumentCreate({ categories, residents, maxFileSize, allowedTypes }: PageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [selectedDocumentType, setSelectedDocumentType] = useState<DocumentType | null>(null);
  const [filteredTypes, setFilteredTypes] = useState<DocumentType[]>([]);

  const { data, setData, post, processing, errors, reset } = useForm<FormData>({
    resident_id: '',
    document_type_id: '',
    name: '',
    description: '',
    file: null,
    issue_date: '',
    expiry_date: '',
    is_public: false,
    requires_password: false,
    password: '',
    confirm_password: '',
    reference_number: '',
  });

  // Extract all document types from categories
  const allDocumentTypes = categories.flatMap(category => 
    category.document_types?.map(type => ({
      ...type,
      category_name: category.name,
      category_icon: category.icon,
      category_color: category.color,
    })) || []
  );

  // Filter document types when category is selected
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredTypes(allDocumentTypes);
    } else {
      const category = categories.find(c => c.id.toString() === selectedCategory);
      setFilteredTypes(category?.document_types || []);
    }
  }, [selectedCategory, categories, allDocumentTypes]);

  // Update selected document type when document_type_id changes
  useEffect(() => {
    if (data.document_type_id) {
      const docType = allDocumentTypes.find(type => type.id.toString() === data.document_type_id);
      setSelectedDocumentType(docType || null);
    } else {
      setSelectedDocumentType(null);
    }
  }, [data.document_type_id, allDocumentTypes]);

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset previous errors
    setFileError(null);

    // Get validation rules from selected document type
    let maxSize = maxFileSize * 1024 * 1024;
    let allowedFileTypes = allowedTypes;

    if (selectedDocumentType) {
      if (selectedDocumentType.max_file_size) {
        maxSize = selectedDocumentType.max_file_size * 1024; // Convert KB to bytes
      }
      if (selectedDocumentType.accepted_formats?.length > 0) {
        allowedFileTypes = selectedDocumentType.accepted_formats;
      }
    }

    // Check file size
    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / 1024 / 1024).toFixed(2);
      setFileError(`File size exceeds maximum limit of ${maxSizeMB}MB`);
      return;
    }

    // Check file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    if (!allowedFileTypes.includes(fileExtension)) {
      setFileError(`File type not allowed. Allowed types: ${allowedFileTypes.join(', ').toUpperCase()}`);
      return;
    }

    setSelectedFile(file);
    setData('file', file);

    // Generate file preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setData('file', null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const icons: Record<string, any> = {
      pdf: FileText,
      doc: FileText,
      docx: FileText,
      xls: FileText,
      xlsx: FileText,
      jpg: File,
      jpeg: File,
      png: File,
      gif: File,
    };
    return icons[extension || ''] || File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatKBtoMB = (kb: number) => {
    return (kb / 1024).toFixed(2) + ' MB';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!data.resident_id) {
      alert('Please select a resident.');
      return;
    }

    if (!data.document_type_id) {
      alert('Please select a document type.');
      return;
    }

    if (!selectedFile) {
      alert('Please select a file to upload.');
      return;
    }

    // Validate password if required
    if (data.requires_password) {
      if (!data.password) {
        alert('Please enter a password for the document.');
        return;
      }
      if (data.password !== data.confirm_password) {
        alert('Passwords do not match.');
        return;
      }
      if (data.password.length < 4) {
        alert('Password must be at least 4 characters long.');
        return;
      }
    }

    setIsUploading(true);

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('resident_id', data.resident_id);
    formData.append('document_type_id', data.document_type_id);
    formData.append('name', data.name);
    formData.append('description', data.description || '');
    formData.append('file', selectedFile);
    formData.append('issue_date', data.issue_date || '');
    formData.append('expiry_date', data.expiry_date || '');
    formData.append('is_public', data.is_public ? '1' : '0');
    formData.append('requires_password', data.requires_password ? '1' : '0');
    formData.append('password', data.password || '');
    formData.append('reference_number', data.reference_number || '');

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 5;
      });
    }, 100);

    // Submit using Inertia
    post('/my-records', formData, {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => {
        clearInterval(progressInterval);
        setUploadProgress(100);
        reset();
        setSelectedFile(null);
        setFilePreview(null);
        setSelectedDocumentType(null);
        setSelectedCategory('all');
      },
      onError: () => {
        clearInterval(progressInterval);
      },
      onFinish: () => {
        setIsUploading(false);
        setUploadProgress(0);
      },
    });
  };

  const FileIcon = selectedFile ? getFileIcon(selectedFile.name) : File;

  return (
    <ResidentLayout
      title="Upload Document"
      breadcrumbs={[
        { title: 'Dashboard', href: '/resident/dashboard' },
        { title: 'My Records', href: '/my-records' },
        { title: 'Upload Document', href: '#' },
      ]}
    >
      <Head title="Upload Document" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/my-records">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Upload Document</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Upload and manage your personal documents
            </p>
          </div>
        </div>

        {/* Document Type Requirements Alert */}
        {selectedDocumentType && (
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800">Document Requirements</AlertTitle>
            <AlertDescription className="text-blue-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Max File Size:</span>
                  <span>{formatKBtoMB(selectedDocumentType.max_file_size || maxFileSize * 1024)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Accepted Formats:</span>
                  <span>
                    {selectedDocumentType.accepted_formats?.length > 0
                      ? selectedDocumentType.accepted_formats.join(', ').toUpperCase()
                      : allowedTypes.join(', ').toUpperCase()}
                  </span>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - File Upload */}
            <div className="lg:col-span-2 space-y-6">
              {/* File Upload Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Select Document
                  </CardTitle>
                  <CardDescription>
                    Choose the document file you want to upload
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!selectedFile ? (
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="font-medium text-lg mb-2">Drag & drop files here</h3>
                      <p className="text-gray-500 mb-4">or click to browse</p>
                      <Button type="button" variant="outline">
                        Browse Files
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        onChange={handleFileSelect}
                        accept={allowedTypes.map(type => `.${type}`).join(',')}
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="p-3 rounded-lg bg-gray-100">
                          <FileIcon className="h-8 w-8 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium truncate">{selectedFile.name}</h4>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={handleRemoveFile}
                              className="h-8 w-8 p-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span>{formatFileSize(selectedFile.size)}</span>
                            <span>•</span>
                            <span>{selectedFile.type}</span>
                          </div>
                        </div>
                      </div>

                      {/* Upload Progress */}
                      {isUploading && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Uploading...</span>
                            <span>{uploadProgress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* File Preview for Images */}
                      {filePreview && (
                        <div className="mt-4">
                          <Label className="mb-2 block">Preview</Label>
                          <div className="border rounded-lg p-4">
                            <img
                              src={filePreview}
                              alt="File preview"
                              className="max-h-64 mx-auto rounded"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {fileError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{fileError}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Document Details Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Document Details</CardTitle>
                  <CardDescription>
                    Provide information about the document
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Document Name *</Label>
                    <Input
                      id="name"
                      value={data.name}
                      onChange={(e) => setData('name', e.target.value)}
                      placeholder="e.g., Birth Certificate, Passport, Diploma"
                      required
                    />
                    {errors.name && (
                      <p className="text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={data.description}
                      onChange={(e) => setData('description', e.target.value)}
                      placeholder="Brief description of the document..."
                      rows={3}
                    />
                    {errors.description && (
                      <p className="text-sm text-red-600">{errors.description}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="issue_date">Issue Date</Label>
                      <Input
                        id="issue_date"
                        type="date"
                        value={data.issue_date}
                        onChange={(e) => setData('issue_date', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expiry_date">Expiry Date</Label>
                      <Input
                        id="expiry_date"
                        type="date"
                        value={data.expiry_date}
                        onChange={(e) => setData('expiry_date', e.target.value)}
                        min={data.issue_date}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reference_number">Reference Number</Label>
                    <Input
                      id="reference_number"
                      value={data.reference_number}
                      onChange={(e) => setData('reference_number', e.target.value)}
                      placeholder="e.g., BC-2023-001, PASSPORT-123456"
                    />
                    <p className="text-sm text-gray-500">
                      Leave blank to auto-generate a reference number
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Settings */}
            <div className="space-y-6">
              {/* Category & Resident Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="resident_id">Resident *</Label>
                    <select
                      id="resident_id"
                      value={data.resident_id}
                      onChange={(e) => setData('resident_id', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Resident</option>
                      {residents.map((resident) => (
                        <option key={resident.id} value={resident.id}>
                          {resident.first_name} {resident.last_name}
                          {resident.middle_name && ` ${resident.middle_name}`}
                        </option>
                      ))}
                    </select>
                    {errors.resident_id && (
                      <p className="text-sm text-red-600">{errors.resident_id}</p>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Filter by Category</Label>
                      <select
                        id="category"
                        value={selectedCategory}
                        onChange={(e) => {
                          setSelectedCategory(e.target.value);
                          setData('document_type_id', '');
                          setSelectedDocumentType(null);
                        }}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">All Categories</option>
                        {categories.map((category) => {
                          const CategoryIcon = getCategoryIcon(category.icon);
                          return (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="document_type_id">Document Type *</Label>
                      <select
                        id="document_type_id"
                        value={data.document_type_id}
                        onChange={(e) => setData('document_type_id', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select Document Type</option>
                        {filteredTypes.map((type) => {
                          const CategoryIcon = getCategoryIcon(type.category_icon || 'File');
                          return (
                            <option key={type.id} value={type.id}>
                              {type.name}
                              {type.description && ` - ${type.description}`}
                            </option>
                          );
                        })}
                      </select>
                      {errors.document_type_id && (
                        <p className="text-sm text-red-600">{errors.document_type_id}</p>
                      )}
                    </div>

                    {selectedDocumentType && (
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        <h4 className="font-medium text-sm mb-2">Document Type Info</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p><span className="font-medium">Code:</span> {selectedDocumentType.code}</p>
                          <p><span className="font-medium">Category:</span> {selectedDocumentType.category_name}</p>
                          {selectedDocumentType.description && (
                            <p><span className="font-medium">Description:</span> {selectedDocumentType.description}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Security Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Make Public
                      </Label>
                      <p className="text-sm text-gray-500">
                        Anyone with the link can view
                      </p>
                    </div>
                    <Switch
                      checked={data.is_public}
                      onCheckedChange={(checked) => setData('is_public', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          Password Protect
                        </Label>
                        <p className="text-sm text-gray-500">
                          Require password to access
                        </p>
                      </div>
                      <Switch
                        checked={data.requires_password}
                        onCheckedChange={(checked) => setData('requires_password', checked)}
                      />
                    </div>

                    {data.requires_password && (
                      <div className="space-y-3 pl-2 border-l-2 border-gray-200">
                        <div className="space-y-2">
                          <Label htmlFor="password">Password *</Label>
                          <Input
                            id="password"
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Enter password"
                            required={data.requires_password}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirm_password">Confirm Password *</Label>
                          <Input
                            id="confirm_password"
                            type="password"
                            value={data.confirm_password}
                            onChange={(e) => setData('confirm_password', e.target.value)}
                            placeholder="Confirm password"
                            required={data.requires_password}
                          />
                        </div>
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-sm">
                            Remember this password. You'll need it to access the document.
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Upload Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Upload Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Selected File</span>
                    <span className="font-medium text-sm truncate max-w-[200px]">
                      {selectedFile ? selectedFile.name : 'No file selected'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">File Size</span>
                    <span className="font-medium">
                      {selectedFile ? formatFileSize(selectedFile.size) : '0 KB'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Resident</span>
                    <span className="font-medium">
                      {data.resident_id
                        ? residents.find(r => r.id.toString() === data.resident_id)?.first_name + ' ' +
                          residents.find(r => r.id.toString() === data.resident_id)?.last_name
                        : 'Not selected'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Document Type</span>
                    <span className="font-medium text-sm truncate max-w-[200px]">
                      {data.document_type_id
                        ? filteredTypes.find(t => t.id.toString() === data.document_type_id)?.name
                        : 'Not selected'}
                    </span>
                  </div>
                  {selectedDocumentType && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Category</span>
                      <span className="font-medium">
                        {selectedDocumentType.category_name}
                      </span>
                    </div>
                  )}
                  <Separator />
                  <div className="pt-2">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={processing || isUploading || !selectedFile || !data.document_type_id}
                    >
                      {processing || isUploading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {isUploading ? 'Uploading...' : 'Processing...'}
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Document
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-gray-500 text-center mt-2">
                      By uploading, you confirm this document belongs to you
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </ResidentLayout>
  );
}