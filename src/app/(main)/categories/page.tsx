'use client'

import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import CategoryManager from '@/components/categories/CategoryManager'
import { Topbar } from '@/components/layout/Topbar'
import { useSearchParams } from 'next/navigation'

export default function CategoriesPage() {
  const searchParams = useSearchParams()
  const userName = 'User'

  const currentMonth = searchParams.get('m') ? parseInt(searchParams.get('m')!) : new Date().getMonth()
  const currentYear = searchParams.get('y') ? parseInt(searchParams.get('y')!) : new Date().getFullYear()

  const startDate = new Date(currentYear, currentMonth, 1).toLocaleDateString('en-CA')
  const endDate = new Date(currentYear, currentMonth + 1, 0).toLocaleDateString('en-CA')

  const categories = useLiveQuery(() => db.categories.filter(c => !c.archived).toArray())
  const transactions = useLiveQuery(
    () => db.transactions
      .where('date')
      .between(startDate, endDate, true, true)
      .filter(tx => !tx.archived)
      .toArray(),
    [startDate, endDate]
  )

  if (categories === undefined || transactions === undefined) {
    return null
  }

  let expenseTotal = 0
  let incomeTotal = 0
  
  transactions.forEach(tx => {
    if (tx.type === 'expense') expenseTotal += tx.amount
    if (tx.type === 'income') incomeTotal += tx.amount
  })

  return (
    <>
      <Topbar userName={userName} month={currentMonth} year={currentYear} expenseTotal={expenseTotal} incomeTotal={incomeTotal} />
      <div className="p-6 px-4 pb-[80px]">
        <CategoryManager categories={categories} />
      </div>
    </>
  )
}
