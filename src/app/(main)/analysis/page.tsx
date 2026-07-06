import { createClient } from '@/lib/supabase/server'
import { Topbar } from '@/components/layout/Topbar'
import AnalysisDashboard from '@/components/analysis/AnalysisDashboard'

export default async function AnalysisPage(props: { searchParams: Promise<{ m?: string, y?: string }> }) {
  const searchParams = await props.searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'

  const currentMonth = searchParams.m ? parseInt(searchParams.m) : new Date().getMonth()
  const currentYear = searchParams.y ? parseInt(searchParams.y) : new Date().getFullYear()

  const startDate = new Date(currentYear, currentMonth, 1).toLocaleDateString('en-CA')
  const endDate = new Date(currentYear, currentMonth + 1, 0).toLocaleDateString('en-CA')

  const [{ data: transactions }, { data: categories }] = await Promise.all([
    supabase
      .from('transactions')
      .select('*')
      .eq('archived', false)
      .gte('date', startDate)
      .lte('date', endDate),
    supabase.from('categories').select('*').eq('archived', false)
  ])

  let expenseTotal = 0
  let incomeTotal = 0
  
  ;(transactions || []).forEach(tx => {
    if (tx.type === 'expense') expenseTotal += tx.amount
    if (tx.type === 'income') incomeTotal += tx.amount
  })

  return (
    <>
      <Topbar userName={userName} month={currentMonth} year={currentYear} expenseTotal={expenseTotal} incomeTotal={incomeTotal} />
      <div className="p-6 px-4">
        <AnalysisDashboard transactions={transactions || []} categories={categories || []} />
      </div>
    </>
  )
}
