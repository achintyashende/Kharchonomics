'use client'

import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { Topbar } from '@/components/layout/Topbar'
import BudgetManager from '@/components/budgets/BudgetManager'
import { useSearchParams } from 'next/navigation'

export default function BudgetsPage() {
  const searchParams = useSearchParams()
  const userName = 'User'

  const currentMonth = searchParams.get('m') ? parseInt(searchParams.get('m')!) : new Date().getMonth()
  const currentYear = searchParams.get('y') ? parseInt(searchParams.get('y')!) : new Date().getFullYear()

  const startDate = new Date(currentYear, currentMonth, 1).toLocaleDateString('en-CA')
  const endDate = new Date(currentYear, currentMonth + 1, 0).toLocaleDateString('en-CA')

  const budgets = useLiveQuery(
    () => db.budgets
      .where({ month: currentMonth, year: currentYear })
      .filter(b => !b.archived)
      .toArray(),
    [currentMonth, currentYear]
  )
  
  const categories = useLiveQuery(
    () => db.categories.filter(c => !c.archived).toArray()
  )
  
  const transactions = useLiveQuery(
    () => db.transactions
      .where('date')
      .between(startDate, endDate, true, true)
      .filter(tx => !tx.archived)
      .toArray(),
    [startDate, endDate]
  )

  if (budgets === undefined || categories === undefined || transactions === undefined) {
    return null
  }

  let expenseTotal = 0
  transactions.forEach(tx => {
    if (tx.type === 'expense') expenseTotal += tx.amount
  })

  let totalBudget = 0
  budgets.forEach(b => {
    totalBudget += b.limit_amount
  })

  return (
    <>
      <Topbar userName={userName} month={currentMonth} year={currentYear} expenseTotal={expenseTotal} balanceTotal={totalBudget} />
      <div className="p-6 px-4">
        <BudgetManager 
          budgets={budgets} 
          categories={categories} 
          transactions={transactions}
          month={currentMonth}
          year={currentYear}
        />
      </div>
    </>
  )
}
