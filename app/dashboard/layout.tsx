import Link from "next/link"
import { logout } from "@/lib/auth"
import { redirect } from "next/navigation"
import { MobileNav } from "@/components/MobileNav" // Import the new component
import { LayoutDashboard, ArrowRightLeft, LogOut, History, User } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-slate-50/50">
      {/* SIDEBAR - SLEEK APPLE DESIGN */}
      <aside className="w-64 border-r bg-white hidden md:flex flex-col shadow-sm">
        <div className="p-8">
          <h1 className="text-2xl font-bold tracking-tighter text-blue-700 italic">Nexus</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">Digital Banking</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-900 hover:bg-slate-50 rounded-2xl transition-all group">
            <LayoutDashboard className="h-4 w-4 text-blue-600" /> Overview
          </Link>
          <Link href="/dashboard/transfer" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-500 hover:text-blue-700 hover:bg-blue-50/50 rounded-2xl transition-all group">
            <ArrowRightLeft className="h-4 w-4 group-hover:rotate-12 transition-transform" /> Transfer
          </Link>
          <Link href="/dashboard/history" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-500 hover:text-blue-700 hover:bg-blue-50/50 rounded-2xl transition-all group">
            <History className="h-4 w-4" /> Transactions
          </Link>
          <Link href="/dashboard/profile" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-500 hover:text-blue-700 hover:bg-blue-50/50 rounded-2xl transition-all group">
            <User className="h-4 w-4" /> Profile
          </Link>
        </nav>

        <div className="p-6 border-t border-slate-50">
          <form action={async () => {
            "use server"
            await logout()
            redirect("/login")
          }}>
            <button className="flex w-full items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-2xl transition-all">
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 md:p-12 max-w-6xl mx-auto">
          {children}
        </div>
      </main>

      {/* 👇 ADD THIS: Shows only on mobile */}
      <MobileNav />
    </div>
  )
}