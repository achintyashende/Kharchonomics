'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { saveTransaction, deleteTransaction } from '@/app/(main)/entry/actions'
import { Account, Category, Transaction } from '@/lib/types'
import { CategoryIcon } from '@/components/ui/CategoryIcon'
import { Trash2 } from 'lucide-react'

export default function EntryForm({ accounts, categories, initialTransaction }: { accounts: Account[], categories: Category[], initialTransaction: Transaction | null }) {
  const router = useRouter()
  
  const [type, setType] = useState<'income' | 'expense' | 'transfer'>(initialTransaction?.type || 'expense')
  const [amountText, setAmountText] = useState(initialTransaction ? initialTransaction.amount.toString() : '0')
  const [notes, setNotes] = useState(initialTransaction?.notes || '')
  const [date, setDate] = useState(initialTransaction?.date || new Date().toISOString().split('T')[0])
  const [time, setTime] = useState(initialTransaction?.time || new Date().toTimeString().slice(0, 5))
  
  const relevantCategories = categories.filter(c => c.type === type)
  const defaultCategoryId = initialTransaction?.category_id || (relevantCategories.length > 0 ? relevantCategories[0].id : '')
  
  const [accountId, setAccountId] = useState(initialTransaction?.account_id || (accounts[0]?.id || ''))
  const [toAccountId, setToAccountId] = useState(initialTransaction?.to_account_id || (accounts.length > 1 ? accounts[1]?.id : ''))
  const [categoryId, setCategoryId] = useState(defaultCategoryId)

  // Modals state
  const [showPicker, setShowPicker] = useState<'account' | 'toAccount' | 'category' | null>(null)

  const handleNumpadClick = (key: string) => {
    if (typeof window !== 'undefined' && navigator.vibrate) navigator.vibrate(20)
    if (key === "=") return;
    if ("+-×÷".includes(key)) return; // basic arithmetic not implemented in UI yet
    if (key === "." && amountText.includes(".")) return;
    
    if (amountText === "0" && key !== ".") {
      setAmountText(key);
    } else {
      setAmountText(prev => prev + key);
    }
  }

  const handleDelete = async () => {
    if (initialTransaction && confirm('Are you sure you want to delete this record?')) {
      await deleteTransaction(initialTransaction.id)
    }
  }

  const handleSave = async () => {
    const amount = Number(amountText)
    if (!amount || amount <= 0) return
    
    await saveTransaction({
      id: initialTransaction?.id,
      type,
      amount,
      accountId,
      toAccountId,
      categoryId,
      notes,
      date,
      time
    })
    
    if (typeof window !== 'undefined' && navigator.vibrate) navigator.vibrate([50, 100, 50])
    
    // Tiny delay so haptics/animation can be felt/seen before navigating
    setTimeout(() => {
      router.push('/records')
      router.refresh()
    }, 150)
  }
  
  const handleTypeChange = (newType: 'income' | 'expense' | 'transfer') => {
    setType(newType)
    const newRelevant = categories.filter(c => c.type === newType)
    if (newRelevant.length > 0) {
      setCategoryId(newRelevant[0].id)
    }
  }

  const activeAccount = accounts.find(a => a.id === accountId)
  const activeToAccount = accounts.find(a => a.id === toAccountId)
  const activeCategory = categories.find(c => c.id === categoryId)

  return (
    <>
      <div className="flex justify-between items-center min-h-[56px] px-2 pt-[max(48px,env(safe-area-inset-top))]">
        <button onClick={() => router.back()} className="text-text text-[clamp(16px,4vw,20px)] uppercase font-bold tracking-widest bg-transparent border-none flex items-center gap-2">
          ✕ CANCEL
        </button>
        <div className="flex gap-4 items-center">
          {initialTransaction && (
            <button onClick={handleDelete} className="text-expense bg-transparent border-none">
              <Trash2 size={24} />
            </button>
          )}
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={handleSave} 
            className="text-text text-[clamp(16px,4vw,20px)] uppercase font-bold tracking-widest bg-transparent border-none flex items-center gap-2"
          >
            ✓ SAVE
          </motion.button>
        </div>
      </div>
      
      <div className="flex justify-center items-center gap-3 my-6">
        {(['income', 'expense', 'transfer'] as const).map((t, i) => (
          <div key={t} className="flex items-center gap-3">
            <button 
              onClick={() => handleTypeChange(t)}
              className={`border-none bg-transparent text-[clamp(14px,3.8vw,18px)] tracking-widest uppercase transition-colors flex items-center gap-1.5 ${type === t ? 'text-text font-black' : 'text-muted font-bold'}`}
            >
              {type === t && <span className="bg-text text-bg rounded-full w-4 h-4 inline-flex items-center justify-center text-[10px] leading-none">✓</span>}
              {t}
            </button>
            {i < 2 && <span className="text-muted opacity-50">|</span>}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div className="text-center">
          <span className="text-muted text-sm tracking-wide">Account</span>
          <button 
            onClick={() => setShowPicker('account')}
            className="w-full mt-1 min-h-[60px] border border-line rounded-lg bg-transparent text-text text-[clamp(16px,4.5vw,22px)] font-bold flex items-center justify-center gap-2 px-2 overflow-hidden"
          >
            {activeAccount ? (
              <>
                <CategoryIcon name={activeAccount.icon} className="w-6 h-6 shrink-0 opacity-70" />
                <span className="truncate">{activeAccount.name}</span>
              </>
            ) : 'Account'}
          </button>
        </div>
        
        <div className="text-center">
          <span className="text-muted text-sm tracking-wide">Category</span>
          {type === 'transfer' ? (
            <button 
              onClick={() => setShowPicker('toAccount')}
              className="w-full mt-1 min-h-[60px] border border-line rounded-lg bg-transparent text-text text-[clamp(16px,4.5vw,22px)] font-bold flex items-center justify-center gap-2 px-2 overflow-hidden"
            >
              {activeToAccount ? (
                <>
                  <CategoryIcon name={activeToAccount.icon} className="w-6 h-6 shrink-0 opacity-70" />
                  <span className="truncate">{activeToAccount.name}</span>
                </>
              ) : 'To Account'}
            </button>
          ) : (
            <button 
              onClick={() => setShowPicker('category')}
              className="w-full mt-1 min-h-[60px] border border-line rounded-lg bg-transparent text-text text-[clamp(16px,4.5vw,22px)] font-bold flex items-center justify-center gap-2 px-2 overflow-hidden"
            >
              {activeCategory ? (
                <>
                  <CategoryIcon name={activeCategory.icon} className="w-6 h-6 shrink-0 opacity-70" />
                  <span className="truncate">{activeCategory.name}</span>
                </>
              ) : 'Category'}
            </button>
          )}
        </div>
      </div>
      
      <label className="block mb-2">
        <textarea 
          placeholder="Add notes" 
          value={notes}
          onChange={e => setNotes(e.target.value)}
          className="w-full h-[120px] p-3 px-4 border border-line rounded-lg bg-transparent text-text outline-none resize-none placeholder:text-muted placeholder:opacity-70 text-[18px]"
        />
      </label>
      
      <div className="min-h-[100px] mb-2 p-4 border border-line rounded-lg flex justify-end items-center text-[clamp(58px,17vw,96px)] font-normal text-text overflow-x-auto hide-scrollbar">
        {amountText}
        {amountText !== '0' && <button onClick={() => setAmountText(prev => prev.length > 1 ? prev.slice(0, -1) : '0')} className="ml-4 text-text opacity-70 bg-transparent border-none">⌫</button>}
      </div>
      
      <div className="grid grid-cols-4 gap-1 flex-1">
        {["+", "7", "8", "9", "-", "4", "5", "6", "×", "1", "2", "3", "÷", "0", ".", "="].map((key) => (
          <motion.button 
            whileTap={{ scale: 0.9 }}
            key={key} 
            onClick={() => handleNumpadClick(key)}
            className={`h-full min-h-[65px] border border-line rounded-md text-[clamp(28px,8vw,36px)] font-normal ${
              "+-×÷=".includes(key) ? "bg-[#b7b391] text-bg font-bold" : "bg-transparent text-text active:bg-panel-soft"
            }`}
          >
            {key}
          </motion.button>
        ))}
      </div>
      
      <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center mt-4 mb-[calc(24px+env(safe-area-inset-bottom))]">
        <label className="flex flex-col items-center justify-center px-1 py-3.5 border-2 border-line rounded-xl bg-panel-soft active:bg-line transition-colors overflow-hidden">
          <input 
            type="date" 
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full text-center bg-transparent text-text outline-none font-bold uppercase text-[clamp(14px,4vw,18px)]" 
          />
        </label>
        <span className="text-muted font-black opacity-50 text-lg px-1">at</span>
        <label className="flex flex-col items-center justify-center px-1 py-3.5 border-2 border-line rounded-xl bg-panel-soft active:bg-line transition-colors overflow-hidden">
          <input 
            type="time" 
            value={time}
            onChange={e => setTime(e.target.value)}
            className="w-full text-center bg-transparent text-text outline-none font-bold uppercase text-[clamp(14px,4vw,18px)]" 
          />
        </label>
      </div>

      {/* Picker Modal */}
      {showPicker && (
        <div className="fixed inset-0 z-[60] grid place-items-center p-6 bg-black/55 backdrop-blur-sm">
          <div className="w-full max-w-[430px] max-h-[86svh] overflow-auto p-6 px-4 bg-panel/95 backdrop-blur-2xl rounded-2xl shadow-app border border-line">
            <h2 className="m-0 mb-5 text-center text-[clamp(26px,7vw,38px)]">
              Choose {showPicker === 'category' ? 'category' : 'account'}
            </h2>
            
            <div className="grid gap-2">
              {(showPicker === 'category' ? relevantCategories : accounts).map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (showPicker === 'account') {
                      if (type === 'transfer' && item.id === toAccountId) {
                        setToAccountId(accountId)
                      }
                      setAccountId(item.id)
                    }
                    if (showPicker === 'toAccount') {
                      if (item.id === accountId) {
                        setAccountId(toAccountId)
                      }
                      setToAccountId(item.id)
                    }
                    if (showPicker === 'category') setCategoryId(item.id)
                    setShowPicker(null)
                  }}
                  className="w-full flex items-center gap-3 p-3 bg-transparent border-none text-left"
                >
                  <div 
                    className={`w-14 h-14 grid place-items-center text-white ${showPicker === 'category' ? 'rounded-full' : 'rounded-lg border-2 border-line'}`}
                    style={{ backgroundColor: (item as any).color || '#8f2b2b' }}
                  >
                    <CategoryIcon name={item.icon} className="w-8 h-8" />
                  </div>
                  <span className="text-[clamp(22px,5.8vw,30px)] font-black text-text truncate">
                    {item.name}
                  </span>
                </button>
              ))}
            </div>
            
            <button 
              onClick={() => setShowPicker(null)}
              className="w-full mt-4 min-h-[48px] p-2.5 px-4 rounded-lg font-bold uppercase border-2 border-text bg-transparent text-text"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  )
}
