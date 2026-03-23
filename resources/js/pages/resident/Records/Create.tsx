// pages/resident/records/create.tsx (refactored - COMPLETE FIXED VERSION WITH DARK MODE)

import React, { useState, useEffect, useMemo } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import ResidentLayout from '@/layouts/resident-app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Menu, Sparkles, AlertCircle, Eye, Upload, FileText, Shield } from 'lucide-react';

// Import types
import { PageProps, DocumentType } from '@/types/portal/records/records';

// Import hooks
import { useRecordsFileHandling } from '@/types/portal/records/services/hooks/useRecordsFileHandling';
import { useRecordsTags } from '@/types/portal/records/services/hooks/useRecordsTags';
import { useRecordsMobile } from '@/types/portal/records/services/hooks/useRecordsMobile';
import { useRecordsAIFeatures } from '@/types/portal/records/services/hooks/useRecordsAIFeatures';

// Import components
import { MobileNavDrawer } from '@/components/portal/records/MobileNavDrawer';
import { DocumentTypeSelector } from '@/components/portal/records/DocumentTypeSelector';
import { FileUploadArea } from '@/components/portal/records/FileUploadArea';
import { DocumentDetailsForm } from '@/components/portal/records/DocumentDetailsForm';
import { ResidentSelector } from '@/components/portal/records/ResidentSelector';
import { SecurityPrivacyCard } from '@/components/portal/records/SecurityPrivacyCard';
import { UploadSummary } from '@/components/portal/records/UploadSummary';
import { MobileBottomActionBar } from '@/components/portal/records/MobileBottomActionBar';
import { AIExtractedInfo } from '@/components/portal/records/AIExtractedInfo';
import { PDFPreview } from '@/components/portal/records/PDFPreview';
import { ImagePreview } from '@/components/portal/records/ImagePreview';
import { FilePreviewComponent } from '@/components/portal/records/FilePreviewComponent';

// Import helpers
import { isPdf, isImage } from '@/types/portal/records/utils/records-helpers';

export default function DocumentCreate({ 
  categories, 
  residents, 
  maxFileSize, 
  allowedTypes,
  recentDocuments = [],
  templates = [],
  aiFeatures = {
    ocr_enabled: true,
    auto_categorization: true,
    metadata_extraction: true,
    duplicate_detection: true,
  }
}: PageProps) {
  // State
  const [selectedDocumentType, setSelectedDocumentType] = useState<DocumentType | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [uploadStep, setUploadStep] = useState<'type-selection' | 'file-upload' | 'details'>('type-selection');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'date'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Form
  const { data, setData, post, processing, errors } = useForm({
    resident_id: '',
    document_type_id: '',
    name: '',
    description: '',
    file: null as File | null,
    issue_date: '',
    expiry_date: '',
    is_public: true,
    requires_password: false,
    password: '',
    confirm_password: '',
    reference_number: '',
    tags: [],
    metadata: {},
    custom_fields: {},
  });

  // Custom hooks
  const {
    isMobile,
    mobileNavOpen,
    setMobileNavOpen,
    activeTab,
    setActiveTab,
  } = useRecordsMobile();

  const {
    selectedTags,
    setSelectedTags,
    customTags,
    setCustomTags,
    handleTagSelect,
    handleAddCustomTag,
  } = useRecordsTags();

  const {
    ocrEnabled,
    setOcrEnabled,
    enableDuplicateCheck,
    setEnableDuplicateCheck,
  } = useRecordsAIFeatures(aiFeatures);

  const {
    selectedFile,
    isScanning,
    extractedInfo,
    showExtractedInfo,
    setShowExtractedInfo,
    dragActive,
    zoomLevel,
    fileInputRef,
    handleDrag,
    handleDrop,
    handleFileSelect,
    handleRemoveFile,
    handleApplyExtractedInfo,
    handleZoomIn,
    handleZoomOut,
    handleZoomReset,
  } = useRecordsFileHandling({
    maxFileSize,
    allowedTypes,
    selectedDocumentType,
    setData,
    data,
    setUploadStep,
    setFileError,
  });

  // Memoized document types
  const allDocumentTypes = useMemo(() => 
    categories.flatMap(category => 
      category.document_types?.map(type => ({
        ...type,
        category_name: category.name,
        category_icon: category.icon,
        category_color: category.color,
        category_description: category.description,
      })) || []
    ),
    [categories]
  );

  const filteredDocumentTypes = useMemo(() => {
    let types = selectedCategory === 'all' 
      ? allDocumentTypes 
      : allDocumentTypes.filter(type => type.document_category_id?.toString() === selectedCategory);

    if (searchQuery) {
      types = types.filter(type => 
        type.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        type.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        type.code.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    types.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'size':
          comparison = (a.max_file_size || 0) - (b.max_file_size || 0);
          break;
        case 'date':
          comparison = (a.sort_order || 0) - (b.sort_order || 0);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return types;
  }, [selectedCategory, allDocumentTypes, searchQuery, sortBy, sortOrder]);

  // Effects
  useEffect(() => {
    if (data.document_type_id) {
      const docType = filteredDocumentTypes.find(type => type.id.toString() === data.document_type_id);
      setSelectedDocumentType(docType || null);
      if (docType) {
        setUploadStep('file-upload');
      }
    } else {
      setSelectedDocumentType(null);
    }
  }, [data.document_type_id, filteredDocumentTypes]);

  useEffect(() => {
    setData('tags', selectedTags);
  }, [selectedTags, setData]);

  // Handlers
  const handleBackToTypeSelection = () => {
    setUploadStep('type-selection');
    setSelectedDocumentType(null);
    setData('document_type_id', '');
  };

  const handleBackToFileUpload = () => {
    setUploadStep('file-upload');
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setUploadError(null);

    // Validation
    if (!data.resident_id) {
      setUploadError('Please select a resident.');
      return;
    }
    if (!data.document_type_id) {
      setUploadError('Please select a document type.');
      return;
    }
    if (!selectedFile) {
      setUploadError('Please select a file to upload.');
      return;
    }
    
    // Password validation - only validate if requires_password is true
    if (data.requires_password) {
      if (!data.password) {
        setUploadError('Please enter a password for the document.');
        return;
      }
      if (data.password !== data.confirm_password) {
        setUploadError('Passwords do not match.');
        return;
      }
      if (data.password.length < 4) {
        setUploadError('Password must be at least 4 characters long.');
        return;
      }
    } else {
      // Clear password fields if not required
      setData('password', '');
      setData('confirm_password', '');
    }

    // Prepare FormData
    const formData = new FormData();
    
    // Required fields
    formData.append('resident_id', data.resident_id);
    formData.append('document_type_id', data.document_type_id);
    formData.append('name', data.name || selectedFile.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, ' '));
    formData.append('description', data.description || '');
    formData.append('file', selectedFile);
    formData.append('is_public', data.is_public ? '1' : '0');
    formData.append('requires_password', data.requires_password ? '1' : '0');
    
    // Optional fields
    if (data.issue_date) formData.append('issue_date', data.issue_date);
    if (data.expiry_date) formData.append('expiry_date', data.expiry_date);
    if (data.reference_number) formData.append('reference_number', data.reference_number);
    
    // Password fields - only include if requires_password is true
    if (data.requires_password) {
      formData.append('password', data.password);
      formData.append('confirm_password', data.confirm_password);
    } else {
      // Send empty strings to clear any previous values
      formData.append('password', '');
      formData.append('confirm_password', '');
    }
    
    // TAGS: Convert to JSON string
    const cleanTags = selectedTags
      .map(tag => tag.toString().trim())
      .filter(tag => tag.length > 0);
    
    formData.append('tags', JSON.stringify(cleanTags));
    
    // METADATA: Ensure it's a JSON string
    let metadataValue = data.metadata || {};
    if (typeof metadataValue === 'string') {
      try {
        metadataValue = JSON.parse(metadataValue);
      } catch {
        metadataValue = {};
      }
    }
    
    formData.append('metadata', JSON.stringify(metadataValue));
    
    // Submit
    post('/portal/my-records', formData, {
      forceFormData: true,
      preserveScroll: true,
      onStart: () => setUploadProgress(10),
      onProgress: (progress) => {
        if (progress.percentage) setUploadProgress(Math.round(progress.percentage));
      },
      onSuccess: () => setUploadProgress(100),
      onError: (errors) => {
        console.error('Upload errors:', errors);
        
        if (errors.tags) {
          setUploadError(`Tags error: ${errors.tags}`);
        } else if (errors.metadata) {
          setUploadError(`Metadata error: ${errors.metadata}`);
        } else if (errors.reference_number) {
          setUploadError('Reference number already exists. Please use a different one.');
        } else if (errors.password) {
          setUploadError(`Password error: ${errors.password}`);
        } else if (errors.confirm_password) {
          setUploadError(`Confirm password error: ${errors.confirm_password}`);
        } else {
          setUploadError(Object.values(errors)[0] || 'Upload failed.');
        }
        setUploadProgress(0);
      },
    });
  };

  // Mobile steps for navigation drawer
  const mobileSteps = [
    { title: 'Document Type', icon: <FileText className="h-4 w-4" />, description: 'Select document category and type' },
    { title: 'File Upload', icon: <Upload className="h-4 w-4" />, description: 'Choose and upload your file' },
    { title: 'Details', icon: <FileText className="h-4 w-4" />, description: 'Add metadata and security options' },
  ];

  const currentStepNumber = {
    'type-selection': 1,
    'file-upload': 2,
    'details': 3,
  }[uploadStep];

  // Mobile tabs for details view
  const mobileTabs = [
    { id: 'details', label: 'Details', icon: FileText },
    { id: 'preview', label: 'Preview', icon: Eye },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <ResidentLayout
      title="Upload Document"
      breadcrumbs={[
        { title: 'Dashboard', href: '/portal/dashboard' },
        { title: 'My Records', href: '/portal/my-records' },
        { title: 'Upload Document', href: '#' },
      ]}
    >
      <Head title="Upload Document" />

      {/* Mobile Navigation Drawer */}
      <MobileNavDrawer
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        currentStep={currentStepNumber}
        totalSteps={3}
        steps={mobileSteps}
      />

      {/* Mobile Bottom Action Bar */}
      {uploadStep === 'details' && isMobile && (
        <MobileBottomActionBar
          processing={processing}
          selectedFile={selectedFile}
          documentTypeId={data.document_type_id}
          residentId={data.resident_id}
          onUpload={() => handleSubmit()}
          onCancel={() => window.history.back()}
        />
      )}

      {/* Main content */}
      <div className={`space-y-4 sm:space-y-6 ${uploadStep === 'details' && isMobile ? 'pb-24' : 'pb-20 sm:pb-6'}`}>
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Link href="/portal/my-records" className="sm:hidden">
              <Button type="button" variant="ghost" size="sm" className="h-9 w-9 p-0 text-gray-400 hover:text-gray-200 hover:bg-gray-800">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight truncate text-white">Upload Document</h1>
              <p className="text-xs sm:text-sm text-gray-400 truncate">
                Upload and manage your personal documents
              </p>
            </div>
          </div>
          
          {/* Mobile Menu Button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="lg:hidden h-9 w-9 p-0 text-gray-400 hover:text-gray-200 hover:bg-gray-800"
            onClick={() => setMobileNavOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <Badge variant="outline" className="hidden sm:inline-flex gap-1 border-gray-700 text-gray-300">
            <Sparkles className="h-3 w-3" />
            AI
          </Badge>
        </div>

        {/* Mobile Step Indicator */}
        <div className="lg:hidden">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-sm font-medium text-gray-300">Step {currentStepNumber} of 3</span>
            <span className="text-xs text-gray-400">
              {uploadStep === 'type-selection' ? 'Select Type' : 
               uploadStep === 'file-upload' ? 'Upload File' : 'Details'}
            </span>
          </div>
          <Progress value={(currentStepNumber / 3) * 100} className="h-2 bg-gray-800" />
        </div>

        {/* Desktop Progress Steps */}
        <div className="hidden lg:flex items-center justify-center">
          <div className="flex items-center space-x-4">
            {['type-selection', 'file-upload', 'details'].map((step, index) => {
              const stepNumber = index + 1;
              const isCurrent = uploadStep === step;
              const isCompleted = 
                (step === 'type-selection' && uploadStep !== 'type-selection') ||
                (step === 'file-upload' && uploadStep === 'details');
              
              return (
                <div key={step} className="flex items-center space-x-2">
                  <div className={`
                    flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all
                    ${isCurrent 
                      ? 'bg-blue-600 border-blue-600 text-white scale-110' 
                      : isCompleted
                      ? 'bg-green-600 border-green-600 text-white'
                      : 'border-gray-600 text-gray-400'
                    }
                  `}>
                    {isCompleted ? '✓' : stepNumber}
                  </div>
                  {index < 2 && <div className="w-16 h-0.5 bg-gray-700"></div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Error Alert */}
        {uploadError && (
          <Alert variant="destructive" className="text-sm bg-red-950/50 border-red-800 text-red-200">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertTitle className="text-sm text-red-200">Upload Failed</AlertTitle>
            <AlertDescription className="text-xs text-red-300">{uploadError}</AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <div className="space-y-4 sm:space-y-6">
          {/* Mobile Layout */}
          <div className="lg:hidden space-y-4">
            {/* Step 1: Document Type Selection */}
            {uploadStep === 'type-selection' && (
              <DocumentTypeSelector
                categories={categories}
                filteredDocumentTypes={filteredDocumentTypes}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                sortBy={sortBy}
                onSortByChange={setSortBy}
                sortOrder={sortOrder}
                onSortOrderChange={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                viewMode={viewMode}
                onViewModeChange={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                selectedDocumentTypeId={data.document_type_id}
                onSelect={(id) => setData('document_type_id', id)}
                maxFileSize={maxFileSize}
                allowedTypes={allowedTypes}
              />
            )}

            {/* Step 2: File Upload */}
            {uploadStep === 'file-upload' && selectedDocumentType && (
              <FileUploadArea
                selectedDocumentType={selectedDocumentType}
                maxFileSize={maxFileSize}
                allowedTypes={allowedTypes}
                dragActive={dragActive}
                fileInputRef={fileInputRef}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onFileSelect={handleFileSelect}
                onBrowseClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                fileError={fileError}
                aiFeatures={aiFeatures}
                onBackToTypeSelection={handleBackToTypeSelection}
              />
            )}

            {/* Step 3: Details - Mobile Tabs */}
            {uploadStep === 'details' && (
              <>
                {/* Mobile Tabs */}
                <div className="border-b border-gray-800">
                  <div className="flex">
                    {mobileTabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          className={`flex-1 py-3 text-center border-b-2 transition-colors text-sm font-medium
                            ${activeTab === tab.id 
                              ? 'border-blue-600 text-blue-400' 
                              : 'border-transparent text-gray-400 hover:text-gray-300'
                            }`}
                          onClick={() => setActiveTab(tab.id as any)}
                        >
                          <div className="flex items-center justify-center gap-1">
                            <Icon className="h-4 w-4" />
                            <span className="hidden xs:inline">{tab.label}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Tab Content */}
                <div className="space-y-4 mb-4">
                  {/* Details Tab */}
                  {activeTab === 'details' && (
                    <>
                      {/* File Preview Card */}
                      {selectedFile && (
                        <Card className="bg-gray-900/50 border-gray-800">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg text-white">
                              <Eye className="h-5 w-5" />
                              File Preview
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-4">
                            <div className="border border-gray-800 rounded-lg p-3 bg-gray-800">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-gray-800 rounded-lg border border-gray-700">
                                  <FileText className="h-8 w-8 text-gray-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-sm text-white truncate">{selectedFile.name}</h4>
                                  <p className="text-xs text-gray-400">
                                    {(selectedFile.size / 1024).toFixed(2)} KB • {selectedFile.type.split('/')[1]?.toUpperCase() || 'Unknown'}
                                  </p>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={handleBackToFileUpload}
                                  className="text-sm border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                                >
                                  Change File
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => fileInputRef.current?.click()}
                                  className="text-sm border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                                >
                                  Replace
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* AI Extracted Info */}
                      {showExtractedInfo && extractedInfo && (
                        <AIExtractedInfo
                          extractedInfo={extractedInfo}
                          onIgnore={() => setShowExtractedInfo(false)}
                          onApply={handleApplyExtractedInfo}
                        />
                      )}

                      {/* Document Details Form */}
                      <DocumentDetailsForm
                        data={data}
                        setData={setData}
                        processing={processing}
                        selectedTags={selectedTags}
                        customTags={customTags}
                        onTagSelect={handleTagSelect}
                        onCustomTagChange={setCustomTags}
                        onAddCustomTag={handleAddCustomTag}
                        showAdvancedOptions={showAdvancedOptions}
                        onToggleAdvancedOptions={() => setShowAdvancedOptions(!showAdvancedOptions)}
                        ocrEnabled={ocrEnabled}
                        enableDuplicateCheck={enableDuplicateCheck}
                        onOcrToggle={setOcrEnabled}
                        onDuplicateToggle={setEnableDuplicateCheck}
                      />

                      {/* Resident Information */}
                      <ResidentSelector
                        residents={residents}
                        value={data.resident_id}
                        onChange={(value) => setData('resident_id', value)}
                        processing={processing}
                        error={errors.resident_id}
                      />
                    </>
                  )}

                  {/* Preview Tab */}
                  {activeTab === 'preview' && selectedFile && (
                    <div className="space-y-4">
                      {isPdf(selectedFile) && (
                        <PDFPreview file={selectedFile} zoomLevel={zoomLevel} />
                      )}
                      {isImage(selectedFile) && (
                        <ImagePreview file={selectedFile} zoomLevel={zoomLevel} />
                      )}
                      {!isPdf(selectedFile) && !isImage(selectedFile) && (
                        <FilePreviewComponent file={selectedFile} />
                      )}
                    </div>
                  )}

                  {/* Security Tab */}
                  {activeTab === 'security' && (
                    <SecurityPrivacyCard
                      data={data}
                      setData={setData}
                      processing={processing}
                      errors={errors}
                    />
                  )}
                </div>
              </>
            )}
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:grid lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {uploadStep === 'type-selection' && (
                <DocumentTypeSelector
                  categories={categories}
                  filteredDocumentTypes={filteredDocumentTypes}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  sortBy={sortBy}
                  onSortByChange={setSortBy}
                  sortOrder={sortOrder}
                  onSortOrderChange={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  viewMode={viewMode}
                  onViewModeChange={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  selectedDocumentTypeId={data.document_type_id}
                  onSelect={(id) => setData('document_type_id', id)}
                  maxFileSize={maxFileSize}
                  allowedTypes={allowedTypes}
                />
              )}

              {uploadStep === 'file-upload' && selectedDocumentType && (
                <FileUploadArea
                  selectedDocumentType={selectedDocumentType}
                  maxFileSize={maxFileSize}
                  allowedTypes={allowedTypes}
                  dragActive={dragActive}
                  fileInputRef={fileInputRef}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onFileSelect={handleFileSelect}
                  onBrowseClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  fileError={fileError}
                  aiFeatures={aiFeatures}
                  onBackToTypeSelection={handleBackToTypeSelection}
                />
              )}

              {uploadStep === 'details' && (
                <>
                  {selectedFile && (
                    <Card className="bg-gray-800/50 border-gray-800">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2 text-white">
                            <Eye className="h-5 w-5" />
                            File Preview
                            {isScanning && (
                              <span className="ml-2 flex items-center text-sm text-blue-400">
                                Scanning...
                              </span>
                            )}
                          </CardTitle>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleBackToFileUpload}
                            className="gap-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800"
                          >
                            Change File
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {isPdf(selectedFile) && (
                          <PDFPreview file={selectedFile} zoomLevel={zoomLevel} />
                        )}
                        {isImage(selectedFile) && (
                          <ImagePreview file={selectedFile} zoomLevel={zoomLevel} />
                        )}
                        {!isPdf(selectedFile) && !isImage(selectedFile) && (
                          <FilePreviewComponent file={selectedFile} />
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {showExtractedInfo && extractedInfo && (
                    <AIExtractedInfo
                      extractedInfo={extractedInfo}
                      onIgnore={() => setShowExtractedInfo(false)}
                      onApply={handleApplyExtractedInfo}
                    />
                  )}

                  <DocumentDetailsForm
                    data={data}
                    setData={setData}
                    processing={processing}
                    selectedTags={selectedTags}
                    customTags={customTags}
                    onTagSelect={handleTagSelect}
                    onCustomTagChange={setCustomTags}
                    onAddCustomTag={handleAddCustomTag}
                    showAdvancedOptions={showAdvancedOptions}
                    onToggleAdvancedOptions={() => setShowAdvancedOptions(!showAdvancedOptions)}
                    ocrEnabled={ocrEnabled}
                    enableDuplicateCheck={enableDuplicateCheck}
                    onOcrToggle={setOcrEnabled}
                    onDuplicateToggle={setEnableDuplicateCheck}
                  />
                </>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <ResidentSelector
                residents={residents}
                value={data.resident_id}
                onChange={(value) => setData('resident_id', value)}
                processing={processing}
                error={errors.resident_id}
              />

              {selectedDocumentType && (
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">Selected Document Type</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-3 bg-gray-800 rounded-lg border border-gray-800">
                      <div className="flex items-start gap-3">
                        <div>
                          <h4 className="font-medium text-white">{selectedDocumentType.name}</h4>
                          <p className="text-sm text-gray-400 mb-2">{selectedDocumentType.description}</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full mt-3 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                        onClick={handleBackToTypeSelection}
                        disabled={processing}
                      >
                        Change Type
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {uploadStep === 'details' && (
                <>
                  <SecurityPrivacyCard
                    data={data}
                    setData={setData}
                    processing={processing}
                    errors={errors}
                  />
                  
                  <UploadSummary
                    selectedFile={selectedFile}
                    selectedDocumentType={selectedDocumentType}
                    data={data}
                    selectedTags={selectedTags}
                    uploadProgress={uploadProgress}
                    processing={processing}
                    onUpload={handleSubmit}
                  />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Submit Section */}
        {!isMobile && uploadStep === 'details' && (
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">
                    Ready to upload your document?
                  </p>
                  {uploadError && (
                    <Alert variant="destructive" className="mt-2 bg-red-950/50 border-red-800">
                      <AlertCircle className="h-4 w-4 text-red-400" />
                      <AlertDescription className="text-red-300">{uploadError}</AlertDescription>
                    </Alert>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Link href="/portal/my-records">
                    <Button type="button" variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    type="button"
                    disabled={processing || !selectedFile || !data.document_type_id || !data.resident_id}
                    onClick={() => handleSubmit()}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {processing ? 'Uploading...' : 'Upload Document'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ResidentLayout>
  );
}