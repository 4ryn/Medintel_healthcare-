'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Users, 
  Calendar, 
  Activity, 
  Bell, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Save,
  X,
  Phone,
  Mail,
  MapPin,
  Clock,
  Heart,
  FileText,
  UserPlus,
  CalendarPlus,
  Stethoscope,
  Pill,
  Brain,
  Download,
  Settings,
  MoreHorizontal
} from 'lucide-react'

interface Patient {
  id: string
  name: string
  email: string
  phone: string
  date_of_birth: string
  gender: string
  address: string
  emergency_contact: string
  insurance: string
  last_visit: string
  next_appointment?: string
  status: 'active' | 'inactive' | 'critical'
  risk_level: 'low' | 'medium' | 'high'
  conditions: string[]
}

interface Appointment {
  id: string
  patient_id: string
  patient_name: string
  doctor_name: string
  department: string
  date: string
  time: string
  duration: number
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'no-show'
  type: 'in-person' | 'telehealth'
  notes?: string
  reason: string
}

interface HealthAlert {
  id: string
  patient_id: string
  patient_name: string
  type: 'critical' | 'warning' | 'info'
  title: string
  message: string
  timestamp: string
  acknowledged: boolean
  vital_type?: string
  value?: string
}

// Mock data
const mockPatients: Patient[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '(555) 123-4567',
    date_of_birth: '1980-05-15',
    gender: 'Male',
    address: '123 Main St, City, State 12345',
    emergency_contact: 'Jane Smith - (555) 987-6543',
    insurance: 'BlueCross BlueShield',
    last_visit: '2025-09-10',
    next_appointment: '2025-09-16',
    status: 'active',
    risk_level: 'medium',
    conditions: ['Hypertension', 'Type 2 Diabetes']
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '(555) 234-5678',
    date_of_birth: '1975-08-22',
    gender: 'Female',
    address: '456 Oak Ave, City, State 12345',
    emergency_contact: 'Mike Johnson - (555) 876-5432',
    insurance: 'Aetna',
    last_visit: '2025-09-12',
    status: 'critical',
    risk_level: 'high',
    conditions: ['Heart Disease', 'High Cholesterol']
  },
  {
    id: '3',
    name: 'Mike Davis',
    email: 'mike.davis@email.com',
    phone: '(555) 345-6789',
    date_of_birth: '1990-03-10',
    gender: 'Male',
    address: '789 Pine Rd, City, State 12345',
    emergency_contact: 'Lisa Davis - (555) 765-4321',
    insurance: 'Kaiser Permanente',
    last_visit: '2025-09-08',
    next_appointment: '2025-09-20',
    status: 'active',
    risk_level: 'low',
    conditions: ['Seasonal Allergies']
  }
]

const mockAppointments: Appointment[] = [
  {
    id: '1',
    patient_id: '1',
    patient_name: 'John Smith',
    doctor_name: 'Dr. Sarah Wilson',
    department: 'Cardiology',
    date: '2025-09-16',
    time: '09:00',
    duration: 30,
    status: 'scheduled',
    type: 'in-person',
    reason: 'Follow-up blood pressure check'
  },
  {
    id: '2',
    patient_id: '2',
    patient_name: 'Sarah Johnson',
    doctor_name: 'Dr. Michael Chen',
    department: 'Cardiology',
    date: '2025-09-16',
    time: '10:30',
    duration: 45,
    status: 'scheduled',
    type: 'in-person',
    reason: 'Chest pain evaluation'
  },
  {
    id: '3',
    patient_id: '3',
    patient_name: 'Mike Davis',
    doctor_name: 'Dr. Emily Rodriguez',
    department: 'Primary Care',
    date: '2025-09-16',
    time: '14:00',
    duration: 30,
    status: 'scheduled',
    type: 'telehealth',
    reason: 'Annual check-up'
  }
]

const mockAlerts: HealthAlert[] = [
  {
    id: '1',
    patient_id: '2',
    patient_name: 'Sarah Johnson',
    type: 'critical',
    title: 'Critical Blood Pressure Reading',
    message: 'Patient recorded BP of 180/110 mmHg - immediate attention required',
    timestamp: '2025-09-14T08:30:00Z',
    acknowledged: false,
    vital_type: 'blood_pressure',
    value: '180/110'
  },
  {
    id: '2',
    patient_id: '1',
    patient_name: 'John Smith',
    type: 'warning',
    title: 'Missed Medication',
    message: 'Patient has not taken prescribed Metformin for 2 days',
    timestamp: '2025-09-14T07:00:00Z',
    acknowledged: false
  },
  {
    id: '3',
    patient_id: '3',
    patient_name: 'Mike Davis',
    type: 'info',
    title: 'Appointment Reminder',
    message: 'Patient has upcoming appointment tomorrow at 2:00 PM',
    timestamp: '2025-09-14T06:00:00Z',
    acknowledged: true
  }
]

export default function ClinicianDashboard() {
  const [patients, setPatients] = useState<Patient[]>(mockPatients)
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments)
  const [alerts, setAlerts] = useState<HealthAlert[]>(mockAlerts)
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>(mockPatients)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterRisk, setFilterRisk] = useState('all')
  const [isAddingPatient, setIsAddingPatient] = useState(false)
  const [isSchedulingAppointment, setIsSchedulingAppointment] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [viewMode, setViewMode] = useState<'overview' | 'patients' | 'appointments' | 'alerts'>('overview')

  const [newPatient, setNewPatient] = useState({
    name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    address: '',
    emergency_contact: '',
    insurance: ''
  })

  const [newAppointment, setNewAppointment] = useState({
    patient_id: '',
    doctor_name: '',
    department: '',
    date: '',
    time: '',
    duration: 30,
    type: 'in-person' as 'in-person' | 'telehealth',
    reason: '',
    notes: ''
  })

  // Filter patients based on search and filters
  useEffect(() => {
    let filtered = patients

    if (searchTerm) {
      filtered = filtered.filter(patient => 
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.conditions.some(condition => 
          condition.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(patient => patient.status === filterStatus)
    }

    if (filterRisk !== 'all') {
      filtered = filtered.filter(patient => patient.risk_level === filterRisk)
    }

    setFilteredPatients(filtered)
  }, [patients, searchTerm, filterStatus, filterRisk])

  const handleAddPatient = async () => {
    if (newPatient.name && newPatient.email && newPatient.phone) {
      const patient: Patient = {
        id: Date.now().toString(),
        ...newPatient,
        last_visit: '',
        status: 'active',
        risk_level: 'low',
        conditions: []
      }
      
      setPatients([...patients, patient])
      setNewPatient({
        name: '',
        email: '',
        phone: '',
        date_of_birth: '',
        gender: '',
        address: '',
        emergency_contact: '',
        insurance: ''
      })
      setIsAddingPatient(false)
      alert('Patient added successfully!')
    }
  }

  const handleScheduleAppointment = async () => {
    if (newAppointment.patient_id && newAppointment.doctor_name && newAppointment.date && newAppointment.time) {
      const patient = patients.find(p => p.id === newAppointment.patient_id)
      if (!patient) return

      const appointment: Appointment = {
        id: Date.now().toString(),
        patient_name: patient.name,
        status: 'scheduled',
        ...newAppointment
      }
      
      setAppointments([...appointments, appointment])
      setNewAppointment({
        patient_id: '',
        doctor_name: '',
        department: '',
        date: '',
        time: '',
        duration: 30,
        type: 'in-person',
        reason: '',
        notes: ''
      })
      setIsSchedulingAppointment(false)
      alert('Appointment scheduled successfully!')
    }
  }

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ))
  }

  const updateAppointmentStatus = (appointmentId: string, status: Appointment['status']) => {
    setAppointments(appointments.map(apt => 
      apt.id === appointmentId ? { ...apt, status } : apt
    ))
  }

  // Statistics
  const totalPatients = patients.length
  const activePatients = patients.filter(p => p.status === 'active').length
  const criticalPatients = patients.filter(p => p.status === 'critical').length
  const todayAppointments = appointments.filter(apt => apt.date === '2025-09-16').length
  const unacknowledgedAlerts = alerts.filter(alert => !alert.acknowledged).length
  const criticalAlerts = alerts.filter(alert => alert.type === 'critical' && !alert.acknowledged).length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clinician Dashboard</h1>
          <p className="text-gray-600">Patient management and clinical oversight</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            onClick={() => setIsAddingPatient(true)}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Patient
          </Button>
          <Button 
            variant="outline"
            onClick={() => setIsSchedulingAppointment(true)}
          >
            <CalendarPlus className="h-4 w-4 mr-2" />
            Schedule Appointment
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalPatients}</div>
            <p className="text-xs text-muted-foreground">{activePatients} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{todayAppointments}</div>
            <p className="text-xs text-muted-foreground">scheduled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Patients</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalPatients}</div>
            <p className="text-xs text-muted-foreground">require attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alerts</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{unacknowledgedAlerts}</div>
            <p className="text-xs text-muted-foreground">{criticalAlerts} critical</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Department Load</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">85%</div>
            <p className="text-xs text-muted-foreground">capacity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">4.8</div>
            <p className="text-xs text-muted-foreground">average rating</p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts */}
      {criticalAlerts > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>CRITICAL:</strong> {criticalAlerts} patient(s) require immediate attention.
          </AlertDescription>
        </Alert>
      )}

      {/* Navigation Tabs */}
      <div className="flex space-x-4 border-b">
        <Button 
          variant={viewMode === 'overview' ? 'default' : 'ghost'}
          onClick={() => setViewMode('overview')}
        >
          Overview
        </Button>
        <Button 
          variant={viewMode === 'patients' ? 'default' : 'ghost'}
          onClick={() => setViewMode('patients')}
        >
          Patients ({filteredPatients.length})
        </Button>
        <Button 
          variant={viewMode === 'appointments' ? 'default' : 'ghost'}
          onClick={() => setViewMode('appointments')}
        >
          Appointments ({todayAppointments})
        </Button>
        <Button 
          variant={viewMode === 'alerts' ? 'default' : 'ghost'}
          onClick={() => setViewMode('alerts')}
        >
          Alerts ({unacknowledgedAlerts})
        </Button>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Today's Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointments.slice(0, 5).map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{appointment.time} - {appointment.patient_name}</div>
                      <div className="text-sm text-gray-600">{appointment.department} • {appointment.reason}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{appointment.type}</Badge>
                      <Select 
                        value={appointment.status} 
                        onValueChange={(value) => updateAppointmentStatus(appointment.id, value as Appointment['status'])}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                          <SelectItem value="no-show">No Show</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Critical Alerts Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Recent Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.slice(0, 5).map((alert) => (
                  <div key={alert.id} className={`p-3 border rounded-lg ${
                    alert.type === 'critical' ? 'border-red-200 bg-red-50' :
                    alert.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                    'border-blue-200 bg-blue-50'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium">{alert.title}</div>
                        <div className="text-sm text-gray-600">{alert.patient_name}</div>
                        <div className="text-sm text-gray-700 mt-1">{alert.message}</div>
                        <div className="text-xs text-gray-500 mt-2">
                          {new Date(alert.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={
                          alert.type === 'critical' ? 'bg-red-100 text-red-800' :
                          alert.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }>
                          {alert.type}
                        </Badge>
                        {!alert.acknowledged && (
                          <Button size="sm" onClick={() => acknowledgeAlert(alert.id)}>
                            Acknowledge
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {viewMode === 'patients' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Patient Management
              </span>
              <div className="flex space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search patients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterRisk} onValueChange={setFilterRisk}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Risk</SelectItem>
                    <SelectItem value="low">Low Risk</SelectItem>
                    <SelectItem value="medium">Medium Risk</SelectItem>
                    <SelectItem value="high">High Risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Conditions</TableHead>
                  <TableHead>Last Visit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{patient.name}</div>
                        <div className="text-sm text-gray-600">{patient.gender}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{patient.phone}</div>
                        <div className="text-gray-600">{patient.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {patient.conditions.map((condition, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {condition}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {patient.last_visit ? new Date(patient.last_visit).toLocaleDateString() : 'Never'}
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        patient.status === 'active' ? 'bg-green-100 text-green-800' :
                        patient.status === 'critical' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }>
                        {patient.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        patient.risk_level === 'high' ? 'bg-red-100 text-red-800' :
                        patient.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }>
                        {patient.risk_level}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="outline" onClick={() => setSelectedPatient(patient)}>
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Add Patient Dialog */}
      <Dialog open={isAddingPatient} onOpenChange={setIsAddingPatient}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Patient</DialogTitle>
            <DialogDescription>
              Enter patient information to add them to the system
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="patient-name">Full Name *</Label>
              <Input
                id="patient-name"
                value={newPatient.name}
                onChange={(e) => setNewPatient(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter full name"
              />
            </div>
            <div>
              <Label htmlFor="patient-email">Email *</Label>
              <Input
                id="patient-email"
                type="email"
                value={newPatient.email}
                onChange={(e) => setNewPatient(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
              />
            </div>
            <div>
              <Label htmlFor="patient-phone">Phone *</Label>
              <Input
                id="patient-phone"
                value={newPatient.phone}
                onChange={(e) => setNewPatient(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <Label htmlFor="patient-dob">Date of Birth</Label>
              <Input
                id="patient-dob"
                type="date"
                value={newPatient.date_of_birth}
                onChange={(e) => setNewPatient(prev => ({ ...prev, date_of_birth: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="patient-gender">Gender</Label>
              <Select value={newPatient.gender} onValueChange={(value) => setNewPatient(prev => ({ ...prev, gender: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                  <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="patient-insurance">Insurance</Label>
              <Input
                id="patient-insurance"
                value={newPatient.insurance}
                onChange={(e) => setNewPatient(prev => ({ ...prev, insurance: e.target.value }))}
                placeholder="Insurance provider"
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="patient-address">Address</Label>
              <Input
                id="patient-address"
                value={newPatient.address}
                onChange={(e) => setNewPatient(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Full address"
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="patient-emergency">Emergency Contact</Label>
              <Input
                id="patient-emergency"
                value={newPatient.emergency_contact}
                onChange={(e) => setNewPatient(prev => ({ ...prev, emergency_contact: e.target.value }))}
                placeholder="Name and phone number"
              />
            </div>
          </div>
          <div className="flex space-x-2 pt-4">
            <Button onClick={handleAddPatient} className="flex-1">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Patient
            </Button>
            <Button variant="outline" onClick={() => setIsAddingPatient(false)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Schedule Appointment Dialog */}
      <Dialog open={isSchedulingAppointment} onOpenChange={setIsSchedulingAppointment}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Appointment</DialogTitle>
            <DialogDescription>
              Book a new appointment for a patient
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="apt-patient">Patient *</Label>
              <Select value={newAppointment.patient_id} onValueChange={(value) => setNewAppointment(prev => ({ ...prev, patient_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name} - {patient.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="apt-doctor">Doctor *</Label>
              <Input
                id="apt-doctor"
                value={newAppointment.doctor_name}
                onChange={(e) => setNewAppointment(prev => ({ ...prev, doctor_name: e.target.value }))}
                placeholder="Doctor name"
              />
            </div>
            <div>
              <Label htmlFor="apt-department">Department *</Label>
              <Select value={newAppointment.department} onValueChange={(value) => setNewAppointment(prev => ({ ...prev, department: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Primary Care">Primary Care</SelectItem>
                  <SelectItem value="Cardiology">Cardiology</SelectItem>
                  <SelectItem value="Dermatology">Dermatology</SelectItem>
                  <SelectItem value="Endocrinology">Endocrinology</SelectItem>
                  <SelectItem value="Neurology">Neurology</SelectItem>
                  <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="apt-date">Date *</Label>
                <Input
                  id="apt-date"
                  type="date"
                  value={newAppointment.date}
                  onChange={(e) => setNewAppointment(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="apt-time">Time *</Label>
                <Input
                  id="apt-time"
                  type="time"
                  value={newAppointment.time}
                  onChange={(e) => setNewAppointment(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="apt-reason">Reason for Visit *</Label>
              <Input
                id="apt-reason"
                value={newAppointment.reason}
                onChange={(e) => setNewAppointment(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Reason for appointment"
              />
            </div>
            <div>
              <Label htmlFor="apt-type">Appointment Type</Label>
              <Select value={newAppointment.type} onValueChange={(value: 'in-person' | 'telehealth') => setNewAppointment(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in-person">In-Person</SelectItem>
                  <SelectItem value="telehealth">Telehealth</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex space-x-2 pt-4">
            <Button onClick={handleScheduleAppointment} className="flex-1">
              <CalendarPlus className="h-4 w-4 mr-2" />
              Schedule Appointment
            </Button>
            <Button variant="outline" onClick={() => setIsSchedulingAppointment(false)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Patient Details Dialog */}
      {selectedPatient && (
        <Dialog open={!!selectedPatient} onOpenChange={() => setSelectedPatient(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Patient Details - {selectedPatient.name}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-2">Personal Information</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Email:</strong> {selectedPatient.email}</div>
                  <div><strong>Phone:</strong> {selectedPatient.phone}</div>
                  <div><strong>Date of Birth:</strong> {selectedPatient.date_of_birth}</div>
                  <div><strong>Gender:</strong> {selectedPatient.gender}</div>
                  <div><strong>Address:</strong> {selectedPatient.address}</div>
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2">Medical Information</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Insurance:</strong> {selectedPatient.insurance}</div>
                  <div><strong>Emergency Contact:</strong> {selectedPatient.emergency_contact}</div>
                  <div><strong>Last Visit:</strong> {selectedPatient.last_visit || 'Never'}</div>
                  <div><strong>Next Appointment:</strong> {selectedPatient.next_appointment || 'None scheduled'}</div>
                  <div>
                    <strong>Conditions:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedPatient.conditions.map((condition, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {condition}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex space-x-2 pt-4">
              <Button className="flex-1">
                <Edit className="h-4 w-4 mr-2" />
                Edit Patient
              </Button>
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Appointment
              </Button>
              <Button variant="outline" onClick={() => setSelectedPatient(null)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}