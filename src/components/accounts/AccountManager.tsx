'use client'

import { useState } from 'react'
import { Account } from '@/lib/types'
import { CategoryIcon } from '@/components/ui/CategoryIcon'
import { money } from '@/lib/utils'
import { saveAccount, deleteAccount, toggleIgnoreAccount } from '@/app/(main)/accounts/actions'
import { Trash2, EyeOff, Eye } from 'lucide-react'

const ACCOUNT_ICONS = ["cash", "card", "bank", "wallet", "coins", "piggy", "briefcase", "receipt", "shield", "building"]

export default function AccountManager({ accounts }: { accounts: (Account & { live_balance: number })[] }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<(Account & { live_balance: number }) | null>(null)
  
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('cash')
  const [initialBalance, setInitialBalance] = useState('0')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const openModal = (account?: Account & { live_balance: number }) => {
    if (account) {
      setEditingAccount(account)
      setName(account.name)
      setIcon(account.icon)
      setInitialBalance(account.initial_balance.toString())
    } else {
      setEditingAccount(null)
      setName('')
      setIcon('cash')
      setInitialBalance('0')
    }
    setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await saveAccount({
        id: editingAccount?.id,
        name,
        icon,
        initialBalance: Number(initialBalance) || 0
      })
      setModalOpen(false)
    } catch (error) {
      console.error(error)
      alert("Failed to save account")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleDelete = async () => {
    if (!editingAccount) return
    if (confirm(`Are you sure you want to delete ${editingAccount.name}?`)) {
      await deleteAccount(editingAccount.id)
      setModalOpen(false)
    }
  }
  
  const handleToggleIgnore = async () => {
    if (!editingAccount) return
    await toggleIgnoreAccount(editingAccount.id, editingAccount.ignored)
    setModalOpen(false)
  }

  return (
    <>
      <div className="grid gap-3">
        {accounts.map(account => (
          <article key={account.id} className={`grid grid-cols-[auto_1fr_auto] gap-3 items-center p-3 px-4 border border-line rounded-2xl bg-transparent transition-opacity ${account.ignored ? 'opacity-40 grayscale' : ''}`}>
            <div className="w-14 h-14 rounded-xl border border-line grid place-items-center bg-panel-soft text-text">
              <CategoryIcon name={account.icon} className="w-8 h-8" />
            </div>
            <div>
              <div className="text-[clamp(18px,4.5vw,24px)] font-bold text-text truncate leading-tight flex items-center gap-2">
                {account.name}
                {account.ignored && <span className="text-[10px] bg-panel-soft px-1.5 py-0.5 rounded tracking-wider uppercase">Ignored</span>}
              </div>
              <div className="mt-1 text-text text-[clamp(16px,4vw,20px)] font-bold">
                Balance: <span className="text-income font-black">{money(account.live_balance)}</span>
              </div>
            </div>
            <button 
              onClick={() => openModal(account)}
              className="w-10 h-10 border-none bg-transparent text-text font-black text-xl"
            >
              •••
            </button>
          </article>
        ))}
      </div>

      <button 
        onClick={() => openModal()}
        className="w-full min-h-[48px] p-3 px-4 mt-4 border border-line rounded-xl bg-transparent text-text font-bold uppercase tracking-wide flex items-center justify-center gap-2"
      >
        <span className="text-2xl leading-none">⊕</span> ADD NEW ACCOUNT
      </button>

      {modalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center p-6 bg-black/55 backdrop-blur-sm">
          <form 
            onSubmit={handleSubmit}
            className="w-full max-w-[430px] max-h-[86svh] overflow-auto p-6 px-4 bg-panel/95 backdrop-blur-2xl rounded-2xl shadow-app border border-line"
          >
            <div className="flex justify-between items-center mb-5">
              <h2 className="m-0 text-[clamp(26px,7vw,38px)]">
                {editingAccount ? "Edit account" : "Add new account"}
              </h2>
              {editingAccount && (
                <div className="flex gap-2">
                  <button type="button" onClick={handleToggleIgnore} className="w-10 h-10 grid place-items-center bg-panel-soft rounded-lg text-text" title={editingAccount.ignored ? "Unignore Account" : "Ignore Account"}>
                    {editingAccount.ignored ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
                  <button type="button" onClick={handleDelete} className="w-10 h-10 grid place-items-center bg-panel-soft rounded-lg text-expense" title="Delete Account">
                    <Trash2 size={20} />
                  </button>
                </div>
              )}
            </div>
            
            <label className="grid gap-2 mb-4 text-muted font-bold">
              Initial amount
              <input 
                type="number" 
                step="0.01" 
                value={initialBalance}
                onChange={e => setInitialBalance(e.target.value)}
                required
                className="w-full min-h-[48px] p-2.5 px-3.5 border-2 border-line rounded-lg bg-panel-soft text-text outline-none" 
              />
              <p className="m-0 text-sm font-normal opacity-80">Initial amount will not be reflected in analysis</p>
            </label>
            
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
            
            <div className="grid gap-2 mb-6 text-muted font-bold">
              Icon
              <div className="grid grid-cols-5 gap-2.5 mt-2">
                {ACCOUNT_ICONS.map(ic => (
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
