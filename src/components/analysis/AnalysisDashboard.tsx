'use client'

import { useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { Category, Transaction } from '@/lib/types'
import { CategoryIcon } from '@/components/ui/CategoryIcon'
import { money } from '@/lib/utils'

export default function AnalysisDashboard({ 
  transactions, 
  categories 
}: { 
  transactions: Transaction[], 
  categories: Category[] 
}) {
  const [viewType, setViewType] = useState<'expense' | 'income'>('expense')
  
  const relevantTransactions = transactions.filter(tx => tx.type === viewType)
  const totalAmount = relevantTransactions.reduce((sum, tx) => sum + tx.amount, 0)
  
  // Aggregate by category
  const categoryTotals: Record<string, number> = {}
  relevantTransactions.forEach(tx => {
    if (!tx.category_id) return
    categoryTotals[tx.category_id] = (categoryTotals[tx.category_id] || 0) + tx.amount
  })

  // Format data for chart
  const data = Object.entries(categoryTotals)
    .map(([id, value]) => {
      const category = categories.find(c => c.id === id)
      return {
        id,
        name: category?.name || 'Unknown',
        value,
        color: category?.color || '#999',
        icon: category?.icon || 'receipt',
        percentage: (value / totalAmount) * 100
      }
    })
    .sort((a, b) => b.value - a.value) // Sort by largest amount

  return (
    <div className="pb-[80px]">
      <div className="flex justify-center my-6">
        <div className="flex bg-[rgba(255,255,255,0.1)] rounded-lg p-1">
          <button 
            onClick={() => setViewType('expense')}
            className={`px-4 py-1.5 rounded text-sm font-bold tracking-wider transition-colors ${viewType === 'expense' ? 'bg-panel-soft text-text' : 'text-muted'}`}
          >
            EXPENSE OVERVIEW
          </button>
          <button 
            onClick={() => setViewType('income')}
            className={`px-4 py-1.5 rounded text-sm font-bold tracking-wider transition-colors ${viewType === 'income' ? 'bg-panel-soft text-text' : 'text-muted'}`}
          >
            INCOME OVERVIEW
          </button>
        </div>
      </div>

      {data.length === 0 ? (
        <p className="max-w-[560px] mx-auto mt-7 text-muted text-center text-[clamp(20px,5vw,28px)] leading-relaxed">
          Analysis appears after you add {viewType}s for this month.
        </p>
      ) : (
        <>
          <div className="flex gap-4 items-center mb-8 h-[220px]">
            <div className="w-[200px] h-full relative shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={95}
                    paddingAngle={0}
                    dataKey="value"
                    stroke="none"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 grid place-items-center pointer-events-none">
                <span className="text-text font-bold text-sm tracking-wide capitalize">{viewType}s</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto max-h-full pr-2 space-y-2.5">
              {data.map(item => (
                <div key={item.id} className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-text text-[clamp(14px,3.5vw,16px)] font-semibold truncate leading-tight">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-0">
            {data.map(item => (
              <div key={item.id} className="grid grid-cols-[64px_1fr_64px] gap-3 items-center py-3 border-t border-[rgba(199,195,154,0.25)]">
                <div 
                  className="w-14 h-14 rounded-full grid place-items-center text-white shrink-0"
                  style={{ backgroundColor: item.color }}
                >
                  <CategoryIcon name={item.icon} className="w-8 h-8" />
                </div>
                
                <div className="min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-text text-[clamp(18px,4.5vw,24px)] font-bold truncate pr-2">{item.name}</span>
                    <span className={`font-black text-[clamp(16px,4vw,20px)] whitespace-nowrap ${viewType === 'expense' ? 'text-expense' : 'text-income'}`}>
                      {viewType === 'expense' ? '-' : '+'}{money(item.value)}
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-line rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-text"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
                
                <div className="text-text font-bold text-right text-[clamp(14px,3.8vw,18px)]">
                  {item.percentage.toFixed(2)}%
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
