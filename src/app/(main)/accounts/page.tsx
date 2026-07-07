'use client'

import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import AccountManager from '@/components/accounts/AccountManager'
import { Topbar } from '@/components/layout/Topbar'

export default function AccountsPage() {
  const userName = 'User'

  const accounts = useLiveQuery(() => db.accounts.filter(a => !a.archived).toArray())
  const transactions = useLiveQuery(() => db.transactions.filter(t => !t.archived).toArray())

  if (accounts === undefined || transactions === undefined) {
    return null
  }

  let totalBalance = 0
  let expenseTotal = 0
  let incomeTotal = 0

  const accountsWithLiveBalance = accounts.map(acc => {
    let currentBalance = acc.initial_balance
    
    transactions.forEach(tx => {
      if (tx.type === 'expense' && tx.account_id === acc.id) {
        currentBalance -= tx.amount
        if (!acc.ignored) expenseTotal += tx.amount
      }
      if (tx.type === 'income' && tx.account_id === acc.id) {
        currentBalance += tx.amount
        if (!acc.ignored) incomeTotal += tx.amount
      }
      if (tx.type === 'transfer' && tx.account_id === acc.id) {
        currentBalance -= tx.amount
      }
      if (tx.type === 'transfer' && tx.to_account_id === acc.id) {
        currentBalance += tx.amount
      }
    })

    if (!acc.ignored) {
      totalBalance += currentBalance
    }
    
    return { ...acc, live_balance: currentBalance }
  })

  return (
    <>
      <Topbar userName={userName} balanceTotal={totalBalance} expenseTotal={expenseTotal} incomeTotal={incomeTotal} />
      <div className="p-6 px-4 pb-[100px]">
        <AccountManager accounts={accountsWithLiveBalance as any} />
      </div>
    </>
  )
}
