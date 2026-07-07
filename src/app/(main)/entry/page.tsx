'use client'

import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import EntryForm from '@/components/entry/EntryForm'
import { useSearchParams } from 'next/navigation'

export default function EntryPage() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  
  const accounts = useLiveQuery(() => db.accounts.filter(a => !a.archived).toArray())
  const categories = useLiveQuery(() => db.categories.filter(c => !c.archived).toArray())
  const transaction = useLiveQuery(
    async () => id ? await db.transactions.get(id) : null,
    [id]
  )
  
  if (accounts === undefined || categories === undefined || (id && transaction === undefined)) {
    return null
  }
  
  return (
    <div className="fixed inset-0 z-50 bg-bg p-[env(safe-area-inset-top)_18px_env(safe-area-inset-bottom)] flex flex-col md:max-w-[520px] md:mx-auto md:border-l md:border-r md:border-[#ffffff2e] overflow-y-auto">
      <EntryForm 
        accounts={accounts} 
        categories={categories} 
        initialTransaction={transaction || null}
      />
    </div>
  )
}
