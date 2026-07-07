'use client'

import { useState } from 'react'
import { Category, Budget, Transaction } from '@/lib/types'
import { CategoryIcon } from '@/components/ui/CategoryIcon'
import { money } from '@/lib/utils'
import { setBudget } from '@/app/(main)/budgets/actions'

export default function BudgetManager({ 
  budgets, 
  categories, 
  transactions,
  month,
  year 
}: { 
  budgets: Budget[], 
  categories: Category[], 
  transactions: Transaction[],
  month: number,
  year: number 
}) {
  const [modalOpen, setModalOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<Category | null>(null)
  const [amountText, setAmountText] = useState('0')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const expenseCategories = categories.filter(c => c.type === 'expense')
  const budgetedIds = budgets.map(b => b.category_id)
  
  const budgetedCategories = expenseCategories.filter(c => budgetedIds.includes(c.id))
  const unbudgetedCategories = expenseCategories.filter(c => !budgetedIds.includes(c.id))

  const openModal = (category: Category) => {
    const existing = budgets.find(b => b.category_id === category.id)
    setActiveCategory(category)
    setAmountText(existing ? existing.limit_amount.toString() : '0')
    setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeCategory) return
    
    setIsSubmitting(true)
    try {
      await setBudget({
        categoryId: activeCategory.id,
        month,
        year,
        limitAmount: Number(amountText) || 0
      })
      setModalOpen(false)
    } catch (error) {
      console.error(error)
      alert("Failed to set budget")
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderCategory = (category: Category, isBudgeted: boolean) => {
    const budget = budgets.find(b => b.category_id === category.id)
    const spent = transactions
      .filter(tx => tx.category_id === category.id && tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0)
      
    const limit = budget?.limit_amount || 0
    const remaining = limit - spent
    const percentage = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0

    return (
      <div key={category.id} className="grid grid-cols-[64px_1fr_auto] gap-3 items-center py-4 border-b border-[rgba(199,195,154,0.25)]">
        <div 
          className="w-14 h-14 rounded-full grid place-items-center text-white shrink-0"
          style={{ backgroundColor: category.color }}
        >
          <CategoryIcon name={category.icon} className="w-8 h-8" />
        </div>
        
        <div className="min-w-0 pr-2">
          <div className="text-[clamp(22px,5.8vw,30px)] font-black text-text leading-none mb-1">{category.name}</div>
          
          {isBudgeted && (
            <>
              <div className="h-2 w-full bg-line rounded-full overflow-hidden my-2">
                <div 
                  className="h-full"
                  style={{ 
                    width: `${percentage}%`,
                    backgroundColor: percentage >= 100 ? '#ef5350' : category.color
                  }}
                />
              </div>
              <div className="text-muted font-bold text-sm">
                Remaining: <span className={remaining < 0 ? 'text-expense' : 'text-income'}>{money(remaining)}</span>
              </div>
            </>
          )}
        </div>
        
        <div className="text-right">
          {isBudgeted ? (
            <button 
              onClick={() => openModal(category)}
              className="text-text font-black text-[clamp(18px,4.8vw,24px)] bg-transparent border-none p-0"
            >
              {money(limit)}
            </button>
          ) : (
            <button 
              onClick={() => openModal(category)}
              className="border border-line rounded px-3 py-2 text-text font-bold text-sm tracking-widest bg-transparent uppercase"
            >
              Set Budget
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="pb-[100px]">
      <div className="my-6">
        <h2 className="text-[clamp(20px,5vw,26px)] font-bold text-text">Budgeted categories</h2>
        {budgetedCategories.length === 0 ? (
          <p className="mt-4 text-muted text-[clamp(18px,4.5vw,22px)] leading-relaxed">
            Currently, no budget is applied for this month. Set budget-limits for this month, or copy your budget-limits from past months.
          </p>
        ) : (
          <div className="mt-2">
            {budgetedCategories.map(c => renderCategory(c, true))}
          </div>
        )}
      </div>

      {unbudgetedCategories.length > 0 && (
        <div className="mt-10">
          <h2 className="text-[clamp(20px,5vw,26px)] font-bold text-text border-b border-line pb-2">Not budgeted this month</h2>
          <div className="mt-2">
            {unbudgetedCategories.map(c => renderCategory(c, false))}
          </div>
        </div>
      )}

      {modalOpen && activeCategory && (
        <div className="fixed inset-0 z-50 grid place-items-center p-6 bg-black/55 backdrop-blur-sm">
          <form 
            onSubmit={handleSubmit}
            className="w-full max-w-[430px] max-h-[86svh] overflow-auto p-6 px-4 bg-panel/95 backdrop-blur-2xl rounded-2xl shadow-app border border-line"
          >
            <div className="flex justify-between items-center mb-5">
              <h2 className="m-0 text-[clamp(26px,7vw,38px)]">
                Set Budget
              </h2>
              {amountText !== '0' && (
                <button 
                  type="button" 
                  onClick={async () => {
                    if (confirm("Are you sure you want to remove this budget?")) {
                      await setBudget({
                        categoryId: activeCategory.id,
                        month,
                        year,
                        limitAmount: 0
                      })
                      setModalOpen(false)
                    }
                  }} 
                  className="w-10 h-10 grid place-items-center bg-panel-soft rounded-lg text-expense"
                  title="Remove Budget"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                </button>
              )}
            </div>
            
            <div className="flex justify-center mb-6">
              <div 
                className="w-20 h-20 rounded-full grid place-items-center text-white"
                style={{ backgroundColor: activeCategory.color }}
              >
                <CategoryIcon name={activeCategory.icon} className="w-10 h-10" />
              </div>
            </div>
            
            <h3 className="text-center text-2xl font-bold mb-6">{activeCategory.name}</h3>

            <label className="grid gap-2 mb-8 text-muted font-bold text-center">
              Monthly Limit Amount
              <input 
                type="number" 
                step="0.01" 
                value={amountText}
                onChange={e => setAmountText(e.target.value)}
                required
                className="w-full min-h-[56px] text-center text-3xl font-black p-2.5 px-3.5 border-2 border-line rounded-xl bg-panel-soft text-text outline-none focus:border-text" 
              />
            </label>
            
            <div className="grid grid-cols-2 gap-3">
              <button 
                type="button" 
                onClick={() => setModalOpen(false)}
                className="min-h-[48px] p-2.5 px-4 rounded-lg font-bold uppercase border-2 border-text bg-transparent text-text"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="min-h-[48px] p-2.5 px-4 rounded-lg font-bold uppercase border-none bg-text text-bg disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
