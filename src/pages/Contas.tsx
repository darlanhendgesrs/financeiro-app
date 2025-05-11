import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import dayjs from 'dayjs'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'

dayjs.extend(isSameOrBefore)

type Bill = {
  id: string
  description: string
  amount: number
  vat: number
  net_amount: number
  no_vat: boolean
  type: 'entrada' | 'saida'
  due_date: string
  status: 'pendente' | 'pago' | 'atrasado'
  created_at: string
}

export default function Contas() {
  const [bills, setBills] = useState<Bill[]>([])
  const [limit, setLimit] = useState(3)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState(0)
  const [type, setType] = useState<'entrada' | 'saida'>('saida')
  const [dueDate, setDueDate] = useState('')
  const [noVat, setNoVat] = useState(false)

  const [isRecurring, setIsRecurring] = useState(false)
  const [recurringDay, setRecurringDay] = useState(1)
  const [recurringStart, setRecurringStart] = useState('')
  const [recurringEnd, setRecurringEnd] = useState('')

  const [filterMonth, setFilterMonth] = useState(dayjs().format('YYYY-MM'))
  const [filterType, setFilterType] = useState<'todos' | 'entrada' | 'saida'>('todos')

  const fetchBills = async () => {
    let query = supabase.from('bills').select('*')

    if (filterMonth) {
      const startDate = dayjs(`${filterMonth}-01`).startOf('month').format('YYYY-MM-DD')
      const endDate = dayjs(`${filterMonth}-01`).endOf('month').format('YYYY-MM-DD')
      query = query.gte('due_date', startDate).lte('due_date', endDate)
    }

    if (filterType !== 'todos') {
      query = query.eq('type', filterType)
    }

    const { data, error } = await query.order('due_date', { ascending: true }).limit(limit)
    if (data) setBills(data)
    if (error) console.error(error)
  }

  useEffect(() => {
    fetchBills()
  }, [limit])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const vatAmount = noVat ? 0 : Number((amount * 0.21).toFixed(2))
    const netAmount = noVat ? amount : Number((amount - vatAmount).toFixed(2))

    if (editingId) {
      const { error } = await supabase.from('bills').update({
        description, amount, vat: vatAmount, net_amount: netAmount, no_vat: noVat,
        type, due_date
      }).eq('id', editingId)

      if (!error) {
        clearForm()
        fetchBills()
      }
    } else if (isRecurring && recurringStart && recurringEnd) {
      const start = dayjs(`${recurringStart}-01`)
      const end = dayjs(`${recurringEnd}-01`)
      const months = []
      let current = start
      while (current.isSameOrBefore(end)) {
        months.push(current)
        current = current.add(1, 'month')
      }

      const inserts = months.map(m => ({
        description, amount, vat: vatAmount, net_amount: netAmount, no_vat: noVat,
        type, due_date: m.date(recurringDay).format('YYYY-MM-DD'),
        status: 'pendente', created_at: new Date().toISOString()
      }))

      const { error } = await supabase.from('bills').insert(inserts)
      if (!error) {
        clearForm()
        fetchBills()
      }
    } else {
      const { error } = await supabase.from('bills').insert([{
        description, amount, vat: vatAmount, net_amount: netAmount, no_vat: noVat,
        type, due_date, status: 'pendente', created_at: new Date().toISOString()
      }])
      if (!error) {
        clearForm()
        fetchBills()
      }
    }
  }

  const markAsPaid = async (bill: Bill) => {
    const { error: insertError } = await supabase.from('transactions').insert([{
      description: bill.description,
      amount: bill.amount,
      net_amount: bill.net_amount,
      type: bill.type,
      vat: bill.vat,
      date: new Date().toISOString()
    }])

    if (!insertError) {
      const { error: deleteError } = await supabase.from('bills').delete().eq('id', bill.id)
      if (!deleteError) fetchBills()
    }
  }

  const deleteBill = async (id: string) => {
    const { error } = await supabase.from('bills').delete().eq('id', id)
    if (!error) fetchBills()
  }

  const startEdit = (bill: Bill) => {
    setEditingId(bill.id)
    setDescription(bill.description)
    setAmount(bill.amount)
    setDueDate(dayjs(bill.due_date).format('YYYY-MM-DD'))
    setNoVat(bill.no_vat)
    setType(bill.type)
  }

  const clearForm = () => {
    setDescription('')
    setAmount(0)
    setDueDate('')
    setNoVat(false)
    setType('saida')
    setEditingId(null)
  }

  const getStatusColor = (bill: Bill) => {
    if (bill.status === 'pago') return 'text-green-600 line-through'
    if (bill.status === 'atrasado') return 'text-red-600'
    if (bill.status === 'pendente' && dayjs().isAfter(dayjs(bill.due_date))) return 'text-red-600'
    return ''
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Contas a Pagar e Receber</h1>


      {/* Formulário */}
      <form onSubmit={handleSubmit} className="space-y-2 mb-6">
        <input type="text" placeholder="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border p-2 rounded" required />
        <input type="number" placeholder="Valor total" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full border p-2 rounded" required />
        {amount > 0 && !noVat && (
          <div className="text-sm text-gray-600 space-y-1">
            <p>💵 Valor sem VAT: R$ {(amount / 1.21).toFixed(2)}</p>
            <p>🧾 VAT (21%): R$ {(amount - amount / 1.21).toFixed(2)}</p>
          </div>
        )}
        <label className="flex items-center space-x-2 text-sm text-gray-600">
          <input type="checkbox" checked={noVat} onChange={e => setNoVat(e.target.checked)} />
          <span>Sem VAT</span>
        </label>
        <select value={type} onChange={(e) => setType(e.target.value as 'entrada' | 'saida')} className="w-full border p-2 rounded">
          <option value="entrada">Entrada</option>
          <option value="saida">Saída</option>
        </select>
        <label className="flex items-center space-x-2 text-sm text-gray-700">
          <input type="checkbox" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} />
          <span>Conta recorrente</span>
        </label>
        {isRecurring ? (
          <div className="space-y-2">
            <input type="number" placeholder="Dia do mês (ex: 5)" min={1} max={28} value={recurringDay} onChange={(e) => setRecurringDay(Number(e.target.value))} className="w-full border p-2 rounded" required />
            <label className="block text-sm">Mês de Início</label>
            <input type="month" value={recurringStart} onChange={(e) => setRecurringStart(e.target.value)} className="w-full border p-2 rounded" required />
            <label className="block text-sm">Mês de Término</label>
            <input type="month" value={recurringEnd} onChange={(e) => setRecurringEnd(e.target.value)} className="w-full border p-2 rounded" required />
          </div>
        ) : (
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full border p-2 rounded" required />
        )}
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">{isRecurring ? 'Criar recorrência' : 'Adicionar'}</button>
      </form>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="month"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className="border p-2 rounded"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as 'todos' | 'entrada' | 'saida')}
          className="border p-2 rounded"
        >
          <option value="todos">Todos</option>
          <option value="entrada">Entrada</option>
          <option value="saida">Saída</option>
        </select>
        <button
          onClick={() => fetchBills()}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Aplicar Filtros
        </button>
      </div>

      <ul className="space-y-2">
        {bills.map((bill) => (
          <li key={bill.id} className="border p-3 rounded bg-white flex flex-col">
            <div className="flex justify-between items-center">
              <span className={`font-semibold ${getStatusColor(bill)}`}>{bill.description} ({bill.type})</span>
              <span className={`font-semibold ${getStatusColor(bill)}`}>R$ {bill.amount.toFixed(2)}</span>
            </div>
            <div className="text-sm text-gray-500 flex justify-between">
              <span>Vencimento: {dayjs(bill.due_date).format('DD/MM/YYYY')}</span>
              <span>{bill.vat > 0 ? `Base: R$ ${bill.net_amount.toFixed(2)} | VAT: R$ ${bill.vat.toFixed(2)}` : 'Sem VAT'}</span>
            </div>
            {bill.status === 'pendente' && (
              <div className="flex justify-end gap-2 mt-2">
                <button onClick={() => startEdit(bill)} className="text-sm bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600">Editar</button>
                <button onClick={() => markAsPaid(bill)} className="text-sm bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600">Marcar como pago</button>
                <button onClick={() => deleteBill(bill.id)} className="text-sm bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">Deletar</button>
              </div>
            )}
          </li>
        ))}
      </ul>

      {bills.length >= limit && (
        <button onClick={() => { const newLimit = limit + 3; setLimit(newLimit); }} className="mt-4 bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded">Ver mais</button>
      )}
    </div>
  )
}
