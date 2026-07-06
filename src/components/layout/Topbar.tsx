'use client'

import { Menu, Search, ChevronLeft, ChevronRight, Filter, Banknote, Sun, Moon } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { money } from '@/lib/utils'

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
  
  const handleLogout = async () => {
    // We can call an api endpoint to logout or use supabase client
    await fetch('/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  const handleMenuClick = () => setMenuOpen(!menuOpen)

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    try {
      const { importCSVData } = await import('@/app/(main)/settings/actions')
      const res = await importCSVData(text)
      alert(`Successfully imported ${res.count} records!`)
      setMenuOpen(false)
    } catch (err: any) {
      alert(`Import failed: ${err.message}`)
    }
  }

  const renderMenuDropdown = () => {
    if (!menuOpen) return null
    return (
      <div className="absolute top-14 left-4 z-50 bg-panel border-2 border-line rounded-lg shadow-app py-2 min-w-[200px]">
        <div className="px-4 py-2 border-b border-line mb-2">
          <div className="text-[12px] font-black tracking-widest uppercase text-muted">Logged in as</div>
          <div className="font-bold text-text truncate">{userName}</div>
        </div>
        
        <label className="w-full text-left px-4 py-3 bg-transparent border-none text-text font-bold hover:bg-panel-soft flex justify-between items-center cursor-pointer">
          Import CSV
          <span className="opacity-50">↑</span>
          <input type="file" accept=".csv" className="hidden" onChange={handleImport} />
        </label>

        <a href="/api/export" className="w-full text-left px-4 py-3 bg-transparent border-none text-text font-bold hover:bg-panel-soft flex justify-between items-center no-underline cursor-pointer" onClick={() => setMenuOpen(false)}>
          Export CSV
          <span className="opacity-50">↓</span>
        </a>

        <div className="h-[1px] bg-line my-2" />

        <a href="/recurring" className="w-full text-left px-4 py-3 bg-transparent border-none text-text font-bold hover:bg-panel-soft flex justify-between items-center no-underline cursor-pointer" onClick={() => setMenuOpen(false)}>
          Subscriptions
          <span className="opacity-50">↻</span>
        </a>

        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="w-full text-left px-4 py-3 bg-transparent border-none text-text font-bold hover:bg-panel-soft flex justify-between items-center cursor-pointer">
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          <span className="opacity-50">{theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}</span>
        </button>

        <div className="h-[1px] bg-line my-2" />
        
        <button onClick={handleLogout} className="w-full text-left px-4 py-3 bg-transparent border-none text-expense font-bold hover:bg-panel-soft flex justify-between items-center cursor-pointer">
          Logout
          <span className="opacity-50">→</span>
        </button>
      </div>
    )
  }

  const renderAccountsTopbar = () => (
    <header className="sticky top-0 z-10 bg-panel/85 backdrop-blur-xl shadow-app">
      <div className="flex justify-between items-center min-h-[60px] pt-3 pb-1 px-4 relative">
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
      <div className="grid grid-cols-[52px_1fr_52px_52px] items-center pt-3 pb-2.5 px-4 relative">
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
      <div className="flex justify-between items-center min-h-[60px] pt-3 pb-2 px-4 relative">
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
            <button className="w-11 h-11 grid place-items-center text-text peer" onClick={() => {}}>
              <Filter size={30} strokeWidth={2.6} />
            </button>
            
            <div className="absolute right-0 top-full mt-2 w-48 bg-panel border-2 border-line rounded-lg shadow-app py-2 opacity-0 invisible peer-focus-within:opacity-100 peer-focus-within:visible focus-within:opacity-100 focus-within:visible transition-all z-50">
              {['latest', 'highest', 'lowest'].map(sort => (
                <button 
                  key={sort}
                  className="w-full text-left px-4 py-2 hover:bg-panel-soft text-text font-bold capitalize flex items-center justify-between"
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString())
                    params.set('sort', sort)
                    router.push(`${pathname}?${params.toString()}`)
                  }}
                >
                  {sort}
                  {searchParams.get('sort') === sort || (!searchParams.get('sort') && sort === 'latest') ? '✓' : ''}
                </button>
              ))}
            </div>
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
