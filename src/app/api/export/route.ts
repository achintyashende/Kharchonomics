import { createClient } from '@/lib/supabase/server'
import Papa from 'papaparse'
import { format, parseISO } from 'date-fns'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const [{ data: transactions }, { data: accounts }, { data: categories }] = await Promise.all([
    supabase.from('transactions').select('*').eq('archived', false).order('date', { ascending: false }).order('time', { ascending: false }),
    supabase.from('accounts').select('*'),
    supabase.from('categories').select('*')
  ])

  if (!transactions) return new NextResponse('No data', { status: 404 })

  const csvData = transactions.map(tx => {
    const account = accounts?.find(a => a.id === tx.account_id)
    const toAccount = accounts?.find(a => a.id === tx.to_account_id)
    const category = categories?.find(c => c.id === tx.category_id)

    // Format TIME: Mar 22, 2026 6:17 PM
    let timeStr = ''
    try {
      const datePart = format(parseISO(tx.date), 'MMM dd, yyyy')
      const timePart = format(parseISO(`1970-01-01T${tx.time}`), 'h:mm a')
      timeStr = `${datePart} ${timePart}`
    } catch (e) {
      timeStr = `${tx.date} ${tx.time}`
    }

    // Format TYPE: (-) Expense, (+) Income, Transfer
    let typeStr = 'Transfer'
    if (tx.type === 'expense') typeStr = '(-) Expense'
    if (tx.type === 'income') typeStr = '(+) Income'

    // Format ACCOUNT
    let accStr = account?.name || ''
    if (tx.type === 'transfer' && toAccount) {
      accStr = `${account?.name || ''} -> ${toAccount.name}`
    }

    return {
      TIME: timeStr,
      TYPE: typeStr,
      AMOUNT: tx.amount.toFixed(2),
      CATEGORY: category?.name || '',
      ACCOUNT: accStr,
      NOTES: tx.notes || ''
    }
  })

  const csv = Papa.unparse(csvData)

  const filename = `export_${format(new Date(), 'dd_MM_yy_HHmm')}.csv`

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`
    }
  })
}
