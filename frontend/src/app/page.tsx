import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Heart, Activity, Users, Shield } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-red-500 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">MedIntel Healthcare</h1>
            </div>
            <nav className="flex space-x-4">
              <Link href="/auth/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link href="/auth/register">
                <Button>Get Started</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            AI-Powered Healthcare
            <span className="block text-indigo-600">Management System</span>
          </h2>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-500">
            Revolutionize patient care with intelligent document processing, predictive analytics, 
            and seamless collaboration between patients and healthcare providers.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/auth/register?role=patient">
              <Button size="lg" className="px-8 py-3 w-full sm:w-auto">
                For Patients
              </Button>
            </Link>
            <Link href="/auth/register?role=clinic">
              <Button size="lg" variant="outline" className="px-8 py-3 w-full sm:w-auto">
                For Clinics
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-3xl font-extrabold text-gray-900">
              Comprehensive Healthcare Features
            </h3>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Everything you need for modern healthcare management
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <Activity className="h-8 w-8 text-indigo-600" />
                <CardTitle>Smart Document Processing</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  AI-powered OCR and LLM extraction of medical data from reports, prescriptions, and lab results.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-indigo-600" />
                <CardTitle>Patient Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Track vitals, medications, care plans, and receive personalized health insights.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-8 w-8 text-indigo-600" />
                <CardTitle>Risk Prediction</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  ML models predict risk for 5 chronic diseases with explainable recommendations.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Heart className="h-8 w-8 text-indigo-600" />
                <CardTitle>Telehealth Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Seamless video consultations with AI-generated patient summaries for doctors.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-extrabold text-white">
            Ready to Transform Healthcare?
          </h3>
          <p className="mt-4 text-xl text-indigo-200">
            Join thousands of patients and healthcare providers using MedIntel
          </p>
          <div className="mt-8">
            <Link href="/auth/register">
              <Button size="lg" variant="secondary" className="px-8 py-3">
                Start Your Journey
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Heart className="h-6 w-6 text-red-500 mr-2" />
              <span className="text-xl font-bold">MedIntel Healthcare</span>
            </div>
            <p className="text-gray-400">
              © 2024 MedIntel Healthcare. All rights reserved. Built with ❤️ for better healthcare.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}