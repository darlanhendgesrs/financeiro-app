import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Contas from './pages/Contas'
import FluxoCaixa from './pages/FluxoCaixa'
import Relatorios from './pages/Relatorios'
import RelatorioContas from './pages/RelatorioContas' 
import PrivateRoute from './components/PrivateRoute'
import Layout from './components/Layout'

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="lancamentos" element={<Transactions />} />
          <Route path="contas" element={<Contas />} />
          <Route path="fluxo" element={<FluxoCaixa />} />
          <Route path="relatorios" element={<Relatorios />} />
          <Route path="relatorios/contas" element={<RelatorioContas />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
