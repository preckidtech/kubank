"use client"

import { Button } from "@/components/ui/button"
import { Printer, ArrowLeft } from "lucide-react"
import Link from "next/link"

export function ReceiptActions() {
  return (
    // Flex column on mobile (reversed so button is top), Row on desktop
    <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-4 no-print mb-6">
      <Link 
        href="/dashboard/history" 
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium p-2"
      >
        <ArrowLeft size={18} /> Back to History
      </Link>
      
      <Button 
        onClick={() => window.print()} 
        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-200 transition-all active:scale-95"
      >
        <Printer size={18} /> Print / Save PDF
      </Button>
    </div>
  )
}