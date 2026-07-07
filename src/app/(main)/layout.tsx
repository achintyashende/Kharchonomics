import { BottomNav } from '@/components/layout/BottomNav'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="flex-1 overflow-y-auto overflow-x-hidden relative hide-scrollbar">
        <main className="min-h-full pb-[100px]">
          {children}
        </main>
      </div>
      
      <div className="relative shrink-0 z-50">
        <Link href="/entry" className="absolute right-6 bottom-[calc(90px+env(safe-area-inset-bottom))] z-20 w-[76px] h-[76px] border-none rounded-full bg-[#64645c] text-text shadow-app flex items-center justify-center md:right-[calc((100vw-520px)/2+24px)]">
          <Plus size={44} strokeWidth={2} />
        </Link>
        <BottomNav />
      </div>
    </>
  )
}
