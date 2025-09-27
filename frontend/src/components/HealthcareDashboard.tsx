'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Activity, 
  Heart, 
  Calendar, 
  FileText, 
  MessageSquare, 
  Video, 
  Bell, 
  Brain,
  Users,
  Pill,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  Zap,
  Shield,
  Plus,
  BarChart3,
  PieChart,
  LineChart,
  Target,
  Award,
  Smartphone,
  Wifi,
  Settings,
  HelpCircle,
  ExternalLink,
  Download,
  Share2
} from 'lucide-react'
import WorkingPatientDashboard from './WorkingPatientDashboard'
import WorkingClinicianDashboard from './WorkingClinicianDashboard'
import CommunicationCenter from './CommunicationCenter'
import NotificationCenter from './NotificationCenter'
import DocumentAnalysisCenter from './DocumentAnalysisCenter'

interface QuickAction {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  color: string
  action: () => void
  urgent?: boolean
}

interface HealthMetric {
  id: string
  name: string
  value: string
  unit: string
  trend: 'up' | 'down' | 'stable'
  status: 'normal' | 'warning' | 'critical'
  lastUpdate: string
  target?: string
}

interface RecentActivity {
  id: string
  type: 'vitals' | 'appointment' | 'medication' | 'document' | 'message'
  title: string
  description: string
  timestamp: string
  status: 'completed' | 'pending' | 'cancelled'
}

export default function HealthcareDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [userRole, setUserRole] = useState<'patient' | 'clinician'>('patient')
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([])
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      // Load dashboard data
      setHealthMetrics(mockHealthMetrics)
      setRecentActivities(mockRecentActivities)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const quickActions: QuickAction[] = [
    {
      id: 'record_vitals',
      title: 'Record Vitals',
      description: 'Log your daily health measurements',
      icon: <Heart className="h-6 w-6" />,
      color: 'bg-red-100 text-red-700 hover:bg-red-200',
      action: () => setActiveTab('patient-dashboard')
    },
    {
      id: 'book_appointment',
      title: 'Book Appointment',
      description: 'Schedule with your healthcare provider',
      icon: <Calendar className="h-6 w-6" />,
      color: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
      action: () => setActiveTab('patient-dashboard')
    },
    {
      id: 'upload_document',
      title: 'Upload Document',
      description: 'Share medical reports with your doctor',
      icon: <FileText className="h-6 w-6" />,
      color: 'bg-green-100 text-green-700 hover:bg-green-200',
      action: () => setActiveTab('patient-dashboard')
    },
    {
      id: 'start_video_call',
      title: 'Video Consultation',
      description: 'Connect with your healthcare team',
      icon: <Video className="h-6 w-6" />,
      color: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
      action: () => setActiveTab('communication'),
      urgent: true
    },
    {
      id: 'chat_support',
      title: 'Chat Support',
      description: 'Get instant help and support',
      icon: <MessageSquare className="h-6 w-6" />,
      color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
      action: () => setActiveTab('communication')
    },
    {
      id: 'ai_insights',
      title: 'AI Health Insights',
      description: 'View personalized health recommendations',
      icon: <Brain className="h-6 w-6" />,
      color: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200',
      action: () => setActiveTab('ai-analysis')
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'text-green-600 bg-green-100'
      case 'warning': return 'text-yellow-600 bg-yellow-100'
      case 'critical': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />
      case 'stable': return <Activity className="h-4 w-4 text-blue-600" />
      default: return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'vitals': return <Heart className="h-4 w-4 text-red-600" />
      case 'appointment': return <Calendar className="h-4 w-4 text-blue-600" />
      case 'medication': return <Pill className="h-4 w-4 text-green-600" />
      case 'document': return <FileText className="h-4 w-4 text-purple-600" />
      case 'message': return <MessageSquare className="h-4 w-4 text-yellow-600" />
      default: return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading your health dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">MedIntel Healthcare</h1>
              <p className="text-gray-600">Comprehensive health management platform</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Online</span>
              </div>
              <Button
                variant={userRole === 'patient' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setUserRole('patient')}
              >
                Patient View
              </Button>
              <Button
                variant={userRole === 'clinician' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setUserRole('clinician')}
              >
                Clinician View
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-6 lg:grid-cols-6">
            <TabsTrigger value="overview">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value={userRole === 'patient' ? 'patient-dashboard' : 'clinician-dashboard'}>
              <Activity className="h-4 w-4 mr-2" />
              {userRole === 'patient' ? 'My Health' : 'Patients'}
            </TabsTrigger>
            <TabsTrigger value="communication">
              <Video className="h-4 w-4 mr-2" />
              Communication
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="ai-analysis">
              <Brain className="h-4 w-4 mr-2" />
              AI Analysis
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-blue-600" />
                  Quick Actions
                </CardTitle>
                <CardDescription>
                  Fast access to commonly used features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {quickActions.map((action) => (
                    <Button
                      key={action.id}
                      variant="outline"
                      className={`h-auto p-4 justify-start ${action.color} relative`}
                      onClick={action.action}
                    >
                      {action.urgent && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      )}
                      <div className="flex items-center space-x-3">
                        {action.icon}
                        <div className="text-left">
                          <div className="font-medium">{action.title}</div>
                          <div className="text-xs opacity-80">{action.description}</div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Health Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {healthMetrics.map((metric) => (
                <Card key={metric.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center justify-between">
                      {metric.name}
                      <Badge className={getStatusColor(metric.status)} variant="outline">
                        {metric.status}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-2xl font-bold">
                        {metric.value}
                        <span className="text-sm font-normal text-gray-500 ml-1">
                          {metric.unit}
                        </span>
                      </div>
                      {getTrendIcon(metric.trend)}
                    </div>
                    {metric.target && (
                      <div className="text-xs text-gray-500 mb-2">
                        Target: {metric.target}
                      </div>
                    )}
                    <div className="text-xs text-gray-400">
                      Last updated: {new Date(metric.lastUpdate).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-blue-600" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivities.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0 p-2 bg-white rounded-full">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900">{activity.title}</h4>
                          <p className="text-sm text-gray-600">{activity.description}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-400">
                              {new Date(activity.timestamp).toLocaleString()}
                            </span>
                            <Badge
                              variant={activity.status === 'completed' ? 'default' : 'outline'}
                              className="text-xs"
                            >
                              {activity.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Health Score */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2 text-green-600" />
                    Health Score
                  </CardTitle>
                  <CardDescription>
                    Overall health assessment based on your data
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">85</div>
                    <p className="text-gray-600">Excellent Health</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Vitals</span>
                        <span>92%</span>
                      </div>
                      <Progress value={92} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Medication Adherence</span>
                        <span>88%</span>
                      </div>
                      <Progress value={88} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Preventive Care</span>
                        <span>76%</span>
                      </div>
                      <Progress value={76} className="h-2" />
                    </div>
                  </div>

                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Award className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Health Goals</span>
                    </div>
                    <p className="text-xs text-green-700">
                      You're on track to meet 4 out of 5 health goals this month!
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* System Status */}
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>
                  All systems operational. Your health data is secure and synchronized across all devices.
                </span>
                <div className="flex items-center space-x-2">
                  <Wifi className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">Connected</span>
                </div>
              </AlertDescription>
            </Alert>
          </TabsContent>

          {/* Patient Dashboard */}
          <TabsContent value="patient-dashboard">
            <WorkingPatientDashboard />
          </TabsContent>

          {/* Clinician Dashboard */}
          <TabsContent value="clinician-dashboard">
            <WorkingClinicianDashboard />
          </TabsContent>

          {/* Communication Center */}
          <TabsContent value="communication">
            <CommunicationCenter />
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications">
            <NotificationCenter />
          </TabsContent>

          {/* AI Analysis */}
          <TabsContent value="ai-analysis">
            <DocumentAnalysisCenter />
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Manage your account preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Profile Information</h4>
                    <p className="text-sm text-gray-600">Update your personal details and contact information</p>
                    <Button variant="outline" size="sm">
                      <Users className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Privacy & Security</h4>
                    <p className="text-sm text-gray-600">Control who can access your health information</p>
                    <Button variant="outline" size="sm">
                      <Shield className="h-4 w-4 mr-2" />
                      Privacy Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Data & Sync</CardTitle>
                  <CardDescription>Manage your health data synchronization</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Device Sync</h4>
                    <p className="text-sm text-gray-600">Sync health data from wearables and smart devices</p>
                    <Button variant="outline" size="sm">
                      <Smartphone className="h-4 w-4 mr-2" />
                      Manage Devices
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Data Export</h4>
                    <p className="text-sm text-gray-600">Export your health data for personal records</p>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export Data
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Support & Help</CardTitle>
                  <CardDescription>Get assistance and learn more about the platform</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Help Center
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contact Support
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    User Guide
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                  <CardDescription>Platform information and updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm"><strong>Version:</strong> 2.1.0</p>
                    <p className="text-sm"><strong>Last Updated:</strong> January 14, 2025</p>
                    <p className="text-sm"><strong>Status:</strong> All features operational</p>
                  </div>
                  <Button variant="outline" size="sm" className="mt-4">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Feedback
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// Mock data
const mockHealthMetrics: HealthMetric[] = [
  {
    id: '1',
    name: 'Blood Pressure',
    value: '125/80',
    unit: 'mmHg',
    trend: 'stable',
    status: 'normal',
    lastUpdate: '2025-01-14T08:00:00Z',
    target: '<130/85'
  },
  {
    id: '2',
    name: 'Heart Rate',
    value: '72',
    unit: 'bpm',
    trend: 'up',
    status: 'normal',
    lastUpdate: '2025-01-14T08:00:00Z',
    target: '60-100'
  },
  {
    id: '3',
    name: 'Blood Sugar',
    value: '98',
    unit: 'mg/dL',
    trend: 'down',
    status: 'normal',
    lastUpdate: '2025-01-13T20:00:00Z',
    target: '<100'
  },
  {
    id: '4',
    name: 'Weight',
    value: '165',
    unit: 'lbs',
    trend: 'stable',
    status: 'normal',
    lastUpdate: '2025-01-14T07:00:00Z',
    target: '160-170'
  }
]

const mockRecentActivities: RecentActivity[] = [
  {
    id: '1',
    type: 'vitals',
    title: 'Blood Pressure Recorded',
    description: '125/80 mmHg - Normal range',
    timestamp: '2025-01-14T08:00:00Z',
    status: 'completed'
  },
  {
    id: '2',
    type: 'appointment',
    title: 'Cardiology Appointment',
    description: 'Scheduled with Dr. Smith for Jan 16',
    timestamp: '2025-01-13T15:30:00Z',
    status: 'pending'
  },
  {
    id: '3',
    type: 'medication',
    title: 'Medication Taken',
    description: 'Lisinopril 10mg - Morning dose',
    timestamp: '2025-01-14T07:30:00Z',
    status: 'completed'
  },
  {
    id: '4',
    type: 'document',
    title: 'Lab Results Uploaded',
    description: 'Blood work from January 10th',
    timestamp: '2025-01-13T14:00:00Z',
    status: 'completed'
  },
  {
    id: '5',
    type: 'message',
    title: 'Message from Dr. Johnson',
    description: 'Please schedule follow-up appointment',
    timestamp: '2025-01-12T11:20:00Z',
    status: 'pending'
  }
]