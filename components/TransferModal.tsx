"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SendHorizontal, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
// 👇 FIXED: Importing the correct function name
import { transferMoney, getAccountOwner } from "@/actions/transfer"

export function TransferModal({ accountId }: { accountId: string }) {
  const [open, setOpen] = useState(false)
  const [recipientName, setRecipientName] = useState<string | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Real-time Owner Lookup
  const handleAccountChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setError(null)
    setSuccess(null)

    if (value.length === 10) {
      setIsValidating(true)
      const result = await getAccountOwner(value) 
      setIsValidating(false)

      if (result.success && result.name) {
        setRecipientName(result.name)
      } else {
        setRecipientName(null)
      }
    } else {
      setRecipientName(null)
    }
  }

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    formData.append("senderAccountId", accountId) 
    
    // We pass the "initial state" that the action expects
    const initialState = { success: false as const, transactionId: null, error: null };
    
    const result = await transferMoney(initialState, formData)
    
    setIsLoading(false)

    if (result.success) {
      setSuccess("Transfer successful!")
      setTimeout(() => {
        setOpen(false)
        setSuccess(null)
        setRecipientName(null)
        window.location.reload()
      }, 1500)
    } else {
      setError(result.error || "Transfer failed")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex-1 bg-blue-600 hover:bg-blue-700 h-12 text-base shadow-lg shadow-blue-900/20">
          <SendHorizontal className="mr-2 h-5 w-5" /> Transfer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Quick Transfer</DialogTitle>
          <DialogDescription>Send money instantly to any Nexus user.</DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4 mt-4">
          <input type="hidden" name="senderAccountId" value={accountId} />

          <div className="space-y-2">
            <Label>Recipient Account</Label>
            <div className="relative">
              <Input 
                name="accountNumber" 
                placeholder="20XXXXXXXX" 
                maxLength={10}
                required
                onChange={handleAccountChange}
                className="font-mono tracking-widest"
              />
              {isValidating && (
                <div className="absolute right-3 top-3">
                  <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                </div>
              )}
            </div>
            {recipientName && (
              <div className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 p-2 rounded-lg">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Verified: {recipientName}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Amount</Label>
            <Input name="amount" type="number" placeholder="0.00" required className="font-bold" />
          </div>

          <div className="space-y-2">
            <Label>PIN</Label>
            <Input 
              name="pin" 
              type="password" 
              maxLength={4} 
              required 
              placeholder="••••" 
              className="text-center tracking-[0.5em] font-bold" 
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl flex items-center gap-2 text-sm">
              <AlertCircle className="h-4 w-4" /> {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 text-green-600 p-3 rounded-xl flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4" /> {success}
            </div>
          )}

          <Button type="submit" disabled={isLoading || isValidating} className="w-full h-12 text-base">
            {isLoading ? <Loader2 className="animate-spin" /> : "Confirm Transfer"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}