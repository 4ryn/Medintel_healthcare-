'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Activity, Heart, Thermometer, Weight, Ruler, Clock, Save, TrendingUp, AlertCircle, Check } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface VitalRecord {
  id?: number
  type: string
  value: number
  unit: string
  recorded_at: string
  notes?: string
  status: 'normal' | 'warning' | 'critical'
}

interface VitalType {
  name: string
  unit: string
  icon: any
  normalRange: { min: number; max: number }
  warningRange: { min: number; max: number }
}

const vitalTypes: Record<string, VitalType> = {
  blood_pressure_systolic: {
    name: 'Blood Pressure (Systolic)',
    unit: 'mmHg',
    icon: Heart,
    normalRange: { min: 90, max: 120 },
    warningRange: { min: 121, max: 140 }
  },
  blood_pressure_diastolic: {
    name: 'Blood Pressure (Diastolic)',
    unit: 'mmHg',
    icon: Heart,
    normalRange: { min: 60, max: 80 },
    warningRange: { min: 81, max: 90 }
  },
  heart_rate: {
    name: 'Heart Rate',
    unit: 'bpm',
    icon: Activity,
    normalRange: { min: 60, max: 100 },
    warningRange: { min: 50, max: 120 }
  },
  temperature: {
    name: 'Temperature',
    unit: '°F',
    icon: Thermometer,
    normalRange: { min: 97.0, max: 99.5 },
    warningRange: { min: 96.0, max: 100.4 }
  },
  weight: {
    name: 'Weight',
    unit: 'lbs',
    icon: Weight,
    normalRange: { min: 100, max: 300 },
    warningRange: { min: 80, max: 350 }
  },
  height: {
    name: 'Height',
    unit: 'inches',
    icon: Ruler,
    normalRange: { min: 48, max: 84 },
    warningRange: { min: 36, max: 96 }
  },
  blood_glucose_fasting: {
    name: 'Blood Glucose (Fasting)',
    unit: 'mg/dL',
    icon: Activity,
    normalRange: { min: 70, max: 100 },
    warningRange: { min: 100, max: 125 }
  },
  blood_glucose_post_meal: {
    name: 'Blood Glucose (Post-meal)',
    unit: 'mg/dL',
    icon: Activity,
    normalRange: { min: 70, max: 140 },
    warningRange: { min: 140, max: 180 }
  },
  oxygen_saturation: {
    name: 'Oxygen Saturation',
    unit: '%',
    icon: Activity,
    normalRange: { min: 95, max: 100 },
    warningRange: { min: 90, max: 94 }
  }
}

export default function VitalsPage() {
  const router = useRouter()
  const [vitals, setVitals] = useState<VitalRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  // Form state
  const [vitalType, setVitalType] = useState('')
  const [value, setValue] = useState('')
  const [unit, setUnit] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    fetchVitals()
  }, [])

  useEffect(() => {
    // Update unit when vital type changes
    if (vitalType && vitalTypes[vitalType]) {
      setUnit(vitalTypes[vitalType].unit)
    }
  }, [vitalType])

  const fetchVitals = async () => {
    try {
      setLoading(true)

      const response = await fetch('http://localhost:8000/api/v1/vitals/', {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setVitals(data.data || [])
        } else {
          setError(data.message || 'Failed to fetch vitals')
        }
      } else {
        setError('Failed to fetch vitals')
      }
    } catch (err) {
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  const determineStatus = (type: string, val: number): 'normal' | 'warning' | 'critical' => {
    const vitalInfo = vitalTypes[type]
    if (!vitalInfo) return 'normal'

    if (val < vitalInfo.normalRange.min || val > vitalInfo.normalRange.max) {
      if (val < vitalInfo.warningRange.min || val > vitalInfo.warningRange.max) {
        return 'critical'
      }
      return 'warning'
    }
    return 'normal'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!vitalType || !value) {
      setError('Please select a vital type and enter a value')
      return
    }

    const numericValue = parseFloat(value)
    if (isNaN(numericValue)) {
      setError('Please enter a valid numeric value')
      return
    }

    try {
      setLoading(true)

      const vitalData = {
        type: vitalType,
        value: numericValue,
        unit: unit,
        recorded_at: selectedDate.toISOString(),
        notes: notes || undefined,
        status: determineStatus(vitalType, numericValue)
      }

      const response = await fetch('http://localhost:8000/api/v1/vitals/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(vitalData)
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setSuccess('Vital sign recorded successfully!')
          setVitalType('')
          setValue('')
          setNotes('')
          setSelectedDate(new Date())
          fetchVitals() // Refresh the list
        } else {
          setError(data.message || 'Failed to record vital sign')
        }
      } else {
        const errorData = await response.json()
        setError(errorData.detail || 'Failed to record vital sign')
      }
    } catch (err) {
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'text-green-600 bg-green-50'
      case 'warning': return 'text-yellow-600 bg-yellow-50'
      case 'critical': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal': return <Check className="h-4 w-4" />
      case 'warning': return <AlertCircle className="h-4 w-4" />
      case 'critical': return <AlertCircle className="h-4 w-4" />
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Vital Signs Tracking</h1>
          <p className="text-gray-600">Monitor and record your health metrics</p>
        </div>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Record New Vital */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Record New Vital Sign
              </CardTitle>
              <CardDescription>
                Enter your current vital signs for tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="vitalType">Vital Type</Label>
                  <Select value={vitalType} onValueChange={setVitalType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a vital sign type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(vitalTypes).map(([key, vital]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <vital.icon className="h-4 w-4" />
                            {vital.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="value">Value</Label>
                    <Input
                      id="value"
                      type="number"
                      step="0.1"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder="Enter value"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Input
                      id="unit"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      placeholder="Unit"
                      readOnly
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Date & Time</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP p") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any additional notes about this reading..."
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Recording...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Record Vital Sign
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Recent Vitals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recent Readings
              </CardTitle>
              <CardDescription>
                Your latest vital sign measurements
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading && vitals.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <Clock className="h-6 w-6 animate-spin mr-2" />
                  Loading vitals...
                </div>
              ) : vitals.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No vital signs recorded yet
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {vitals.slice(0, 10).map((vital, index) => {
                    const vitalInfo = vitalTypes[vital.type]
                    const Icon = vitalInfo?.icon || Activity
                    
                    return (
                      <div key={vital.id || index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-gray-600" />
                          <div>
                            <p className="font-medium text-sm">
                              {vitalInfo?.name || vital.type}
                            </p>
                            <p className="text-xs text-gray-500">
                              {format(new Date(vital.recorded_at), "MMM dd, yyyy 'at' h:mm a")}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">
                              {vital.value} {vital.unit}
                            </span>
                            <span className={cn(
                              "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                              getStatusColor(vital.status)
                            )}>
                              {getStatusIcon(vital.status)}
                              <span className="ml-1 capitalize">{vital.status}</span>
                            </span>
                          </div>
                          {vital.notes && (
                            <p className="text-xs text-gray-500 mt-1">{vital.notes}</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
            {vitals.length > 10 && (
              <CardFooter>
                <Button variant="outline" className="w-full">
                  View All Readings
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>

        {/* Reference Ranges */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Reference Ranges</CardTitle>
            <CardDescription>
              Normal and warning ranges for vital signs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(vitalTypes).map(([key, vital]) => (
                <div key={key} className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <vital.icon className="h-4 w-4" />
                    <span className="font-medium text-sm">{vital.name}</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-green-600">Normal:</span>
                      <span>{vital.normalRange.min}-{vital.normalRange.max} {vital.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-yellow-600">Warning:</span>
                      <span>{vital.warningRange.min}-{vital.warningRange.max} {vital.unit}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}