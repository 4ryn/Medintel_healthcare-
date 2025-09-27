'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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
  Calendar, 
  Clock, 
  User, 
  Plus,
  ArrowLeft,
  Phone,
  Video,
  MapPin,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react'

interface Appointment {
  id: number
  patient_id: number
  provider_id: number
  provider_name: string
  appointment_date: string
  start_time: string
  end_time: string
  appointment_type: string
  status: string
  notes: string
  is_telehealth: boolean
  telehealth_link?: string
  created_at: string
  updated_at: string
}

interface Provider {
  id: number
  name: string
  specialty: string
  available_slots: string[]
}

const mockProviders: Provider[] = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    specialty: "General Medicine",
    available_slots: ["09:00", "10:00", "11:00", "14:00", "15:00"]
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    specialty: "Cardiology",
    available_slots: ["09:30", "11:30", "14:30", "16:00"]
  },
  {
    id: 3,
    name: "Dr. Emily Rodriguez",
    specialty: "Dermatology",
    available_slots: ["10:00", "11:00", "15:00", "16:30"]
  }
]

export default function AppointmentsPage() {
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [providers, setProviders] = useState<Provider[]>(mockProviders)
  const [loading, setLoading] = useState(true)
  const [showNewAppointment, setShowNewAppointment] = useState(false)
  const [formData, setFormData] = useState({
    provider_id: '',
    appointment_date: '',
    start_time: '',
    appointment_type: 'consultation',
    notes: '',
    is_telehealth: false
  })

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/appointments/')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setAppointments(data.data)
        }
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:8000/api/v1/appointments/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          patient_id: 1, // Mock patient ID
          provider_id: parseInt(formData.provider_id)
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          await fetchAppointments() // Refresh appointments
          setShowNewAppointment(false)
          setFormData({
            provider_id: '',
            appointment_date: '',
            start_time: '',
            appointment_type: 'consultation',
            notes: '',
            is_telehealth: false
          })
        }
      }
    } catch (error) {
      console.error('Error creating appointment:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { color: 'bg-blue-100 text-blue-800', icon: Calendar },
      confirmed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle },
      completed: { color: 'bg-gray-100 text-gray-800', icon: CheckCircle }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled
    const Icon = config.icon
    
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading appointments...</p>
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
              <Link href="/patient/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
                <p className="text-gray-600">Schedule and manage your healthcare appointments</p>
              </div>
            </div>
            <Button onClick={() => setShowNewAppointment(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Schedule New Appointment
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* New Appointment Form */}
        {showNewAppointment && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Schedule New Appointment</CardTitle>
              <CardDescription>
                Fill in the details to book your appointment with a healthcare provider
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="provider">Healthcare Provider</Label>
                    <Select 
                      value={formData.provider_id} 
                      onValueChange={(value) => setFormData({...formData, provider_id: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a provider" />
                      </SelectTrigger>
                      <SelectContent>
                        {providers.map(provider => (
                          <SelectItem key={provider.id} value={provider.id.toString()}>
                            {provider.name} - {provider.specialty}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="appointment_type">Appointment Type</Label>
                    <Select 
                      value={formData.appointment_type} 
                      onValueChange={(value) => setFormData({...formData, appointment_type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="consultation">Consultation</SelectItem>
                        <SelectItem value="follow_up">Follow-up</SelectItem>
                        <SelectItem value="checkup">Regular Checkup</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="appointment_date">Appointment Date</Label>
                    <Input
                      id="appointment_date"
                      type="date"
                      value={formData.appointment_date}
                      onChange={(e) => setFormData({...formData, appointment_date: e.target.value})}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="start_time">Preferred Time</Label>
                    <Select 
                      value={formData.start_time} 
                      onValueChange={(value) => setFormData({...formData, start_time: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        {formData.provider_id && providers
                          .find(p => p.id.toString() === formData.provider_id)
                          ?.available_slots.map(slot => (
                            <SelectItem key={slot} value={slot}>
                              {formatTime(slot + ':00')}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any specific concerns or notes for the provider..."
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="min-h-[100px]"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_telehealth"
                    checked={formData.is_telehealth}
                    onChange={(e) => setFormData({...formData, is_telehealth: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="is_telehealth" className="flex items-center">
                    <Video className="h-4 w-4 mr-2" />
                    Request Telehealth Appointment
                  </Label>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowNewAppointment(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    Schedule Appointment
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Appointments List */}
        <div className="space-y-6">
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
              <TabsTrigger value="all">All Appointments</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-4">
              {appointments
                .filter(apt => apt.status === 'scheduled' || apt.status === 'confirmed')
                .map(appointment => (
                  <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="bg-blue-100 rounded-full p-3">
                            <User className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {appointment.provider_name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {appointment.appointment_type.charAt(0).toUpperCase() + 
                               appointment.appointment_type.slice(1)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(appointment.appointment_date)}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>{formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {appointment.is_telehealth && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Video className="h-3 w-3" />
                              Telehealth
                            </Badge>
                          )}
                          {getStatusBadge(appointment.status)}
                        </div>
                      </div>
                      {appointment.notes && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">{appointment.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </TabsContent>

            <TabsContent value="past" className="space-y-4">
              {appointments
                .filter(apt => apt.status === 'completed' || apt.status === 'cancelled')
                .map(appointment => (
                  <Card key={appointment.id} className="opacity-75">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="bg-gray-100 rounded-full p-3">
                            <User className="h-6 w-6 text-gray-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-700">
                              {appointment.provider_name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {appointment.appointment_type.charAt(0).toUpperCase() + 
                               appointment.appointment_type.slice(1)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(appointment.appointment_date)}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <Clock className="h-4 w-4" />
                            <span>{formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {getStatusBadge(appointment.status)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </TabsContent>

            <TabsContent value="all" className="space-y-4">
              {appointments.map(appointment => (
                <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-blue-100 rounded-full p-3">
                          <User className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {appointment.provider_name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {appointment.appointment_type.charAt(0).toUpperCase() + 
                             appointment.appointment_type.slice(1)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(appointment.appointment_date)}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>{formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {appointment.is_telehealth && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Video className="h-3 w-3" />
                            Telehealth
                          </Badge>
                        )}
                        {getStatusBadge(appointment.status)}
                      </div>
                    </div>
                    {appointment.notes && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{appointment.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>

          {appointments.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
                <p className="text-gray-600 mb-6">
                  You haven't scheduled any appointments yet. Click the button above to get started.
                </p>
                <Button onClick={() => setShowNewAppointment(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Your First Appointment
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}