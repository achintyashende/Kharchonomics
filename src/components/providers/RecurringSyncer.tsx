'use client'
import { useEffect } from 'react'
import { syncRecurringTransactions } from '@/app/(main)/recurring/actions'

export function RecurringSyncer() {
  useEffect(() => {
    // Run silently in the background on app load
    syncRecurringTransactions().catch(console.error)
  }, [])

  return null
}
