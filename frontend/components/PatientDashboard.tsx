"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { 
  Heart, 
  Activity, 
  Calendar, 
  FileText, 
  Pill, 
  Target,
  AlertTriangle,
  Clock,
  TrendingUp,
  User,
  Phone,
  Mail,
  MapPin
} from 'lucide-react'
import { format } from 'date-fns'

interface VitalReading {
  id: number
  type: string
  value: number
  unit: string
  recorded_at: string
  status: 'normal' | 'warning' | 'critical'
}

interface Document {
  id: number
  filename: string
  type: string
  uploaded_at: string
  processing_status: string
}

interface Appointment {
  id: number
  date: string
  provider: string
  type: string
  status: string
}

interface CarePlan {
  id: number
  title: string
  progress_percentage: number
  next_milestone: string
  total_goals: number
  completed_goals: number
}

interface HealthAlert {
  type: string
  message: string
  timestamp: string
  priority: 'low' | 'medium' | 'high'
}

interface PatientProfile {
  id: number
  first_name: string
  last_name: string
  date_of_birth: string | null
  gender: string | null
  phone: string | null
  address: string | null
  blood_type: string | null
  allergies: string | null
  chronic_conditions: string | null
}

interface DashboardData {
  profile: PatientProfile
  recent_vitals: VitalReading[]
  recent_documents: Document[]
  upcoming_appointments: Appointment[]
  active_medications: string[]
  health_alerts: HealthAlert[]
  care_plan_progress: CarePlan
}

export default function PatientDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('No authentication token found')
        return
      }

      const response = await fetch('http://127.0.0.1:8000/api/v1/patients/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setDashboardData(data)
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const getVitalStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-green-100 text-green-800'
      case 'warning': return 'bg-yellow-100 text-yellow-800'
      case 'critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getAlertIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'medium': return <Clock className="h-4 w-4 text-yellow-500" />
      default: return <Activity className="h-4 w-4 text-blue-500" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || 'Failed to load dashboard'}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const { profile, recent_vitals, recent_documents, upcoming_appointments, active_medications, health_alerts, care_plan_progress } = dashboardData

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {profile.first_name} {profile.last_name}
            </h1>
            <p className="text-gray-600">Here's your health overview for today</p>
          </div>
          <Button>
            <Calendar className="mr-2 h-4 w-4" />
            Schedule Appointment
          </Button>
        </div>

        {/* Patient Information Card */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800">Patient Information</h2>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Name</p>
              <p className="text-lg font-semibold text-gray-900">{profile.first_name} {profile.last_name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Date of Birth</p>
              <p className="text-lg font-semibold text-gray-900">{profile.date_of_birth || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Gender</p>
              <p className="text-lg font-semibold text-gray-900">{profile.gender || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Health Alerts */}
        {health_alerts.length > 0 && (
          <div className="space-y-2">
            {health_alerts.map((alert, index) => (
              <Alert key={index} className={`border-l-4 ${
                alert.priority === 'high' ? 'border-red-500 bg-red-50' : 
                alert.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' : 
                'border-blue-500 bg-blue-50'
              }`}>
                {getAlertIcon(alert.priority)}
                <AlertTitle className="capitalize">{alert.priority} Priority Alert</AlertTitle>
                <AlertDescription>{alert.message}</AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Vitals</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recent_vitals.length}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcoming_appointments.length}</div>
              <p className="text-xs text-muted-foreground">Next 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Medications</CardTitle>
              <Pill className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{active_medications.length}</div>
              <p className="text-xs text-muted-foreground">Current prescriptions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Care Plan Progress</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{care_plan_progress.progress_percentage}%</div>
              <p className="text-xs text-muted-foreground">Overall progress</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="vitals">Vitals</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="care-plan">Care Plan</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Recent Vitals */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="mr-2 h-5 w-5" />
                    Recent Vital Signs
                  </CardTitle>
                  <CardDescription>Your latest health measurements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recent_vitals.slice(0, 5).map((vital) => (
                      <div key={vital.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{vital.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                          <p className="text-sm text-gray-600">
                            {format(new Date(vital.recorded_at), 'MMM d, h:mm a')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{vital.value} {vital.unit}</p>
                          <Badge className={getVitalStatusColor(vital.status)}>
                            {vital.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Appointments */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5" />
                    Upcoming Appointments
                  </CardTitle>
                  <CardDescription>Your scheduled healthcare visits</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcoming_appointments.map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{appointment.provider}</p>
                          <p className="text-sm text-gray-600">{appointment.type}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            {format(new Date(appointment.date), 'MMM d')}
                          </p>
                          <Badge variant="outline">{appointment.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Care Plan Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="mr-2 h-5 w-5" />
                  Care Plan Progress
                </CardTitle>
                <CardDescription>Your treatment goals and milestones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Overall Progress</span>
                      <span>{care_plan_progress.progress_percentage}%</span>
                    </div>
                    <Progress value={care_plan_progress.progress_percentage} className="mt-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Completed Goals</p>
                      <p className="font-semibold">
                        {care_plan_progress.completed_goals} of {care_plan_progress.total_goals}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Next Milestone</p>
                      <p className="font-semibold">{care_plan_progress.next_milestone}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vitals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Vital Signs History</CardTitle>
                <CardDescription>Track your health measurements over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recent_vitals.map((vital) => (
                    <div key={vital.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <div>
                          <p className="font-medium">
                            {vital.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </p>
                          <p className="text-sm text-gray-600">
                            {format(new Date(vital.recorded_at), 'MMMM d, yyyy \'at\' h:mm a')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold">{vital.value} {vital.unit}</p>
                        <Badge className={getVitalStatusColor(vital.status)}>
                          {vital.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Medical Documents
                </CardTitle>
                <CardDescription>Your uploaded medical records and reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recent_documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <FileText className="h-8 w-8 text-blue-500" />
                        <div>
                          <p className="font-medium">{doc.filename}</p>
                          <p className="text-sm text-gray-600">
                            {format(new Date(doc.uploaded_at), 'MMMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">{doc.type}</Badge>
                        <p className="text-sm text-gray-600 mt-1">{doc.processing_status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="care-plan" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Care Plans</CardTitle>
                <CardDescription>Your current treatment plans and medication schedules</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Treatment Progress</h3>
                    <Progress value={care_plan_progress.progress_percentage} className="mb-2" />
                    <p className="text-sm text-gray-600">
                      {care_plan_progress.completed_goals} of {care_plan_progress.total_goals} goals completed
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Active Medications</h3>
                    <div className="space-y-2">
                      {active_medications.map((medication, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Pill className="h-5 w-5 text-blue-500" />
                            <span className="font-medium">{medication}</span>
                          </div>
                          <Badge variant="outline">Active</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>Your personal details and emergency contacts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Full Name</label>
                      <p className="mt-1 text-lg">{profile.first_name} {profile.last_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Date of Birth</label>
                      <p className="mt-1">
                        {profile.date_of_birth ? format(new Date(profile.date_of_birth), 'MMMM d, yyyy') : 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Gender</label>
                      <p className="mt-1">{profile.gender || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Blood Type</label>
                      <p className="mt-1">{profile.blood_type || 'Not available'}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600 flex items-center">
                        <Phone className="mr-2 h-4 w-4" />
                        Phone
                      </label>
                      <p className="mt-1">{profile.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 flex items-center">
                        <MapPin className="mr-2 h-4 w-4" />
                        Address
                      </label>
                      <p className="mt-1">{profile.address || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Allergies</label>
                      <p className="mt-1">{profile.allergies || 'None reported'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Chronic Conditions</label>
                      <p className="mt-1">{profile.chronic_conditions || 'None reported'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}