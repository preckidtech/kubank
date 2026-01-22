"use client"

import { useActionState, useEffect } from "react"
import { transferMoney, type TransferState } from "@/actions/transfer" // Import the type
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, SendHorizontal, AlertCircle } from "lucide-react"

export default function TransferPage() {
  const router = useRouter();
  
  // Define initial state using the imported type
  const initialState: TransferState = { 
    success: false, 
    transactionId: null, 
    error: null 
  };
  
  const [state, formAction, isPending] = useActionState(transferMoney, initialState);

  useEffect(() => {
    if (state.success && state.transactionId) {
      router.push(`/dashboard/history/${state.transactionId}`);
    }
  }, [state, router]);

  return (
    <div className="max-w-xl mx-auto py-10">
      <Card className="border-none shadow-2xl rounded-[2rem] bg-white overflow-hidden">
        <CardHeader className="bg-slate-950 text-white p-8">
          <CardTitle className="text-2xl font-bold italic">New Transfer</CardTitle>
          <CardDescription className="text-slate-400">Send money securely to Nexus users.</CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <form action={formAction} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Recipient Account</Label>
              <Input name="accountNumber" placeholder="20XXXXXXXX" required className="h-14 font-mono text-lg tracking-widest bg-slate-50 border-none rounded-2xl" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Amount (₦)</Label>
              <Input name="amount" type="number" placeholder="0.00" required className="h-14 font-bold text-xl bg-slate-50 border-none rounded-2xl" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">PIN</Label>
              <Input name="pin" type="password" maxLength={4} required className="h-14 text-center text-2xl tracking-[1em] bg-slate-50 border-none rounded-2xl" />
            </div>
            
            {state.error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-2 text-sm font-medium border border-red-100">
                <AlertCircle size={18} />
                {state.error}
              </div>
            )}

            <Button type="submit" disabled={isPending} className="w-full h-14 bg-slate-900 hover:bg-black text-white font-bold rounded-2xl text-lg shadow-xl transition-all">
              {isPending ? <Loader2 className="animate-spin mr-2" /> : "Authorize Transfer"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}