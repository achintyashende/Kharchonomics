'use client'

import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { Topbar } from '@/components/layout/Topbar'
import Link from 'next/link'
import { money } from '@/lib/utils'
import { CategoryIcon } from '@/components/ui/CategoryIcon'
import { format, parseISO } from 'date-fns'
import { useSearchParams } from 'next/navigation'

export default function RecordsPage() {
  const searchParams = useSearchParams()
  const userName = 'User' // Defaulting since no auth

  const currentMonth = searchParams.get('m') ? parseInt(searchParams.get('m')!) : new Date().getMonth()
  const currentYear = searchParams.get('y') ? parseInt(searchParams.get('y')!) : new Date().getFullYear()

  const startDate = new Date(currentYear, currentMonth, 1).toLocaleDateString('en-CA')
  const endDate = new Date(currentYear, currentMonth + 1, 0).toLocaleDateString('en-CA')

  const transactions = useLiveQuery(
    () => db.transactions
      .where('date')
      .between(startDate, endDate, true, true)
      .filter(tx => !tx.archived)
      .toArray(),
    [startDate, endDate]
  )
  
  const accounts = useLiveQuery(() => db.accounts.toArray())
  const categories = useLiveQuery(() => db.categories.toArray())

  if (transactions === undefined || accounts === undefined || categories === undefined) {
    return null // or a loading skeleton
  }

  // Sort descending manually since Dexie between() returns ascending by default
  transactions.sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date)
    return b.time.localeCompare(a.time)
  })

  let expenseTotal = 0
  let incomeTotal = 0
  
  transactions.forEach(tx => {
    if (tx.type === 'expense') expenseTotal += tx.amount
    if (tx.type === 'income') incomeTotal += tx.amount
  })

  // Apply Search
  const searchQuery = searchParams.get('q')?.toLowerCase() || ''
  let filteredTransactions = transactions.filter(tx => {
    if (!searchQuery) return true
    const cat = categories.find(c => c.id === tx.category_id)
    const matchesCategory = cat?.name.toLowerCase().includes(searchQuery)
    const matchesNotes = tx.notes?.toLowerCase().includes(searchQuery)
    return matchesCategory || matchesNotes
  })

  // Apply Sorting
  const sort = searchParams.get('sort') || 'latest'
  if (sort === 'highest') {
    filteredTransactions = filteredTransactions.sort((a, b) => b.amount - a.amount)
  } else if (sort === 'lowest') {
    filteredTransactions = filteredTransactions.sort((a, b) => a.amount - b.amount)
  }

  // Group by date
  const grouped = filteredTransactions.reduce((acc, tx) => {
    const dateKey = tx.date
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(tx)
    return acc
  }, {} as Record<string, typeof transactions>)

  return (
    <>
      <Topbar userName={userName} month={currentMonth} year={currentYear} expenseTotal={expenseTotal} incomeTotal={incomeTotal} />
      
      {filteredTransactions.length === 0 ? (
        <p className="max-w-[560px] mx-auto mt-7 text-muted text-center text-[clamp(20px,5vw,28px)] leading-relaxed px-4">
          No records found. Tap + to add income, expense, or transfer.
        </p>
      ) : (
        <div className="pb-[100px] px-2 pt-2">
          {Object.entries(grouped).map(([date, txs]) => (
            <div key={date} className="mb-6">
              <h3 className="px-2 pb-2 mb-2 border-b border-line text-text font-bold text-[clamp(16px,4.5vw,20px)] sticky top-[138px] bg-bg z-[5] py-2">
                {format(parseISO(date), 'MMM dd, EEEE')}
              </h3>
              <div className="grid gap-0">
                {(txs as any[]).map(tx => {
                  const account = accounts.find(a => a.id === tx.account_id)
                  const toAccount = accounts.find(a => a.id === tx.to_account_id)
                  const category = categories.find(c => c.id === tx.category_id)
                  
                  const isTransfer = tx.type === 'transfer'
                  const title = isTransfer ? 'Transfer' : category?.name || 'Unknown'
                  const color = isTransfer ? '#1976d2' : category?.color || '#8f2b2b'
                  
                  let subtitle = ""
                  if (isTransfer) {
                    subtitle = `${account?.name || 'Account'} → ${toAccount?.name || 'Account'} ${tx.notes ? `"${tx.notes}"` : ''}`
                  } else {
                    subtitle = `${account?.name || 'Account'} ${tx.notes ? `"${tx.notes}"` : ''}`
                  }
                  
                  const prefix = tx.type === 'expense' ? '-' : ''
                  const amountColor = tx.type === 'expense' ? 'text-expense' : tx.type === 'income' ? 'text-income' : 'text-[#56ccf2]'

                  return (
                    <Link 
                      href={`/entry?id=${tx.id}`}
                      key={tx.id} 
                      className="grid grid-cols-[auto_1fr_auto] gap-3 items-center py-2.5 px-2 hover:bg-panel-soft rounded-lg transition-colors no-underline"
                    >
                      <div 
                        className={`w-11 h-11 rounded-full grid place-items-center text-white shrink-0 ${isTransfer ? 'border-2 border-[#ffffff]' : ''}`}
                        style={{ backgroundColor: color }}
                      >
                        {isTransfer ? (
                          <span className="text-[24px] leading-none mb-1">⇄</span>
                        ) : (
                          <CategoryIcon name={category?.icon || 'receipt'} className="w-6 h-6" />
                        )}
                      </div>
                      
                      <div className="min-w-0 text-text">
                        <div className="text-[clamp(18px,4.8vw,24px)] font-bold leading-[1.05] truncate mb-0.5">
                          {title}
                        </div>
                        <div className="text-muted text-[clamp(14px,3.5vw,16px)] font-bold truncate">
                          {subtitle.trim()}
                        </div>
                      </div>
                      
                      <div className={`font-black text-[clamp(18px,4.5vw,22px)] text-right whitespace-nowrap ${amountColor}`}>
                        {prefix}{money(tx.amount)}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
