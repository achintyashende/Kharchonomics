import { db } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

export async function syncRecurringTransactions() {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  const currentDay = now.getDate()
  
  const currentMonthString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`

  const recurring = await db.recurring_transactions
    .filter(r => !r.archived && r.day_of_month <= currentDay)
    .toArray()
    
  if (recurring.length === 0) return

  const due = recurring.filter(r => r.last_processed_date !== currentMonthString)

  if (due.length === 0) return

  const transactionsToInsert = due.map(r => ({
    id: uuidv4(),
    type: r.type,
    account_id: r.account_id,
    to_account_id: r.to_account_id,
    category_id: r.category_id,
    amount: r.amount,
    notes: 'Recurring Transaction',
    date: new Date(currentYear, currentMonth, r.day_of_month).toISOString().split('T')[0],
    time: '09:00',
    archived: false,
    created_at: new Date().toISOString()
  }))

  await db.transactions.bulkAdd(transactionsToInsert)
  
  const dueIds = due.map(r => r.id)
  await Promise.all(dueIds.map(id => db.recurring_transactions.update(id, { last_processed_date: currentMonthString })))
}

export async function addRecurringTransaction(data: any) {
  await db.recurring_transactions.add({
    id: uuidv4(),
    ...data,
    archived: false,
    created_at: new Date().toISOString(),
    last_processed_date: null
  })
}

export async function deleteRecurringTransaction(id: string) {
  await db.recurring_transactions.update(id, { archived: true })
}
