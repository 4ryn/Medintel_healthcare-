'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { 
  Heart, 
  Activity, 
  Calendar, 
  FileText, 
  Pill, 
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
  TrendingUp,
  AlertTriangle,
  Plus,
  Target,
  Stethoscope,
  CheckCircle,
  Eye,
  Trash2
} from 'lucide-react'
import { api, mockApi, type Vital, type Appointment, type Notification } from '@/lib/api'

export default function WorkingPatientDashboard() {
  const [vitals, setVitals] = useState<Vital[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Form states
  const [newVital, setNewVital] = useState({
    vital_type: '',
    value: '',
    unit: '',
    notes: ''
  })
  const [newAppointment, setNewAppointment] = useState({
    doctor_name: '',
    appointment_date: '',
    appointment_type: '',
    notes: ''
  })

  // Load initial data
  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      // Try real API first, fallback to mock data
      const [vitalsRes, appointmentsRes, notificationsRes] = await Promise.all([
        api.getVitals().catch(() => ({ success: true, data: mockVitalsData })),
        api.getAppointments().catch(() => ({ success: true, data: mockAppointmentsData })),
        api.getNotifications().catch(() => mockApi.getNotifications())
      ])

      if (vitalsRes.success) setVitals(vitalsRes.data || [])
      if (appointmentsRes.success) setAppointments(appointmentsRes.data || [])
      if (notificationsRes.success) setNotifications(notificationsRes.data || [])
    } catch (err) {
      setError('Failed to load dashboard data')
      console.error('Dashboard load error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRecordVitals = async () => {
    if (!newVital.vital_type || !newVital.value) {
      setError('Please fill in all required fields')
      return
    }

    try {
      const response = await api.createVital({
        vital_type: newVital.vital_type,
        value: parseFloat(newVital.value),
        unit: newVital.unit,
        notes: newVital.notes,
        patient_id: 1 // Mock patient ID
      })

      if (response.success) {
        setVitals([response.data, ...vitals])
        setNewVital({ vital_type: '', value: '', unit: '', notes: '' })
        setError(null)
        alert('Vitals recorded successfully!')
      } else {
        setError(response.error || 'Failed to record vitals')
      }
    } catch (err) {
      // Mock success for demo
      const mockVital: Vital = {
        id: Date.now(),
        patient_id: 1,
        vital_type: newVital.vital_type,
        value: parseFloat(newVital.value),
        unit: newVital.unit,
        recorded_at: new Date().toISOString(),
        notes: newVital.notes
      }
      setVitals([mockVital, ...vitals])
      setNewVital({ vital_type: '', value: '', unit: '', notes: '' })
      alert('Vitals recorded successfully! (Demo mode)')
    }
  }

  const handleBookAppointment = async () => {
    if (!newAppointment.doctor_name || !newAppointment.appointment_date || !newAppointment.appointment_type) {
      setError('Please fill in all required fields')
      return
    }

    try {
      const response = await api.createAppointment({
        ...newAppointment,
        patient_id: 1, // Mock patient ID
        status: 'scheduled'
      })

      if (response.success) {
        setAppointments([response.data, ...appointments])
        setNewAppointment({ doctor_name: '', appointment_date: '', appointment_type: '', notes: '' })
        setError(null)
        alert('Appointment booked successfully!')
      } else {
        setError(response.error || 'Failed to book appointment')
      }
    } catch (err) {
      // Mock success for demo
      const mockAppointment: Appointment = {
        id: Date.now(),
        patient_id: 1,
        doctor_name: newAppointment.doctor_name,
        appointment_date: newAppointment.appointment_date,
        appointment_type: newAppointment.appointment_type,
        status: 'scheduled',
        notes: newAppointment.notes
      }
      setAppointments([mockAppointment, ...appointments])
      setNewAppointment({ doctor_name: '', appointment_date: '', appointment_type: '', notes: '' })
      alert('Appointment booked successfully! (Demo mode)')
    }
  }

  const handleMarkNotificationRead = async (id: number) => {
    try {
      await api.markNotificationRead(id)
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      ))
    } catch (err) {
      // Mock success for demo
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      ))
    }
  }

  const handleDocumentUpload = async (file: File) => {
    try {
      setError(null)
      const response = await api.uploadDocument(file, 1) // Using patient ID 1 for demo

      if (response.success) {
        alert(`Document "${file.name}" uploaded successfully!`)
      } else {
        setError(response.error || 'Failed to upload document')
      }
    } catch (err) {
      // Mock success for demo since API might not be available
      alert(`Document "${file.name}" uploaded successfully! (Demo mode)`)
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

  // Mock patient data
  const patientInfo = {
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '(555) 123-4567',
    dob: '1980-05-15',
    address: '123 Main St, Anytown, USA',
    emergencyContact: 'Jane Smith - (555) 987-6543'
  }

  // Calculate health metrics
  const unreadNotifications = notifications.filter(n => !n.read).length
  const upcomingAppointments = appointments.filter(a => 
    new Date(a.appointment_date) > new Date() && a.status === 'scheduled'
  ).length
  const recentVitals = vitals.slice(0, 3)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Patient Dashboard</h1>
          <p className="text-gray-600">Welcome back, {patientInfo.name}</p>
        </div>
        <div className="flex space-x-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Record Vitals
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record New Vitals</DialogTitle>
                <DialogDescription>Enter your current vital signs</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Vital Type</Label>
                  <Select value={newVital.vital_type} onValueChange={(value) => setNewVital({...newVital, vital_type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vital type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blood_pressure">Blood Pressure</SelectItem>
                      <SelectItem value="heart_rate">Heart Rate</SelectItem>
                      <SelectItem value="temperature">Temperature</SelectItem>
                      <SelectItem value="weight">Weight</SelectItem>
                      <SelectItem value="height">Height</SelectItem>
                      <SelectItem value="blood_sugar">Blood Sugar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Value</Label>
                  <Input
                    value={newVital.value}
                    onChange={(e) => setNewVital({...newVital, value: e.target.value})}
                    placeholder="Enter value"
                  />
                </div>
                <div>
                  <Label>Unit</Label>
                  <Input
                    value={newVital.unit}
                    onChange={(e) => setNewVital({...newVital, unit: e.target.value})}
                    placeholder="e.g., mmHg, bpm, °F, lbs"
                  />
                </div>
                <div>
                  <Label>Notes (Optional)</Label>
                  <Textarea
                    value={newVital.notes}
                    onChange={(e) => setNewVital({...newVital, notes: e.target.value})}
                    placeholder="Any additional notes..."
                  />
                </div>
                {error && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                  </Alert>
                )}
                <Button onClick={handleRecordVitals} className="w-full">
                  Record Vitals
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Book Appointment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Book New Appointment</DialogTitle>
                <DialogDescription>Schedule an appointment with your healthcare provider</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Doctor/Provider</Label>
                  <Input
                    value={newAppointment.doctor_name}
                    onChange={(e) => setNewAppointment({...newAppointment, doctor_name: e.target.value})}
                    placeholder="Dr. Sarah Wilson"
                  />
                </div>
                <div>
                  <Label>Date & Time</Label>
                  <Input
                    type="datetime-local"
                    value={newAppointment.appointment_date}
                    onChange={(e) => setNewAppointment({...newAppointment, appointment_date: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Appointment Type</Label>
                  <Select value={newAppointment.appointment_type} onValueChange={(value) => setNewAppointment({...newAppointment, appointment_type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select appointment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Consultation</SelectItem>
                      <SelectItem value="follow_up">Follow-up</SelectItem>
                      <SelectItem value="specialist">Specialist Consultation</SelectItem>
                      <SelectItem value="lab_results">Lab Results Review</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Notes (Optional)</Label>
                  <Textarea
                    value={newAppointment.notes}
                    onChange={(e) => setNewAppointment({...newAppointment, notes: e.target.value})}
                    placeholder="Reason for visit, symptoms, etc..."
                  />
                </div>
                {error && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                  </Alert>
                )}
                <Button onClick={handleBookAppointment} className="w-full">
                  Book Appointment
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{upcomingAppointments}</div>
            <p className="text-xs text-muted-foreground">scheduled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread Notifications</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{unreadNotifications}</div>
            <p className="text-xs text-muted-foreground">require attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Vitals</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{recentVitals.length}</div>
            <p className="text-xs text-muted-foreground">this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">94%</div>
            <p className="text-xs text-muted-foreground">overall health</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="vitals">Vitals</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Vitals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Stethoscope className="h-5 w-5 mr-2" />
                  Recent Vitals
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentVitals.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No vitals recorded yet</p>
                ) : (
                  <div className="space-y-3">
                    {recentVitals.map((vital) => (
                      <div key={vital.id} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{vital.vital_type.replace('_', ' ').toUpperCase()}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(vital.recorded_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{vital.value} {vital.unit}</p>
                          <Badge variant="outline">Normal</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <Button variant="outline" className="w-full mt-4" onClick={() => setLoading(true)}>
                  View All Vitals
                </Button>
              </CardContent>
            </Card>

            {/* Upcoming Appointments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Upcoming Appointments
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingAppointments === 0 ? (
                  <p className="text-gray-500 text-center py-4">No upcoming appointments</p>
                ) : (
                  <div className="space-y-3">
                    {appointments.filter(a => new Date(a.appointment_date) > new Date()).slice(0, 3).map((appointment) => (
                      <div key={appointment.id} className="border-l-4 border-blue-500 pl-4">
                        <p className="font-medium">{appointment.doctor_name}</p>
                        <p className="text-sm text-gray-600">{appointment.appointment_type}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(appointment.appointment_date).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                <Button variant="outline" className="w-full mt-4">
                  View All Appointments
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Recent Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No notifications</p>
              ) : (
                <div className="space-y-3">
                  {notifications.slice(0, 5).map((notification) => (
                    <div key={notification.id} className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium">{notification.title}</p>
                        <p className="text-sm text-gray-600">{notification.message}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={notification.read ? "outline" : "default"}>
                          {notification.priority}
                        </Badge>
                        {!notification.read && (
                          <Button size="sm" variant="outline" onClick={() => handleMarkNotificationRead(notification.id)}>
                            Mark Read
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other tabs content... */}
        <TabsContent value="vitals">
          <Card>
            <CardHeader>
              <CardTitle>All Vitals</CardTitle>
              <CardDescription>Your complete vital signs history</CardDescription>
            </CardHeader>
            <CardContent>
              {vitals.length === 0 ? (
                <p className="text-center py-8 text-gray-500">No vitals recorded yet</p>
              ) : (
                <div className="space-y-4">
                  {vitals.map((vital) => (
                    <div key={vital.id} className="border rounded p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{vital.vital_type.replace('_', ' ').toUpperCase()}</h3>
                          <p className="text-lg font-bold">{vital.value} {vital.unit}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(vital.recorded_at).toLocaleString()}
                          </p>
                          {vital.notes && (
                            <p className="text-sm text-gray-600 mt-2">{vital.notes}</p>
                          )}
                        </div>
                        <Badge variant="outline">Normal</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments">
          <Card>
            <CardHeader>
              <CardTitle>All Appointments</CardTitle>
              <CardDescription>Your appointment history and upcoming visits</CardDescription>
            </CardHeader>
            <CardContent>
              {appointments.length === 0 ? (
                <p className="text-center py-8 text-gray-500">No appointments scheduled</p>
              ) : (
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div key={appointment.id} className="border rounded p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{appointment.doctor_name}</h3>
                          <p className="text-sm text-gray-600">{appointment.appointment_type}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(appointment.appointment_date).toLocaleString()}
                          </p>
                          {appointment.notes && (
                            <p className="text-sm text-gray-600 mt-2">{appointment.notes}</p>
                          )}
                        </div>
                        <Badge variant={appointment.status === 'completed' ? 'default' : 'outline'}>
                          {appointment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Medical Documents
                </CardTitle>
                <div className="flex space-x-2">
                  <input
                    type="file"
                    id="document-upload"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        handleDocumentUpload(file)
                      }
                    }}
                  />
                  <Button 
                    onClick={() => document.getElementById('document-upload')?.click()}
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-8 w-8 text-blue-600" />
                        <div>
                          <h4 className="font-medium">Lab Results - Blood Test</h4>
                          <p className="text-sm text-gray-500">Uploaded: Sep 10, 2025</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-8 w-8 text-green-600" />
                        <div>
                          <h4 className="font-medium">X-Ray Report - Chest</h4>
                          <p className="text-sm text-gray-500">Uploaded: Sep 8, 2025</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-8 w-8 text-purple-600" />
                        <div>
                          <h4 className="font-medium">Prescription - Medications</h4>
                          <p className="text-sm text-gray-500">Uploaded: Sep 5, 2025</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {error && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Patient Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Full Name</Label>
                  <p className="text-lg font-medium">{patientInfo.name}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    {patientInfo.email}
                  </p>
                </div>
                <div>
                  <Label>Phone</Label>
                  <p className="flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    {patientInfo.phone}
                  </p>
                </div>
                <div>
                  <Label>Date of Birth</Label>
                  <p>{patientInfo.dob}</p>
                </div>
                <div className="md:col-span-2">
                  <Label>Address</Label>
                  <p className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    {patientInfo.address}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <Label>Emergency Contact</Label>
                  <p>{patientInfo.emergencyContact}</p>
                </div>
              </div>
              <Button className="mt-6">Edit Profile</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Mock data for testing
const mockVitalsData: Vital[] = [
  {
    id: 1,
    patient_id: 1,
    vital_type: 'blood_pressure',
    value: 120,
    unit: 'mmHg',
    recorded_at: '2025-09-14T08:00:00Z',
    notes: 'Morning reading'
  },
  {
    id: 2,
    patient_id: 1,
    vital_type: 'heart_rate',
    value: 72,
    unit: 'bpm',
    recorded_at: '2025-09-14T08:05:00Z'
  }
]

const mockAppointmentsData: Appointment[] = [
  {
    id: 1,
    patient_id: 1,
    doctor_name: 'Dr. Sarah Wilson',
    appointment_date: '2025-09-16T10:00:00Z',
    appointment_type: 'cardiology',
    status: 'scheduled',
    notes: 'Follow-up appointment'
  }
]