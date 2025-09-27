'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { 
  Users, 
  Calendar, 
  Activity, 
  AlertTriangle, 
  TrendingUp, 
  Search, 
  Bell, 
  Heart,
  Thermometer,
  Weight,
  Plus,
  Eye,
  Edit,
  Video,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle,
  Phone
} from 'lucide-react'

interface Patient {
  id: number
  name: string
  age: number
  gender: string
  lastVisit: string
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  conditions: string[]
  nextAppointment?: string
  vitals: {
    bloodPressure: string
    heartRate: number
    temperature: number
    weight: number
  }
}

interface Appointment {
  id: number
  patientName: string
  patientId: number
  time: string
  type: 'consultation' | 'follow-up' | 'emergency' | 'telehealth'
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
  duration: number
}

interface Alert {
  id: number
  patientId: number
  patientName: string
  type: 'critical' | 'warning' | 'info'
  message: string
  timestamp: string
  read: boolean
}

const mockPatients: Patient[] = [
  {
    id: 1,
    name: "John Doe",
    age: 65,
    gender: "Male",
    lastVisit: "2025-09-10",
    riskLevel: "high",
    conditions: ["Diabetes Type 2", "Hypertension"],
    nextAppointment: "2025-09-16 10:00",
    vitals: {
      bloodPressure: "145/95",
      heartRate: 88,
      temperature: 98.6,
      weight: 185
    }
  },
  {
    id: 2,
    name: "Jane Smith",
    age: 45,
    gender: "Female",
    lastVisit: "2025-09-12",
    riskLevel: "medium",
    conditions: ["COPD"],
    nextAppointment: "2025-09-18 14:30",
    vitals: {
      bloodPressure: "130/80",
      heartRate: 72,
      temperature: 98.4,
      weight: 140
    }
  },
  {
    id: 3,
    name: "Robert Johnson",
    age: 58,
    gender: "Male",
    lastVisit: "2025-09-14",
    riskLevel: "critical",
    conditions: ["Heart Disease", "Diabetes Type 2"],
    vitals: {
      bloodPressure: "160/100",
      heartRate: 95,
      temperature: 99.2,
      weight: 220
    }
  }
]

const mockAppointments: Appointment[] = [
  {
    id: 1,
    patientName: "John Doe",
    patientId: 1,
    time: "2025-09-14 09:00",
    type: "consultation",
    status: "scheduled",
    duration: 30
  },
  {
    id: 2,
    patientName: "Jane Smith",
    patientId: 2,
    time: "2025-09-14 10:30",
    type: "follow-up",
    status: "in-progress",
    duration: 20
  },
  {
    id: 3,
    patientName: "Robert Johnson",
    patientId: 3,
    time: "2025-09-14 14:00",
    type: "emergency",
    status: "scheduled",
    duration: 45
  }
]

const mockAlerts: Alert[] = [
  {
    id: 1,
    patientId: 3,
    patientName: "Robert Johnson",
    type: "critical",
    message: "Blood pressure critically high: 160/100 mmHg",
    timestamp: "2025-09-14 08:30",
    read: false
  },
  {
    id: 2,
    patientId: 1,
    patientName: "John Doe",
    type: "warning",
    message: "Missed medication dose - Metformin",
    timestamp: "2025-09-14 07:15",
    read: false
  },
  {
    id: 3,
    patientId: 2,
    patientName: "Jane Smith",
    type: "info",
    message: "Lab results available for review",
    timestamp: "2025-09-13 16:45",
    read: true
  }
]

export default function ClinicianDashboard() {
  const [user, setUser] = useState<any>(null)
  const [patients, setPatients] = useState<Patient[]>(mockPatients)
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments)
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      router.push('/auth/login')
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== 'clinician') {
      router.push('/auth/login')
      return
    }

    setUser(parsedUser)
  }, [router])

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.conditions.some(condition => 
      condition.toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'bg-red-500 text-white'
      case 'high': return 'bg-orange-500 text-white'
      case 'medium': return 'bg-yellow-500 text-white'
      case 'low': return 'bg-green-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500 text-white'
      case 'in-progress': return 'bg-green-500 text-white'
      case 'completed': return 'bg-gray-500 text-white'
      case 'cancelled': return 'bg-red-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'info': return <CheckCircle className="h-4 w-4 text-blue-500" />
      default: return <Bell className="h-4 w-4" />
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/auth/login')
  }

  const unreadAlerts = alerts.filter(alert => !alert.read).length

  if (!user) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clinician Dashboard</h1>
          <p className="text-gray-600">Welcome back, Dr. {user.full_name}</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Bell className="h-6 w-6 text-gray-600" />
            {unreadAlerts > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs">
                {unreadAlerts}
              </Badge>
            )}
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patients.length}</div>
            <p className="text-xs text-muted-foreground">Active under care</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointments.length}</div>
            <p className="text-xs text-muted-foreground">Scheduled for today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {alerts.filter(a => a.type === 'critical').length}
            </div>
            <p className="text-xs text-muted-foreground">Require immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk Patients</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {patients.filter(p => p.riskLevel === 'high' || p.riskLevel === 'critical').length}
            </div>
            <p className="text-xs text-muted-foreground">Need monitoring</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="patients" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="patients">Patients</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="alerts">Alerts ({unreadAlerts})</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Patients Tab */}
        <TabsContent value="patients" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Patient Management</CardTitle>
              <CardDescription>Search and manage your patients</CardDescription>
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search patients by name or condition..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Patient
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>Conditions</TableHead>
                    <TableHead>Last Visit</TableHead>
                    <TableHead>Vitals</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Avatar>
                            <AvatarFallback>
                              {patient.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{patient.name}</div>
                            <div className="text-sm text-gray-500">
                              {patient.age} years, {patient.gender}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRiskBadgeColor(patient.riskLevel)}>
                          {patient.riskLevel.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {patient.conditions.map((condition, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {condition}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{patient.lastVisit}</TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          <div>BP: {patient.vitals.bloodPressure}</div>
                          <div>HR: {patient.vitals.heartRate} bpm</div>
                          <div>Temp: {patient.vitals.temperature}°F</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Video className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appointments Tab */}
        <TabsContent value="appointments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Today's Appointments</CardTitle>
              <CardDescription>Manage your schedule for today</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell className="font-medium">
                        {new Date(appointment.time).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell>{appointment.patientName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {appointment.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{appointment.duration} min</TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {appointment.type === 'telehealth' && (
                            <Button size="sm" variant="outline">
                              <Video className="h-4 w-4 mr-2" />
                              Join Call
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Phone className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Patient Alerts</CardTitle>
              <CardDescription>Monitor critical patient conditions and events</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {alerts.map((alert) => (
                <Alert key={alert.id} className={`${!alert.read ? 'border-l-4 border-l-blue-500' : ''}`}>
                  <div className="flex items-start space-x-3">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{alert.patientName}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(alert.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <AlertDescription className="mt-1">
                        {alert.message}
                      </AlertDescription>
                      {!alert.read && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2"
                          onClick={() => {
                            setAlerts(alerts.map(a => 
                              a.id === alert.id ? { ...a, read: true } : a
                            ))
                          }}
                        >
                          Mark as Read
                        </Button>
                      )}
                    </div>
                  </div>
                </Alert>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Patient Risk Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Critical Risk</span>
                    <span className="text-sm font-medium">
                      {patients.filter(p => p.riskLevel === 'critical').length}
                    </span>
                  </div>
                  <Progress 
                    value={(patients.filter(p => p.riskLevel === 'critical').length / patients.length) * 100} 
                    className="h-2"
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">High Risk</span>
                    <span className="text-sm font-medium">
                      {patients.filter(p => p.riskLevel === 'high').length}
                    </span>
                  </div>
                  <Progress 
                    value={(patients.filter(p => p.riskLevel === 'high').length / patients.length) * 100} 
                    className="h-2"
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Medium Risk</span>
                    <span className="text-sm font-medium">
                      {patients.filter(p => p.riskLevel === 'medium').length}
                    </span>
                  </div>
                  <Progress 
                    value={(patients.filter(p => p.riskLevel === 'medium').length / patients.length) * 100} 
                    className="h-2"
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Low Risk</span>
                    <span className="text-sm font-medium">
                      {patients.filter(p => p.riskLevel === 'low').length}
                    </span>
                  </div>
                  <Progress 
                    value={(patients.filter(p => p.riskLevel === 'low').length / patients.length) * 100} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Today's Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <span className="text-sm">Appointments</span>
                  </div>
                  <span className="font-medium">{appointments.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm">Completed</span>
                  </div>
                  <span className="font-medium">
                    {appointments.filter(a => a.status === 'completed').length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    <span className="text-sm">Pending</span>
                  </div>
                  <span className="font-medium">
                    {appointments.filter(a => a.status === 'scheduled').length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <span className="text-sm">Critical Alerts</span>
                  </div>
                  <span className="font-medium">
                    {alerts.filter(a => a.type === 'critical' && !a.read).length}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}