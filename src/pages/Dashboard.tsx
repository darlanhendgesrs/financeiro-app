import { supabase } from '../supabaseClient'

export default function Dashboard() {
  const logout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-100 text-gray-800">
      <h1 className="text-3xl font-bold mb-4">Bem-vindo ao Financeiro App</h1>
    </div>
  )
}
