'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  Heart, 
  Activity, 
  Calendar, 
  FileText, 
  Bell, 
  LogOut, 
  Plus,
  TrendingUp,
  TrendingDown,
  Thermometer,
  Weight,
  Timer,
  Pill,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Phone,
  Upload
} from 'lucide-react'

interface VitalRecord {
  id: number
  type: string
  value: number
  unit: string
  recordedAt: string
  status: 'normal' | 'warning' | 'critical'
}

interface Appointment {
  id: number
  doctorName: string
  specialty: string
  date: string
  time: string
  type: 'consultation' | 'follow-up' | 'telehealth'
  status: 'scheduled' | 'completed' | 'cancelled'
}

interface Medication {
  id: number
  name: string
  dosage: string
  frequency: string
  timeToTake: string
  taken: boolean
}

interface CarePlan {
  id: number
  title: string
  progress: number
  dueDate: string
  tasks: {
    id: number
    description: string
    completed: boolean
  }[]
}

// Mock data
const mockVitals: VitalRecord[] = [
  { id: 1, type: 'Blood Pressure Systolic', value: 120, unit: 'mmHg', recordedAt: '2025-09-14 08:00', status: 'normal' },
  { id: 2, type: 'Blood Pressure Diastolic', value: 80, unit: 'mmHg', recordedAt: '2025-09-14 08:00', status: 'normal' },
  { id: 3, type: 'Heart Rate', value: 72, unit: 'bpm', recordedAt: '2025-09-14 08:00', status: 'normal' },
  { id: 4, type: 'Weight', value: 175, unit: 'lbs', recordedAt: '2025-09-14 07:30', status: 'normal' },
  { id: 5, type: 'Temperature', value: 98.6, unit: '°F', recordedAt: '2025-09-14 07:30', status: 'normal' },
]

const mockAppointments: Appointment[] = [
  {
    id: 1,
    doctorName: 'Dr. Sarah Wilson',
    specialty: 'Cardiology',
    date: '2025-09-16',
    time: '10:00 AM',
    type: 'consultation',
    status: 'scheduled'
  },
  {
    id: 2,
    doctorName: 'Dr. Michael Chen',
    specialty: 'Internal Medicine',
    date: '2025-09-20',
    time: '2:30 PM',
    type: 'follow-up',
    status: 'scheduled'
  }
]

const mockMedications: Medication[] = [
  {
    id: 1,
    name: 'Lisinopril',
    dosage: '10mg',
    frequency: 'Once daily',
    timeToTake: '08:00 AM',
    taken: true
  },
  {
    id: 2,
    name: 'Metformin',
    dosage: '500mg',
    frequency: 'Twice daily',
    timeToTake: '12:00 PM',
    taken: false
  },
  {
    id: 3,
    name: 'Atorvastatin',
    dosage: '20mg',
    frequency: 'Once daily',
    timeToTake: '08:00 PM',
    taken: false
  }
]

const mockCarePlans: CarePlan[] = [
  {
    id: 1,
    title: 'Diabetes Management Plan',
    progress: 75,
    dueDate: '2025-10-15',
    tasks: [
      { id: 1, description: 'Check blood glucose twice daily', completed: true },
      { id: 2, description: 'Take Metformin as prescribed', completed: true },
      { id: 3, description: 'Exercise for 30 minutes daily', completed: false },
      { id: 4, description: 'Follow low-carb diet plan', completed: true },
    ]
  },
  {
    id: 2,
    title: 'Hypertension Monitoring',
    progress: 60,
    dueDate: '2025-11-01',
    tasks: [
      { id: 5, description: 'Monitor blood pressure daily', completed: true },
      { id: 6, description: 'Reduce sodium intake', completed: false },
      { id: 7, description: 'Take prescribed medications', completed: true },
    ]
  }
]

export default function PatientDashboard() {
  const [user, setUser] = useState<any>(null)
  const [vitals, setVitals] = useState<VitalRecord[]>(mockVitals)
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments)
  const [medications, setMedications] = useState<Medication[]>(mockMedications)
  const [carePlans, setCarePlans] = useState<CarePlan[]>(mockCarePlans)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      router.push('/auth/login')
      return
    }
    
    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== 'patient') {
      router.push('/auth/login')
      return
    }
    
    setUser(parsedUser)
    
    // Load patient dashboard data
    loadDashboardData(token)
  }, [router])

  const loadDashboardData = async (token: string) => {
    try {
      // In a real app, you would make API calls here
      // const response = await fetch('/api/v1/patients/dashboard', {
      //   headers: { Authorization: `Bearer ${token}` }
      // })
      // const data = await response.json()
      
      // For now, we'll use mock data
      setLoading(false)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

  const markMedicationTaken = (medicationId: number) => {
    setMedications(medications.map(med => 
      med.id === medicationId ? { ...med, taken: true } : med
    ))
  }

  const toggleCarePlanTask = (carePlanId: number, taskId: number) => {
    setCarePlans(carePlans.map(plan => {
      if (plan.id === carePlanId) {
        const updatedTasks = plan.tasks.map(task => 
          task.id === taskId ? { ...task, completed: !task.completed } : task
        )
        const completedTasks = updatedTasks.filter(task => task.completed).length
        const progress = (completedTasks / updatedTasks.length) * 100
        
        return { ...plan, tasks: updatedTasks, progress }
      }
      return plan
    }))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'normal': return <Badge className="bg-green-500 text-white">Normal</Badge>
      case 'warning': return <Badge className="bg-yellow-500 text-white">Warning</Badge>
      case 'critical': return <Badge className="bg-red-500 text-white">Critical</Badge>
      default: return <Badge variant="outline">Unknown</Badge>
    }
  }

  const pendingMedications = medications.filter(med => !med.taken).length
  const upcomingAppointments = appointments.filter(apt => apt.status === 'scheduled').length
  const activeTasks = carePlans.reduce((total, plan) => total + plan.tasks.filter(task => !task.completed).length, 0)

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading your health data...</div>
  }

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-red-500 mr-2" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">MedIntel Healthcare</h1>
                <p className="text-sm text-gray-600">Welcome back, {user.full_name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Bell className="h-6 w-6 text-gray-600" />
                {(pendingMedications + upcomingAppointments) > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs">
                    {pendingMedications + upcomingAppointments}
                  </Badge>
                )}
              </div>
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Health Alerts */}
        {pendingMedications > 0 && (
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              You have {pendingMedications} pending medication{pendingMedications > 1 ? 's' : ''} to take today.
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Medications</CardTitle>
              <Pill className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{medications.filter(med => med.taken).length}/{medications.length}</div>
              <p className="text-xs text-muted-foreground">medications taken</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingAppointments}</div>
              <p className="text-xs text-muted-foreground">scheduled</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Care Plan Progress</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(carePlans.reduce((avg, plan) => avg + plan.progress, 0) / carePlans.length)}%
              </div>
              <p className="text-xs text-muted-foreground">average completion</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
              <Timer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeTasks}</div>
              <p className="text-xs text-muted-foreground">pending tasks</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="vitals">Vitals</TabsTrigger>
            <TabsTrigger value="medications">Medications</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="care-plans">Care Plans</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Vitals */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Vitals</CardTitle>
                  <CardDescription>Your latest health measurements</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {vitals.slice(0, 4).map((vital) => (
                    <div key={vital.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Activity className="h-5 w-5 text-blue-600" />
                        <div>
                          <div className="font-medium text-sm">{vital.type}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(vital.recordedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold">{vital.value} {vital.unit}</span>
                        {getStatusBadge(vital.status)}
                      </div>
                    </div>
                  ))}
                  <Link href="/patient/vitals">
                    <Button className="w-full" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Record New Vitals
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks and activities</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/patient/vitals">
                    <Button className="w-full justify-start" variant="outline">
                      <Activity className="h-4 w-4 mr-2" />
                      Record Vitals
                    </Button>
                  </Link>
                  <Link href="/patient/upload">
                    <Button className="w-full justify-start" variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Documents
                    </Button>
                  </Link>
                  <Link href="/patient/appointments">
                    <Button className="w-full justify-start" variant="outline">
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Appointment
                    </Button>
                  </Link>
                  <Link href="/patient/profile">
                    <Button className="w-full justify-start" variant="outline">
                      <User className="h-4 w-4 mr-2" />
                      Update Profile
                    </Button>
                  </Link>
                  <Button className="w-full justify-start" variant="outline">
                    <Phone className="h-4 w-4 mr-2" />
                    Contact Support
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Vitals Tab */}
          <TabsContent value="vitals" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Vital Signs History</CardTitle>
                    <CardDescription>Track your health measurements over time</CardDescription>
                  </div>
                  <Link href="/patient/vitals">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Vitals
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {vitals.map((vital) => (
                    <div key={vital.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <Activity className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">{vital.type}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(vital.recordedAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-lg font-bold">{vital.value} {vital.unit}</span>
                        {getStatusBadge(vital.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Medications Tab */}
          <TabsContent value="medications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Today's Medications</CardTitle>
                <CardDescription>Keep track of your daily medications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {medications.map((medication) => (
                    <div key={medication.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${medication.taken ? 'bg-green-100' : 'bg-orange-100'}`}>
                          <Pill className={`h-4 w-4 ${medication.taken ? 'text-green-600' : 'text-orange-600'}`} />
                        </div>
                        <div>
                          <div className="font-medium">{medication.name}</div>
                          <div className="text-sm text-gray-500">
                            {medication.dosage} - {medication.frequency}
                          </div>
                          <div className="text-sm text-gray-500">Take at {medication.timeToTake}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {medication.taken ? (
                          <Badge className="bg-green-500 text-white">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Taken
                          </Badge>
                        ) : (
                          <Button 
                            size="sm"
                            onClick={() => markMedicationTaken(medication.id)}
                          >
                            Mark as Taken
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Upcoming Appointments</CardTitle>
                    <CardDescription>Your scheduled healthcare appointments</CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule New
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <Calendar className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">{appointment.doctorName}</div>
                          <div className="text-sm text-gray-500">{appointment.specialty}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline">{appointment.type}</Badge>
                        <Badge className={
                          appointment.status === 'scheduled' ? 'bg-blue-500 text-white' :
                          appointment.status === 'completed' ? 'bg-green-500 text-white' :
                          'bg-red-500 text-white'
                        }>
                          {appointment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Care Plans Tab */}
          <TabsContent value="care-plans" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {carePlans.map((plan) => (
                <Card key={plan.id}>
                  <CardHeader>
                    <CardTitle>{plan.title}</CardTitle>
                    <CardDescription>Due: {new Date(plan.dueDate).toLocaleDateString()}</CardDescription>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span>{Math.round(plan.progress)}%</span>
                      </div>
                      <Progress value={plan.progress} className="h-2" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {plan.tasks.map((task) => (
                        <div key={task.id} className="flex items-center space-x-3">
                          <button
                            onClick={() => toggleCarePlanTask(plan.id, task.id)}
                            className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center ${
                              task.completed 
                                ? 'bg-green-500 border-green-500 text-white' 
                                : 'border-gray-300 hover:border-green-500'
                            }`}
                          >
                            {task.completed && <CheckCircle className="h-3 w-3" />}
                          </button>
                          <span className={`text-sm ${task.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                            {task.description}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}