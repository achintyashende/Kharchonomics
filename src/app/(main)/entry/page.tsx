import { createClient } from '@/lib/supabase/server'
import EntryForm from '@/components/entry/EntryForm'

export default async function EntryPage(props: { searchParams: Promise<{ id?: string }> }) {
  const searchParams = await props.searchParams
  const supabase = await createClient()
  
  const [accountsResponse, categoriesResponse, transactionResponse] = await Promise.all([
    supabase.from('accounts').select('*').eq('archived', false).order('created_at'),
    supabase.from('categories').select('*').eq('archived', false).order('name'),
    searchParams.id ? supabase.from('transactions').select('*').eq('id', searchParams.id).single() : Promise.resolve({ data: null })
  ])
  
  return (
    <div className="fixed inset-0 z-50 bg-bg p-[env(safe-area-inset-top)_18px_env(safe-area-inset-bottom)] flex flex-col md:max-w-[520px] md:mx-auto md:border-l md:border-r md:border-[#ffffff2e] overflow-y-auto">
      <EntryForm 
        accounts={accountsResponse.data || []} 
        categories={categoriesResponse.data || []} 
        initialTransaction={transactionResponse.data}
      />
    </div>
  )
}
