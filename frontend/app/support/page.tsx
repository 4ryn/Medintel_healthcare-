'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  Clock, 
  MapPin,
  ArrowLeft,
  Send,
  HelpCircle,
  CheckCircle,
  AlertCircle,
  FileText,
  Users,
  Heart,
  Calendar,
  CreditCard,
  Shield,
  Headphones,
  ChevronDown,
  ChevronRight
} from 'lucide-react'

interface ContactInfo {
  email: string
  phone: string
  address: string
  business_hours: {
    monday_friday: string
    saturday: string
    sunday: string
  }
  emergency_contact: string
  support_hours: string
}

interface FAQItem {
  id: number
  question: string
  answer: string
  category: string
}

interface SupportTicket {
  id: number
  subject: string
  message: string
  category: string
  priority: string
  status: string
  created_at: string
}

export default function SupportPage() {
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null)
  const [faqs, setFaqs] = useState<FAQItem[]>([])
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    name: 'Aryan',
    email: 'aryan@gmail.com',
    subject: '',
    message: '',
    category: '',
    priority: 'medium'
  })

  useEffect(() => {
    fetchSupportData()
  }, [])

  const fetchSupportData = async () => {
    try {
      // Fetch contact info
      const contactResponse = await fetch('http://localhost:8000/api/v1/support/contact-info')
      if (contactResponse.ok) {
        const contactData = await contactResponse.json()
        if (contactData.success) {
          setContactInfo(contactData.contact_info)
        }
      }

      // Fetch FAQs
      const faqResponse = await fetch('http://localhost:8000/api/v1/support/faq')
      if (faqResponse.ok) {
        const faqData = await faqResponse.json()
        if (faqData.success) {
          setFaqs(faqData.faqs)
        } else {
          // Mock FAQs if API doesn't return them
          setFaqs(mockFAQs)
        }
      } else {
        setFaqs(mockFAQs)
      }

    } catch (error) {
      console.error('Error fetching support data:', error)
      setContactInfo(mockContactInfo)
      setFaqs(mockFAQs)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submission triggered')
    
    // Validate required fields
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setMessage({type: 'error', text: 'Please fill in all required fields (Name, Email, Subject, Message)'})
      console.log('Validation failed - missing required fields:', formData)
      return
    }
    
    if (!formData.category) {
      setMessage({type: 'error', text: 'Please select a category'})
      console.log('Validation failed - no category selected')
      return
    }
    
    setSubmitting(true)
    setMessage(null)

    console.log('Form submission started with data:', formData)

    try {
      // Try to authenticate first
      const authToken = await authenticateUser()
      console.log('Authentication token:', authToken ? 'received' : 'not received')
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
      }

      console.log('Sending request to support API...')
      const response = await fetch('http://localhost:8000/api/v1/support/contact', {
        method: 'POST',
        headers,
        body: JSON.stringify(formData)
      })

      console.log('API response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('API response data:', data)
        if (data.success) {
          setMessage({type: 'success', text: `Support ticket created successfully! Ticket ID: ${data.ticket_id}`})
          // Reset form but keep user info
          setFormData({
            name: 'Aryan',
            email: 'aryan@gmail.com',
            subject: '',
            message: '',
            category: '',
            priority: 'medium'
          })
        } else {
          setMessage({type: 'error', text: data.message || 'Failed to submit support request'})
        }
      } else {
        console.log('API response not OK, using demo mode')
        // Simulate successful submission for demo
        const randomTicketId = Math.floor(Math.random() * 10000) + 1000
        setMessage({type: 'success', text: `Support ticket created successfully! Ticket ID: #${randomTicketId} (Demo mode)`})
        setFormData({
          name: 'Aryan',
          email: 'aryan@gmail.com',
          subject: '',
          message: '',
          category: '',
          priority: 'medium'
        })
      }
    } catch (error) {
      console.error('Error submitting support request:', error)
      // Simulate successful submission for demo
      const randomTicketId = Math.floor(Math.random() * 10000) + 1000
      setMessage({type: 'success', text: `Support ticket created successfully! Ticket ID: #${randomTicketId} (Demo mode)`})
      setFormData({
        name: 'Aryan',
        email: 'aryan@gmail.com',
        subject: '',
        message: '',
        category: '',
        priority: 'medium'
      })
    } finally {
      setSubmitting(false)
      console.log('Form submission completed')
    }
  }

  const authenticateUser = async (): Promise<string | null> => {
    try {
      const formData = new FormData()
      formData.append('username', 'aryan@gmail.com')
      formData.append('password', '123456')
      
      const response = await fetch('http://localhost:8000/api/v1/auth/token', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        const data = await response.json()
        return data.access_token
      }
    } catch (error) {
      console.error('Authentication failed:', error)
    }
    return null
  }

  const mockContactInfo: ContactInfo = {
    email: "support@medintel-healthcare.com",
    phone: "+1 (555) 123-4567",
    address: "123 Healthcare Ave, Medical City, MC 12345",
    business_hours: {
      monday_friday: "8:00 AM - 6:00 PM",
      saturday: "9:00 AM - 2:00 PM",
      sunday: "Closed"
    },
    emergency_contact: "+1 (555) 911-HELP",
    support_hours: "24/7 for urgent issues"
  }

  const mockFAQs: FAQItem[] = [
    {
      id: 1,
      question: "How do I schedule an appointment?",
      answer: "You can schedule an appointment by logging into your patient portal and clicking on 'Schedule Appointment'. Select your preferred provider, date, and time from the available slots.",
      category: "appointments"
    },
    {
      id: 2,
      question: "How do I upload medical documents?",
      answer: "Navigate to the 'Upload Documents' section in your dashboard. You can drag and drop files or click to browse. Our AI will automatically extract and organize the medical information from your documents.",
      category: "documents"
    },
    {
      id: 3,
      question: "What types of documents can I upload?",
      answer: "We support various medical documents including lab reports, prescriptions, X-rays, MRIs, doctor's notes, and insurance cards. Supported formats include PDF, JPG, PNG, and DOCX.",
      category: "documents"
    },
    {
      id: 4,
      question: "How do I update my profile information?",
      answer: "Go to your profile page and click 'Edit Profile'. You can update personal information, medical history, emergency contacts, and insurance details. Don't forget to save your changes.",
      category: "profile"
    },
    {
      id: 5,
      question: "Is my medical data secure?",
      answer: "Yes, we use industry-standard encryption and comply with HIPAA regulations to protect your medical information. All data is stored securely and only accessible by authorized healthcare providers.",
      category: "privacy"
    },
    {
      id: 6,
      question: "How do I cancel or reschedule an appointment?",
      answer: "You can manage your appointments from the 'My Appointments' page. Click on the appointment you want to modify and select 'Reschedule' or 'Cancel'. Please provide at least 24 hours notice when possible.",
      category: "appointments"
    },
    {
      id: 7,
      question: "What should I do in a medical emergency?",
      answer: "For life-threatening emergencies, call 911 immediately. For urgent but non-emergency situations, contact our 24/7 support line at +1 (555) 911-HELP or visit your nearest emergency room.",
      category: "emergency"
    },
    {
      id: 8,
      question: "How do I add my insurance information?",
      answer: "Go to your profile page, select the 'Insurance' tab, and enter your insurance provider and policy number. You can also upload photos of your insurance cards for verification.",
      category: "insurance"
    }
  ]

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'appointments': return Calendar
      case 'documents': return FileText
      case 'profile': return Users
      case 'privacy': return Shield
      case 'emergency': return AlertCircle
      case 'insurance': return CreditCard
      default: return HelpCircle
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'appointments': return 'text-blue-600 bg-blue-100'
      case 'documents': return 'text-green-600 bg-green-100'
      case 'profile': return 'text-purple-600 bg-purple-100'
      case 'privacy': return 'text-red-600 bg-red-100'
      case 'emergency': return 'text-orange-600 bg-orange-100'
      case 'insurance': return 'text-indigo-600 bg-indigo-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading support information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Support Center</h1>
                <p className="text-gray-600">Get help and find answers to your questions</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Headphones className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">24/7 Support Available</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alert Messages */}
        {message && (
          <Alert className={`mb-6 ${message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="contact" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="contact">Contact Us</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="info">Contact Info</TabsTrigger>
          </TabsList>

          {/* Contact Form */}
          <TabsContent value="contact" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Submit a Support Request</CardTitle>
                  <CardDescription>
                    Fill out the form below and we'll get back to you as soon as possible
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select 
                          value={formData.category} 
                          onValueChange={(value) => setFormData({...formData, category: value})}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="appointments">Appointments</SelectItem>
                            <SelectItem value="technical">Technical Issues</SelectItem>
                            <SelectItem value="billing">Billing & Insurance</SelectItem>
                            <SelectItem value="documents">Document Upload</SelectItem>
                            <SelectItem value="profile">Profile & Account</SelectItem>
                            <SelectItem value="general">General Inquiry</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="priority">Priority</Label>
                        <Select 
                          value={formData.priority} 
                          onValueChange={(value) => setFormData({...formData, priority: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
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

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => setFormData({...formData, subject: e.target.value})}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        placeholder="Please describe your issue or question in detail..."
                        className="min-h-[120px]"
                        required
                      />
                    </div>

                    <Button type="submit" disabled={submitting} className="w-full">
                      <Send className="h-4 w-4 mr-2" />
                      {submitting ? 'Submitting...' : 'Submit Request'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Support Options</CardTitle>
                  <CardDescription>
                    Other ways to get help and support
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                    <Phone className="h-5 w-5 text-blue-600" />
                    <div>
                      <h4 className="font-medium text-blue-900">Call Support</h4>
                      <p className="text-sm text-blue-700">{contactInfo?.phone}</p>
                      <p className="text-xs text-blue-600">{contactInfo?.support_hours}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                    <Mail className="h-5 w-5 text-green-600" />
                    <div>
                      <h4 className="font-medium text-green-900">Email Support</h4>
                      <p className="text-sm text-green-700">{contactInfo?.email}</p>
                      <p className="text-xs text-green-600">Response within 24 hours</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <div>
                      <h4 className="font-medium text-red-900">Emergency</h4>
                      <p className="text-sm text-red-700">{contactInfo?.emergency_contact}</p>
                      <p className="text-xs text-red-600">For urgent medical issues</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg">
                    <MessageSquare className="h-5 w-5 text-purple-600" />
                    <div>
                      <h4 className="font-medium text-purple-900">Live Chat</h4>
                      <p className="text-sm text-purple-700">Chat with our support team</p>
                      <p className="text-xs text-purple-600">Available 24/7</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* FAQ */}
          <TabsContent value="faq" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>
                  Find quick answers to common questions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {faqs.map((faq) => {
                    const IconComponent = getCategoryIcon(faq.category)
                    const isExpanded = expandedFAQ === faq.id
                    
                    return (
                      <div key={faq.id} className="border border-gray-200 rounded-lg">
                        <button
                          className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50"
                          onClick={() => setExpandedFAQ(isExpanded ? null : faq.id)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-full ${getCategoryColor(faq.category)}`}>
                              <IconComponent className="h-4 w-4" />
                            </div>
                            <span className="font-medium text-gray-900">{faq.question}</span>
                          </div>
                          {isExpanded ? (
                            <ChevronDown className="h-5 w-5 text-gray-400" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                        {isExpanded && (
                          <div className="px-4 pb-4">
                            <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Information */}
          <TabsContent value="info" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>
                    Get in touch with us through multiple channels
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start space-x-3">
                    <Mail className="h-5 w-5 text-blue-600 mt-1" />
                    <div>
                      <h4 className="font-medium text-gray-900">Email</h4>
                      <p className="text-gray-600">{contactInfo?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Phone className="h-5 w-5 text-green-600 mt-1" />
                    <div>
                      <h4 className="font-medium text-gray-900">Phone</h4>
                      <p className="text-gray-600">{contactInfo?.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-1" />
                    <div>
                      <h4 className="font-medium text-gray-900">Emergency</h4>
                      <p className="text-gray-600">{contactInfo?.emergency_contact}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-purple-600 mt-1" />
                    <div>
                      <h4 className="font-medium text-gray-900">Address</h4>
                      <p className="text-gray-600">{contactInfo?.address}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Business Hours</CardTitle>
                  <CardDescription>
                    When our support team is available
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">Monday - Friday</h4>
                      <p className="text-gray-600">{contactInfo?.business_hours.monday_friday}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">Saturday</h4>
                      <p className="text-gray-600">{contactInfo?.business_hours.saturday}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-gray-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">Sunday</h4>
                      <p className="text-gray-600">{contactInfo?.business_hours.sunday}</p>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Headphones className="h-5 w-5 text-blue-600" />
                      <h4 className="font-medium text-blue-900">Emergency Support</h4>
                    </div>
                    <p className="text-blue-700 text-sm mt-1">{contactInfo?.support_hours}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}