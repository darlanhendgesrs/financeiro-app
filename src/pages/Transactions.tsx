import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

type Transaction = {
  id: string
  description: string
  amount: number
  vat: number
  net_amount: number
  type: 'entrada' | 'saida'
  date: string
}

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState(0)
  const [type, setType] = useState<'entrada' | 'saida'>('entrada')
  const [noVat, setNoVat] = useState(false)
  const [limit, setLimit] = useState(20)

  const fetchTransactions = async (limite = limit) => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false })
      .limit(limite)

    if (data) setTransactions(data)
    if (error) console.error(error)
  }

  const addTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    const vatAmount = noVat ? 0 : Number((amount * 0.21).toFixed(2))
    const netAmount = noVat ? amount : Number((amount - vatAmount).toFixed(2))

    const { error } = await supabase.from('transactions').insert([{
      description,
      amount,
      vat: vatAmount,
      net_amount: netAmount,
      type,
      date: new Date().toISOString()
    }])
    if (!error) {
      setDescription('')
      setAmount(0)
      fetchTransactions()
    }
  }

  const handleLoadMore = () => {
    const newLimit = limit + 20
    setLimit(newLimit)
    fetchTransactions(newLimit)
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Lançamentos</h1>
      <form onSubmit={addTransaction} className="space-y-2 mb-6">
        <input
          type="text"
          placeholder="Descrição"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="number"
          placeholder="Valor total (com VAT)"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-full border p-2 rounded"
          required
        />
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

        <select
          value={type}
          onChange={(e) => setType(e.target.value as 'entrada' | 'saida')}
          className="w-full border p-2 rounded"
        >
          <option value="entrada">Entrada</option>
          <option value="saida">Saída</option>
        </select>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Adicionar
        </button>
      </form>
      <ul className="space-y-2 mb-4">
        {transactions.map((tx) => (
          <li key={tx.id} className="border p-2 rounded bg-white">
            <div className="flex justify-between">
              <span>{tx.description}</span>
              <span className={tx.type === 'entrada' ? 'text-green-600' : 'text-red-600'}>
                {tx.type === 'entrada' ? '+' : '-'} R$ {tx.amount.toFixed(2)}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              {tx.vat > 0 ? `Base: R$ ${tx.net_amount.toFixed(2)} | VAT: R$ ${tx.vat.toFixed(2)}` : "Sem VAT"}
            </div>
          </li>
        ))}
      </ul>
      {transactions.length >= limit && (
        <button
          onClick={handleLoadMore}
          className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
        >
          Ver mais
        </button>
      )}
    </div>
  )
}