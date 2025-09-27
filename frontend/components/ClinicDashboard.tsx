"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Users, 
  Calendar, 
  AlertTriangle, 
  TrendingUp, 
  Activity,
  Clock,
  FileText,
  Phone,
  Video,
  Search,
  Filter,
  MoreVertical,
  Bell,
  Heart,
  Pill
} from 'lucide-react'
import { format } from 'date-fns'

interface Patient {
  id: number
  name: string
  age: number
  gender: string
  last_visit: string
  risk_level: 'low' | 'medium' | 'high'
  chronic_conditions: string[]
  upcoming_appointment?: string
  recent_vitals: {
    type: string
    value: string
    status: 'normal' | 'warning' | 'critical'
  }[]
}

interface Appointment {
  id: number
  patient_name: string
  patient_id: number
  date: string
  time: string
  type: string
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled'
  duration: number
  is_telehealth: boolean
}

interface Alert {
  id: number
  patient_name: string
  patient_id: number
  type: 'vital_alert' | 'medication_reminder' | 'appointment_reminder' | 'lab_result'
  message: string
  priority: 'low' | 'medium' | 'high'
  timestamp: string
  status: 'unread' | 'read'
}

interface ClinicStats {
  total_patients: number
  appointments_today: number
  critical_alerts: number
  patients_high_risk: number
  medication_adherence: number
  telehealth_sessions: number
}

export default function ClinicDashboard() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [stats, setStats] = useState<ClinicStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string>('all')

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Mock data for demonstration
      setStats({
        total_patients: 1247,
        appointments_today: 24,
        critical_alerts: 3,
        patients_high_risk: 87,
        medication_adherence: 92,
        telehealth_sessions: 156
      })

      setPatients([
        {
          id: 1,
          name: "Sarah Johnson",
          age: 65,
          gender: "Female",
          last_visit: "2025-09-10",
          risk_level: "high",
          chronic_conditions: ["Diabetes", "Hypertension"],
          upcoming_appointment: "2025-09-15T10:00:00",
          recent_vitals: [
            { type: "Blood Pressure", value: "145/90", status: "warning" },
            { type: "Blood Glucose", value: "180 mg/dL", status: "critical" }
          ]
        },
        {
          id: 2,
          name: "Michael Chen",
          age: 45,
          gender: "Male",
          last_visit: "2025-09-12",
          risk_level: "medium",
          chronic_conditions: ["Hypertension"],
          upcoming_appointment: "2025-09-16T14:00:00",
          recent_vitals: [
            { type: "Blood Pressure", value: "135/85", status: "warning" },
            { type: "Heart Rate", value: "72 bpm", status: "normal" }
          ]
        },
        {
          id: 3,
          name: "Emily Rodriguez",
          age: 32,
          gender: "Female",
          last_visit: "2025-09-13",
          risk_level: "low",
          chronic_conditions: [],
          upcoming_appointment: "2025-09-18T09:00:00",
          recent_vitals: [
            { type: "Blood Pressure", value: "118/75", status: "normal" },
            { type: "Weight", value: "145 lbs", status: "normal" }
          ]
        }
      ])

      setAppointments([
        {
          id: 1,
          patient_name: "Sarah Johnson",
          patient_id: 1,
          date: "2025-09-15",
          time: "10:00",
          type: "Follow-up",
          status: "confirmed",
          duration: 30,
          is_telehealth: false
        },
        {
          id: 2,
          patient_name: "Michael Chen",
          patient_id: 2,
          date: "2025-09-15",
          time: "11:00",
          type: "Consultation",
          status: "scheduled",
          duration: 45,
          is_telehealth: true
        },
        {
          id: 3,
          patient_name: "Emily Rodriguez",
          patient_id: 3,
          date: "2025-09-15",
          time: "14:00",
          type: "Check-up",
          status: "confirmed",
          duration: 30,
          is_telehealth: false
        }
      ])

      setAlerts([
        {
          id: 1,
          patient_name: "Sarah Johnson",
          patient_id: 1,
          type: "vital_alert",
          message: "Blood glucose reading of 180 mg/dL is critically high",
          priority: "high",
          timestamp: "2025-09-14T15:30:00",
          status: "unread"
        },
        {
          id: 2,
          patient_name: "Michael Chen",
          patient_id: 2,
          type: "medication_reminder",
          message: "Patient missed Lisinopril dose for 2 consecutive days",
          priority: "medium",
          timestamp: "2025-09-14T09:00:00",
          status: "unread"
        },
        {
          id: 3,
          patient_name: "Emily Rodriguez",
          patient_id: 3,
          type: "appointment_reminder",
          message: "Appointment confirmation needed for tomorrow",
          priority: "low",
          timestamp: "2025-09-14T12:00:00",
          status: "read"
        }
      ])

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getVitalStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'text-green-600'
      case 'warning': return 'text-yellow-600'
      case 'critical': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'medium': return <Clock className="h-4 w-4 text-yellow-500" />
      default: return <Bell className="h-4 w-4 text-blue-500" />
    }
  }

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.chronic_conditions.some(condition => 
                           condition.toLowerCase().includes(searchTerm.toLowerCase())
                         )
    const matchesRisk = selectedRiskFilter === 'all' || patient.risk_level === selectedRiskFilter
    return matchesSearch && matchesRisk
  })

  const unreadAlerts = alerts.filter(alert => alert.status === 'unread')
  const todayAppointments = appointments.filter(apt => apt.date === format(new Date(), 'yyyy-MM-dd'))

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Clinic Dashboard</h1>
            <p className="text-gray-600">Healthcare provider overview and patient management</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Schedule
            </Button>
            <Button>
              <Users className="mr-2 h-4 w-4" />
              Add Patient
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total_patients}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.appointments_today}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats?.critical_alerts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Risk Patients</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.patients_high_risk}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Medication Adherence</CardTitle>
              <Pill className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.medication_adherence}%</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Telehealth Sessions</CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.telehealth_sessions}</div>
            </CardContent>
          </Card>
        </div>

        {/* Critical Alerts */}
        {unreadAlerts.length > 0 && (
          <div className="space-y-2">
            {unreadAlerts.slice(0, 3).map((alert) => (
              <Alert key={alert.id} className={`border-l-4 ${
                alert.priority === 'high' ? 'border-red-500 bg-red-50' : 
                alert.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' : 
                'border-blue-500 bg-blue-50'
              }`}>
                {getPriorityIcon(alert.priority)}
                <AlertTitle className="capitalize">{alert.type.replace('_', ' ')} - {alert.patient_name}</AlertTitle>
                <AlertDescription>{alert.message}</AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Main Content */}
        <Tabs defaultValue="patients" className="space-y-4">
          <TabsList>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="alerts">Alerts ({unreadAlerts.length})</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="patients" className="space-y-6">
            {/* Patient Search and Filters */}
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search patients by name or condition..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={selectedRiskFilter}
                onChange={(e) => setSelectedRiskFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Risk Levels</option>
                <option value="high">High Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="low">Low Risk</option>
              </select>
            </div>

            {/* Patient List */}
            <div className="grid gap-4">
              {filteredPatients.map((patient) => (
                <Card key={patient.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarFallback>
                            {patient.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-lg">{patient.name}</h3>
                          <p className="text-gray-600">{patient.age} years old • {patient.gender}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={getRiskBadgeColor(patient.risk_level)}>
                              {patient.risk_level} risk
                            </Badge>
                            {patient.chronic_conditions.map((condition) => (
                              <Badge key={condition} variant="outline" className="text-xs">
                                {condition}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Last Visit</p>
                          <p className="font-medium">
                            {format(new Date(patient.last_visit), 'MMM d, yyyy')}
                          </p>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Recent Vitals</p>
                          <div className="space-y-1">
                            {patient.recent_vitals.slice(0, 2).map((vital, index) => (
                              <div key={index} className="text-sm">
                                <span className={getVitalStatusColor(vital.status)}>
                                  {vital.type}: {vital.value}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex flex-col space-y-2">
                          <Button size="sm" variant="outline">
                            <FileText className="mr-2 h-4 w-4" />
                            View Chart
                          </Button>
                          {patient.upcoming_appointment && (
                            <Button size="sm">
                              <Video className="mr-2 h-4 w-4" />
                              Join Call
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Today's Schedule</CardTitle>
                <CardDescription>
                  {todayAppointments.length} appointments scheduled for {format(new Date(), 'MMMM d, yyyy')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {todayAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <div>
                          <p className="font-medium">{appointment.patient_name}</p>
                          <p className="text-sm text-gray-600">
                            {appointment.time} • {appointment.type} ({appointment.duration} min)
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline">{appointment.status}</Badge>
                        {appointment.is_telehealth && (
                          <Badge className="bg-blue-100 text-blue-800">Telehealth</Badge>
                        )}
                        <Button size="sm" variant="outline">
                          {appointment.is_telehealth ? <Video className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Patient Alerts & Notifications</CardTitle>
                <CardDescription>Critical health alerts and system notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div key={alert.id} className={`flex items-start space-x-4 p-4 border rounded-lg ${
                      alert.status === 'unread' ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                    }`}>
                      {getPriorityIcon(alert.priority)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{alert.patient_name}</p>
                          <p className="text-sm text-gray-500">
                            {format(new Date(alert.timestamp), 'MMM d, h:mm a')}
                          </p>
                        </div>
                        <p className="text-gray-700 mt-1">{alert.message}</p>
                        <Badge className={`mt-2 ${
                          alert.priority === 'high' ? 'bg-red-100 text-red-800' :
                          alert.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {alert.priority} priority
                        </Badge>
                      </div>
                      {alert.status === 'unread' && (
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5" />
                    Patient Risk Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>High Risk</span>
                      <span className="font-semibold text-red-600">
                        {patients.filter(p => p.risk_level === 'high').length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Medium Risk</span>
                      <span className="font-semibold text-yellow-600">
                        {patients.filter(p => p.risk_level === 'medium').length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Low Risk</span>
                      <span className="font-semibold text-green-600">
                        {patients.filter(p => p.risk_level === 'low').length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="mr-2 h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm">• 15 vitals recorded today</p>
                    <p className="text-sm">• 3 new patient registrations</p>
                    <p className="text-sm">• 8 prescription refills</p>
                    <p className="text-sm">• 12 appointment confirmations</p>
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