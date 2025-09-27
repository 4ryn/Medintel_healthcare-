'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Bell, 
  Calendar, 
  Heart, 
  Users, 
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Brain,
  Stethoscope,
  Pill,
  UserCheck,
  Settings
} from 'lucide-react'

// Import all our major components
import AppointmentScheduler from '@/components/AppointmentScheduler'
import VitalsMonitoring from '@/components/VitalsMonitoring'
import AIHealthInsights from '@/components/AIHealthInsights'
import NotificationCenter from '@/components/NotificationCenter'
import PatientDashboard from '@/components/PatientDashboard'
import ClinicianDashboard from '@/components/ClinicianDashboard'

export default function ComprehensiveDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [userRole, setUserRole] = useState<'patient' | 'clinician'>('patient')

  // Mock data for quick stats
  const quickStats = {
    totalPatients: 1247,
    todayAppointments: 18,
    criticalAlerts: 3,
    avgVitals: 94,
    unreadNotifications: 7,
    completedTasks: 85
  }

  const recentActivities = [
    {
      id: 1,
      type: 'appointment',
      title: 'Appointment with Dr. Sarah Wilson',
      time: '10:00 AM',
      status: 'upcoming',
      icon: Calendar
    },
    {
      id: 2,
      type: 'vitals',
      title: 'Blood pressure recorded',
      time: '8:30 AM',
      status: 'completed',
      icon: Heart
    },
    {
      id: 3,
      type: 'medication',
      title: 'Medication reminder: Lisinopril',
      time: '8:00 AM',
      status: 'completed',
      icon: Pill
    },
    {
      id: 4,
      type: 'alert',
      title: 'AI Health Insight: Exercise recommendation',
      time: '7:45 AM',
      status: 'new',
      icon: Brain
    }
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'appointment': return Calendar
      case 'vitals': return Heart
      case 'medication': return Pill
      case 'alert': return Brain
      default: return Activity
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'upcoming': return 'bg-blue-100 text-blue-800'
      case 'new': return 'bg-purple-100 text-purple-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">MedIntel Healthcare</h1>
              <p className="text-gray-600">Comprehensive Healthcare Management Platform</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <UserCheck className="h-5 w-5 text-blue-600" />
                <select 
                  value={userRole} 
                  onChange={(e) => setUserRole(e.target.value as 'patient' | 'clinician')}
                  className="border rounded-md px-3 py-1 text-sm"
                >
                  <option value="patient">Patient View</option>
                  <option value="clinician">Clinician View</option>
                </select>
              </div>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="dashboard">
              {userRole === 'patient' ? 'Patient Portal' : 'Clinician Portal'}
            </TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="vitals">Vitals</TabsTrigger>
            <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
            <TabsTrigger value="notifications">
              Notifications
              {quickStats.unreadNotifications > 0 && (
                <Badge variant="destructive" className="ml-2 text-xs">
                  {quickStats.unreadNotifications}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {userRole === 'clinician' ? 'Total Patients' : 'Health Score'}
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {userRole === 'clinician' ? quickStats.totalPatients : `${quickStats.avgVitals}%`}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {userRole === 'clinician' ? 'active patients' : 'overall health'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {userRole === 'clinician' ? "Today's Appointments" : 'Next Appointment'}
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {userRole === 'clinician' ? quickStats.todayAppointments : 'Tomorrow'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {userRole === 'clinician' ? 'scheduled today' : '10:00 AM'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{quickStats.criticalAlerts}</div>
                  <p className="text-xs text-muted-foreground">require attention</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Vitals Status</CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{quickStats.avgVitals}%</div>
                  <p className="text-xs text-muted-foreground">within normal range</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Notifications</CardTitle>
                  <Bell className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">{quickStats.unreadNotifications}</div>
                  <p className="text-xs text-muted-foreground">unread messages</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tasks Complete</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-indigo-600">{quickStats.completedTasks}%</div>
                  <p className="text-xs text-muted-foreground">this week</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Your latest healthcare activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivities.map((activity) => {
                      const IconComponent = getActivityIcon(activity.type)
                      return (
                        <div key={activity.id} className="flex items-center space-x-3">
                          <div className="p-2 bg-gray-100 rounded-full">
                            <IconComponent className="h-4 w-4 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{activity.title}</p>
                            <p className="text-xs text-gray-500">{activity.time}</p>
                          </div>
                          <Badge className={getStatusColor(activity.status)}>
                            {activity.status}
                          </Badge>
                        </div>
                      )
                    })}
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    View All Activity
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription>Frequently used features</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col space-y-2"
                      onClick={() => setActiveTab('appointments')}
                    >
                      <Calendar className="h-6 w-6" />
                      <span className="text-xs">Schedule Appointment</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col space-y-2"
                      onClick={() => setActiveTab('vitals')}
                    >
                      <Heart className="h-6 w-6" />
                      <span className="text-xs">Record Vitals</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col space-y-2"
                      onClick={() => setActiveTab('ai-insights')}
                    >
                      <Brain className="h-6 w-6" />
                      <span className="text-xs">AI Insights</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col space-y-2"
                      onClick={() => setActiveTab('notifications')}
                    >
                      <Bell className="h-6 w-6" />
                      <span className="text-xs">Notifications</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Health Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Stethoscope className="h-5 w-5 mr-2" />
                  Health Summary
                </CardTitle>
                <CardDescription>
                  {userRole === 'clinician' ? 'Patient overview and trends' : 'Your current health status'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">Normal</div>
                    <p className="text-sm text-gray-600">Blood Pressure</p>
                    <p className="text-xs text-gray-500">120/80 mmHg</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">Good</div>
                    <p className="text-sm text-gray-600">Heart Rate</p>
                    <p className="text-xs text-gray-500">72 bpm</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">Stable</div>
                    <p className="text-sm text-gray-600">Weight</p>
                    <p className="text-xs text-gray-500">150 lbs</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            {userRole === 'patient' ? (
              <PatientDashboard />
            ) : (
              <ClinicianDashboard />
            )}
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments">
            <AppointmentScheduler />
          </TabsContent>

          {/* Vitals Tab */}
          <TabsContent value="vitals">
            <VitalsMonitoring />
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="ai-insights">
            <AIHealthInsights />
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <NotificationCenter />
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Healthcare Reports
                </CardTitle>
                <CardDescription>Generate and view detailed health reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Button variant="outline" className="h-32 flex-col space-y-3">
                    <Heart className="h-8 w-8 text-red-500" />
                    <div className="text-center">
                      <div className="font-medium">Vitals Report</div>
                      <div className="text-xs text-gray-500">Last 30 days</div>
                    </div>
                  </Button>
                  
                  <Button variant="outline" className="h-32 flex-col space-y-3">
                    <Calendar className="h-8 w-8 text-blue-500" />
                    <div className="text-center">
                      <div className="font-medium">Appointment History</div>
                      <div className="text-xs text-gray-500">Past visits</div>
                    </div>
                  </Button>
                  
                  <Button variant="outline" className="h-32 flex-col space-y-3">
                    <Brain className="h-8 w-8 text-purple-500" />
                    <div className="text-center">
                      <div className="font-medium">AI Analysis</div>
                      <div className="text-xs text-gray-500">Health insights</div>
                    </div>
                  </Button>
                  
                  <Button variant="outline" className="h-32 flex-col space-y-3">
                    <Pill className="h-8 w-8 text-green-500" />
                    <div className="text-center">
                      <div className="font-medium">Medication Report</div>
                      <div className="text-xs text-gray-500">Adherence tracking</div>
                    </div>
                  </Button>
                  
                  <Button variant="outline" className="h-32 flex-col space-y-3">
                    <TrendingUp className="h-8 w-8 text-indigo-500" />
                    <div className="text-center">
                      <div className="font-medium">Progress Report</div>
                      <div className="text-xs text-gray-500">Health trends</div>
                    </div>
                  </Button>
                  
                  <Button variant="outline" className="h-32 flex-col space-y-3">
                    <FileText className="h-8 w-8 text-gray-500" />
                    <div className="text-center">
                      <div className="font-medium">Comprehensive Report</div>
                      <div className="text-xs text-gray-500">Full health summary</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}