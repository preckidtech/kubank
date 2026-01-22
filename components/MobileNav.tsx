"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, SendHorizontal, Clock, User } from "lucide-react"

export function MobileNav() {
  const pathname = usePathname()
  
  const links = [
    { href: "/dashboard", label: "Home", icon: Home },
    { href: "/dashboard/transfer", label: "Transfer", icon: SendHorizontal },
    { href: "/dashboard/history", label: "Activity", icon: Clock },
    { href: "/dashboard/profile", label: "Profile", icon: User },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-3 pb-6 md:hidden z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center">
        {links.map((link) => {
          // Highlight logic: Exact match for Home, 'starts with' for others
          const isActive = link.href === "/dashboard" 
            ? pathname === link.href 
            : pathname.startsWith(link.href)

          return (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`flex flex-col items-center gap-1 transition-colors ${isActive ? "text-blue-600" : "text-slate-400 hover:text-slate-600"}`}
            >
              <div className={`p-1.5 rounded-xl ${isActive ? "bg-blue-50" : "bg-transparent"}`}>
                <link.icon size={22} className={isActive ? "fill-blue-600 text-blue-600" : "fill-transparent"} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider">{link.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}