'use client'

import { useState } from 'react'
import { Category } from '@/lib/types'
import { CategoryIcon } from '@/components/ui/CategoryIcon'
import { saveCategory } from '@/app/(main)/categories/actions'

const CATEGORY_ICONS = ["utensils", "home", "receipt", "shirt", "heart", "fuel", "shopping", "graduation", "phone", "baby", "sparkles", "activity", "salary", "gift", "chart", "car", "plane", "coffee", "music", "camera", "gamepad", "tv", "scissors", "book", "bus"]
const COLORS = ["#ef5350", "#ffffff", "#7e57c2", "#7bc96f", "#ec407a", "#26a69a", "#26c6da", "#f2994a", "#ad1457", "#9e9d24", "#00838f", "#2f80ed", "#6fcf97", "#bb6bd9", "#56ccf2", "#ffb74d"]

export default function CategoryManager({ categories }: { categories: Category[] }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [name, setName] = useState('')
  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [icon, setIcon] = useState(CATEGORY_ICONS[0])
  const [color, setColor] = useState(COLORS[0])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const openModal = (category?: Category) => {
    if (category) {
      setEditingId(category.id)
      setName(category.name)
      setType(category.type)
      setIcon(category.icon)
      setColor(category.color)
    } else {
      setEditingId(null)
      setName('')
      setType('expense')
      setIcon(CATEGORY_ICONS[0])
      setColor(COLORS[0])
    }
    setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await saveCategory({
        id: editingId || undefined,
        name,
        type,
        icon,
        color
      })
      setModalOpen(false)
    } catch (error) {
      console.error(error)
      alert("Failed to save category")
    } finally {
      setIsSubmitting(false)
    }
  }

  const incomes = categories.filter(c => c.type === 'income')
  const expenses = categories.filter(c => c.type === 'expense')

  const renderCategory = (category: Category) => (
    <article key={category.id} className="grid grid-cols-[64px_1fr_auto] gap-3 items-center py-3 border-b border-[rgba(199,195,154,0.35)]">
      <div 
        className="w-11 h-11 rounded-full grid place-items-center text-white"
        style={{ backgroundColor: category.color }}
      >
        <CategoryIcon name={category.icon} className="w-6 h-6" />
      </div>
      <div className="text-[clamp(18px,4.8vw,24px)] font-bold leading-[1.05]">{category.name}</div>
      <button 
        onClick={() => openModal(category)}
        className="w-11 h-11 border-none bg-transparent text-text font-bold text-xl"
      >
        •••
      </button>
    </article>
  )

  return (
    <>
      <div>
        <h2 className="my-4 pb-2.5 border-b-2 border-line text-[clamp(20px,5vw,26px)] font-black tracking-wide">Income Categories</h2>
        <div className="grid gap-0">
          {incomes.map(renderCategory)}
        </div>
        
        <h2 className="my-4 pb-2.5 border-b-2 border-line text-[clamp(20px,5vw,26px)] font-black tracking-wide mt-8">Expense Categories</h2>
        <div className="grid gap-0">
          {expenses.map(renderCategory)}
        </div>

        <button 
          onClick={() => openModal()}
          className="w-full min-h-[48px] p-2.5 px-4 mt-6 border-2 border-text rounded-lg bg-transparent text-text font-bold uppercase"
        >
          ＋ Add Category
        </button>
      </div>

      {modalOpen && (
        <div 
          className="fixed inset-0 z-50 grid place-items-center p-6 bg-black/55 backdrop-blur-sm"
          onClick={() => setModalOpen(false)}
        >
          <form 
            onSubmit={handleSubmit}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-[430px] max-h-[86svh] overflow-auto p-6 px-4 bg-panel/95 backdrop-blur-2xl rounded-2xl shadow-app border border-line"
          >
            <div className="flex justify-between items-center mb-5">
              <h2 className="m-0 text-[clamp(26px,7vw,38px)]">
                {editingId ? "Edit category" : "Add category"}
              </h2>
              {editingId && (
                <button 
                  type="button" 
                  onClick={async () => {
                    if (confirm("Are you sure you want to delete this category?")) {
                      const { deleteCategory } = await import('@/app/(main)/categories/actions')
                      await deleteCategory(editingId)
                      setModalOpen(false)
                    }
                  }} 
                  className="w-10 h-10 grid place-items-center bg-panel-soft rounded-lg text-expense"
                  title="Delete Category"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                </button>
              )}
            </div>
            
            <label className="grid gap-2 mb-4 text-muted font-bold">
              Name
              <input 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full min-h-[48px] p-2.5 px-3.5 border-2 border-line rounded-lg bg-panel-soft text-text outline-none" 
              />
            </label>
            
            <div className="grid gap-2 mb-4 text-muted font-bold">
              Type
              <div className="flex gap-6 mt-1">
                <label className="flex items-center gap-2 cursor-pointer text-text font-normal">
                  <input type="radio" name="type" value="expense" checked={type === 'expense'} onChange={() => setType('expense')} className="w-4 h-4" /> 
                  Expense
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-text font-normal">
                  <input type="radio" name="type" value="income" checked={type === 'income'} onChange={() => setType('income')} className="w-4 h-4" /> 
                  Income
                </label>
              </div>
            </div>

            <div className="grid gap-2 mb-4 text-muted font-bold">
              Icon
              <div className="grid grid-cols-5 gap-2.5 mt-2">
                {CATEGORY_ICONS.map(ic => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setIcon(ic)}
                    className={`aspect-square rounded-lg border-2 grid place-items-center text-text ${
                      icon === ic ? 'border-text bg-line' : 'border-transparent bg-panel-soft'
                    }`}
                  >
                    <CategoryIcon name={ic} className="w-7 h-7" />
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-2 mb-6 text-muted font-bold">
              Color
              <div className="grid grid-cols-5 gap-2.5 mt-2">
                {COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    style={{ backgroundColor: c }}
                    className={`aspect-square rounded-lg border-2 grid place-items-center ${
                      color === c ? 'border-text' : 'border-transparent'
                    }`}
                  />
                ))}
              </div>
            </div>
            
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
    </>
  )
}
