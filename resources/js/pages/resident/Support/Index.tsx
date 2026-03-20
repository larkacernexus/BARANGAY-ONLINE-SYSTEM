import ResidentLayout from '@/layouts/resident-app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';

// Import icons
import { 
  HelpCircle as HelpCircleIcon,
  Mail as MailIcon,
  Phone as PhoneIcon,
  MessageCircle as MessageCircleIcon,
  FileText as FileTextIcon,
  Clock as ClockIcon,
  CheckCircle as CheckCircleIcon,
  AlertCircle as AlertCircleIcon,
  Send as SendIcon,
  Upload as UploadIcon,
  X as XIcon,
  Search as SearchIcon,
  BookOpen as BookOpenIcon,
  Video as VideoIcon,
  FileQuestion as FileQuestionIcon,
  LifeBuoy as LifeBuoyIcon,
  ExternalLink as ExternalLinkIcon,
  ChevronRight as ChevronRightIcon,
  Sparkles as SparklesIcon,
  Users as UsersIcon,
  Building as BuildingIcon,
  Globe as GlobeIcon,
  MessageSquare as MessageSquareIcon,
  Ticket as TicketIcon,
  History as HistoryIcon,
  ThumbsUp as ThumbsUpIcon,
  MegaphoneIcon,
  Loader2,
  EyeIcon,
} from 'lucide-react';

interface SupportTicket {
  id: number;
  ticket_number: string;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  last_update: string;
  created_at: string;
}

interface FaqItem {
  id: number;
  question: string;
  answer: string;
  category: string;
  views: number;
  helpful_count: number;
}

interface PageProps {
  tickets?: SupportTicket[];
  faqs?: FaqItem[];
  categories?: string[];
  contactInfo?: {
    email: string;
    phone: string;
    hours: string;
    address: string;
  };
}

export default function SupportPage({ 
  tickets = [],
  faqs = [],
  categories = ['Technical', 'Billing', 'Account', 'General', 'Other'],
  contactInfo = {
    email: 'support@barangay.gov.ph',
    phone: '(02) 1234-5678',
    hours: 'Monday - Friday, 8:00 AM - 5:00 PM',
    address: 'Barangay Hall, City Hall Complex'
  }
}: PageProps) {
  const [activeTab, setActiveTab] = useState('faq');
  const [searchQuery, setSearchQuery] = useState('');
  const [faqCategory, setFaqCategory] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    priority: 'medium',
    message: '',
    attachment: null as File | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, attachment: file }));
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Support ticket submitted successfully!', {
        description: 'We\'ll get back to you within 24 hours.',
      });
      
      setFormData({
        name: '',
        email: '',
        subject: '',
        category: '',
        priority: 'medium',
        message: '',
        attachment: null,
      });
      
      setActiveTab('tickets');
    } catch (error) {
      toast.error('Failed to submit ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredFaqs = useMemo(() => {
    return faqs.filter(faq => {
      const matchesSearch = searchQuery === '' || 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = faqCategory === 'all' || faq.category === faqCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [faqs, searchQuery, faqCategory]);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'open': return 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400';
      case 'in_progress': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-400';
      case 'resolved': return 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400';
      case 'closed': return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'low': return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-400';
      case 'medium': return 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400';
      case 'high': return 'bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400';
      case 'urgent': return 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-400';
    }
  };

  if (!mounted) {
    return (
      <ResidentLayout title="Support Center">
        <Head title="Support Center" />
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">Loading...</p>
          </div>
        </div>
      </ResidentLayout>
    );
  }

  return (
    <ResidentLayout
      title="Support Center"
      breadcrumbs={[
        { title: 'Dashboard', href: '/portal/dashboard' },
        { title: 'Support', href: '#' }
      ]}
    >
      <Head title="Support Center" />

      <div className="space-y-4 sm:space-y-6 pb-4 sm:pb-6">
        {/* Header */}
        <div className="px-4 sm:px-0">
          <div className="flex items-center gap-2 mb-2">
            <LifeBuoyIcon className="h-5 w-5 sm:h-6 sm:w-6 text-primary dark:text-primary-400" />
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight dark:text-white">
              Support Center
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            We're here to help! Find answers, contact support, or track your tickets.
          </p>
        </div>

        {/* Quick Contact Cards - COMPACT ON MOBILE */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 px-4 sm:px-0">
          {/* Email Card - Compact */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border dark:border-gray-700 p-2 sm:p-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col items-center text-center">
              <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-1 sm:mb-2">
                <MailIcon className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-[10px] sm:text-xs font-medium dark:text-white truncate w-full">Email</h3>
              <p className="text-[8px] sm:text-[10px] text-gray-500 dark:text-gray-400 truncate w-full mt-0.5">
                {contactInfo.email}
              </p>
              <p className="text-[7px] sm:text-[9px] text-gray-400 dark:text-gray-500 mt-0.5">24/7 Support</p>
            </div>
          </div>

          {/* Phone Card - Compact */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border dark:border-gray-700 p-2 sm:p-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col items-center text-center">
              <div className="p-1.5 sm:p-2 bg-green-100 dark:bg-green-900/30 rounded-full mb-1 sm:mb-2">
                <PhoneIcon className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-[10px] sm:text-xs font-medium dark:text-white truncate w-full">Phone</h3>
              <p className="text-[8px] sm:text-[10px] text-gray-500 dark:text-gray-400 truncate w-full mt-0.5">
                {contactInfo.phone}
              </p>
              <p className="text-[7px] sm:text-[9px] text-gray-400 dark:text-gray-500 truncate w-full mt-0.5">
                {contactInfo.hours.split(',')[0]}
              </p>
            </div>
          </div>

          {/* Visit Us Card - Compact */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border dark:border-gray-700 p-2 sm:p-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col items-center text-center">
              <div className="p-1.5 sm:p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-1 sm:mb-2">
                <BuildingIcon className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-[10px] sm:text-xs font-medium dark:text-white truncate w-full">Visit Us</h3>
              <p className="text-[8px] sm:text-[10px] text-gray-500 dark:text-gray-400 truncate w-full mt-0.5">
                {contactInfo.address.split(',')[0]}
              </p>
              <p className="text-[7px] sm:text-[9px] text-gray-400 dark:text-gray-500 truncate w-full mt-0.5">
                {contactInfo.hours}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4 sm:px-0">
          <TabsList className="grid w-full grid-cols-3 mb-4 sm:mb-6 h-auto">
            <TabsTrigger value="faq" className="text-xs sm:text-sm py-1.5 sm:py-2">
              <FileQuestionIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">FAQ</span>
              <span className="sm:hidden">FAQ</span>
            </TabsTrigger>
            <TabsTrigger value="contact" className="text-xs sm:text-sm py-1.5 sm:py-2">
              <MailIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Contact</span>
              <span className="sm:hidden">Support</span>
            </TabsTrigger>
            <TabsTrigger value="tickets" className="text-xs sm:text-sm py-1.5 sm:py-2">
              <TicketIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">My Tickets</span>
              <span className="sm:hidden">Tickets</span>
            </TabsTrigger>
          </TabsList>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="space-y-4">
            <Card className="dark:bg-gray-900 dark:border-gray-700">
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="text-base sm:text-lg dark:text-white">Frequently Asked Questions</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Find answers to common questions</CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4">
                  <div className="relative flex-1">
                    <SearchIcon className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                    <Input
                      placeholder="Search FAQs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-7 sm:pl-9 h-8 sm:h-10 text-xs sm:text-sm dark:bg-gray-900 dark:border-gray-700"
                    />
                  </div>
                  <Select value={faqCategory} onValueChange={setFaqCategory}>
                    <SelectTrigger className="w-full sm:w-[180px] h-8 sm:h-10 text-xs sm:text-sm dark:bg-gray-900 dark:border-gray-700">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* FAQ Accordion */}
                {filteredFaqs.length > 0 ? (
                  <Accordion type="single" collapsible className="space-y-2">
                    {filteredFaqs.map((faq) => (
                      <AccordionItem key={faq.id} value={`item-${faq.id}`} className="border rounded-lg px-3 sm:px-4 dark:border-gray-700">
                        <AccordionTrigger className="hover:no-underline py-2 sm:py-3">
                          <span className="text-xs sm:text-sm font-medium text-left dark:text-white">{faq.question}</span>
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 pb-2 sm:pb-3">{faq.answer}</p>
                          <div className="flex items-center gap-3 sm:gap-4 text-[10px] sm:text-xs text-gray-500 dark:text-gray-500 pb-2">
                            <span className="flex items-center gap-1">
                              <EyeIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                              {faq.views} views
                            </span>
                            <span className="flex items-center gap-1">
                              <ThumbsUpIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                              {faq.helpful_count} found helpful
                            </span>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <div className="text-center py-6 sm:py-8">
                    <FileQuestionIcon className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-gray-300 dark:text-gray-600 mb-2 sm:mb-3" />
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">No FAQs found matching your search</p>
                    <Button 
                      variant="link" 
                      onClick={() => { setSearchQuery(''); setFaqCategory('all'); }}
                      className="mt-1 sm:mt-2 text-xs sm:text-sm"
                    >
                      Clear filters
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Support Tab */}
          <TabsContent value="contact">
            <Card className="dark:bg-gray-900 dark:border-gray-700">
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="text-base sm:text-lg dark:text-white">Submit a Support Ticket</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Fill out the form below and we'll get back to you as soon as possible</CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
                <form onSubmit={handleSubmitTicket} className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1 sm:space-y-2">
                      <Label htmlFor="name" className="text-xs sm:text-sm">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="h-8 sm:h-10 text-xs sm:text-sm dark:bg-gray-900 dark:border-gray-700"
                      />
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                      <Label htmlFor="email" className="text-xs sm:text-sm">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="h-8 sm:h-10 text-xs sm:text-sm dark:bg-gray-900 dark:border-gray-700"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 sm:space-y-2">
                    <Label htmlFor="subject" className="text-xs sm:text-sm">Subject</Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="h-8 sm:h-10 text-xs sm:text-sm dark:bg-gray-900 dark:border-gray-700"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1 sm:space-y-2">
                      <Label htmlFor="category" className="text-xs sm:text-sm">Category</Label>
                      <Select 
                        value={formData.category} 
                        onValueChange={(value) => handleSelectChange('category', value)}
                      >
                        <SelectTrigger className="h-8 sm:h-10 text-xs sm:text-sm dark:bg-gray-900 dark:border-gray-700">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat} value={cat.toLowerCase()}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                      <Label htmlFor="priority" className="text-xs sm:text-sm">Priority</Label>
                      <Select 
                        value={formData.priority} 
                        onValueChange={(value) => handleSelectChange('priority', value)}
                      >
                        <SelectTrigger className="h-8 sm:h-10 text-xs sm:text-sm dark:bg-gray-900 dark:border-gray-700">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1 sm:space-y-2">
                    <Label htmlFor="message" className="text-xs sm:text-sm">Message</Label>
                    <Textarea
                      id="message"
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      className="text-xs sm:text-sm dark:bg-gray-900 dark:border-gray-700"
                    />
                  </div>

                  <div className="space-y-1 sm:space-y-2">
                    <Label htmlFor="attachment" className="text-xs sm:text-sm">Attachment (Optional)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="attachment"
                        type="file"
                        onChange={handleFileChange}
                        className="flex-1 h-8 sm:h-10 text-xs sm:text-sm dark:bg-gray-900 dark:border-gray-700 file:mr-2 file:py-1 file:px-2 file:text-xs"
                      />
                      {formData.attachment && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setFormData(prev => ({ ...prev, attachment: null }))}
                          className="h-8 w-8 sm:h-10 sm:w-10"
                        >
                          <XIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                      Max file size: 10MB. Allowed: PDF, Images, Documents
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full sm:w-auto h-8 sm:h-10 text-xs sm:text-sm"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <SendIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        Submit Ticket
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Tickets Tab */}
          <TabsContent value="tickets">
            <Card className="dark:bg-gray-900 dark:border-gray-700">
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="text-base sm:text-lg dark:text-white">My Support Tickets</CardTitle>
                <CardDescription className="text-xs sm:text-sm">View and track your support requests</CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
                {tickets.length > 0 ? (
                  <div className="space-y-2 sm:space-y-3">
                    {tickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-2 sm:p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors dark:border-gray-700"
                      >
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1">
                            <span className="text-[10px] sm:text-xs font-mono text-gray-500 dark:text-gray-400">
                              #{ticket.ticket_number}
                            </span>
                            <Badge className={cn("text-[8px] sm:text-xs px-1 py-0 sm:px-2 sm:py-1", getStatusColor(ticket.status))}>
                              {ticket.status.replace('_', ' ')}
                            </Badge>
                            <Badge className={cn("text-[8px] sm:text-xs px-1 py-0 sm:px-2 sm:py-1", getPriorityColor(ticket.priority))}>
                              {ticket.priority}
                            </Badge>
                          </div>
                          <h4 className="font-medium text-xs sm:text-sm dark:text-white line-clamp-1">{ticket.subject}</h4>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1 text-[9px] sm:text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <ClockIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                              {new Date(ticket.created_at).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <HistoryIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                              {new Date(ticket.last_update).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 sm:mt-0 h-7 sm:h-9 text-xs sm:text-sm self-end sm:self-auto"
                          onClick={() => router.visit(`/portal/support/tickets/${ticket.id}`)}
                        >
                          View
                          <ChevronRightIcon className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8">
                    <TicketIcon className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-gray-300 dark:text-gray-600 mb-2 sm:mb-3" />
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">No support tickets yet</p>
                    <Button 
                      variant="link" 
                      onClick={() => setActiveTab('contact')}
                      className="mt-1 sm:mt-2 text-xs sm:text-sm"
                    >
                      Submit your first ticket
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Knowledge Base Links */}
        <div className="px-4 sm:px-0">
          <h2 className="text-sm sm:text-lg font-semibold mb-2 sm:mb-3 dark:text-white">Helpful Resources</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
            <Card className="dark:bg-gray-900 dark:border-gray-700 hover:shadow-md transition-shadow">
              <CardContent className="p-2 sm:p-4">
                <Link href="/portal/guides" className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <BookOpenIcon className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-xs sm:text-sm dark:text-white truncate">User Guides</h3>
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">
                      Step-by-step guides
                    </p>
                  </div>
                  <ExternalLinkIcon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                </Link>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-900 dark:border-gray-700 hover:shadow-md transition-shadow">
              <CardContent className="p-2 sm:p-4">
                <Link href="/portal/video-tutorials" className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <VideoIcon className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-xs sm:text-sm dark:text-white truncate">Video Tutorials</h3>
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">
                      Watch tutorials
                    </p>
                  </div>
                  <ExternalLinkIcon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                </Link>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-900 dark:border-gray-700 hover:shadow-md transition-shadow">
              <CardContent className="p-2 sm:p-4">
                <Link href="/portal/announcements" className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <MegaphoneIcon className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-xs sm:text-sm dark:text-white truncate">Announcements</h3>
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">
                      System updates
                    </p>
                  </div>
                  <ExternalLinkIcon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ResidentLayout>
  );
}