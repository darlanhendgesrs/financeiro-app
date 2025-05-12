import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function Layout() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 px-4 py-6 md:pl-64 transition-all">
        <Outlet />
      </main>
    </div>
  )
}
