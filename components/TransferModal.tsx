"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SendHorizontal, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { transferMoney, verifyRecipient } from "@/actions/transfer"

export function TransferModal({ accountId }: { accountId: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [successData, setSuccessData] = useState<any>(null)
  
  const [recipientName, setRecipientName] = useState<string | null>(null)
  const [verifying, setVerifying] = useState(false)

  // Reset modal state when closing or finishing
  const handleClose = (isOpen: boolean) => {
    if (!loading) {
      setOpen(isOpen)
      if (!isOpen) {
        setSuccessData(null)
        setError("")
        setRecipientName(null)
      }
    }
  }

  // Handle Account Number verification as the user types
  async function handleAccountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setRecipientName(null)
    setError("")

    if (val.length === 10 && val.startsWith("20")) {
      setVerifying(true)
      const res = await verifyRecipient(val)
      setRecipientName(res?.name || null)
      if (!res) setError("Account number not found.")
      setVerifying(false)
    }
  }

  async function handleTransfer(formData: FormData) {
    setLoading(true)
    setError("")
    formData.append("senderAccountId", accountId)
    
    // Call the server action with the required initial state argument
    const res = await transferMoney({ success: false, transactionId: null, error: null }, formData)
    
    if (res.error) {
      setError(res.error)
      setLoading(false)
    } else {
      setSuccessData(res)
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button className="h-14 px-10 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-xl shadow-blue-900/40 transition-all active:scale-95 flex items-center gap-3">
          <SendHorizontal size={20} /> Send Money
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[450px] bg-white rounded-[2.5rem] p-8 border-none shadow-2xl overflow-hidden">
        {!successData ? (
          <div className="animate-in fade-in duration-500">
            <DialogHeader className="space-y-2 text-left">
              <DialogTitle className="text-3xl font-bold tracking-tight text-slate-900 italic">Transfer</DialogTitle>
              <DialogDescription className="text-slate-500 font-medium">Move funds instantly between Nexus accounts.</DialogDescription>
            </DialogHeader>
            
            <form action={handleTransfer} className="space-y-6 pt-6">
              {/* Account Number Field */}
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest px-1">Recipient Account</Label>
                <Input 
                  name="accountNumber" 
                  placeholder="20XXXXXXXX" 
                  required 
                  onChange={handleAccountChange} 
                  className="h-14 font-mono tracking-widest bg-slate-50 border-none rounded-2xl text-lg focus-visible:ring-blue-600" 
                />
                {verifying && <p className="text-[10px] text-blue-600 font-bold animate-pulse px-1">VERIFYING ACCOUNT...</p>}
                {recipientName && (
                   <div className="bg-green-50 p-3 rounded-xl border border-green-100 flex items-center gap-2 animate-in slide-in-from-top-1">
                     <div className="h-2 w-2 rounded-full bg-green-500" />
                     <p className="text-xs font-bold text-green-700 uppercase">Recipient: {recipientName}</p>
                   </div>
                )}
              </div>

              {/* Amount Field */}
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest px-1">Amount (₦)</Label>
                <Input name="amount" type="number" placeholder="0.00" required className="h-14 font-bold text-2xl bg-slate-50 border-none rounded-2xl focus-visible:ring-blue-600" />
              </div>

              {/* PIN Field */}
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest px-1">Transaction PIN</Label>
                <Input name="pin" type="password" maxLength={4} required className="h-14 text-center tracking-[1.5em] bg-slate-50 border-none rounded-2xl text-xl focus-visible:ring-blue-600" />
              </div>

              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-2 text-sm font-medium border border-red-100 animate-in shake-1">
                  <AlertCircle size={18} /> {error}
                </div>
              )}

              <Button 
                type="submit" 
                disabled={loading || verifying || !recipientName} 
                className="w-full h-14 bg-slate-900 hover:bg-black text-white font-bold rounded-2xl text-lg shadow-lg disabled:opacity-50 transition-all active:scale-95"
              >
                {loading ? <Loader2 className="animate-spin" /> : "Authorize Transaction"}
              </Button>
            </form>
          </div>
        ) : (
          /* SUCCESS SCREEN */
          <div className="text-center py-8 space-y-8 animate-in zoom-in duration-500">
            <div className="mx-auto h-24 w-24 bg-green-50 rounded-full flex items-center justify-center border-4 border-white shadow-xl">
              <CheckCircle2 className="h-14 w-14 text-green-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight italic">Transfer Successful!</h2>
              <p className="text-slate-500 font-medium">Money has been sent successfully.</p>
            </div>
            
            <div className="bg-slate-50 p-6 rounded-3xl space-y-3 text-left">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <span>Ref ID</span>
                <span className="text-slate-900 font-mono">#{successData.transactionId.slice(-8)}</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <span>Status</span>
                <span className="text-green-600">Completed</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
               <Button onClick={() => window.location.reload()} className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg">Done</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}