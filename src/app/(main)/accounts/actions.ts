import { db } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

export async function saveAccount(data: {
  id?: string
  name: string
  icon: string
  initialBalance: number
}) {
  if (data.id) {
    await db.accounts.update(data.id, {
      name: data.name,
      icon: data.icon,
      initial_balance: data.initialBalance,
    })
  } else {
    await db.accounts.add({
      id: uuidv4(),
      name: data.name,
      icon: data.icon,
      initial_balance: data.initialBalance,
      archived: false,
      ignored: false,
      created_at: new Date().toISOString()
    })
  }
}

export async function deleteAccount(id: string) {
  // Archive the account itself
  await db.accounts.update(id, { archived: true })
  
  // Archive all transactions associated with this account (Cascade)
  await db.transactions.where('account_id').equals(id).modify({ archived: true })
  await db.transactions.where('to_account_id').equals(id).modify({ archived: true })
}

export async function toggleIgnoreAccount(id: string, currentlyIgnored: boolean) {
  await db.accounts.update(id, { ignored: !currentlyIgnored })
}
