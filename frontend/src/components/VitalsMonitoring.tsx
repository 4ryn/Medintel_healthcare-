'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Activity, 
  Heart, 
  Thermometer, 
  Weight, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Plus,
  History,
  Target,
  Zap,
  BarChart3
} from 'lucide-react'

interface VitalReading {
  id: number
  type: string
  value: number
  unit: string
  recordedAt: string
  status: 'normal' | 'warning' | 'critical'
  notes?: string
  source: 'manual' | 'device' | 'wearable'
}

interface VitalRange {
  type: string
  min: number
  max: number
  unit: string
  criticalLow: number
  criticalHigh: number
}

interface HealthTrend {
  type: string
  direction: 'up' | 'down' | 'stable'
  percentage: number
  period: string
}

// Mock vital ranges
const vitalRanges: VitalRange[] = [
  { type: 'blood_pressure_systolic', min: 90, max: 140, unit: 'mmHg', criticalLow: 70, criticalHigh: 180 },
  { type: 'blood_pressure_diastolic', min: 60, max: 90, unit: 'mmHg', criticalLow: 40, criticalHigh: 120 },
  { type: 'heart_rate', min: 60, max: 100, unit: 'bpm', criticalLow: 40, criticalHigh: 150 },
  { type: 'temperature', min: 96.8, max: 99.5, unit: '°F', criticalLow: 95, criticalHigh: 104 },
  { type: 'weight', min: 0, max: 1000, unit: 'lbs', criticalLow: 0, criticalHigh: 1000 },
  { type: 'blood_glucose', min: 80, max: 140, unit: 'mg/dL', criticalLow: 50, criticalHigh: 250 },
  { type: 'oxygen_saturation', min: 95, max: 100, unit: '%', criticalLow: 85, criticalHigh: 100 }
]

// Mock data
const mockVitals: VitalReading[] = [
  {
    id: 1,
    type: 'blood_pressure_systolic',
    value: 125,
    unit: 'mmHg',
    recordedAt: '2025-09-14T08:00:00Z',
    status: 'normal',
    notes: 'Morning reading after medication',
    source: 'manual'
  },
  {
    id: 2,
    type: 'blood_pressure_diastolic',
    value: 82,
    unit: 'mmHg',
    recordedAt: '2025-09-14T08:00:00Z',
    status: 'normal',
    source: 'manual'
  },
  {
    id: 3,
    type: 'heart_rate',
    value: 75,
    unit: 'bpm',
    recordedAt: '2025-09-14T08:00:00Z',
    status: 'normal',
    source: 'wearable'
  },
  {
    id: 4,
    type: 'weight',
    value: 175,
    unit: 'lbs',
    recordedAt: '2025-09-14T07:30:00Z',
    status: 'normal',
    source: 'device'
  },
  {
    id: 5,
    type: 'temperature',
    value: 98.6,
    unit: '°F',
    recordedAt: '2025-09-14T07:30:00Z',
    status: 'normal',
    source: 'manual'
  }
]

const mockTrends: HealthTrend[] = [
  { type: 'blood_pressure_systolic', direction: 'down', percentage: 5.2, period: '7 days' },
  { type: 'heart_rate', direction: 'stable', percentage: 0.8, period: '7 days' },
  { type: 'weight', direction: 'down', percentage: 2.1, period: '30 days' },
  { type: 'blood_glucose', direction: 'up', percentage: 8.5, period: '7 days' }
]

export default function VitalsMonitoring() {
  const [vitals, setVitals] = useState<VitalReading[]>(mockVitals)
  const [trends, setTrends] = useState<HealthTrend[]>(mockTrends)
  const [isRecording, setIsRecording] = useState(false)
  const [newVital, setNewVital] = useState({
    type: '',
    value: '',
    notes: '',
    source: 'manual'
  })

  const getVitalIcon = (type: string) => {
    switch (type) {
      case 'blood_pressure_systolic':
      case 'blood_pressure_diastolic':
        return <Heart className="h-5 w-5" />
      case 'heart_rate':
        return <Activity className="h-5 w-5" />
      case 'temperature':
        return <Thermometer className="h-5 w-5" />
      case 'weight':
        return <Weight className="h-5 w-5" />
      default:
        return <Activity className="h-5 w-5" />
    }
  }

  const getVitalDisplayName = (type: string) => {
    const names: { [key: string]: string } = {
      'blood_pressure_systolic': 'Blood Pressure (Systolic)',
      'blood_pressure_diastolic': 'Blood Pressure (Diastolic)',
      'heart_rate': 'Heart Rate',
      'temperature': 'Temperature',
      'weight': 'Weight',
      'blood_glucose': 'Blood Glucose',
      'oxygen_saturation': 'Oxygen Saturation'
    }
    return names[type] || type
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'text-green-600 bg-green-100'
      case 'warning': return 'text-yellow-600 bg-yellow-100'
      case 'critical': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up': return <TrendingUp className="h-4 w-4 text-red-500" />
      case 'down': return <TrendingDown className="h-4 w-4 text-green-500" />
      case 'stable': return <Activity className="h-4 w-4 text-blue-500" />
      default: return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const analyzeVitalStatus = (type: string, value: number): 'normal' | 'warning' | 'critical' => {
    const range = vitalRanges.find(r => r.type === type)
    if (!range) return 'normal'

    if (value <= range.criticalLow || value >= range.criticalHigh) {
      return 'critical'
    } else if (value < range.min || value > range.max) {
      return 'warning'
    } else {
      return 'normal'
    }
  }

  const handleRecordVital = () => {
    if (!newVital.type || !newVital.value) return

    const value = parseFloat(newVital.value)
    const status = analyzeVitalStatus(newVital.type, value)
    const range = vitalRanges.find(r => r.type === newVital.type)

    const vitalReading: VitalReading = {
      id: Date.now(),
      type: newVital.type,
      value,
      unit: range?.unit || '',
      recordedAt: new Date().toISOString(),
      status,
      notes: newVital.notes,
      source: newVital.source as any
    }

    setVitals([vitalReading, ...vitals])
    setNewVital({ type: '', value: '', notes: '', source: 'manual' })
    setIsRecording(false)
  }

  const getLatestReading = (type: string) => {
    return vitals.filter(v => v.type === type).sort((a, b) => 
      new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
    )[0]
  }

  const getCriticalAlerts = () => {
    return vitals.filter(v => v.status === 'critical' && 
      new Date(v.recordedAt).getTime() > Date.now() - 24 * 60 * 60 * 1000 // Last 24 hours
    )
  }

  const criticalAlerts = getCriticalAlerts()

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vitals Monitoring</h1>
          <p className="text-gray-600">Track and monitor your health vitals in real-time</p>
        </div>
        <Button 
          onClick={() => setIsRecording(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Record Vitals
        </Button>
      </div>

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Critical Alert:</strong> {criticalAlerts.length} vital reading(s) require immediate attention.
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latest Readings</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vitals.length}</div>
            <p className="text-xs text-muted-foreground">total recorded</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Normal Range</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vitals.filter(v => v.status === 'normal').length}
            </div>
            <p className="text-xs text-muted-foreground">readings in range</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warnings</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {vitals.filter(v => v.status === 'warning').length}
            </div>
            <p className="text-xs text-muted-foreground">need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {vitals.filter(v => v.status === 'critical').length}
            </div>
            <p className="text-xs text-muted-foreground">urgent care needed</p>
          </CardContent>
        </Card>
      </div>

      {/* Record New Vital */}
      {isRecording && (
        <Card>
          <CardHeader>
            <CardTitle>Record New Vital</CardTitle>
            <CardDescription>Enter your latest vital sign reading</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="vital-type">Vital Type</Label>
                <Select value={newVital.type} onValueChange={(value) => setNewVital({...newVital, type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vital type" />
                  </SelectTrigger>
                  <SelectContent>
                    {vitalRanges.map(range => (
                      <SelectItem key={range.type} value={range.type}>
                        {getVitalDisplayName(range.type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="vital-value">Value</Label>
                <Input
                  placeholder="Enter value"
                  value={newVital.value}
                  onChange={(e) => setNewVital({...newVital, value: e.target.value})}
                  type="number"
                  step="0.1"
                />
              </div>

              <div>
                <Label htmlFor="vital-source">Source</Label>
                <Select value={newVital.source} onValueChange={(value) => setNewVital({...newVital, source: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual Entry</SelectItem>
                    <SelectItem value="device">Medical Device</SelectItem>
                    <SelectItem value="wearable">Wearable Device</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-1">
                <Label htmlFor="vital-notes">Notes (Optional)</Label>
                <Input
                  placeholder="Add notes..."
                  value={newVital.notes}
                  onChange={(e) => setNewVital({...newVital, notes: e.target.value})}
                />
              </div>
            </div>

            <div className="flex space-x-2 mt-4">
              <Button onClick={handleRecordVital}>
                Record Vital
              </Button>
              <Button variant="outline" onClick={() => setIsRecording(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs defaultValue="current" className="space-y-6">
        <TabsList>
          <TabsTrigger value="current">Current Status</TabsTrigger>
          <TabsTrigger value="trends">Trends & Analysis</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="alerts">Alerts & Thresholds</TabsTrigger>
        </TabsList>

        {/* Current Status */}
        <TabsContent value="current" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vitalRanges.map(range => {
              const latest = getLatestReading(range.type)
              return (
                <Card key={range.type}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {getVitalDisplayName(range.type)}
                    </CardTitle>
                    {getVitalIcon(range.type)}
                  </CardHeader>
                  <CardContent>
                    {latest ? (
                      <>
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-bold">
                            {latest.value} {latest.unit}
                          </span>
                          <Badge className={getStatusColor(latest.status)}>
                            {latest.status}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(latest.recordedAt).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Normal: {range.min}-{range.max} {range.unit}
                        </div>
                        {latest.notes && (
                          <div className="text-xs text-gray-600 mt-2 p-2 bg-gray-50 rounded">
                            {latest.notes}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-gray-500">
                        <div className="text-lg">No readings</div>
                        <div className="text-xs">
                          Normal: {range.min}-{range.max} {range.unit}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Trends & Analysis */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Health Trends</CardTitle>
                <CardDescription>Analysis of your vital sign patterns</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {trends.map(trend => (
                  <div key={trend.type} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getVitalIcon(trend.type)}
                      <div>
                        <div className="font-medium">{getVitalDisplayName(trend.type)}</div>
                        <div className="text-sm text-gray-500">Over {trend.period}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getTrendIcon(trend.direction)}
                      <span className="font-medium">
                        {trend.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Health Score</CardTitle>
                <CardDescription>Overall health assessment based on vitals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600">85</div>
                    <div className="text-sm text-gray-500">Health Score</div>
                  </div>
                  <Progress value={85} className="h-3" />
                  <div className="text-sm text-gray-600">
                    Your health metrics are looking good! Keep maintaining your current routine.
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Cardiovascular</span>
                      <span className="text-green-600">Excellent</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Weight Management</span>
                      <span className="text-blue-600">Good</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Blood Sugar</span>
                      <span className="text-yellow-600">Monitor</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* History */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Readings</CardTitle>
              <CardDescription>Your vital signs over the past week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vitals.slice(0, 10).map(vital => (
                  <div key={vital.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getVitalIcon(vital.type)}
                      <div>
                        <div className="font-medium">{getVitalDisplayName(vital.type)}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(vital.recordedAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="font-medium">
                        {vital.value} {vital.unit}
                      </span>
                      <Badge className={getStatusColor(vital.status)}>
                        {vital.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts & Thresholds */}
        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Alert Settings</CardTitle>
              <CardDescription>Configure thresholds for health monitoring alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {vitalRanges.map(range => (
                  <div key={range.type} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {getVitalIcon(range.type)}
                        <span className="font-medium">{getVitalDisplayName(range.type)}</span>
                      </div>
                      <span className="text-sm text-gray-500">{range.unit}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">Normal Range</div>
                        <div className="font-medium">{range.min} - {range.max}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Critical Thresholds</div>
                        <div className="font-medium text-red-600">
                          {'<'}{range.criticalLow} or {'>'}{range.criticalHigh}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}