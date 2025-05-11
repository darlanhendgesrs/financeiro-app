import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import dayjs from 'dayjs'

type Bill = {
  id: string
  description: string
  amount: number
  type: 'entrada' | 'saida'
  due_date: string
  status: 'pendente' | 'pago' | 'atrasado'
}

export default function RelatorioContas() {
  const [bills, setBills] = useState<Bill[]>([])
  const [selectedMonth, setSelectedMonth] = useState(dayjs().format('YYYY-MM'))

  const fetchBillsByMonth = async (month: string) => {
    const startDate = dayjs(`${month}-01`).startOf('month').format('YYYY-MM-DD')
    const endDate = dayjs(`${month}-01`).endOf('month').format('YYYY-MM-DD')

    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .eq('status', 'pendente')
      .gte('due_date', startDate)
      .lte('due_date', endDate)
      .order('due_date', { ascending: true })

    if (data) setBills(data)
    if (error) console.error(error)
  }

  const applyFilter = () => {
    fetchBillsByMonth(selectedMonth)
  }

  useEffect(() => {
    fetchBillsByMonth(selectedMonth)
  }, [])

  const totalEntradas = bills.filter(b => b.type === 'entrada').reduce((sum, b) => sum + b.amount, 0)
  const totalSaidas = bills.filter(b => b.type === 'saida').reduce((sum, b) => sum + b.amount, 0)
  const saldoMes = totalEntradas - totalSaidas

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Relatório de Contas do Mês</h1>

      <div className="flex items-center gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium">Selecionar mês</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border p-2 rounded"
          />
        </div>
        <button
          onClick={applyFilter}
          className="mt-6 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Aplicar Filtros
        </button>
      </div>

      <div className="bg-white shadow rounded">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-200 font-semibold">
            <tr>
              <th className="px-4 py-2">Descrição</th>
              <th className="px-4 py-2">Tipo</th>
              <th className="px-4 py-2">Vencimento</th>
              <th className="px-4 py-2">Valor</th>
            </tr>
          </thead>
          <tbody>
            {bills.map((bill) => (
              <tr key={bill.id} className="border-t">
                <td className="px-4 py-2">{bill.description}</td>
                <td className="px-4 py-2 capitalize">{bill.type}</td>
                <td className="px-4 py-2">{dayjs(bill.due_date).format('DD/MM/YYYY')}</td>
                <td className="px-4 py-2">R$ {bill.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-right space-y-1 font-semibold">
        <p>Total de Entradas: R$ {totalEntradas.toFixed(2)}</p>
        <p>Total de Saídas: R$ {totalSaidas.toFixed(2)}</p>
        <p className="text-lg">Saldo do Mês: R$ {saldoMes.toFixed(2)}</p>
      </div>
    </div>
  )
}
