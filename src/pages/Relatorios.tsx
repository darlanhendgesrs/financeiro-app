
import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import dayjs from 'dayjs'

type ReportItem = {
  description: string
  type: 'entrada' | 'saida'
  total: number
}

export default function Relatorios() {
  const [data, setData] = useState<ReportItem[]>([])
  const [startDate, setStartDate] = useState(dayjs().startOf('month').format('YYYY-MM-DD'))
  const [endDate, setEndDate] = useState(dayjs().endOf('month').format('YYYY-MM-DD'))

  const fetchData = async () => {
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('description, type, amount, date')
      .gte('date', startDate)
      .lte('date', endDate)

    if (error) {
      console.error(error)
      return
    }

    const grouped = new Map<string, ReportItem>()

    transactions?.forEach(t => {
      const key = `${t.description}_${t.type}`
      if (!grouped.has(key)) {
        grouped.set(key, { description: t.description, type: t.type, total: 0 })
      }
      grouped.get(key)!.total += Number(t.amount)
    })

    setData(Array.from(grouped.values()))
  }

  useEffect(() => {
    fetchData()
  }, [])

  const totalEntrada = data.filter(d => d.type === 'entrada').reduce((sum, i) => sum + i.total, 0)
  const totalSaida = data.filter(d => d.type === 'saida').reduce((sum, i) => sum + i.total, 0)
  const saldo = totalEntrada - totalSaida

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Relatórios Financeiros</h1>
      <form
        className="flex items-end space-x-4 mb-6"
        onSubmit={(e) => {
          e.preventDefault()
          fetchData()
        }}
      >
        <div>
          <label className="block text-sm">Data inicial</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border p-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm">Data final</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border p-2 rounded"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Aplicar Filtros
        </button>
      </form>

      <table className="w-full text-sm border">
        <thead>
          <tr className="text-left border-b bg-gray-100">
            <th className="py-2 px-2">Descrição</th>
            <th className="py-2 px-2">Tipo</th>
            <th className="py-2 px-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, i) => (
            <tr key={i} className="border-b">
              <td className="px-2 py-1">{item.description}</td>
              <td className="px-2 py-1 capitalize">{item.type}</td>
              <td className="px-2 py-1">R$ {item.total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="text-right mt-6 space-y-1 font-semibold">
        <p>Total de Entradas: R$ {totalEntrada.toFixed(2)}</p>
        <p>Total de Saídas: R$ {totalSaida.toFixed(2)}</p>
        <p className="text-lg">Saldo: R$ {saldo.toFixed(2)}</p>
      </div>
    </div>
  )
}
