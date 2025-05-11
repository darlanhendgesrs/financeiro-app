import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import dayjs from 'dayjs'

type Entry = {
  date: string
  entrada: number
  saida: number
  tipo: 'realizado' | 'previsto'
}

export default function Fluxo() {
  const [fluxo, setFluxo] = useState<Entry[]>([])
  const [saldo, setSaldo] = useState({ realizado: 0, previsto: 0 })
  const [startDate, setStartDate] = useState(dayjs().startOf('month').format('YYYY-MM-DD'))
  const [endDate, setEndDate] = useState(dayjs().endOf('month').format('YYYY-MM-DD'))

  const carregarFluxo = async () => {
    if (!startDate || !endDate) return;
    const hoje = dayjs().format('YYYY-MM-DD')

    const { data: transacoes } = await supabase
      .from('transactions')
      .select('amount, type, date')
    const { data: contas } = await supabase
      .from('bills')
      .select('amount, type, due_date, status')

    const mapa = new Map<string, Entry>()

    // Transações (realizado)
    transacoes?.forEach((t) => {
      if (t.date < startDate || t.date > endDate) return;
      const data = dayjs(t.date).format('YYYY-MM-DD')
      const key = `${data}-realizado`
      if (!mapa.has(key)) {
        mapa.set(key, {
          date: data,
          entrada: 0,
          saida: 0,
          tipo: 'realizado'
        })
      }
      const e = mapa.get(key)!
      if (t.type === 'entrada') e.entrada += Number(t.amount)
      if (t.type === 'saida') e.saida += Number(t.amount)
    })

    // Contas pendentes (previsto)
    contas?.forEach((c) => {
      if (!c.due_date || c.status !== 'pendente') return
      const dueDate = dayjs(c.due_date).format('YYYY-MM-DD')
    
    if (dayjs(dueDate).isBefore(dayjs(startDate)) || dayjs(dueDate).isAfter(dayjs(endDate))) return;
      if (c.due_date < startDate || c.due_date > endDate) return;
      if (c.status === 'pago') return
      const data = dueDate
      const key = `${data}-previsto`
      if (!mapa.has(key)) {
        mapa.set(key, {
          date: data,
          entrada: 0,
          saida: 0,
          tipo: 'previsto'
        })
      }
      const e = mapa.get(key)!
      if (c.type === 'entrada') e.entrada += Number(c.amount)
      if (c.type === 'saida') e.saida += Number(c.amount)
    })

    // Ordenar por data
    const lista = Array.from(mapa.values()).sort((a, b) => a.date.localeCompare(b.date))
    let acumulado = 0
    const final = lista.map((l) => {
      acumulado += l.entrada - l.saida
      return { ...l, saldo: acumulado }
    })

    setFluxo(final)
        const realizado = final
      .filter(e => e.tipo === 'realizado')
      .reduce((sum, e) => sum + e.entrada - e.saida, 0)
    const previsto = final
      .filter(e => e.tipo === 'previsto')
      .reduce((sum, e) => sum + e.entrada - e.saida, 0)

    setSaldo({ realizado, previsto })
  }

  useEffect(() => {
    carregarFluxo()
  }, [])

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Fluxo de Caixa</h1>
      <form className="flex items-end space-x-4 mb-6" onSubmit={e => { e.preventDefault(); carregarFluxo() }}>
        <div>
          <label className="block text-sm">Data inicial</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border p-2 rounded" />
        </div>
        <div>
          <label className="block text-sm">Data final</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border p-2 rounded" />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Aplicar Filtros</button>
      </form>
      <div className="bg-white p-4 rounded shadow">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2">Data</th>
              <th>Tipo</th>
              <th>Entradas</th>
              <th>Saídas</th>
              <th>Saldo</th>
            </tr>
          </thead>
          <tbody>
            {fluxo.map((f, idx) => (
              <tr key={idx} className="border-b">
                <td className="py-1">{dayjs(f.date).format('DD/MM/YYYY')}</td>
                <td>{f.tipo}</td>
                <td className="text-green-600">R$ {f.entrada.toFixed(2)}</td>
                <td className="text-red-600">R$ {f.saida.toFixed(2)}</td>
                <td className="font-semibold">R$ {(f.entrada - f.saida).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Gráfico de Fluxo de Caixa</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={fluxo}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="entrada" name="Entradas - Realizado" fill="#22c55e" stackId="a" 
              isAnimationActive={false} shape={({ x, y, width, height, payload }) => (
              <rect
                x={x}
                y={y}
                width={width}
                height={height}
                fill={payload.tipo === 'realizado' ? '#22c55e' : '#bbf7d0'}
              />
            )} />
            <Bar dataKey="saida" name="Saídas - Realizado" fill="#ef4444" stackId="b"
              isAnimationActive={false} shape={({ x, y, width, height, payload }) => (
              <rect
                x={x}
                y={y}
                width={width}
                height={height}
                fill={payload.tipo === 'realizado' ? '#ef4444' : '#fecaca'}
              />
            )} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="text-right font-bold mt-4 text-lg space-y-1">
          Saldo realizado: R$ {saldo.realizado.toFixed(2)}<br/>
Saldo projetado: R$ {(saldo.realizado + saldo.previsto).toFixed(2)}
        </div>
      </div>
  )
}
