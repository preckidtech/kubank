"use client"

import { useActionState, useEffect, useState } from "react"
// 👇 Import types and actions
import { transferMoney, getAccountOwner, type TransferState } from "@/actions/transfer" 
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, SendHorizontal, AlertCircle, CheckCircle2 } from "lucide-react"

export default function TransferPage() {
  const router = useRouter();
  
  const [recipientName, setRecipientName] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  
  // 👇 Explicitly typed Initial State
  const initialState: TransferState = { 
    success: false, 
    transactionId: null, 
    error: null 
  };
  
  const [state, formAction, isPending] = useActionState(transferMoney, initialState);

  // Handle Real-time Account Lookup
  const handleAccountChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length !== 10) setRecipientName(null);

    if (value.length === 10) {
      setIsValidating(true);
      const result = await getAccountOwner(value);
      setIsValidating(false);
      if (result.success) {
        setRecipientName(result.name || null);
      } else {
        setRecipientName(null);
      }
    }
  };

  // 👇 AUTO-REDIRECT logic for Session Expiry & Success
  useEffect(() => {
    if (state.success && state.transactionId) {
      router.push(`/dashboard/history/${state.transactionId}`);
    }
    // If error contains "session", force logout/login
    if (state.error && state.error.toLowerCase().includes("session")) {
      setTimeout(() => router.push("/login"), 2000);
    }
  }, [state, router]);

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <Card className="border-none shadow-2xl rounded-[2rem] bg-white overflow-hidden">
        <CardHeader className="bg-slate-950 text-white p-8">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold italic">New Transfer</CardTitle>
              <CardDescription className="text-slate-400 mt-2">
                Send money securely to Nexus users.
              </CardDescription>
            </div>
            <div className="bg-slate-800 p-3 rounded-full">
              <SendHorizontal className="text-blue-400" size={24} />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-8">
          <form action={formAction} className="space-y-6">
            
            {/* Account Input */}
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                Recipient Account
              </Label>
              <div className="relative">
                <Input 
                  name="accountNumber" 
                  onChange={handleAccountChange}
                  placeholder="20XXXXXXXX" 
                  maxLength={10}
                  required 
                  className="h-14 font-mono text-lg tracking-widest bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all" 
                />
                {isValidating && (
                  <div className="absolute right-4 top-4">
                    <Loader2 className="animate-spin text-slate-400" size={20} />
                  </div>
                )}
              </div>

              {recipientName && (
                <div className="flex items-center gap-2 text-green-700 bg-green-50 p-3 rounded-xl border border-green-100 animate-in fade-in slide-in-from-top-2">
                  <CheckCircle2 size={16} />
                  <span className="text-sm font-bold uppercase tracking-wide">
                    VERIFIED: {recipientName}
                  </span>
                </div>
              )}
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                Amount (₦)
              </Label>
              <Input 
                name="amount" 
                type="number" 
                placeholder="0.00" 
                required 
                className="h-14 font-bold text-xl bg-slate-50 border-none rounded-2xl" 
              />
            </div>

            {/* PIN Input */}
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                Security PIN
              </Label>
              <Input 
                name="pin" 
                type="password" 
                maxLength={4} 
                required 
                placeholder="••••"
                className="h-14 text-center text-3xl tracking-[1em] bg-slate-50 border-none rounded-2xl placeholder:tracking-normal" 
              />
            </div>
            
            {/* Error Message Display */}
            {state.error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-2 text-sm font-medium border border-red-100 animate-shake">
                <AlertCircle size={18} />
                {state.error}
              </div>
            )}

            <Button 
              type="submit" 
              disabled={isPending || isValidating} 
              className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-lg shadow-xl shadow-blue-200 transition-all active:scale-[0.98]"
            >
              {isPending ? (
                <>
                  <Loader2 className="animate-spin mr-2" /> Processing...
                </>
              ) : (
                "Authorize Transfer"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}