'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  User, 
  Stethoscope, 
  Calendar, 
  FileText, 
  Settings, 
  LogOut,
  Menu,
  X,
  Activity,
  Bell,
  Heart,
  Users
} from 'lucide-react'

const NavigationMenu = () => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => setIsOpen(!isOpen)

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">MedIntel</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/working-patient-dashboard" 
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <User className="h-5 w-5" />
              <span>Patient Dashboard</span>
            </Link>
            
            <Link 
              href="/working-clinician-dashboard" 
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Stethoscope className="h-5 w-5" />
              <span>Clinician Dashboard</span>
            </Link>
            
            <Link 
              href="/appointments" 
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Calendar className="h-5 w-5" />
              <span>Appointments</span>
            </Link>
            
            <Link 
              href="/vitals" 
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Activity className="h-5 w-5" />
              <span>Vitals</span>
            </Link>
            
            <Link 
              href="/notifications" 
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Bell className="h-5 w-5" />
              <span>Notifications</span>
            </Link>

            <div className="flex items-center space-x-4 ml-8 pl-8 border-l border-gray-200">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-gray-600 hover:text-gray-900 p-2"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="space-y-2">
              <Link 
                href="/working-patient-dashboard"
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <User className="h-5 w-5" />
                <span>Patient Dashboard</span>
              </Link>
              
              <Link 
                href="/working-clinician-dashboard"
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Stethoscope className="h-5 w-5" />
                <span>Clinician Dashboard</span>
              </Link>
              
              <Link 
                href="/appointments"
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Calendar className="h-5 w-5" />
                <span>Appointments</span>
              </Link>
              
              <Link 
                href="/vitals"
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Activity className="h-5 w-5" />
                <span>Vitals</span>
              </Link>
              
              <Link 
                href="/notifications"
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Bell className="h-5 w-5" />
                <span>Notifications</span>
              </Link>

              <div className="pt-4 mt-4 border-t border-gray-200">
                <div className="space-y-2">
                  <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors w-full text-left">
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors w-full text-left">
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default NavigationMenu