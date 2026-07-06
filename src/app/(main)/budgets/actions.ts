'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function setBudget(data: {
  categoryId: string
  month: number
  year: number
  limitAmount: number
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Check if budget exists for this month/category
  const { data: existing } = await supabase
    .from('budgets')
    .select('id')
    .eq('user_id', user.id)
    .eq('category_id', data.categoryId)
    .eq('month', data.month)
    .eq('year', data.year)
    .single()

  if (existing) {
    if (data.limitAmount === 0) {
      await supabase.from('budgets').delete().eq('id', existing.id)
    } else {
      await supabase.from('budgets').update({ limit_amount: data.limitAmount }).eq('id', existing.id)
    }
  } else if (data.limitAmount > 0) {
    await supabase.from('budgets').insert({
      user_id: user.id,
      category_id: data.categoryId,
      month: data.month,
      year: data.year,
      limit_amount: data.limitAmount
    })
  }

  revalidatePath('/budgets')
}
