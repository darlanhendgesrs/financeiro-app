import { Link, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

const links = [
  { to: '/', label: '🏠 Dashboard' },
  { to: '/lancamentos', label: '📄 Lançamentos' },
  { to: '/contas', label: '💸 Contas a Pagar/Receber' },
  { to: '/fluxo', label: '📊 Fluxo de Caixa' },
  { to: '/relatorios', label: '📋 Relatórios Financeiros' },
  { to: '/relatorios/contas', label: '🗓️ Contas do Mês' }
]

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <aside className="w-64 h-screen bg-gray-100 p-4 border-r flex flex-col justify-between">
      <nav className="flex flex-col space-y-2">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`p-2 rounded hover:bg-gray-200 ${
              location.pathname.startsWith(link.to) ? 'bg-blue-200 font-semibold' : ''
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <button
        onClick={handleLogout}
        className="mt-6 p-2 text-left text-red-600 hover:bg-red-100 rounded"
      >
        🔓 Sair
      </button>
    </aside>
  )
}
