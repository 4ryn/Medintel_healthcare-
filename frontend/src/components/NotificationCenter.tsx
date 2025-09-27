'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { 
  Bell, 
  Settings, 
  Eye, 
  Trash2, 
  Check, 
  X, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  Clock,
  User,
  Calendar,
  Pill,
  Activity,
  FileText,
  Video,
  MessageSquare,
  Heart,
  TrendingUp,
  Zap,
  Filter,
  Search,
  MoreHorizontal,
  Pin,
  Archive,
  Star,
  Volume2,
  VolumeX,
  Smartphone,
  Mail,
  Users,
  RefreshCw,
  Monitor
} from 'lucide-react'
import { api } from '@/lib/api'

interface Notification {
  id: string
  type: 'appointment' | 'medication' | 'test_result' | 'vital_alert' | 'system' | 'message' | 'reminder' | 'health_alert'
  title: string
  message: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  read: boolean
  starred: boolean
  pinned: boolean
  archived: boolean
  created_at: string
  updated_at: string
  scheduled_for?: string
  action_required?: boolean
  sender?: {
    id: string
    name: string
    role: string
    avatar?: string
  }
  action_buttons?: {
    label: string
    action: string
    variant?: 'default' | 'outline' | 'destructive'
  }[]
  metadata?: Record<string, any>
}

interface NotificationSettings {
  email_notifications: boolean
  push_notifications: boolean
  sms_notifications: boolean
  notification_sound: boolean
  quiet_hours: {
    enabled: boolean
    start_time: string
    end_time: string
  }
  types: {
    appointments: boolean
    medications: boolean
    test_results: boolean
    vital_alerts: boolean
    messages: boolean
    reminders: boolean
  }
  medication_reminders: boolean
  appointment_reminders: boolean
  health_alerts: boolean
  system_updates: boolean
  reminder_frequency: string
  quiet_hours_enabled: boolean
  quiet_hours_start: string
  quiet_hours_end: string
}

// Mock data
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'medication',
    title: 'Medication Reminder',
    message: 'Time to take your Lisinopril (10mg). Take with water after breakfast.',
    priority: 'high',
    read: false,
    starred: false,
    pinned: false,
    archived: false,
    created_at: '2025-09-14T08:00:00Z',
    updated_at: '2025-09-14T08:00:00Z',
    scheduled_for: '2025-09-14T08:00:00Z',
    action_required: true,
    metadata: { medication: 'Lisinopril', dosage: '10mg', instructions: 'Take with water after breakfast' }
  },
  {
    id: '2',
    type: 'appointment',
    title: 'Upcoming Appointment',
    message: 'Your appointment with Dr. Sarah Wilson is tomorrow at 10:00 AM. Please arrive 15 minutes early.',
    priority: 'medium',
    read: false,
    starred: false,
    pinned: false,
    archived: false,
    created_at: '2025-09-13T15:00:00Z',
    updated_at: '2025-09-13T15:00:00Z',
    scheduled_for: '2025-09-16T10:00:00Z',
    action_required: false,
    metadata: { doctor: 'Dr. Sarah Wilson', appointment_time: '2025-09-16T10:00:00Z', location: 'Cardiology Clinic' }
  },
  {
    id: '3',
    type: 'health_alert',
    title: 'Blood Pressure Alert',
    message: 'Your recent blood pressure readings are elevated. Consider contacting your healthcare provider.',
    priority: 'urgent',
    read: false,
    starred: false,
    pinned: false,
    archived: false,
    created_at: '2025-09-14T07:30:00Z',
    updated_at: '2025-09-14T07:30:00Z',
    action_required: true,
    metadata: { vital_type: 'blood_pressure', value: 145, threshold: 140 }
  },
  {
    id: '4',
    type: 'reminder',
    title: 'Vitals Recording',
    message: 'Don\'t forget to record your daily vitals. It\'s been 2 days since your last entry.',
    priority: 'low',
    read: true,
    starred: false,
    pinned: false,
    archived: false,
    created_at: '2025-09-13T09:00:00Z',
    updated_at: '2025-09-13T09:00:00Z',
    action_required: false,
    metadata: { last_recorded: '2025-09-12T08:00:00Z' }
  },
  {
    id: '5',
    type: 'system',
    title: 'System Update',
    message: 'New AI health insights are now available. Check your dashboard for personalized recommendations.',
    priority: 'low',
    read: true,
    starred: false,
    pinned: false,
    archived: false,
    created_at: '2025-09-12T14:00:00Z',
    updated_at: '2025-09-12T14:00:00Z',
    action_required: false,
    metadata: { update_type: 'ai_insights', version: '2.1.0' }
  }
]

const mockSettings: NotificationSettings = {
  push_notifications: true,
  email_notifications: true,
  sms_notifications: false,
  notification_sound: true,
  quiet_hours: {
    enabled: true,
    start_time: '22:00',
    end_time: '07:00'
  },
  types: {
    appointments: true,
    medications: true,
    test_results: true,
    vital_alerts: true,
    messages: true,
    reminders: true
  },
  medication_reminders: true,
  appointment_reminders: true,
  health_alerts: true,
  system_updates: false,
  reminder_frequency: '30_minutes',
  quiet_hours_enabled: true,
  quiet_hours_start: '22:00',
  quiet_hours_end: '07:00'
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [settings, setSettings] = useState<NotificationSettings>(mockSettings)
  const [filter, setFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showSettings, setShowSettings] = useState(false)

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'medication': return <Pill className="h-5 w-5 text-green-600" />
      case 'appointment': return <Calendar className="h-5 w-5 text-blue-600" />
      case 'health_alert': return <AlertTriangle className="h-5 w-5 text-red-600" />
      case 'reminder': return <Clock className="h-5 w-5 text-yellow-600" />
      case 'system': return <Settings className="h-5 w-5 text-gray-600" />
      default: return <Bell className="h-5 w-5 text-gray-600" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-blue-100 text-blue-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'urgent': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === 'all' || notification.type === filter || 
                          (filter === 'unread' && !notification.read) ||
                          (filter === 'action_required' && notification.action_required)
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const unreadCount = notifications.filter(n => !n.read).length
  const actionRequiredCount = notifications.filter(n => n.action_required && !n.read).length

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id))
  }

  const updateSettings = (key: keyof NotificationSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notification Center</h1>
          <p className="text-gray-600">Manage your health alerts and reminders</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button onClick={markAllAsRead}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{unreadCount}</div>
            <p className="text-xs text-muted-foreground">notifications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Action Required</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{actionRequiredCount}</div>
            <p className="text-xs text-muted-foreground">urgent items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Reminders</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {notifications.filter(n => 
                n.type === 'medication' || n.type === 'reminder'
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">scheduled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Settings Status</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {settings.push_notifications ? (
                <Volume2 className="h-5 w-5 text-green-600" />
              ) : (
                <VolumeX className="h-5 w-5 text-red-600" />
              )}
              <span className="text-sm">
                {settings.push_notifications ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">notifications</p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts */}
      {actionRequiredCount > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Action Required:</strong> You have {actionRequiredCount} urgent notification(s) that need your attention.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs value={showSettings ? 'settings' : 'notifications'} className="space-y-6">
        <TabsList>
          <TabsTrigger value="notifications" onClick={() => setShowSettings(false)}>
            Notifications ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="settings" onClick={() => setShowSettings(true)}>
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <CardTitle>All Notifications</CardTitle>
                <div className="flex space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search notifications..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Notifications</SelectItem>
                      <SelectItem value="unread">Unread</SelectItem>
                      <SelectItem value="action_required">Action Required</SelectItem>
                      <SelectItem value="medication">Medications</SelectItem>
                      <SelectItem value="appointment">Appointments</SelectItem>
                      <SelectItem value="health_alert">Health Alerts</SelectItem>
                      <SelectItem value="reminder">Reminders</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {searchTerm ? 'No notifications match your search' : 'No notifications found'}
                  </div>
                ) : (
                  filteredNotifications.map(notification => (
                    <NotificationCard 
                      key={notification.id} 
                      notification={notification}
                      onMarkAsRead={markAsRead}
                      onDelete={deleteNotification}
                    />
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Configure how and when you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Delivery Methods */}
              <div>
                <h3 className="text-lg font-medium mb-4">Delivery Methods</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Smartphone className="h-5 w-5 text-blue-600" />
                      <div>
                        <Label>Push Notifications</Label>
                        <p className="text-sm text-gray-500">Receive notifications on your device</p>
                      </div>
                    </div>
                    <Switch 
                      checked={settings.push_notifications}
                      onCheckedChange={(checked) => updateSettings('push_notifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-green-600" />
                      <div>
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-gray-500">Receive notifications via email</p>
                      </div>
                    </div>
                    <Switch 
                      checked={settings.email_notifications}
                      onCheckedChange={(checked) => updateSettings('email_notifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <MessageSquare className="h-5 w-5 text-purple-600" />
                      <div>
                        <Label>SMS Notifications</Label>
                        <p className="text-sm text-gray-500">Receive notifications via text message</p>
                      </div>
                    </div>
                    <Switch 
                      checked={settings.sms_notifications}
                      onCheckedChange={(checked) => updateSettings('sms_notifications', checked)}
                    />
                  </div>
                </div>
              </div>

              {/* Notification Types */}
              <div>
                <h3 className="text-lg font-medium mb-4">Notification Types</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Pill className="h-5 w-5 text-green-600" />
                      <div>
                        <Label>Medication Reminders</Label>
                        <p className="text-sm text-gray-500">Reminders to take medications</p>
                      </div>
                    </div>
                    <Switch 
                      checked={settings.medication_reminders}
                      onCheckedChange={(checked) => updateSettings('medication_reminders', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <div>
                        <Label>Appointment Reminders</Label>
                        <p className="text-sm text-gray-500">Reminders for upcoming appointments</p>
                      </div>
                    </div>
                    <Switch 
                      checked={settings.appointment_reminders}
                      onCheckedChange={(checked) => updateSettings('appointment_reminders', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Heart className="h-5 w-5 text-red-600" />
                      <div>
                        <Label>Health Alerts</Label>
                        <p className="text-sm text-gray-500">Critical health notifications</p>
                      </div>
                    </div>
                    <Switch 
                      checked={settings.health_alerts}
                      onCheckedChange={(checked) => updateSettings('health_alerts', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Monitor className="h-5 w-5 text-gray-600" />
                      <div>
                        <Label>System Updates</Label>
                        <p className="text-sm text-gray-500">App updates and new features</p>
                      </div>
                    </div>
                    <Switch 
                      checked={settings.system_updates}
                      onCheckedChange={(checked) => updateSettings('system_updates', checked)}
                    />
                  </div>
                </div>
              </div>

              {/* Timing Settings */}
              <div>
                <h3 className="text-lg font-medium mb-4">Timing & Frequency</h3>
                <div className="space-y-4">
                  <div>
                    <Label>Reminder Frequency</Label>
                    <Select value={settings.reminder_frequency} onValueChange={(value) => updateSettings('reminder_frequency', value)}>
                      <SelectTrigger className="w-full mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15_minutes">Every 15 minutes</SelectItem>
                        <SelectItem value="30_minutes">Every 30 minutes</SelectItem>
                        <SelectItem value="1_hour">Every hour</SelectItem>
                        <SelectItem value="2_hours">Every 2 hours</SelectItem>
                        <SelectItem value="once">Once only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Quiet Hours</Label>
                      <p className="text-sm text-gray-500">Disable notifications during specified hours</p>
                    </div>
                    <Switch 
                      checked={settings.quiet_hours_enabled}
                      onCheckedChange={(checked) => updateSettings('quiet_hours_enabled', checked)}
                    />
                  </div>

                  {settings.quiet_hours_enabled && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Start Time</Label>
                        <Input
                          type="time"
                          value={settings.quiet_hours_start}
                          onChange={(e) => updateSettings('quiet_hours_start', e.target.value)}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label>End Time</Label>
                        <Input
                          type="time"
                          value={settings.quiet_hours_end}
                          onChange={(e) => updateSettings('quiet_hours_end', e.target.value)}
                          className="mt-2"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button className="w-full">
                  Save Notification Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function NotificationCard({ 
  notification, 
  onMarkAsRead, 
  onDelete 
}: { 
  notification: Notification
  onMarkAsRead: (id: string) => void
  onDelete: (id: string) => void
}) {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'medication': return <Pill className="h-5 w-5 text-green-600" />
      case 'appointment': return <Calendar className="h-5 w-5 text-blue-600" />
      case 'health_alert': return <AlertTriangle className="h-5 w-5 text-red-600" />
      case 'reminder': return <Clock className="h-5 w-5 text-yellow-600" />
      case 'system': return <Settings className="h-5 w-5 text-gray-600" />
      default: return <Bell className="h-5 w-5 text-gray-600" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-blue-100 text-blue-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'urgent': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className={`border rounded-lg p-4 ${notification.read ? 'bg-gray-50' : 'bg-white'} ${notification.priority === 'urgent' ? 'border-red-200' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className="p-2 bg-gray-100 rounded-full">
            {getNotificationIcon(notification.type)}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className={`font-medium ${notification.read ? 'text-gray-600' : 'text-gray-900'}`}>
                {notification.title}
              </h3>
              <Badge className={getPriorityColor(notification.priority)}>
                {notification.priority}
              </Badge>
              {notification.action_required && (
                <Badge variant="outline" className="text-red-600 border-red-600">
                  Action Required
                </Badge>
              )}
              {!notification.read && (
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              )}
            </div>
            <p className={`text-sm ${notification.read ? 'text-gray-500' : 'text-gray-700'} mb-2`}>
              {notification.message}
            </p>
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span>{new Date(notification.created_at).toLocaleString()}</span>
              {notification.scheduled_for && (
                <span>Scheduled: {new Date(notification.scheduled_for).toLocaleString()}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          {!notification.read && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onMarkAsRead(notification.id)}
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
          )}
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onDelete(notification.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}