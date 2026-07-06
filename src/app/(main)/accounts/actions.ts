'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveAccount(data: {
  id?: string
  name: string
  icon: string
  initialBalance: number
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  if (data.id) {
    const { error } = await supabase.from('accounts').update({
      name: data.name,
      icon: data.icon,
      initial_balance: data.initialBalance,
    }).eq('id', data.id).eq('user_id', user.id)
    if (error) throw new Error(error.message)
  } else {
    const { error } = await supabase.from('accounts').insert({
      user_id: user.id,
      name: data.name,
      icon: data.icon,
      initial_balance: data.initialBalance,
    })
    if (error) throw new Error(error.message)
  }

  revalidatePath('/accounts')
  revalidatePath('/records')
  revalidatePath('/entry')
}

export async function deleteAccount(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Archive the account itself
  await supabase.from('accounts').update({ archived: true }).eq('id', id).eq('user_id', user.id)
  
  // Archive all transactions associated with this account (Cascade)
  await supabase.from('transactions').update({ archived: true }).eq('account_id', id).eq('user_id', user.id)
  await supabase.from('transactions').update({ archived: true }).eq('to_account_id', id).eq('user_id', user.id)
  revalidatePath('/accounts')
  revalidatePath('/records')
}

export async function toggleIgnoreAccount(id: string, currentlyIgnored: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  await supabase.from('accounts').update({ ignored: !currentlyIgnored }).eq('id', id).eq('user_id', user.id)
  revalidatePath('/accounts')
}
