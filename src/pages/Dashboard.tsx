import { supabase } from '../supabaseClient'
import DashboardInsights from '../components/DashboardInsights'

export default function Dashboard() {
  const logout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="p-4">
    <DashboardInsights />
    
  </div>
  )
}