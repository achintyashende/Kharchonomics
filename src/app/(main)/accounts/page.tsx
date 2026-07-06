import { createClient } from '@/lib/supabase/server'
import AccountManager from '@/components/accounts/AccountManager'
import { Topbar } from '@/components/layout/Topbar'

export default async function AccountsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'

  const [{ data: accounts }, { data: transactions }] = await Promise.all([
    supabase.from('accounts').select('*').eq('archived', false).order('created_at'),
    supabase.from('transactions').select('*').eq('archived', false)
  ])

  let totalBalance = 0
  let expenseTotal = 0
  let incomeTotal = 0

  const accountsWithLiveBalance = (accounts || []).map(acc => {
    let currentBalance = acc.initial_balance
    
    ;(transactions || []).forEach(tx => {
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
