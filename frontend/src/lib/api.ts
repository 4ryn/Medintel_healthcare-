// API service functions for the healthcare dashboard
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
        ...options,
      })

      const data = await response.json()
      
      // Handle new backend response format
      if (data.success !== undefined) {
        return data
      }
      
      // Legacy format - assume success if no error
      if (response.ok) {
        return { success: true, data }
      } else {
        return { success: false, error: data.detail || `HTTP error! status: ${response.status}` }
      }
    } catch (error) {
      console.error('API request failed:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  // Authentication
  async login(email: string, password: string) {
    return this.request<{ access_token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: email, password }),
    })
  }

  async register(userData: any) {
    return this.request<{ access_token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  // Patients
  async getPatients() {
    return this.request<any[]>('/patients/')
  }

  async getPatient(id: number) {
    return this.request<any>(`/patients/${id}`)
  }

  async createPatient(patientData: any) {
    return this.request<any>('/patients/', {
      method: 'POST',
      body: JSON.stringify(patientData),
    })
  }

  async updatePatient(id: number, patientData: any) {
    return this.request<any>(`/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(patientData),
    })
  }

  async deletePatient(id: number) {
    return this.request<any>(`/patients/${id}`, {
      method: 'DELETE',
    })
  }

  // Vitals
  async getVitals(patientId?: number) {
    const endpoint = patientId ? `/vitals/patient/${patientId}` : '/vitals/'
    return this.request<any[]>(endpoint)
  }

  async createVital(vitalData: any) {
    return this.request<any>('/vitals/', {
      method: 'POST',
      body: JSON.stringify(vitalData),
    })
  }

  async getVitalStats(patientId?: number) {
    const endpoint = patientId ? `/vitals/stats/${patientId}` : '/vitals/stats'
    return this.request<any>(endpoint)
  }

  // Appointments
  async getAppointments() {
    return this.request<any[]>('/appointments/')
  }

  async createAppointment(appointmentData: any) {
    return this.request<any>('/appointments/', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    })
  }

  async updateAppointment(id: number, appointmentData: any) {
    return this.request<any>(`/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(appointmentData),
    })
  }

  async deleteAppointment(id: number) {
    return this.request<any>(`/appointments/${id}`, {
      method: 'DELETE',
    })
  }

  // Notifications
  async getNotifications() {
    return this.request<any[]>('/notifications/')
  }

  async markNotificationRead(id: number) {
    return this.request<any>(`/notifications/${id}/read`, {
      method: 'POST',
    })
  }

  async markAllNotificationsRead() {
    return this.request<any>('/notifications/mark-all-read', {
      method: 'POST',
    })
  }

  async deleteNotification(id: number) {
    return this.request<any>(`/notifications/${id}`, {
      method: 'DELETE',
    })
  }

  async getNotificationStats() {
    return this.request<any>('/notifications/stats')
  }

  async createMedicationReminder(data: {
    medication_name: string
    dosage: string
    instructions: string
    reminder_time?: string
  }) {
    return this.request<any>('/notifications/medication-reminder', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async createAppointmentReminder(appointmentId: number, hoursBefor: number = 24) {
    return this.request<any>(`/notifications/appointment-reminder/${appointmentId}`, {
      method: 'POST',
      body: JSON.stringify({ reminder_hours_before: hoursBefor }),
    })
  }

  async createHealthAlert(data: {
    vital_type: string
    current_value: number
    threshold: number
    severity: string
  }) {
    return this.request<any>('/notifications/health-alert', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // AI Insights
  async getAIInsights(patientId?: number) {
    const endpoint = patientId ? `/ai/insights/${patientId}` : '/ai/insights'
    return this.request<any>(endpoint)
  }

  async getRiskAssessment(patientId: number) {
    return this.request<any>(`/ai/risk-assessment/${patientId}`)
  }

  async getHealthTrends(patientId: number) {
    return this.request<any>(`/ai/health-trends/${patientId}`)
  }

  async getCareRecommendations(patientId: number) {
    return this.request<any>(`/ai/care-recommendations/${patientId}`)
  }

  async getPredictiveInsights(patientId: number) {
    return this.request<any>(`/ai/predictive-insights/${patientId}`)
  }

  // Analytics
  async getDashboardStats() {
    return this.request<any>('/analytics/dashboard-stats')
  }

  async getPatientAnalytics(patientId: number) {
    return this.request<any>(`/analytics/patient/${patientId}`)
  }

  async getVitalsTrends(patientId: number, period: string = '30d') {
    return this.request<any>(`/analytics/vitals-trends/${patientId}?period=${period}`)
  }

  // Documents (if implemented)
  async uploadDocument(file: File, patientId?: number) {
    const formData = new FormData()
    formData.append('file', file)
    if (patientId) formData.append('patient_id', patientId.toString())

    try {
      return await this.request<any>('/documents/upload', {
        method: 'POST',
        headers: {}, // Remove Content-Type for FormData
        body: formData,
      })
    } catch (error) {
      // Mock success for demo
      return {
        success: true,
        data: {
          id: Date.now(),
          filename: file.name,
          file_size: file.size,
          document_type: 'medical_record',
          upload_date: new Date().toISOString(),
          processing_status: 'completed'
        }
      }
    }
  }

  async getDocuments(patientId?: number) {
    try {
      const endpoint = patientId ? `/documents/patient/${patientId}` : '/documents/'
      return await this.request<any[]>(endpoint)
    } catch (error) {
      // Return mock documents
      return {
        success: true,
        data: [
          {
            id: 1,
            filename: 'lab_results_2025.pdf',
            document_type: 'lab_result',
            upload_date: '2025-09-10T10:00:00Z',
            file_size: 245760,
            processing_status: 'completed'
          },
          {
            id: 2,
            filename: 'x_ray_chest.jpg',
            document_type: 'medical_image',
            upload_date: '2025-09-08T14:30:00Z',
            file_size: 1048576,
            processing_status: 'completed'
          }
        ]
      }
    }
  }

  async deleteDocument(id: number) {
    return this.request<any>(`/documents/${id}`, {
      method: 'DELETE',
    })
  }
}

// Create and export a singleton instance
export const api = new ApiService()

// Export types for use in components
export interface Patient {
  id: number
  first_name: string
  last_name: string
  email: string
  phone?: string
  date_of_birth?: string
  gender?: string
  address?: string
  emergency_contact?: string
  created_at: string
}

export interface Vital {
  id: number
  patient_id: number
  vital_type: string
  value: number
  unit: string
  recorded_at: string
  notes?: string
}

export interface Appointment {
  id: number
  patient_id: number
  doctor_name: string
  appointment_date: string
  appointment_type: string
  status: string
  notes?: string
  location?: string
}

export interface Notification {
  id: number
  type: string
  title: string
  message: string
  priority: string
  read: boolean
  created_at: string
  scheduled_for?: string
  action_required: boolean
  metadata?: any
}

export interface AIInsight {
  id: number
  patient_id: number
  insight_type: string
  title: string
  description: string
  confidence_score: number
  recommendations: string[]
  data_sources: string[]
  created_at: string
}

// Mock data helpers for development
export const mockApi = {
  // This will be used when the backend is not available
  async getPatients(): Promise<ApiResponse<Patient[]>> {
    await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API delay
    return {
      success: true,
      data: [
        {
          id: 1,
          first_name: 'John',
          last_name: 'Smith',
          email: 'john.smith@example.com',
          phone: '(555) 123-4567',
          date_of_birth: '1980-05-15',
          gender: 'Male',
          address: '123 Main St, Anytown, USA',
          emergency_contact: 'Jane Smith - (555) 987-6543',
          created_at: '2024-01-15T10:00:00Z'
        },
        {
          id: 2,
          first_name: 'Sarah',
          last_name: 'Johnson',
          email: 'sarah.johnson@example.com',
          phone: '(555) 234-5678',
          date_of_birth: '1975-08-22',
          gender: 'Female',
          address: '456 Oak Ave, Somewhere, USA',
          emergency_contact: 'Mike Johnson - (555) 876-5432',
          created_at: '2024-01-20T14:30:00Z'
        }
      ]
    }
  },

  async getDashboardStats(): Promise<ApiResponse<any>> {
    await new Promise(resolve => setTimeout(resolve, 300))
    return {
      success: true,
      data: {
        total_patients: 1247,
        todays_appointments: 18,
        critical_alerts: 3,
        avg_vitals_score: 94,
        unread_notifications: 7,
        completed_tasks: 85
      }
    }
  },

  async getNotifications(): Promise<ApiResponse<Notification[]>> {
    await new Promise(resolve => setTimeout(resolve, 400))
    return {
      success: true,
      data: [
        {
          id: 1,
          type: 'medication',
          title: 'Medication Reminder',
          message: 'Time to take your Lisinopril (10mg). Take with water after breakfast.',
          priority: 'high',
          read: false,
          created_at: '2025-09-14T08:00:00Z',
          scheduled_for: '2025-09-14T08:00:00Z',
          action_required: true,
          metadata: { medication: 'Lisinopril', dosage: '10mg' }
        }
      ]
    }
  }
}

export default api