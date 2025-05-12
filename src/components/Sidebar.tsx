import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
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
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const handleLinkClick = () => {
    setIsOpen(false)
  }

  return (
    <>
      {/* Hamburger for mobile */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-gray-200 p-2 rounded shadow"
        onClick={() => setIsOpen(true)}
      >
        ☰
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-gray-100 p-4 border-r z-50 transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:block`}
      >
        <nav className="flex flex-col space-y-2">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={handleLinkClick}
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
    </>
  )
}