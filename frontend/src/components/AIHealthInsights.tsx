'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Target, 
  Lightbulb,
  BarChart3,
  Activity,
  Heart,
  Pill,
  Calendar,
  Users,
  Zap,
  Eye,
  Shield,
  Clock
} from 'lucide-react'

interface HealthInsight {
  id: string
  type: 'risk_prediction' | 'trend_analysis' | 'care_recommendation' | 'medication_adherence' | 'lifestyle_suggestion'
  title: string
  description: string
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  confidence: number
  generated_at: string
  recommendations: string[]
  metrics: Record<string, any>
}

interface RiskFactor {
  factor: string
  severity: 'low' | 'medium' | 'high'
  value: number
  impact: string
}

interface ProtectiveFactor {
  factor: string
  value: number
  benefit: string
}

interface RiskAssessment {
  overall_risk: 'low' | 'medium' | 'high' | 'critical'
  risk_percentage: number
  risk_factors: RiskFactor[]
  protective_factors: ProtectiveFactor[]
  next_assessment_due: string
}

interface TrendAnalysis {
  vital_type: string
  trend_direction: 'improving' | 'declining' | 'stable'
  trend_strength: number
  period_days: number
  predicted_value?: number
  confidence_interval: number[]
}

interface CareRecommendation {
  category: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  title: string
  description: string
  action_items: string[]
  expected_outcome: string
  timeline: string
}

// Mock data
const mockInsights: HealthInsight[] = [
  {
    id: 'bp_risk_1',
    type: 'risk_prediction',
    title: 'Blood Pressure Risk Assessment',
    description: 'Average systolic pressure of 135.2 mmHg indicates medium cardiovascular risk',
    risk_level: 'medium',
    confidence: 0.85,
    generated_at: '2025-09-14T10:30:00Z',
    recommendations: [
      'Monitor blood pressure daily',
      'Reduce sodium intake to <2300mg/day',
      'Increase physical activity to 150min/week',
      'Consider medication adjustment with physician'
    ],
    metrics: { avg_systolic: 135.2, readings_count: 15 }
  },
  {
    id: 'weight_trend_1',
    type: 'trend_analysis',
    title: 'Weight Trend Analysis',
    description: 'Weight has been decreasing over the past 3 measurements - positive trend',
    risk_level: 'low',
    confidence: 0.78,
    generated_at: '2025-09-14T09:15:00Z',
    recommendations: [
      'Continue current diet and exercise routine',
      'Monitor weight weekly',
      'Maintain caloric deficit of 500 calories/day'
    ],
    metrics: { trend: 'decreasing', weight_change: -3.2 }
  },
  {
    id: 'med_adherence_1',
    type: 'medication_adherence',
    title: 'Medication Adherence Analysis',
    description: 'Based on vital sign patterns, medication adherence appears excellent',
    risk_level: 'low',
    confidence: 0.92,
    generated_at: '2025-09-14T08:00:00Z',
    recommendations: [
      'Continue current medication schedule',
      'Track medication effects on vitals',
      'Set up automatic refill reminders'
    ],
    metrics: { adherence_score: 0.95, consistency_rating: 'high' }
  }
]

const mockRiskAssessment: RiskAssessment = {
  overall_risk: 'medium',
  risk_percentage: 35,
  risk_factors: [
    {
      factor: 'Elevated Blood Pressure',
      severity: 'medium',
      value: 135,
      impact: 'Increased cardiovascular risk'
    },
    {
      factor: 'Family History',
      severity: 'medium',
      value: 1,
      impact: 'Genetic predisposition to heart disease'
    }
  ],
  protective_factors: [
    {
      factor: 'Regular Exercise',
      value: 150,
      benefit: 'Reduced cardiovascular risk by 30%'
    },
    {
      factor: 'Non-smoker',
      value: 1,
      benefit: 'Significantly lower risk of complications'
    }
  ],
  next_assessment_due: '2025-10-14'
}

const mockTrends: TrendAnalysis[] = [
  {
    vital_type: 'blood_pressure_systolic',
    trend_direction: 'improving',
    trend_strength: 0.7,
    period_days: 30,
    predicted_value: 128,
    confidence_interval: [125, 132]
  },
  {
    vital_type: 'weight',
    trend_direction: 'improving',
    trend_strength: 0.8,
    period_days: 30,
    predicted_value: 172,
    confidence_interval: [170, 175]
  },
  {
    vital_type: 'heart_rate',
    trend_direction: 'stable',
    trend_strength: 0.3,
    period_days: 30,
    predicted_value: 72,
    confidence_interval: [68, 76]
  }
]

const mockRecommendations: CareRecommendation[] = [
  {
    category: 'cardiovascular',
    priority: 'high',
    title: 'Blood Pressure Optimization',
    description: 'Focus on achieving target blood pressure levels through lifestyle and medication management',
    action_items: [
      'Schedule cardiology consultation within 2 weeks',
      'Implement DASH diet with <2300mg sodium daily',
      'Begin structured exercise program (30min, 5x/week)',
      'Monitor BP daily and track patterns'
    ],
    expected_outcome: 'Reduce systolic BP to <130 mmHg',
    timeline: '4-6 weeks'
  },
  {
    category: 'lifestyle',
    priority: 'medium',
    title: 'Weight Management Program',
    description: 'Continue current weight loss trajectory with structured approach',
    action_items: [
      'Maintain current caloric deficit of 500 cal/day',
      'Track macronutrients (40% carbs, 30% protein, 30% fat)',
      'Increase strength training to 2x/week',
      'Weekly weigh-ins and body composition tracking'
    ],
    expected_outcome: 'Achieve target weight of 165 lbs',
    timeline: '3-4 months'
  },
  {
    category: 'preventive',
    priority: 'low',
    title: 'Routine Health Maintenance',
    description: 'Stay current with preventive care and health screenings',
    action_items: [
      'Schedule annual physical exam',
      'Complete lipid panel and HbA1c testing',
      'Update vaccinations (flu, COVID boosters)',
      'Eye exam and dental cleaning'
    ],
    expected_outcome: 'Maintain excellent preventive care compliance',
    timeline: 'Next 6 months'
  }
]

export default function AIHealthInsights() {
  const [insights, setInsights] = useState<HealthInsight[]>(mockInsights)
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment>(mockRiskAssessment)
  const [trends, setTrends] = useState<TrendAnalysis[]>(mockTrends)
  const [recommendations, setRecommendations] = useState<CareRecommendation[]>(mockRecommendations)
  const [loading, setLoading] = useState(false)

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'risk_prediction': return <Target className="h-5 w-5" />
      case 'trend_analysis': return <TrendingUp className="h-5 w-5" />
      case 'care_recommendation': return <Lightbulb className="h-5 w-5" />
      case 'medication_adherence': return <Pill className="h-5 w-5" />
      case 'lifestyle_suggestion': return <Activity className="h-5 w-5" />
      default: return <Brain className="h-5 w-5" />
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'critical': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-blue-600 bg-blue-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'urgent': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-500" />
      case 'stable': return <Activity className="h-4 w-4 text-blue-500" />
      default: return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getVitalDisplayName = (type: string) => {
    const names: { [key: string]: string } = {
      'blood_pressure_systolic': 'Blood Pressure',
      'heart_rate': 'Heart Rate',
      'weight': 'Weight',
      'temperature': 'Temperature',
      'blood_glucose': 'Blood Glucose'
    }
    return names[type] || type
  }

  const refreshInsights = async () => {
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
    }, 2000)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Health Insights</h1>
          <p className="text-gray-600">Personalized health analysis powered by artificial intelligence</p>
        </div>
        <Button 
          onClick={refreshInsights}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Brain className="h-4 w-4 mr-2" />
          {loading ? 'Analyzing...' : 'Refresh Insights'}
        </Button>
      </div>

      {/* Risk Assessment Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Risk</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge className={getRiskColor(riskAssessment.overall_risk)}>
                {riskAssessment.overall_risk.toUpperCase()}
              </Badge>
              <span className="text-2xl font-bold">{riskAssessment.risk_percentage}%</span>
            </div>
            <p className="text-xs text-muted-foreground">risk score</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Insights</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.length}</div>
            <p className="text-xs text-muted-foreground">active insights</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recommendations</CardTitle>
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recommendations.length}</div>
            <p className="text-xs text-muted-foreground">action items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Assessment</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date(riskAssessment.next_assessment_due).toLocaleDateString()}
            </div>
            <p className="text-xs text-muted-foreground">scheduled</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="insights" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
          <TabsTrigger value="trends">Health Trends</TabsTrigger>
          <TabsTrigger value="recommendations">Care Plans</TabsTrigger>
        </TabsList>

        {/* AI Insights */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid gap-6">
            {insights.map(insight => (
              <Card key={insight.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-100 rounded-full">
                        {getInsightIcon(insight.type)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{insight.title}</CardTitle>
                        <CardDescription className="flex items-center space-x-2 mt-1">
                          <Badge className={getRiskColor(insight.risk_level)}>
                            {insight.risk_level.toUpperCase()}
                          </Badge>
                          <span>Confidence: {(insight.confidence * 100).toFixed(0)}%</span>
                        </CardDescription>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(insight.generated_at).toLocaleDateString()}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{insight.description}</p>
                  
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">AI Recommendations:</h4>
                    <ul className="space-y-1">
                      {insight.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start space-x-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {insight.metrics && Object.keys(insight.metrics).length > 0 && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h5 className="font-medium text-sm mb-2">Analysis Metrics:</h5>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {Object.entries(insight.metrics).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-gray-600">{key.replace('_', ' ')}:</span>
                            <span className="font-medium">{typeof value === 'number' ? value.toFixed(1) : value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Risk Assessment */}
        <TabsContent value="risk" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Risk Factors</CardTitle>
                <CardDescription>Factors that may increase health risks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {riskAssessment.risk_factors.map((factor, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{factor.factor}</h4>
                      <Badge className={getRiskColor(factor.severity)}>
                        {factor.severity.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{factor.impact}</p>
                    <div className="text-sm">
                      <span className="text-gray-500">Current value: </span>
                      <span className="font-medium">{factor.value}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Protective Factors</CardTitle>
                <CardDescription>Factors that help reduce health risks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {riskAssessment.protective_factors.map((factor, index) => (
                  <div key={index} className="border rounded-lg p-4 border-green-200 bg-green-50">
                    <h4 className="font-medium mb-2">{factor.factor}</h4>
                    <p className="text-sm text-gray-600 mb-2">{factor.benefit}</p>
                    <div className="text-sm">
                      <span className="text-gray-500">Current value: </span>
                      <span className="font-medium">{factor.value}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Overall Risk Assessment</CardTitle>
              <CardDescription>Comprehensive analysis of your health risk profile</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 mb-6">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">{riskAssessment.risk_percentage}%</div>
                  <Badge className={getRiskColor(riskAssessment.overall_risk)} variant="outline">
                    {riskAssessment.overall_risk.toUpperCase()} RISK
                  </Badge>
                </div>
                <div className="flex-1">
                  <Progress value={riskAssessment.risk_percentage} className="h-3 mb-2" />
                  <p className="text-sm text-gray-600">
                    Your current risk level is based on {riskAssessment.risk_factors.length} risk factors and {riskAssessment.protective_factors.length} protective factors.
                  </p>
                </div>
              </div>
              
              <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertDescription>
                  <strong>Next Assessment:</strong> Scheduled for {new Date(riskAssessment.next_assessment_due).toLocaleDateString()}. 
                  Continue following your care plan to maintain or improve your risk profile.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Health Trends */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid gap-6">
            {trends.map((trend, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Heart className="h-5 w-5 text-red-500" />
                      <div>
                        <CardTitle>{getVitalDisplayName(trend.vital_type)}</CardTitle>
                        <CardDescription>
                          Analysis over {trend.period_days} days
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getTrendIcon(trend.trend_direction)}
                      <span className="font-medium capitalize">{trend.trend_direction}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Trend Strength</div>
                      <div className="flex items-center space-x-2">
                        <Progress value={trend.trend_strength * 100} className="flex-1 h-2" />
                        <span className="text-sm font-medium">{(trend.trend_strength * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                    
                    {trend.predicted_value && (
                      <div>
                        <div className="text-sm text-gray-500">Predicted Value</div>
                        <div className="text-lg font-bold">{trend.predicted_value.toFixed(1)}</div>
                      </div>
                    )}
                    
                    {trend.confidence_interval && (
                      <div>
                        <div className="text-sm text-gray-500">Confidence Range</div>
                        <div className="text-sm font-medium">
                          {trend.confidence_interval[0].toFixed(1)} - {trend.confidence_interval[1].toFixed(1)}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Care Recommendations */}
        <TabsContent value="recommendations" className="space-y-6">
          <div className="grid gap-6">
            {recommendations.map((rec, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <CardTitle>{rec.title}</CardTitle>
                        <Badge className={getPriorityColor(rec.priority)}>
                          {rec.priority.toUpperCase()}
                        </Badge>
                      </div>
                      <CardDescription>{rec.description}</CardDescription>
                    </div>
                    <div className="text-xs text-gray-500">
                      <Clock className="h-4 w-4 inline mr-1" />
                      {rec.timeline}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Action Items:</h4>
                      <ul className="space-y-2">
                        {rec.action_items.map((item, i) => (
                          <li key={i} className="flex items-start space-x-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <h5 className="font-medium text-sm text-blue-800 mb-1">Expected Outcome:</h5>
                      <p className="text-sm text-blue-700">{rec.expected_outcome}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}