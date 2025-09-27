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
import { 
  Heart, 
  Calendar, 
  Pill, 
  Bell, 
  TrendingUp, 
  Activity,
  CheckCircle,
  AlertTriangle,
  Plus,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  Download,
  Eye,
  Edit,
  Save,
  X
} from 'lucide-react'

interface VitalReading {
  id: string
  type: string
  value: string
  unit: string
  timestamp: string
  status: 'normal' | 'high' | 'low'
}

interface Appointment {
  id: string
  doctor_name: string
  department: string
  date: string
  time: string
  status: 'upcoming' | 'completed' | 'cancelled'
  type: 'in-person' | 'telehealth'
  notes?: string
}

interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  instructions: string
  next_dose: string
  taken_today: boolean
}

interface Notification {
  id: string
  title: string
  message: string
  type: 'medication' | 'appointment' | 'health_alert'
  priority: 'low' | 'medium' | 'high'
  read: boolean
  timestamp: string
}

// Mock data
const mockVitals: VitalReading[] = [
  { id: '1', type: 'Blood Pressure', value: '120/80', unit: 'mmHg', timestamp: '2025-09-14T08:00:00Z', status: 'normal' },
  { id: '2', type: 'Heart Rate', value: '72', unit: 'bpm', timestamp: '2025-09-14T08:00:00Z', status: 'normal' },
  { id: '3', type: 'Weight', value: '150', unit: 'lbs', timestamp: '2025-09-14T08:00:00Z', status: 'normal' },
  { id: '4', type: 'Temperature', value: '98.6', unit: '°F', timestamp: '2025-09-14T08:00:00Z', status: 'normal' }
]

const mockAppointments: Appointment[] = [
  {
    id: '1',
    doctor_name: 'Dr. Sarah Wilson',
    department: 'Cardiology',
    date: '2025-09-16',
    time: '10:00',
    status: 'upcoming',
    type: 'in-person',
    notes: 'Follow-up appointment for blood pressure monitoring'
  },
  {
    id: '2',
    doctor_name: 'Dr. Michael Chen',
    department: 'Primary Care',
    date: '2025-09-20',
    time: '14:30',
    status: 'upcoming',
    type: 'telehealth'
  }
]

const mockMedications: Medication[] = [
  {
    id: '1',
    name: 'Lisinopril',
    dosage: '10mg',
    frequency: 'Once daily',
    instructions: 'Take with water after breakfast',
    next_dose: '08:00',
    taken_today: true
  },
  {
    id: '2',
    name: 'Metformin',
    dosage: '500mg',
    frequency: 'Twice daily',
    instructions: 'Take with meals',
    next_dose: '12:00',
    taken_today: false
  },
  {
    id: '3',
    name: 'Aspirin',
    dosage: '81mg',
    frequency: 'Once daily',
    instructions: 'Take with food to avoid stomach upset',
    next_dose: '18:00',
    taken_today: false
  }
]

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Medication Reminder',
    message: 'Time to take your Metformin (500mg)',
    type: 'medication',
    priority: 'high',
    read: false,
    timestamp: '2025-09-14T12:00:00Z'
  },
  {
    id: '2',
    title: 'Appointment Reminder',
    message: 'Your appointment with Dr. Sarah Wilson is tomorrow at 10:00 AM',
    type: 'appointment',
    priority: 'medium',
    read: false,
    timestamp: '2025-09-14T09:00:00Z'
  }
]

export default function PatientDashboard() {
  const [vitals, setVitals] = useState<VitalReading[]>(mockVitals)
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments)
  const [medications, setMedications] = useState<Medication[]>(mockMedications)
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [isAddingVital, setIsAddingVital] = useState(false)
  const [isBookingAppointment, setIsBookingAppointment] = useState(false)
  const [newVital, setNewVital] = useState({ type: '', value: '', unit: '' })
  const [newAppointment, setNewAppointment] = useState({
    doctor_name: '',
    department: '',
    date: '',
    time: '',
    type: 'in-person' as 'in-person' | 'telehealth',
    notes: ''
  })

  const handleAddVital = async () => {
    if (newVital.type && newVital.value && newVital.unit) {
      const vital: VitalReading = {
        id: Date.now().toString(),
        type: newVital.type,
        value: newVital.value,
        unit: newVital.unit,
        timestamp: new Date().toISOString(),
        status: 'normal' // In real app, this would be calculated based on normal ranges
      }
      
      setVitals([vital, ...vitals])
      setNewVital({ type: '', value: '', unit: '' })
      setIsAddingVital(false)
      
      // Show success message
      alert('Vital signs recorded successfully!')
    }
  }

  const handleBookAppointment = async () => {
    if (newAppointment.doctor_name && newAppointment.department && newAppointment.date && newAppointment.time) {
      const appointment: Appointment = {
        id: Date.now().toString(),
        doctor_name: newAppointment.doctor_name,
        department: newAppointment.department,
        date: newAppointment.date,
        time: newAppointment.time,
        status: 'upcoming',
        type: newAppointment.type,
        notes: newAppointment.notes
      }
      
      setAppointments([...appointments, appointment])
      setNewAppointment({
        doctor_name: '',
        department: '',
        date: '',
        time: '',
        type: 'in-person',
        notes: ''
      })
      setIsBookingAppointment(false)
      
      // Show success message
      alert('Appointment booked successfully!')
    }
  }

  const markMedicationTaken = (medicationId: string) => {
    setMedications(medications.map(med => 
      med.id === medicationId ? { ...med, taken_today: true } : med
    ))
    alert('Medication marked as taken!')
  }

  const markNotificationRead = (notificationId: string) => {
    setNotifications(notifications.map(notif => 
      notif.id === notificationId ? { ...notif, read: true } : notif
    ))
  }

  const healthScore = Math.round((vitals.filter(v => v.status === 'normal').length / vitals.length) * 100)
  const unreadNotifications = notifications.filter(n => !n.read).length
  const medicationsTaken = medications.filter(m => m.taken_today).length
  const totalMedications = medications.length
  const medicationCompliance = Math.round((medicationsTaken / totalMedications) * 100)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Patient Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your health overview</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Download Health Report
          </Button>
          <Button variant="outline">
            <User className="h-4 w-4 mr-2" />
            Profile Settings
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Score</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{healthScore}%</div>
            <Progress value={healthScore} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">Overall health status</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Appointment</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">Tomorrow</div>
            <p className="text-xs text-muted-foreground">Dr. Sarah Wilson - 10:00 AM</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medication Compliance</CardTitle>
            <Pill className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{medicationCompliance}%</div>
            <Progress value={medicationCompliance} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">{medicationsTaken}/{totalMedications} taken today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{unreadNotifications}</div>
            <p className="text-xs text-muted-foreground">unread messages</p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts */}
      {unreadNotifications > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            You have {unreadNotifications} unread notification(s) that may require your attention.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Medications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Pill className="h-5 w-5 mr-2" />
                Today's Medications
              </span>
              <Badge variant="outline">{medicationsTaken}/{totalMedications} taken</Badge>
            </CardTitle>
            <CardDescription>Manage your daily medication schedule</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {medications.map((medication) => (
                <div key={medication.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{medication.name} {medication.dosage}</div>
                    <div className="text-sm text-gray-600">{medication.frequency}</div>
                    <div className="text-xs text-gray-500">{medication.instructions}</div>
                    <div className="text-xs text-blue-600">Next dose: {medication.next_dose}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {medication.taken_today ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Taken
                      </Badge>
                    ) : (
                      <Button 
                        size="sm" 
                        onClick={() => markMedicationTaken(medication.id)}
                      >
                        Mark Taken
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Vitals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Recent Vitals
              </span>
              <Dialog open={isAddingVital} onOpenChange={setIsAddingVital}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Vital
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Record Vital Signs</DialogTitle>
                    <DialogDescription>
                      Enter your vital sign measurements
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="vital-type">Vital Sign Type</Label>
                      <Select value={newVital.type} onValueChange={(value) => setNewVital(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select vital sign type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Blood Pressure">Blood Pressure</SelectItem>
                          <SelectItem value="Heart Rate">Heart Rate</SelectItem>
                          <SelectItem value="Weight">Weight</SelectItem>
                          <SelectItem value="Temperature">Temperature</SelectItem>
                          <SelectItem value="Blood Sugar">Blood Sugar</SelectItem>
                          <SelectItem value="Oxygen Saturation">Oxygen Saturation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="vital-value">Value</Label>
                      <Input
                        id="vital-value"
                        value={newVital.value}
                        onChange={(e) => setNewVital(prev => ({ ...prev, value: e.target.value }))}
                        placeholder="Enter measurement value"
                      />
                    </div>
                    <div>
                      <Label htmlFor="vital-unit">Unit</Label>
                      <Input
                        id="vital-unit"
                        value={newVital.unit}
                        onChange={(e) => setNewVital(prev => ({ ...prev, unit: e.target.value }))}
                        placeholder="e.g., mmHg, bpm, lbs, °F"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={handleAddVital} className="flex-1">
                        <Save className="h-4 w-4 mr-2" />
                        Record Vital
                      </Button>
                      <Button variant="outline" onClick={() => setIsAddingVital(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardTitle>
            <CardDescription>Track your health measurements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {vitals.slice(0, 4).map((vital) => (
                <div key={vital.id} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{vital.type}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(vital.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{vital.value} {vital.unit}</div>
                    <Badge className={
                      vital.status === 'normal' ? 'bg-green-100 text-green-800' :
                      vital.status === 'high' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }>
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
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Upcoming Appointments
              </span>
              <Dialog open={isBookingAppointment} onOpenChange={setIsBookingAppointment}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Book Appointment
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Book New Appointment</DialogTitle>
                    <DialogDescription>
                      Schedule an appointment with your healthcare provider
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="doctor">Doctor</Label>
                      <Input
                        id="doctor"
                        value={newAppointment.doctor_name}
                        onChange={(e) => setNewAppointment(prev => ({ ...prev, doctor_name: e.target.value }))}
                        placeholder="Enter doctor's name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="department">Department</Label>
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
                    <div>
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={newAppointment.date}
                        onChange={(e) => setNewAppointment(prev => ({ ...prev, date: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="time">Time</Label>
                      <Input
                        id="time"
                        type="time"
                        value={newAppointment.time}
                        onChange={(e) => setNewAppointment(prev => ({ ...prev, time: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">Appointment Type</Label>
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
                    <div>
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        value={newAppointment.notes}
                        onChange={(e) => setNewAppointment(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Any specific concerns or notes"
                        rows={3}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={handleBookAppointment} className="flex-1">
                        <Calendar className="h-4 w-4 mr-2" />
                        Book Appointment
                      </Button>
                      <Button variant="outline" onClick={() => setIsBookingAppointment(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardTitle>
            <CardDescription>Manage your healthcare appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium">{appointment.doctor_name}</div>
                      <div className="text-sm text-gray-600">{appointment.department}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant="outline">{appointment.type}</Badge>
                        <Badge className={
                          appointment.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                          appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }>
                          {appointment.status}
                        </Badge>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Details
                    </Button>
                  </div>
                  {appointment.notes && (
                    <div className="mt-2 text-sm text-gray-600 italic">
                      {appointment.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Recent Notifications
            </CardTitle>
            <CardDescription>Important health updates and reminders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 border rounded-lg cursor-pointer ${notification.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'}`}
                  onClick={() => markNotificationRead(notification.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium">{notification.title}</div>
                      <div className="text-sm text-gray-600 mt-1">{notification.message}</div>
                      <div className="text-xs text-gray-500 mt-2">
                        {new Date(notification.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={
                        notification.priority === 'high' ? 'bg-red-100 text-red-800' :
                        notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }>
                        {notification.priority}
                      </Badge>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All Notifications
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}