'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { addRecurringTransaction, deleteRecurringTransaction } from './actions'
import { CategoryIcon } from '@/components/ui/CategoryIcon'
import { money } from '@/lib/utils'
import { Trash2, Plus } from 'lucide-react'

export default function RecurringList({ initialData, accounts, categories }: any) {
  const router = useRouter()
  const [showAdd, setShowAdd] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Form State
  const [type, setType] = useState('expense')
  const [amount, setAmount] = useState('')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [categoryId, setCategoryId] = useState(categories.find((c:any) => c.type === 'expense')?.id || '')
  const [accountId, setAccountId] = useState(accounts[0]?.id || '')

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Extract the day of the month from the selected date
      const day = new Date(startDate).getDate()
      
      await addRecurringTransaction({
        type,
        amount: Number(amount),
        day_of_month: day,
        category_id: categoryId,
        account_id: accountId
      })
      setShowAdd(false)
      router.refresh()
    } catch (err: any) {
      alert(err.message)
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Delete this subscription?')) {
      await deleteRecurringTransaction(id)
      router.refresh()
    }
  }

  return (
    <div>
      {initialData.length === 0 && !showAdd && (
        <div className="text-center py-10 opacity-50 font-bold">No recurring transactions found.</div>
      )}

      <div className="grid gap-3 mb-6">
        {initialData.map((item: any) => (
          <div key={item.id} className="bg-panel rounded-2xl p-4 border-2 border-line flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full grid place-items-center text-white" style={{ backgroundColor: item.category?.color || '#333' }}>
                <CategoryIcon name={item.category?.icon || 'help-circle'} className="w-6 h-6" />
              </div>
              <div>
                <div className="font-bold text-[18px]">{item.category?.name || 'Transfer'}</div>
                <div className="text-sm text-muted">Every month on day {item.day_of_month}</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className={`font-black text-lg ${item.type === 'income' ? 'text-income' : 'text-expense'}`}>
                {money(item.amount)}
              </div>
              <button onClick={() => handleDelete(item.id)} className="text-expense bg-transparent border-none opacity-50 hover:opacity-100">
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {!showAdd ? (
        <button 
          onClick={() => setShowAdd(true)}
          className="w-full min-h-[56px] bg-panel-soft border-2 border-line rounded-xl font-bold uppercase tracking-widest text-text flex items-center justify-center gap-2"
        >
          <Plus size={20} /> Add Subscription
        </button>
      ) : (
        <form onSubmit={handleAdd} className="bg-panel rounded-2xl p-4 border-2 border-line flex flex-col gap-4">
          <h3 className="m-0 font-black uppercase tracking-widest">New Subscription</h3>
          
          <select value={type} onChange={e => { setType(e.target.value); setCategoryId(categories.find((c:any) => c.type === e.target.value)?.id) }} className="w-full p-3 rounded-lg bg-panel-soft text-text outline-none border-none font-bold uppercase">
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-muted uppercase tracking-widest ml-1 mb-1">Amount</span>
              <input type="number" required placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-3 rounded-lg bg-panel-soft text-text outline-none border-none font-bold text-lg" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-muted uppercase tracking-widest ml-1 mb-1">First Date</span>
              <input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-3 rounded-lg bg-panel-soft text-text outline-none border-none font-bold text-[15px] uppercase" />
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-muted uppercase tracking-widest ml-1 mb-1">Category</span>
            <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full p-3 rounded-lg bg-panel-soft text-text outline-none border-none font-bold">
              {categories.filter((c:any) => c.type === type).map((c:any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-muted uppercase tracking-widest ml-1 mb-1">Account</span>
            <select value={accountId} onChange={e => setAccountId(e.target.value)} className="w-full p-3 rounded-lg bg-panel-soft text-text outline-none border-none font-bold">
              {accounts.map((a:any) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex gap-2 mt-2">
            <button type="button" onClick={() => setShowAdd(false)} className="flex-1 p-3 rounded-lg bg-panel-soft font-bold uppercase">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 p-3 rounded-lg bg-text text-bg font-bold uppercase">Save</button>
          </div>
        </form>
      )}
    </div>
  )
}
