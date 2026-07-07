import { db } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

export async function setBudget(data: {
  categoryId: string
  month: number
  year: number
  limitAmount: number
}) {
  // Check if budget exists for this month/category
  const existing = await db.budgets
    .where({ month: data.month, year: data.year, category_id: data.categoryId })
    .first()

  if (existing) {
    if (data.limitAmount === 0) {
      await db.budgets.delete(existing.id)
    } else {
      await db.budgets.update(existing.id, { limit_amount: data.limitAmount })
    }
  } else if (data.limitAmount > 0) {
    await db.budgets.add({
      id: uuidv4(),
      category_id: data.categoryId,
      month: data.month,
      year: data.year,
      limit_amount: data.limitAmount,
      archived: false,
      created_at: new Date().toISOString()
    })
  }
}
