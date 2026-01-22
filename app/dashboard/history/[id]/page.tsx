import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { notFound } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Printer, ArrowLeft, CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default async function ReceiptPage({ params }: { params: { id: string } }) {
  const session = await getSession()
  const tx = await prisma.transaction.findUnique({
    where: { id: params.id },
    include: {
      sender: { include: { user: true } },
      receiver: { include: { user: true } }
    }
  })

  if (!tx) notFound()

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 space-y-6">
      <div className="flex justify-between items-center no-print">
        <Link href="/dashboard/history" className="flex items-center gap-2 text-slate-500 hover:text-slate-900">
          <ArrowLeft size={18} /> Back to History
        </Link>
        <button 
          onClick={() => window.print()} 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg"
        >
          <Printer size={18} /> Print Receipt
        </button>
      </div>

      <Card className="border-none shadow-2xl bg-white rounded-[2rem] overflow-hidden print:shadow-none">
        <CardContent className="p-0">
          <div className="bg-slate-950 text-white p-10 text-center space-y-4">
             <CheckCircle2 className="mx-auto text-green-500" size={60} />
             <h2 className="text-2xl font-bold uppercase tracking-widest">Transaction Successful</h2>
             <p className="text-slate-400 text-sm">Reference: {tx.id.toUpperCase()}</p>
          </div>

          <div className="p-10 space-y-8">
            <div className="text-center border-b pb-8">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Amount Sent</p>
              <h1 className="text-5xl font-bold text-slate-900 mt-2">₦{tx.amount.toLocaleString()}</h1>
            </div>

            <div className="grid grid-cols-2 gap-8 text-sm">
              <div>
                <p className="text-slate-400 font-bold uppercase text-[10px]">Sender</p>
                <p className="font-bold text-slate-900 mt-1">{tx.sender.user.firstName} {tx.sender.user.lastName}</p>
                <p className="text-slate-500 font-mono text-xs">{tx.sender.accountNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 font-bold uppercase text-[10px]">Recipient</p>
                <p className="font-bold text-slate-900 mt-1">{tx.receiver.user.firstName} {tx.receiver.user.lastName}</p>
                <p className="text-slate-500 font-mono text-xs">{tx.receiver.accountNumber}</p>
              </div>
              <div>
                <p className="text-slate-400 font-bold uppercase text-[10px]">Date & Time</p>
                <p className="font-bold text-slate-900 mt-1">{new Date(tx.createdAt).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 font-bold uppercase text-[10px]">Status</p>
                <p className="font-bold text-green-600 mt-1 uppercase italic">Completed</p>
              </div>
            </div>

            <div className="pt-8 border-t text-center">
              <p className="text-[10px] text-slate-400 uppercase tracking-tighter">
                Generated via Nexus Bank Digital System. This is a computer-generated receipt.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
        }
      `}} />
    </div>
  )
}