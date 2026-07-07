import { db } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

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
  if (data.type === 'transfer' && data.accountId === data.toAccountId) {
    throw new Error('Transfer from and to accounts cannot be the same')
  }

  const payload = {
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
    await db.transactions.update(data.id, payload)
  } else {
    await db.transactions.add({
      id: uuidv4(),
      ...payload,
      archived: false,
      created_at: new Date().toISOString()
    })
  }
}

export async function deleteTransaction(id: string) {
  await db.transactions.update(id, { archived: true })
}
