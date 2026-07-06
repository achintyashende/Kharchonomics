import { BottomNav } from '@/components/layout/BottomNav'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100svh] pb-[88px] md:max-w-[520px] md:mx-auto md:border-l md:border-r md:border-[#ffffff2e]">
      <main className="p-0">
        {children}
      </main>
      
      <Link href="/entry" className="fixed right-6 bottom-[calc(104px+env(safe-area-inset-bottom))] z-20 w-[76px] h-[76px] border-none rounded-full bg-[#64645c] text-text shadow-app flex items-center justify-center md:right-[calc((100vw-520px)/2+24px)]">
        <Plus size={44} strokeWidth={2} />
      </Link>
      
      <BottomNav />
    </div>
  )
}
