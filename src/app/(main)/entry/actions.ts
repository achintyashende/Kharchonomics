'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function saveTransaction(data: {
  id?: string
  type: 'income' | 'expense' | 'transfer'
  amount: number
  accountId: string
  toAccountId: string | null
  categoryId: string | null
  notes: string
  date: string
  time: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  if (data.type === 'transfer' && data.accountId === data.toAccountId) {
    throw new Error('Transfer from and to accounts cannot be the same')
  }

  const payload = {
    user_id: user.id,
    type: data.type,
    amount: data.amount,
    account_id: data.accountId,
    to_account_id: data.type === 'transfer' ? data.toAccountId : null,
    category_id: data.type === 'transfer' ? null : data.categoryId,
    notes: data.notes,
    date: data.date,
    time: data.time,
  }

  if (data.id) {
    const { error } = await supabase.from('transactions').update(payload).eq('id', data.id).eq('user_id', user.id)
    if (error) {
      console.error('Error updating transaction:', error)
      throw new Error('Failed to update transaction')
    }
  } else {
    const { error } = await supabase.from('transactions').insert(payload)
    if (error) {
      console.error('Error creating transaction:', error)
      throw new Error('Failed to create transaction')
    }
  }

  revalidatePath('/records')
  revalidatePath('/analysis')
  redirect('/records')
}

export async function deleteTransaction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  await supabase.from('transactions').update({ archived: true }).eq('id', id).eq('user_id', user.id)
  revalidatePath('/records')
  revalidatePath('/analysis')
  redirect('/records')
}
