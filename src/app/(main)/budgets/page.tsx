import { createClient } from '@/lib/supabase/server'
import { Topbar } from '@/components/layout/Topbar'
import BudgetManager from '@/components/budgets/BudgetManager'

export default async function BudgetsPage(props: { searchParams: Promise<{ m?: string, y?: string }> }) {
  const searchParams = await props.searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'

  const currentMonth = searchParams.m ? parseInt(searchParams.m) : new Date().getMonth()
  const currentYear = searchParams.y ? parseInt(searchParams.y) : new Date().getFullYear()

  const startDate = new Date(currentYear, currentMonth, 1).toLocaleDateString('en-CA')
  const endDate = new Date(currentYear, currentMonth + 1, 0).toLocaleDateString('en-CA')

  const [{ data: budgets }, { data: categories }, { data: transactions }] = await Promise.all([
    supabase.from('budgets').select('*').eq('archived', false).eq('month', currentMonth).eq('year', currentYear),
    supabase.from('categories').select('*').eq('archived', false),
    supabase.from('transactions').select('*').eq('archived', false).gte('date', startDate).lte('date', endDate)
  ])

  let expenseTotal = 0
  ;(transactions || []).forEach(tx => {
    if (tx.type === 'expense') expenseTotal += tx.amount
  })

  let totalBudget = 0
  ;(budgets || []).forEach(b => {
    totalBudget += b.limit_amount
  })

  return (
    <>
      <Topbar userName={userName} month={currentMonth} year={currentYear} expenseTotal={expenseTotal} balanceTotal={totalBudget} />
      <div className="p-6 px-4">
        <BudgetManager 
          budgets={budgets || []} 
          categories={categories || []} 
          transactions={transactions || []}
          month={currentMonth}
          year={currentYear}
        />
      </div>
    </>
  )
}
