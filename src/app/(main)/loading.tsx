import { Loader2 } from "lucide-react"

export default function MainLoading() {
  return (
    <div className="w-full h-[100svh] flex flex-col pt-[120px] items-center text-muted gap-4">
      <Loader2 className="w-10 h-10 animate-spin opacity-50" />
      <span className="font-bold uppercase tracking-widest text-sm opacity-50">Loading...</span>
    </div>
  )
}
