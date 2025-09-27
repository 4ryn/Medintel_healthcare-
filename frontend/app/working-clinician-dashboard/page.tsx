import WorkingClinicianDashboard from '@/components/WorkingClinicianDashboard'
import NavigationMenu from '@/components/NavigationMenu'

export default function WorkingClinicianDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationMenu />
      <WorkingClinicianDashboard />
    </div>
  )
}