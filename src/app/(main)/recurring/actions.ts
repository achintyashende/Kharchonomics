'use server'

import { createClient } from '@/lib/supabase/server'

export async function syncRecurringTransactions() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  const currentDay = now.getDate()

  const { data: recurring } = await supabase
    .from('recurring_transactions')
    .select('*')
    .eq('user_id', user.id)
    .eq('archived', false)
    .lte('day_of_month', currentDay)
    
  if (!recurring || recurring.length === 0) return

  const due = recurring.filter(r => 
    r.last_processed_month === null || 
    r.last_processed_year < currentYear || 
    (r.last_processed_year === currentYear && r.last_processed_month < currentMonth)
  )

  if (due.length === 0) return

  const transactionsToInsert = due.map(r => ({
    user_id: user.id,
    type: r.type,
    account_id: r.account_id,
    to_account_id: r.to_account_id,
    category_id: r.category_id,
    amount: r.amount,
    notes: r.notes ? `[Recurring] ${r.notes}` : 'Recurring Transaction',
    date: new Date(currentYear, currentMonth, r.day_of_month).toISOString().split('T')[0],
    time: '09:00:00'
  }))

  const { error } = await supabase.from('transactions').insert(transactionsToInsert)
  if (!error) {
    const ids = due.map(r => r.id)
    await supabase.from('recurring_transactions')
      .update({ last_processed_month: currentMonth, last_processed_year: currentYear })
      .in('id', ids)
  }
}

export async function addRecurringTransaction(data: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase.from('recurring_transactions').insert({
    user_id: user.id,
    ...data
  })
  
  if (error) throw new Error(error.message)
}

export async function deleteRecurringTransaction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase.from('recurring_transactions')
    .update({ archived: true })
    .eq('id', id)
    .eq('user_id', user.id)
    
  if (error) throw new Error(error.message)
}
