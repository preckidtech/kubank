"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { WalletMinimal } from "lucide-react"

interface DepositModalProps { accountId: string }

export function DepositModal({ accountId }: DepositModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-12 px-6 rounded-2xl border-slate-700 bg-transparent hover:bg-slate-800 text-white font-bold text-sm">
          <WalletMinimal size={18} /> Add Funds
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white">
        <DialogHeader><DialogTitle className="text-xl font-bold">Deposit Funds</DialogTitle></DialogHeader>
        <div className="p-6 text-center space-y-4">
          <p className="text-slate-500 text-sm">Simulated deposit for Account ID: {accountId.slice(-5)}</p>
          <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700">Pay with Card</Button>
          <Button variant="outline" className="w-full h-12 border-slate-200">Bank Transfer</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}