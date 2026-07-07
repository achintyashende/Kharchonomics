'use client'

import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import RecurringList from './RecurringList'

export default function RecurringPage() {
  const accounts = useLiveQuery(() => db.accounts.filter(a => !a.archived).toArray())
  const categories = useLiveQuery(() => db.categories.filter(c => !c.archived).toArray())
  const recurring = useLiveQuery(() => db.recurring_transactions.filter(r => !r.archived).toArray())

  if (accounts === undefined || categories === undefined || recurring === undefined) {
    return null
  }

  // Map account and category data onto the recurring transactions 
  // since Supabase used to do a joined query
  const recurringJoined = recurring.map(r => {
    const acc = accounts.find(a => a.id === r.account_id)
    const cat = categories.find(c => c.id === r.category_id)
    return {
      ...r,
      account: acc ? { name: acc.name, icon: acc.icon } : undefined,
      category: cat ? { name: cat.name, icon: cat.icon, color: cat.color } : undefined
    }
  }).sort((a, b) => a.day_of_month - b.day_of_month)

  return (
    <div className="pb-24 px-4 pt-[max(48px,env(safe-area-inset-top))]">
      <div className="flex items-center gap-3 mb-2">
        <Link href="/records" className="text-text bg-panel-soft p-2 rounded-full hover:opacity-70 transition-opacity border-2 border-line">
          <ArrowLeft size={24} strokeWidth={2.5} />
        </Link>
        <h1 className="text-2xl font-black text-text uppercase tracking-wider m-0">Subscriptions</h1>
      </div>
      <p className="text-muted mb-6">Transactions that automatically log themselves each month.</p>
      
      <RecurringList 
        initialData={recurringJoined as any} 
        accounts={accounts} 
        categories={categories} 
      />
    </div>
  )
}
