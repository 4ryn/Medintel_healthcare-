'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  FileText, 
  Brain, 
  Eye, 
  Download, 
  Share2, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  TrendingUp,
  Activity,
  Heart,
  Pill,
  Calendar,
  User,
  Stethoscope,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  BookOpen,
  Lightbulb,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react'
import { api } from '@/lib/api'

interface DocumentSummary {
  id: string
  document_id: string
  document_name: string
  document_type: string
  summary: string
  key_findings: string[]
  recommendations: string[]
  risk_factors: string[]
  confidence_score: number
  processing_status: 'pending' | 'processing' | 'completed' | 'failed'
  created_at: string
  ai_insights: {
    medical_conditions: string[]
    medications: string[]
    vital_signs: Record<string, string>
    test_results: Record<string, string>
    next_steps: string[]
  }
}

interface HealthInsight {
  id: string
  type: 'trend' | 'risk' | 'improvement' | 'recommendation'
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  confidence: number
  data_source: string[]
  created_at: string
  action_items: string[]
}

export default function DocumentAnalysisCenter() {
  const [summaries, setSummaries] = useState<DocumentSummary[]>([])
  const [healthInsights, setHealthInsights] = useState<HealthInsight[]>([])
  const [selectedSummary, setSelectedSummary] = useState<DocumentSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDocumentAnalysis()
  }, [])

  const loadDocumentAnalysis = async () => {
    setLoading(true)
    try {
      // Load document summaries and AI insights
      setSummaries(mockDocumentSummaries)
      setHealthInsights(mockHealthInsights)
      if (mockDocumentSummaries.length > 0) {
        setSelectedSummary(mockDocumentSummaries[0])
      }
    } catch (err) {
      setError('Failed to load document analysis')
    } finally {
      setLoading(false)
    }
  }

  const processDocument = async (documentId: string) => {
    try {
      setProcessingProgress(0)
      const interval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval)
            return 100
          }
          return prev + 10
        })
      }, 200)

      // TODO: Call actual AI processing API
      // await api.processDocumentAI(documentId)
      
      setTimeout(() => {
        clearInterval(interval)
        setProcessingProgress(100)
        // Refresh summaries
        loadDocumentAnalysis()
      }, 2000)
    } catch (err) {
      setError('Failed to process document')
    }
  }

  const generateHealthReport = async () => {
    try {
      // TODO: Generate comprehensive health report from all documents
      alert('Health report generation started! You will receive it in your email shortly.')
    } catch (err) {
      setError('Failed to generate health report')
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600'
    if (confidence >= 75) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading AI document analysis...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Brain className="h-8 w-8 mr-3 text-blue-600" />
            AI Document Analysis
          </h1>
          <p className="text-gray-600">AI-powered insights from your medical documents</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={generateHealthReport}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Generate Health Report
          </Button>
          <Button variant="outline" onClick={loadDocumentAnalysis}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Processing Progress */}
      {processingProgress > 0 && processingProgress < 100 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2 text-blue-600" />
              AI Processing in Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={processingProgress} className="mb-2" />
            <p className="text-sm text-gray-600">
              Analyzing document content and extracting medical insights...
            </p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="summaries" className="space-y-6">
        <TabsList>
          <TabsTrigger value="summaries">Document Summaries ({summaries.length})</TabsTrigger>
          <TabsTrigger value="insights">Health Insights ({healthInsights.length})</TabsTrigger>
          <TabsTrigger value="trends">Health Trends</TabsTrigger>
          <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="summaries" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Document List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Documents</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {summaries.map((summary) => (
                    <div
                      key={summary.id}
                      className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                        selectedSummary?.id === summary.id ? 'border-blue-300 bg-blue-50' : ''
                      }`}
                      onClick={() => setSelectedSummary(summary)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <Badge variant={summary.processing_status === 'completed' ? 'default' : 'secondary'}>
                          {summary.processing_status}
                        </Badge>
                      </div>
                      <h4 className="font-medium text-sm mb-1">{summary.document_name}</h4>
                      <p className="text-xs text-gray-500 mb-2">{summary.document_type}</p>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-medium ${getConfidenceColor(summary.confidence_score)}`}>
                          {summary.confidence_score}% confidence
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(summary.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Document Summary Details */}
            <div className="lg:col-span-2">
              {selectedSummary ? (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center">
                            <FileText className="h-5 w-5 mr-2" />
                            {selectedSummary.document_name}
                          </CardTitle>
                          <CardDescription>
                            {selectedSummary.document_type} • Analyzed on{' '}
                            {new Date(selectedSummary.created_at).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-2" />
                            View Original
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                          </Button>
                          <Button size="sm" variant="outline">
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* AI Summary */}
                      <div>
                        <h3 className="font-semibold mb-3 flex items-center">
                          <BookOpen className="h-4 w-4 mr-2" />
                          AI Summary
                        </h3>
                        <p className="text-gray-700 leading-relaxed">{selectedSummary.summary}</p>
                      </div>

                      {/* Key Findings */}
                      <div>
                        <h3 className="font-semibold mb-3 flex items-center">
                          <Target className="h-4 w-4 mr-2" />
                          Key Findings
                        </h3>
                        <div className="space-y-2">
                          {selectedSummary.key_findings.map((finding, index) => (
                            <div key={index} className="flex items-start space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{finding}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Risk Factors */}
                      {selectedSummary.risk_factors.length > 0 && (
                        <div>
                          <h3 className="font-semibold mb-3 flex items-center">
                            <AlertTriangle className="h-4 w-4 mr-2 text-orange-600" />
                            Risk Factors
                          </h3>
                          <div className="space-y-2">
                            {selectedSummary.risk_factors.map((risk, index) => (
                              <div key={index} className="flex items-start space-x-2">
                                <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-gray-700">{risk}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recommendations */}
                      <div>
                        <h3 className="font-semibold mb-3 flex items-center">
                          <Lightbulb className="h-4 w-4 mr-2 text-blue-600" />
                          AI Recommendations
                        </h3>
                        <div className="space-y-2">
                          {selectedSummary.recommendations.map((rec, index) => (
                            <div key={index} className="flex items-start space-x-2">
                              <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{rec}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Medical Insights */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2 flex items-center">
                            <Stethoscope className="h-4 w-4 mr-2" />
                            Medical Conditions
                          </h4>
                          <div className="space-y-1">
                            {selectedSummary.ai_insights.medical_conditions.map((condition, index) => (
                              <Badge key={index} variant="outline" className="mr-1 mb-1">
                                {condition}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2 flex items-center">
                            <Pill className="h-4 w-4 mr-2" />
                            Medications
                          </h4>
                          <div className="space-y-1">
                            {selectedSummary.ai_insights.medications.map((med, index) => (
                              <Badge key={index} variant="outline" className="mr-1 mb-1">
                                {med}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Confidence Score */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">AI Confidence Score</span>
                          <span className={`font-bold ${getConfidenceColor(selectedSummary.confidence_score)}`}>
                            {selectedSummary.confidence_score}%
                          </span>
                        </div>
                        <Progress value={selectedSummary.confidence_score} className="h-2" />
                        <p className="text-xs text-gray-600 mt-2">
                          Based on document clarity, medical terminology recognition, and data completeness
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Select a document
                      </h3>
                      <p className="text-gray-500">
                        Choose a document from the list to view AI analysis
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="insights">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {healthInsights.map((insight) => (
              <Card key={insight.id} className={`border-l-4 ${getSeverityColor(insight.severity)}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{insight.title}</CardTitle>
                    <Badge variant={insight.severity === 'critical' ? 'destructive' : 'outline'}>
                      {insight.severity}
                    </Badge>
                  </div>
                  <CardDescription>
                    Confidence: {insight.confidence}% • Source: {insight.data_source.join(', ')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{insight.description}</p>
                  {insight.action_items.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Recommended Actions:</h4>
                      <ul className="space-y-1">
                        {insight.action_items.map((action, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start">
                            <CheckCircle className="h-3 w-3 text-green-600 mt-1 mr-2 flex-shrink-0" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Health Metrics Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Blood Pressure</span>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-green-600 font-medium">Improving</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Cholesterol</span>
                    <div className="flex items-center space-x-2">
                      <Activity className="h-4 w-4 text-yellow-600" />
                      <span className="text-yellow-600 font-medium">Stable</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Blood Sugar</span>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-green-600 font-medium">Improving</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Score Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">Low Risk</div>
                  <p className="text-gray-600 mb-4">Overall health score improved by 15% this month</p>
                  <Progress value={85} className="h-3" />
                  <p className="text-sm text-gray-500 mt-2">85% health score</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recommendations">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2 text-blue-600" />
                  Personalized AI Recommendations
                </CardTitle>
                <CardDescription>
                  Based on your complete medical history and current health status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center">
                      <Heart className="h-4 w-4 mr-2 text-red-600" />
                      Cardiovascular Health
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Continue current exercise routine and consider adding 30 minutes of cardio 3x weekly.
                    </p>
                    <Button size="sm" variant="outline">Schedule Cardio Plan</Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center">
                      <Pill className="h-4 w-4 mr-2 text-blue-600" />
                      Medication Optimization
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Blood pressure medication showing good results. Consider dosage review with doctor.
                    </p>
                    <Button size="sm" variant="outline">Book Appointment</Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-green-600" />
                      Preventive Care
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Due for annual blood work and mammogram screening.
                    </p>
                    <Button size="sm" variant="outline">Schedule Tests</Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center">
                      <Activity className="h-4 w-4 mr-2 text-purple-600" />
                      Lifestyle Factors
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Sleep patterns indicate room for improvement. Consider sleep hygiene protocol.
                    </p>
                    <Button size="sm" variant="outline">View Sleep Tips</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Mock data
const mockDocumentSummaries: DocumentSummary[] = [
  {
    id: '1',
    document_id: 'doc_1',
    document_name: 'Blood Test Results - Sep 2025',
    document_type: 'Lab Report',
    summary: 'Comprehensive blood panel shows overall good health with slight improvement in cholesterol levels. Blood glucose and liver function within normal ranges. Blood pressure medication appears effective.',
    key_findings: [
      'Total cholesterol improved from 220 to 195 mg/dL',
      'HbA1c remains stable at 5.8%',
      'Liver enzymes within normal range',
      'Vitamin D levels adequate'
    ],
    recommendations: [
      'Continue current statin medication',
      'Maintain current diet and exercise routine',
      'Schedule follow-up in 3 months',
      'Consider increasing omega-3 intake'
    ],
    risk_factors: [
      'Slightly elevated triglycerides (borderline high)',
      'Family history of cardiovascular disease'
    ],
    confidence_score: 92,
    processing_status: 'completed',
    created_at: '2025-09-10T10:00:00Z',
    ai_insights: {
      medical_conditions: ['Hyperlipidemia', 'Pre-diabetes'],
      medications: ['Atorvastatin', 'Metformin'],
      vital_signs: {
        'Blood Pressure': '125/80 mmHg',
        'Heart Rate': '72 bpm'
      },
      test_results: {
        'Total Cholesterol': '195 mg/dL',
        'HbA1c': '5.8%',
        'Glucose': '98 mg/dL'
      },
      next_steps: [
        'Continue medication regimen',
        'Schedule 3-month follow-up',
        'Monitor blood pressure at home'
      ]
    }
  },
  {
    id: '2',
    document_id: 'doc_2',
    document_name: 'Cardiology Consultation - Aug 2025',
    document_type: 'Consultation Report',
    summary: 'Routine cardiology follow-up shows stable cardiac function. Echo results demonstrate normal left ventricular function. Patient responding well to current treatment plan.',
    key_findings: [
      'Echocardiogram shows normal cardiac function',
      'Exercise tolerance has improved',
      'No signs of cardiac stress',
      'Blood pressure well controlled'
    ],
    recommendations: [
      'Continue current cardiac medications',
      'Maintain exercise program',
      'Annual echo follow-up',
      'Weight management remains important'
    ],
    risk_factors: [],
    confidence_score: 88,
    processing_status: 'completed',
    created_at: '2025-08-15T14:30:00Z',
    ai_insights: {
      medical_conditions: ['Hypertension', 'Mild LVH'],
      medications: ['Lisinopril', 'Metoprolol'],
      vital_signs: {
        'Blood Pressure': '120/75 mmHg',
        'Heart Rate': '68 bpm'
      },
      test_results: {
        'Ejection Fraction': '60%',
        'LV Wall Thickness': 'Mildly increased'
      },
      next_steps: [
        'Annual cardiology follow-up',
        'Continue home BP monitoring',
        'Maintain current exercise routine'
      ]
    }
  }
]

const mockHealthInsights: HealthInsight[] = [
  {
    id: '1',
    type: 'improvement',
    title: 'Cholesterol Levels Improving',
    description: 'Your cholesterol levels have shown a consistent downward trend over the past 6 months, indicating that your current treatment plan is effective.',
    severity: 'low',
    confidence: 95,
    data_source: ['Lab Results', 'Medication History'],
    created_at: '2025-09-14T10:00:00Z',
    action_items: [
      'Continue current statin medication',
      'Maintain healthy diet',
      'Schedule next lipid panel in 3 months'
    ]
  },
  {
    id: '2',
    type: 'recommendation',
    title: 'Consider Diabetes Prevention Program',
    description: 'Based on your HbA1c trends and family history, you may benefit from a structured diabetes prevention program.',
    severity: 'medium',
    confidence: 78,
    data_source: ['Lab Results', 'Family History'],
    created_at: '2025-09-14T09:30:00Z',
    action_items: [
      'Discuss with primary care physician',
      'Consider nutrition counseling',
      'Increase physical activity to 150 minutes per week'
    ]
  },
  {
    id: '3',
    type: 'risk',
    title: 'Medication Interaction Alert',
    description: 'Potential minor interaction detected between your current medications. Monitor for any unusual symptoms.',
    severity: 'medium',
    confidence: 82,
    data_source: ['Medication List', 'Drug Database'],
    created_at: '2025-09-13T16:15:00Z',
    action_items: [
      'Consult with pharmacist',
      'Monitor for side effects',
      'Consider medication timing adjustment'
    ]
  }
]