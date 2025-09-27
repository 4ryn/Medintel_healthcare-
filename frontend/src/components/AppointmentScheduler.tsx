'use client'

import { useState, useEffect } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Video, 
  User, 
  Phone,
  MapPin,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Bell,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react'

interface Appointment {
  id: number
  patientName: string
  patientId: number
  date: string
  time: string
  duration: number
  type: 'consultation' | 'follow-up' | 'checkup' | 'emergency' | 'telehealth'
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'no-show'
  notes?: string
  meetingLink?: string
  specialty: string
}

interface TimeSlot {
  time: string
  available: boolean
  duration: number
}

interface AppointmentFormData {
  patientId: string
  date: string
  time: string
  duration: number
  type: string
  notes: string
  isVirtual: boolean
}

// Mock data
const mockAppointments: Appointment[] = [
  {
    id: 1,
    patientName: "John Doe",
    patientId: 1,
    date: "2025-09-16",
    time: "10:00",
    duration: 30,
    type: "consultation",
    status: "scheduled",
    notes: "Initial consultation for diabetes management",
    specialty: "Endocrinology"
  },
  {
    id: 2,
    patientName: "Jane Smith",
    patientId: 2,
    date: "2025-09-16",
    time: "14:30",
    duration: 45,
    type: "follow-up",
    status: "confirmed",
    notes: "Follow-up for COPD treatment",
    specialty: "Pulmonology"
  },
  {
    id: 3,
    patientName: "Robert Johnson",
    patientId: 3,
    date: "2025-09-17",
    time: "09:00",
    duration: 60,
    type: "telehealth",
    status: "scheduled",
    meetingLink: "https://meet.medintel.com/room/12345",
    notes: "Virtual consultation for hypertension monitoring",
    specialty: "Cardiology"
  }
]

const mockPatients = [
  { id: 1, name: "John Doe", email: "john@example.com" },
  { id: 2, name: "Jane Smith", email: "jane@example.com" },
  { id: 3, name: "Robert Johnson", email: "robert@example.com" },
  { id: 4, name: "Mary Wilson", email: "mary@example.com" }
]

const timeSlots: TimeSlot[] = [
  { time: "09:00", available: true, duration: 30 },
  { time: "09:30", available: true, duration: 30 },
  { time: "10:00", available: false, duration: 30 },
  { time: "10:30", available: true, duration: 30 },
  { time: "11:00", available: true, duration: 30 },
  { time: "11:30", available: true, duration: 30 },
  { time: "14:00", available: true, duration: 45 },
  { time: "14:30", available: false, duration: 45 },
  { time: "15:15", available: true, duration: 45 },
  { time: "16:00", available: true, duration: 30 },
  { time: "16:30", available: true, duration: 30 }
]

export default function AppointmentScheduler() {
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [formData, setFormData] = useState<AppointmentFormData>({
    patientId: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    duration: 30,
    type: 'consultation',
    notes: '',
    isVirtual: false
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      case 'no-show': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'telehealth': return <Video className="h-4 w-4" />
      case 'emergency': return <AlertTriangle className="h-4 w-4" />
      case 'consultation': return <User className="h-4 w-4" />
      case 'follow-up': return <CheckCircle className="h-4 w-4" />
      default: return <CalendarIcon className="h-4 w-4" />
    }
  }

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.specialty.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const todayAppointments = filteredAppointments.filter(apt => 
    apt.date === new Date().toISOString().split('T')[0]
  )

  const selectedDateAppointments = filteredAppointments.filter(apt => 
    apt.date === selectedDate.toISOString().split('T')[0]
  )

  const handleCreateAppointment = async () => {
    try {
      const newAppointment: Appointment = {
        id: Date.now(),
        patientName: mockPatients.find(p => p.id === parseInt(formData.patientId))?.name || 'Unknown',
        patientId: parseInt(formData.patientId),
        date: formData.date,
        time: formData.time,
        duration: formData.duration,
        type: formData.type as any,
        status: 'scheduled',
        notes: formData.notes,
        specialty: 'General Medicine',
        ...(formData.isVirtual && { meetingLink: `https://meet.medintel.com/room/${Date.now()}` })
      }

      setAppointments([...appointments, newAppointment])
      setIsDialogOpen(false)
      setFormData({
        patientId: '',
        date: new Date().toISOString().split('T')[0],
        time: '',
        duration: 30,
        type: 'consultation',
        notes: '',
        isVirtual: false
      })
    } catch (error) {
      console.error('Error creating appointment:', error)
    }
  }

  const handleUpdateStatus = (appointmentId: number, newStatus: string) => {
    setAppointments(appointments.map(apt => 
      apt.id === appointmentId ? { ...apt, status: newStatus as any } : apt
    ))
  }

  const handleCancelAppointment = (appointmentId: number) => {
    handleUpdateStatus(appointmentId, 'cancelled')
  }

  const getTodayStats = () => {
    const today = new Date().toISOString().split('T')[0]
    const todayAppts = appointments.filter(apt => apt.date === today)
    
    return {
      total: todayAppts.length,
      completed: todayAppts.filter(apt => apt.status === 'completed').length,
      upcoming: todayAppts.filter(apt => apt.status === 'scheduled' || apt.status === 'confirmed').length,
      virtual: todayAppts.filter(apt => apt.type === 'telehealth').length
    }
  }

  const stats = getTodayStats()

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointment Scheduler</h1>
          <p className="text-gray-600">Manage your appointments and patient schedule</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              New Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule New Appointment</DialogTitle>
              <DialogDescription>
                Create a new appointment for a patient
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="patient">Patient</Label>
                <Select value={formData.patientId} onValueChange={(value) => setFormData({...formData, patientId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockPatients.map(patient => (
                      <SelectItem key={patient.id} value={patient.id.toString()}>
                        {patient.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="time">Time</Label>
                  <Select value={formData.time} onValueChange={(value) => setFormData({...formData, time: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.filter(slot => slot.available).map(slot => (
                        <SelectItem key={slot.time} value={slot.time}>
                          {slot.time} ({slot.duration}min)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consultation">Consultation</SelectItem>
                      <SelectItem value="follow-up">Follow-up</SelectItem>
                      <SelectItem value="checkup">Checkup</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="telehealth">Telehealth</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="duration">Duration (min)</Label>
                  <Select value={formData.duration.toString()} onValueChange={(value) => setFormData({...formData, duration: parseInt(value)})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  placeholder="Add any notes or special instructions..."
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="virtual"
                  checked={formData.isVirtual}
                  onChange={(e) => setFormData({...formData, isVirtual: e.target.checked})}
                  className="rounded"
                />
                <Label htmlFor="virtual">Virtual appointment (telehealth)</Label>
              </div>

              <div className="flex space-x-2">
                <Button onClick={handleCreateAppointment} className="flex-1">
                  Schedule Appointment
                </Button>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">total scheduled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">appointments done</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcoming}</div>
            <p className="text-xs text-muted-foreground">still to come</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Virtual Appointments</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.virtual}</div>
            <p className="text-xs text-muted-foreground">telehealth sessions</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
            <CardDescription>Select a date to view appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Appointment List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Appointments</CardTitle>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search patients or specialties..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="today" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="today">Today ({todayAppointments.length})</TabsTrigger>
                  <TabsTrigger value="selected">
                    {selectedDate.toLocaleDateString()} ({selectedDateAppointments.length})
                  </TabsTrigger>
                  <TabsTrigger value="all">All ({filteredAppointments.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="today" className="space-y-4">
                  {todayAppointments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No appointments for today
                    </div>
                  ) : (
                    todayAppointments.map(appointment => (
                      <AppointmentCard 
                        key={appointment.id} 
                        appointment={appointment}
                        onUpdateStatus={handleUpdateStatus}
                        onCancel={handleCancelAppointment}
                      />
                    ))
                  )}
                </TabsContent>

                <TabsContent value="selected" className="space-y-4">
                  {selectedDateAppointments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No appointments for selected date
                    </div>
                  ) : (
                    selectedDateAppointments.map(appointment => (
                      <AppointmentCard 
                        key={appointment.id} 
                        appointment={appointment}
                        onUpdateStatus={handleUpdateStatus}
                        onCancel={handleCancelAppointment}
                      />
                    ))
                  )}
                </TabsContent>

                <TabsContent value="all" className="space-y-4">
                  {filteredAppointments.map(appointment => (
                    <AppointmentCard 
                      key={appointment.id} 
                      appointment={appointment}
                      onUpdateStatus={handleUpdateStatus}
                      onCancel={handleCancelAppointment}
                    />
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function AppointmentCard({ 
  appointment, 
  onUpdateStatus, 
  onCancel 
}: { 
  appointment: Appointment
  onUpdateStatus: (id: number, status: string) => void
  onCancel: (id: number) => void
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      case 'no-show': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'telehealth': return <Video className="h-4 w-4" />
      case 'emergency': return <AlertTriangle className="h-4 w-4" />
      case 'consultation': return <User className="h-4 w-4" />
      case 'follow-up': return <CheckCircle className="h-4 w-4" />
      default: return <CalendarIcon className="h-4 w-4" />
    }
  }

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-full">
            {getTypeIcon(appointment.type)}
          </div>
          <div>
            <h3 className="font-semibold">{appointment.patientName}</h3>
            <p className="text-sm text-gray-600">{appointment.specialty}</p>
          </div>
        </div>
        <Badge className={getStatusColor(appointment.status)}>
          {appointment.status}
        </Badge>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <CalendarIcon className="h-4 w-4" />
            <span>{new Date(appointment.date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{appointment.time} ({appointment.duration}min)</span>
          </div>
          {appointment.type === 'telehealth' && (
            <div className="flex items-center space-x-1">
              <Video className="h-4 w-4" />
              <span>Virtual</span>
            </div>
          )}
        </div>
      </div>

      {appointment.notes && (
        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
          {appointment.notes}
        </p>
      )}

      {appointment.meetingLink && (
        <div className="flex items-center space-x-2">
          <Video className="h-4 w-4 text-blue-600" />
          <a 
            href={appointment.meetingLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline text-sm"
          >
            Join Virtual Meeting
          </a>
        </div>
      )}

      <div className="flex space-x-2">
        {appointment.status === 'scheduled' && (
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onUpdateStatus(appointment.id, 'confirmed')}
          >
            Confirm
          </Button>
        )}
        {appointment.status === 'confirmed' && (
          <Button 
            size="sm" 
            onClick={() => onUpdateStatus(appointment.id, 'completed')}
          >
            Mark Complete
          </Button>
        )}
        {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onCancel(appointment.id)}
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  )
}