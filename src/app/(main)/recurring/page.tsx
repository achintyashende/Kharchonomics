import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import RecurringList from './RecurringList'

export default async function RecurringPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: recurring } = await supabase
    .from('recurring_transactions')
    .select(`
      *,
      account:accounts!account_id(name, icon),
      category:categories!category_id(name, icon, color)
    `)
    .eq('user_id', user.id)
    .eq('archived', false)
    .order('day_of_month', { ascending: true })

  const { data: accounts } = await supabase.from('accounts').select('*').eq('user_id', user.id).eq('archived', false)
  const { data: categories } = await supabase.from('categories').select('*').eq('user_id', user.id).eq('archived', false)

  return (
    <div className="pb-24 px-4 pt-6">
      <div className="flex items-center gap-3 mb-2">
        <Link href="/records" className="text-text bg-panel-soft p-2 rounded-full hover:opacity-70 transition-opacity border-2 border-line">
          <ArrowLeft size={24} strokeWidth={2.5} />
        </Link>
        <h1 className="text-2xl font-black text-text uppercase tracking-wider m-0">Subscriptions</h1>
      </div>
      <p className="text-muted mb-6">Transactions that automatically log themselves each month.</p>
      
      <RecurringList 
        initialData={recurring || []} 
        accounts={accounts || []} 
        categories={categories || []} 
      />
    </div>
  )
}
