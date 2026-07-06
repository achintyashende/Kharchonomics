'use server'

import { createClient } from '@/lib/supabase/server'
import Papa from 'papaparse'
import { parse, format } from 'date-fns'
import { revalidatePath } from 'next/cache'

export async function importCSVData(csvString: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const parsed = Papa.parse(csvString, { header: true, skipEmptyLines: true })
  const rows = parsed.data as any[]

  if (rows.length === 0) return { success: true, count: 0 }

  // 1. Fetch existing accounts & categories
  const { data: existingAccounts } = await supabase.from('accounts').select('*').eq('user_id', user.id)
  const { data: existingCategories } = await supabase.from('categories').select('*').eq('user_id', user.id)

  let accounts = existingAccounts || []
  let categories = existingCategories || []

  const transactionsToInsert = []

  for (const row of rows) {
    const rawTime = row['TIME']
    const rawType = row['TYPE']
    const rawAmount = row['AMOUNT']
    const rawCategory = row['CATEGORY']
    const rawAccount = row['ACCOUNT']
    const rawNotes = row['NOTES']

    if (!rawTime || !rawType || !rawAmount || !rawAccount) continue

    // Parse Time: "Mar 22, 2026 6:17 PM"
    let dateStr = ''
    let timeStr = ''
    try {
      const parsedDate = parse(rawTime, 'MMM d, yyyy h:mm a', new Date())
      dateStr = format(parsedDate, 'yyyy-MM-dd')
      timeStr = format(parsedDate, 'HH:mm')
    } catch (e) {
      console.error('Failed to parse time', rawTime)
      continue // Skip invalid rows
    }

    // Parse Type
    let type = 'expense'
    if (rawType.includes('Income')) type = 'income'
    if (rawType.includes('Transfer')) type = 'transfer'

    // Parse Amount
    const amount = Math.abs(parseFloat(rawAmount))
    if (isNaN(amount)) continue

    // Resolve Account
    let accName = rawAccount
    let toAccName = null
    if (type === 'transfer' && accName.includes('->')) {
      const parts = accName.split('->').map((p: string) => p.trim())
      accName = parts[0]
      toAccName = parts[1]
    }

    // Find or create account
    let account = accounts.find(a => a.name.toLowerCase() === accName.toLowerCase())
    if (!account) {
      const { data: newAcc, error } = await supabase.from('accounts').insert({
        user_id: user.id,
        name: accName,
        icon: 'wallet',
        initial_balance: 0
      }).select().single()
      if (newAcc) {
        accounts.push(newAcc)
        account = newAcc
      }
    }

    // Find or create toAccount if transfer
    let toAccount = null
    if (type === 'transfer' && toAccName) {
      toAccount = accounts.find(a => a.name.toLowerCase() === toAccName?.toLowerCase())
      if (!toAccount) {
        const { data: newToAcc } = await supabase.from('accounts').insert({
          user_id: user.id,
          name: toAccName,
          icon: 'wallet',
          initial_balance: 0
        }).select().single()
        if (newToAcc) {
          accounts.push(newToAcc)
          toAccount = newToAcc
        }
      }
    }

    // Find or create category
    let category = null
    if (type !== 'transfer' && rawCategory) {
      category = categories.find(c => c.name.toLowerCase() === rawCategory.toLowerCase() && c.type === type)
      if (!category) {
        const { data: newCat } = await supabase.from('categories').insert({
          user_id: user.id,
          name: rawCategory,
          type: type,
          icon: 'tag',
          color: '#808080'
        }).select().single()
        if (newCat) {
          categories.push(newCat)
          category = newCat
        }
      }
    }

    transactionsToInsert.push({
      user_id: user.id,
      type: type,
      amount: amount,
      account_id: account?.id,
      to_account_id: toAccount?.id || null,
      category_id: category?.id || null,
      notes: rawNotes || '',
      date: dateStr,
      time: timeStr
    })
  }

  if (transactionsToInsert.length > 0) {
    // Chunk inserts if extremely large
    const CHUNK_SIZE = 1000
    for (let i = 0; i < transactionsToInsert.length; i += CHUNK_SIZE) {
      const chunk = transactionsToInsert.slice(i, i + CHUNK_SIZE)
      await supabase.from('transactions').insert(chunk)
    }
  }

  revalidatePath('/records')
  revalidatePath('/analysis')
  revalidatePath('/accounts')
  revalidatePath('/categories')
  
  return { success: true, count: transactionsToInsert.length }
}
