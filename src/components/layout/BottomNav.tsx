'use client'

import { List, PieChart, Wallet, CreditCard, LayoutGrid } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function BottomNav() {
  const pathname = usePathname()
  
  const tabs = [
    { id: 'records', label: 'Records', href: '/records', icon: List },
    { id: 'analysis', label: 'Analysis', href: '/analysis', icon: PieChart },
    { id: 'budgets', label: 'Budgets', href: '/budgets', icon: Wallet },
    { id: 'accounts', label: 'Accounts', href: '/accounts', icon: CreditCard },
    { id: 'categories', label: 'Categories', href: '/categories', icon: LayoutGrid },
  ]
  
  return (
    <nav className="relative z-[50] grid grid-cols-5 min-h-[calc(72px+env(safe-area-inset-bottom))] pb-[env(safe-area-inset-bottom)] px-1 pt-1.5 bg-panel/85 backdrop-blur-xl shadow-[0_-8px_22px_rgba(2,21,38,0.4)] md:max-w-[520px] md:mx-auto">
      {tabs.map((tab) => {
        const isActive = pathname.startsWith(tab.href)
        const Icon = tab.icon
        return (
          <Link 
            key={tab.id} 
            href={tab.href}
            className={`flex flex-col items-center justify-center gap-0.5 text-[13px] font-bold ${isActive ? 'text-text' : 'text-muted'}`}
          >
            <Icon size={30} strokeWidth={isActive ? 2.8 : 2.4} />
            <span>{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
