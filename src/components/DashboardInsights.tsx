import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import dayjs from 'dayjs'

export default function DashboardInsights() {
  const [income, setIncome] = useState(0)
  const [expense, setExpense] = useState(0)
  const [upcomingBills, setUpcomingBills] = useState<any[]>([])
  const [overdueBills, setOverdueBills] = useState<any[]>([])

  useEffect(() => {
    loadSummary()
    loadUpcomingBills()
    loadOverdueBills()
  }, [])

  const loadSummary = async () => {
    const start = dayjs().startOf('month').format('YYYY-MM-DD')
    const end = dayjs().endOf('month').format('YYYY-MM-DD')

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .gte('date', start)
      .lte('date', end)

    if (data) {
      const totalIncome = data.filter(t => t.type === 'entrada').reduce((sum, t) => sum + t.amount, 0)
      const totalExpense = data.filter(t => t.type === 'saida').reduce((sum, t) => sum + t.amount, 0)
      setIncome(totalIncome)
      setExpense(totalExpense)
    }
    if (error) console.error(error)
  }

  const loadUpcomingBills = async () => {
    const today = dayjs().format('YYYY-MM-DD')
    const future = dayjs().add(7, 'day').format('YYYY-MM-DD')

    const { data } = await supabase
      .from('bills')
      .select('*')
      .eq('status', 'pendente')
      .gte('due_date', today)
      .lte('due_date', future)

    if (data) setUpcomingBills(data)
  }

  const loadOverdueBills = async () => {
    const today = dayjs().format('YYYY-MM-DD')
    const { data } = await supabase
      .from('bills')
      .select('*')
      .eq('status', 'pendente')
      .lt('due_date', today)

    if (data) setOverdueBills(data)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-green-100 p-4 rounded">
          <h3 className="text-sm text-green-700">Income (This Month)</h3>
          <p className="text-xl font-bold">R$ {income.toFixed(2)}</p>
        </div>
        <div className="bg-red-100 p-4 rounded">
          <h3 className="text-sm text-red-700">Expenses (This Month)</h3>
          <p className="text-xl font-bold">R$ {expense.toFixed(2)}</p>
        </div>
        <div className="bg-blue-100 p-4 rounded">
          <h3 className="text-sm text-blue-700">Balance</h3>
          <p className="text-xl font-bold">R$ {(income - expense).toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-yellow-100 p-4 rounded">
        <h3 className="text-md font-semibold mb-2">📅 Upcoming Bills (7 days)</h3>
        {upcomingBills.length === 0 && <p className="text-sm text-gray-600">No upcoming bills.</p>}
        <ul className="text-sm text-gray-700 space-y-1">
          {upcomingBills.map(b => (
            <li key={b.id}>• {b.description} — due {dayjs(b.due_date).format('DD/MM')}</li>
          ))}
        </ul>
      </div>

      {overdueBills.length > 0 && (
        <div className="bg-red-100 p-4 rounded">
          <h3 className="text-md font-semibold mb-2">⚠️ Overdue Bills</h3>
          <ul className="text-sm text-red-700 space-y-1">
            {overdueBills.map(b => (
              <li key={b.id}>• {b.description} — was due {dayjs(b.due_date).format('DD/MM')}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}