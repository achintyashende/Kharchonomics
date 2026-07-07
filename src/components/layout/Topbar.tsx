'use client'

import { Menu, Search, ChevronLeft, ChevronRight, Filter, Banknote, Sun, Moon } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { money } from '@/lib/utils'
import { db } from '@/lib/db'

export type TopbarProps = {
  userName: string
  expenseTotal?: number
  incomeTotal?: number
  balanceTotal?: number
  month?: number
  year?: number
}

export function Topbar({ userName, expenseTotal = 0, incomeTotal = 0, balanceTotal = 0, month, year }: TopbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [timeOfDay, setTimeOfDay] = useState('day')
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    const hour = new Date().getHours()
    setTimeOfDay(hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening')
  }, [])

  const currentMonth = month ?? new Date().getMonth()
  const currentYear = year ?? new Date().getFullYear()

  const changeMonth = (delta: number) => {
    const d = new Date(currentYear, currentMonth + delta, 1)
    const params = new URLSearchParams(searchParams.toString())
    params.set('m', d.getMonth().toString())
    params.set('y', d.getFullYear().toString())
    router.push(`${pathname}?${params.toString()}`)
  }
  
  const monthName = new Date(currentYear, currentMonth, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
  
  const handleMenuClick = () => setMenuOpen(!menuOpen)

  const handleImportJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      
      if (confirm('This will merge the backup into your current data. Continue?')) {
        await db.transaction('rw', db.accounts, db.categories, db.transactions, db.budgets, db.recurring_transactions, async () => {
          if (data.accounts) await db.accounts.bulkPut(data.accounts)
          if (data.categories) await db.categories.bulkPut(data.categories)
          if (data.transactions) await db.transactions.bulkPut(data.transactions)
          if (data.budgets) await db.budgets.bulkPut(data.budgets)
          if (data.recurring_transactions) await db.recurring_transactions.bulkPut(data.recurring_transactions)
        })
        alert('Backup restored successfully!')
        window.location.reload()
      }
    } catch (err: any) {
      alert('Import failed. Invalid backup file.')
    }
    setMenuOpen(false)
  }

  const handleExportJSON = async () => {
    const data = {
      accounts: await db.accounts.toArray(),
      categories: await db.categories.toArray(),
      transactions: await db.transactions.toArray(),
      budgets: await db.budgets.toArray(),
      recurring_transactions: await db.recurring_transactions.toArray(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Kaash_Backup_${new Date().toISOString().split('T')[0]}.kaash`
    a.click()
    URL.revokeObjectURL(url)
    setMenuOpen(false)
  }

  const renderMenuDropdown = () => {
    if (!menuOpen) return null
    return (
      <>
        <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
        <div className="absolute top-14 left-4 z-50 bg-panel border-2 border-line rounded-lg shadow-app py-2 min-w-[200px]">
        <div className="px-4 py-2 border-b border-line mb-2">
          <div className="text-[12px] font-black tracking-widest uppercase text-muted">Logged in as</div>
          <div className="font-bold text-text truncate">{userName}</div>
        </div>
        
        <label className="w-full text-left px-4 py-3 bg-transparent border-none text-text font-bold hover:bg-panel-soft flex justify-between items-center cursor-pointer">
          Restore Backup
          <span className="opacity-50">↑</span>
          <input type="file" accept=".kaash" className="hidden" onChange={handleImportJSON} />
        </label>

        <button onClick={handleExportJSON} className="w-full text-left px-4 py-3 bg-transparent border-none text-text font-bold hover:bg-panel-soft flex justify-between items-center cursor-pointer">
          Save Backup
          <span className="opacity-50">↓</span>
        </button>

        <div className="h-[1px] bg-line my-2" />

        <a href="/recurring" className="w-full text-left px-4 py-3 bg-transparent border-none text-text font-bold hover:bg-panel-soft flex justify-between items-center no-underline cursor-pointer" onClick={() => setMenuOpen(false)}>
          Subscriptions
          <span className="opacity-50">↻</span>
        </a>

        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="w-full text-left px-4 py-3 bg-transparent border-none text-text font-bold hover:bg-panel-soft flex justify-between items-center cursor-pointer">
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          <span className="opacity-50">{theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}</span>
        </button>
      </div>
      </>
    )
  }

  const renderAccountsTopbar = () => (
    <header className="sticky top-0 z-10 bg-panel/85 backdrop-blur-xl shadow-app">
      <div className="flex justify-between items-center min-h-[60px] pt-[max(48px,env(safe-area-inset-top))] pb-1 px-4 relative">
        <div className="flex items-center gap-3">
          <button onClick={handleMenuClick} className="w-10 h-10 grid place-items-center text-text -ml-2">
            <Menu size={28} strokeWidth={2.6} />
          </button>
          <h1 className="m-0 font-sans text-[20px] font-black tracking-wide text-text uppercase truncate">
            All Accounts <span className="text-text ml-1">{money(balanceTotal)}</span>
          </h1>
        </div>
        <div className="flex items-center">
          <button className="w-10 h-10 grid place-items-center text-text -mr-2" onClick={() => setSearchOpen(!searchOpen)}>
            <Search size={26} strokeWidth={2.6} />
          </button>
        </div>
        {renderMenuDropdown()}
      </div>
      <div className="grid grid-cols-2 gap-2 pb-4 pt-1.5 px-4 text-center">
        <div>
          <div className="text-[14px] font-black tracking-widest uppercase text-text">Expense so far</div>
          <div className="mt-1.5 text-[clamp(16px,4vw,20px)] font-black text-expense">{money(expenseTotal)}</div>
        </div>
        <div>
          <div className="text-[14px] font-black tracking-widest uppercase text-text">Income so far</div>
          <div className="mt-1.5 text-[clamp(16px,4vw,20px)] font-black text-income">{money(incomeTotal)}</div>
        </div>
      </div>
    </header>
  )

  const renderBudgetsTopbar = () => (
    <header className="sticky top-0 z-10 bg-panel/85 backdrop-blur-xl shadow-app">
      <div className="grid grid-cols-[52px_1fr_52px_52px] items-center pt-[max(48px,env(safe-area-inset-top))] pb-2.5 px-4 relative">
        <button onClick={() => changeMonth(-1)} className="w-11 h-11 grid place-items-center text-text"><ChevronLeft size={30} strokeWidth={2.6} /></button>
        <h1 className="m-0 text-center text-[clamp(24px,6vw,34px)]">{monthName}</h1>
        <button onClick={() => changeMonth(1)} className="w-11 h-11 grid place-items-center text-text"><ChevronRight size={30} strokeWidth={2.6} /></button>
        <span />
      </div>
      <div className="grid grid-cols-2 gap-2 pb-4 pt-1.5 px-4 text-center">
        <div>
          <div className="text-[14px] font-black tracking-widest uppercase text-text">Total Budget</div>
          <div className="mt-1.5 text-[clamp(16px,4vw,20px)] font-black">{money(balanceTotal)}</div>
        </div>
        <div>
          <div className="text-[14px] font-black tracking-widest uppercase text-text">Total Spent</div>
          <div className="mt-1.5 text-[clamp(16px,4vw,20px)] font-black text-expense">{money(expenseTotal)}</div>
        </div>
      </div>
    </header>
  )

  const renderDefaultTopbar = () => (
    <header className="sticky top-0 z-10 bg-panel/85 backdrop-blur-xl shadow-app">
      <div className="flex justify-between items-center min-h-[60px] pt-[max(48px,env(safe-area-inset-top))] pb-2 px-4 relative">
        <div className="flex items-center gap-4">
          <button onClick={handleMenuClick} className="p-2 -ml-2 bg-transparent border-none text-text flex items-center justify-center">
            <Menu size={26} strokeWidth={2.5} />
          </button>
          <div className="flex flex-col justify-center -mt-0.5">
            <span className="font-sans font-black text-xl tracking-[0.15em] uppercase text-[var(--brand)] leading-[1.1]">
              Kaash
            </span>
            <span className="font-sans font-medium text-[13px] tracking-tight text-muted leading-[1.1]">
              Good {timeOfDay}, {userName.split(' ')[0]}
            </span>
          </div>
        </div>
        <div className="flex items-center">
          <button className="w-10 h-10 grid place-items-center text-text -mr-2" onClick={() => setSearchOpen(!searchOpen)}>
            <Search size={26} strokeWidth={2.6} />
          </button>
        </div>
        {renderMenuDropdown()}
      </div>
      
      {searchOpen && (
        <div className="px-4 pb-3.5 relative">
          <input 
            className="w-full min-h-[48px] p-2.5 px-3.5 border-2 border-line rounded-lg bg-panel-soft text-text outline-none" 
            placeholder="Search records" 
            defaultValue={searchParams.get('q') || ''}
            onChange={(e) => {
              const params = new URLSearchParams(searchParams.toString())
              if (e.target.value) params.set('q', e.target.value)
              else params.delete('q')
              router.replace(`${pathname}?${params.toString()}`)
            }}
          />
        </div>
      )}

      <div className="grid grid-cols-[52px_1fr_52px_52px] items-center pt-2 pb-2.5 px-4 relative group">
        <button onClick={() => changeMonth(-1)} className="w-11 h-11 grid place-items-center text-text"><ChevronLeft size={30} strokeWidth={2.6} /></button>
        <h1 className="m-0 text-center text-[clamp(24px,6vw,34px)]">{monthName}</h1>
        <button onClick={() => changeMonth(1)} className="w-11 h-11 grid place-items-center text-text"><ChevronRight size={30} strokeWidth={2.6} /></button>
        
        {pathname.startsWith('/records') || pathname === '/' ? (
          <div className="relative">
            <button className="w-11 h-11 grid place-items-center text-text" onClick={() => setFilterOpen(!filterOpen)}>
              <Filter size={30} strokeWidth={2.6} />
            </button>
            
            {filterOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setFilterOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-48 bg-panel border-2 border-line rounded-lg shadow-app py-2 z-50">
                {['latest', 'highest', 'lowest'].map(sort => (
                  <button 
                    key={sort}
                    className="w-full text-left px-4 py-2 hover:bg-panel-soft text-text font-bold capitalize flex items-center justify-between"
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString())
                      params.set('sort', sort)
                      router.push(`${pathname}?${params.toString()}`)
                      setFilterOpen(false)
                    }}
                  >
                    {sort}
                    {searchParams.get('sort') === sort || (!searchParams.get('sort') && sort === 'latest') ? '✓' : ''}
                  </button>
                ))}
                </div>
              </>
            )}
          </div>
        ) : <span />}
      </div>
      
      <div className="grid grid-cols-3 gap-2 pb-4 pt-1.5 px-4 text-center">
        <div>
          <div className="text-[14px] font-black tracking-widest uppercase text-text">Expense</div>
          <div className="mt-1.5 text-[clamp(16px,4vw,20px)] font-black text-expense">{money(expenseTotal)}</div>
        </div>
        <div>
          <div className="text-[14px] font-black tracking-widest uppercase text-text">Income</div>
          <div className="mt-1.5 text-[clamp(16px,4vw,20px)] font-black text-income">{money(incomeTotal)}</div>
        </div>
        <div>
          <div className="text-[14px] font-black tracking-widest uppercase text-text">Total</div>
          <div className={`mt-1.5 text-[clamp(16px,4vw,20px)] font-black ${incomeTotal - expenseTotal >= 0 ? 'text-income' : 'text-expense'}`}>
            {money(incomeTotal - expenseTotal)}
          </div>
        </div>
      </div>
    </header>
  )

  if (pathname.startsWith('/accounts')) return renderAccountsTopbar()
  if (pathname.startsWith('/budgets')) return renderBudgetsTopbar()
  
  return renderDefaultTopbar()
}
