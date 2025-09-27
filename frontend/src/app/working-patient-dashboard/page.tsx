import WorkingPatientDashboard from '@/components/WorkingPatientDashboard'
import NavigationMenu from '@/components/NavigationMenu'

export default function WorkingPatientDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationMenu />
      <WorkingPatientDashboard />
    </div>
  )
}