"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Activity, Heart, Thermometer, Weight, Ruler } from 'lucide-react'
import { cn } from "@/lib/utils"

interface VitalEntry {
  type: string
  value: number
  unit: string
  recorded_at: Date
  notes?: string
  status: string
}

const VITAL_TYPES = [
  { value: 'blood_pressure_systolic', label: 'Blood Pressure (Systolic)', unit: 'mmHg', icon: Heart },
  { value: 'blood_pressure_diastolic', label: 'Blood Pressure (Diastolic)', unit: 'mmHg', icon: Heart },
  { value: 'heart_rate', label: 'Heart Rate', unit: 'bpm', icon: Activity },
  { value: 'temperature', label: 'Body Temperature', unit: '°F', icon: Thermometer },
  { value: 'weight', label: 'Weight', unit: 'lbs', icon: Weight },
  { value: 'height', label: 'Height', unit: 'inches', icon: Ruler },
  { value: 'oxygen_saturation', label: 'Oxygen Saturation', unit: '%', icon: Activity },
  { value: 'blood_glucose_fasting', label: 'Blood Glucose (Fasting)', unit: 'mg/dL', icon: Activity },
  { value: 'blood_glucose_post_meal', label: 'Blood Glucose (Post-meal)', unit: 'mg/dL', icon: Activity }
]

const NORMAL_RANGES: Record<string, { min: number; max: number; status: (value: number) => string }> = {
  blood_pressure_systolic: {
    min: 90, max: 120,
    status: (value) => value < 90 ? 'critical' : value <= 120 ? 'normal' : value <= 140 ? 'warning' : 'critical'
  },
  blood_pressure_diastolic: {
    min: 60, max: 80,
    status: (value) => value < 60 ? 'critical' : value <= 80 ? 'normal' : value <= 90 ? 'warning' : 'critical'
  },
  heart_rate: {
    min: 60, max: 100,
    status: (value) => value < 50 ? 'critical' : value <= 100 ? 'normal' : value <= 120 ? 'warning' : 'critical'
  },
  temperature: {
    min: 97, max: 99,
    status: (value) => value < 95 ? 'critical' : value <= 99 ? 'normal' : value <= 101 ? 'warning' : 'critical'
  },
  weight: {
    min: 80, max: 250,
    status: () => 'normal' // Weight status depends on BMI calculation
  },
  height: {
    min: 48, max: 84,
    status: () => 'normal'
  },
  oxygen_saturation: {
    min: 95, max: 100,
    status: (value) => value < 90 ? 'critical' : value < 95 ? 'warning' : 'normal'
  },
  blood_glucose_fasting: {
    min: 70, max: 100,
    status: (value) => value < 70 ? 'warning' : value <= 100 ? 'normal' : value <= 125 ? 'warning' : 'critical'
  },
  blood_glucose_post_meal: {
    min: 70, max: 140,
    status: (value) => value < 70 ? 'warning' : value <= 140 ? 'normal' : value <= 180 ? 'warning' : 'critical'
  }
}

export default function VitalsEntry() {
  const [selectedType, setSelectedType] = useState<string>('')
  const [value, setValue] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [recordedAt, setRecordedAt] = useState<Date>(new Date())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [currentStatus, setCurrentStatus] = useState<string>('normal')

  const selectedVitalType = VITAL_TYPES.find(type => type.value === selectedType)
  
  const calculateStatus = (type: string, val: number): string => {
    const range = NORMAL_RANGES[type]
    return range ? range.status(val) : 'normal'
  }

  const handleValueChange = (newValue: string) => {
    setValue(newValue)
    if (selectedType && newValue) {
      const numValue = parseFloat(newValue)
      if (!isNaN(numValue)) {
        setCurrentStatus(calculateStatus(selectedType, numValue))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedType || !value) {
      setMessage({ type: 'error', text: 'Please select a vital type and enter a value' })
      return
    }

    const numValue = parseFloat(value)
    if (isNaN(numValue)) {
      setMessage({ type: 'error', text: 'Please enter a valid numeric value' })
      return
    }

    setIsSubmitting(true)
    setMessage(null)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const vitalData = {
        type: selectedType,
        value: numValue,
        unit: selectedVitalType?.unit || '',
        recorded_at: recordedAt.toISOString(),
        notes: notes || null,
        status: calculateStatus(selectedType, numValue)
      }

      const response = await fetch('http://127.0.0.1:8000/api/v1/vitals/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(vitalData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to record vital sign')
      }

      const result = await response.json()
      setMessage({ type: 'success', text: 'Vital sign recorded successfully!' })
      
      // Reset form
      setSelectedType('')
      setValue('')
      setNotes('')
      setRecordedAt(new Date())
      setCurrentStatus('normal')
      
    } catch (error) {
      console.error('Error recording vital:', error)
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to record vital sign' 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-green-100 text-green-800 border-green-200'
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getRangeInfo = (type: string) => {
    const range = NORMAL_RANGES[type]
    if (!range) return null
    
    return (
      <div className="text-sm text-gray-600 mt-2">
        <p>Normal range: {range.min} - {range.max} {selectedVitalType?.unit}</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="mr-2 h-6 w-6 text-blue-600" />
            Record Vital Signs
          </CardTitle>
          <CardDescription>
            Enter your health measurements to track your wellness over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Vital Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="vital-type">Vital Sign Type</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a vital sign to record" />
                </SelectTrigger>
                <SelectContent>
                  {VITAL_TYPES.map((type) => {
                    const IconComponent = type.icon
                    return (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center">
                          <IconComponent className="mr-2 h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Value Input */}
            {selectedVitalType && (
              <div className="space-y-2">
                <Label htmlFor="value">
                  Value ({selectedVitalType.unit})
                </Label>
                <div className="flex items-center space-x-3">
                  <Input
                    id="value"
                    type="number"
                    step="0.1"
                    value={value}
                    onChange={(e) => handleValueChange(e.target.value)}
                    placeholder={`Enter ${selectedVitalType.label.toLowerCase()}`}
                    className="flex-1"
                  />
                  {value && (
                    <Badge className={getStatusColor(currentStatus)}>
                      {currentStatus}
                    </Badge>
                  )}
                </div>
                {getRangeInfo(selectedType)}
              </div>
            )}

            {/* Date and Time */}
            <div className="space-y-2">
              <Label>Date & Time Recorded</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !recordedAt && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {recordedAt ? format(recordedAt, "PPP 'at' p") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={recordedAt}
                    onSelect={(date) => date && setRecordedAt(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional notes about this measurement..."
                rows={3}
              />
            </div>

            {/* Status Messages */}
            {message && (
              <Alert className={message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                  {message.text}
                </AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <Button 
              type="submit" 
              disabled={isSubmitting || !selectedType || !value}
              className="w-full"
            >
              {isSubmitting ? 'Recording...' : 'Record Vital Sign'}
            </Button>
          </form>

          {/* Quick Tips */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">💡 Quick Tips</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Take measurements at the same time each day for consistency</li>
              <li>• Rest for 5 minutes before taking blood pressure</li>
              <li>• Weigh yourself in the morning before eating</li>
              <li>• Record any unusual circumstances in the notes</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}