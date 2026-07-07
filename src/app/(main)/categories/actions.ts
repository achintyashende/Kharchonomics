import { db } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

export async function saveCategory(data: {
  id?: string
  name: string
  type: 'income' | 'expense'
  icon: string
  color: string
}) {
  if (data.id) {
    await db.categories.update(data.id, {
      name: data.name,
      type: data.type,
      icon: data.icon,
      color: data.color,
    })
  } else {
    await db.categories.add({
      id: uuidv4(),
      name: data.name,
      type: data.type,
      icon: data.icon,
      color: data.color,
      archived: false,
      created_at: new Date().toISOString()
    })
  }
}

export async function deleteCategory(id: string) {
  await db.categories.update(id, { archived: true })
}
