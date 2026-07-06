'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveCategory(data: {
  id?: string
  name: string
  type: 'income' | 'expense'
  icon: string
  color: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  if (data.id) {
    const { error } = await supabase.from('categories').update({
      name: data.name,
      type: data.type,
      icon: data.icon,
      color: data.color,
    }).eq('id', data.id).eq('user_id', user.id)
    if (error) throw new Error(error.message)
  } else {
    const { error } = await supabase.from('categories').insert({
      user_id: user.id,
      name: data.name,
      type: data.type,
      icon: data.icon,
      color: data.color,
    })
    if (error) throw new Error(error.message)
  }

  revalidatePath('/categories')
  revalidatePath('/records')
  revalidatePath('/analysis')
  revalidatePath('/budgets')
  revalidatePath('/entry')
}

export async function deleteCategory(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  await supabase.from('categories').update({ archived: true }).eq('id', id).eq('user_id', user.id)
  
  revalidatePath('/categories')
  revalidatePath('/records')
  revalidatePath('/analysis')
  revalidatePath('/budgets')
  revalidatePath('/entry')
}
