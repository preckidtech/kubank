import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { notFound, redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"
import { ReceiptActions } from "@/components/ReceiptActions"

// Define the params type as a Promise for Next.js 15+
interface ReceiptPageProps {
  params: Promise<{ id: string }>
}

export default async function ReceiptPage({ params }: ReceiptPageProps) {
  const session = await getSession()
  if (!session) redirect("/login")

  // Await the params to get the ID
  const resolvedParams = await params
  const { id } = resolvedParams

  const tx = await prisma.transaction.findUnique({
    where: { id },
    include: {
      sender: { include: { user: true } },
      receiver: { include: { user: true } }
    }
  })

  if (!tx) notFound()

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:py-10">
      
      {/* Client Component for Print Button */}
      <ReceiptActions />

      <Card className="border-none shadow-2xl bg-white rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden print:shadow-none print:border print:rounded-none">
        <CardContent className="p-0">
          
          {/* Header Section */}
          <div className="bg-slate-950 text-white p-8 sm:p-10 text-center space-y-4 print:bg-white print:text-black print:border-b">
             <div className="mx-auto w-fit p-3 bg-green-500/10 rounded-full print:hidden">
               <CheckCircle2 className="text-green-500 h-12 w-12 sm:h-16 sm:w-16" />
             </div>
             
             {/* Print-only Logo */}
             <div className="hidden print:block text-center font-bold text-2xl mb-4">KUVAULT</div>

             <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-widest">Transaction Successful</h2>
             <p className="text-slate-400 text-xs sm:text-sm break-all print:text-slate-600">Ref: {tx.id.toUpperCase()}</p>
          </div>

          {/* Details Section */}
          <div className="p-6 sm:p-10 space-y-6 sm:space-y-8">
            <div className="text-center border-b border-slate-100 pb-6 sm:pb-8">
              <p className="text-slate-500 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-2">Amount Sent</p>
              {/* Responsive Text Size: 3xl on mobile, 5xl on desktop */}
              <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
                ₦{tx.amount.toLocaleString()}
              </h1>
            </div>

            <div className="grid grid-cols-2 gap-y-6 sm:gap-y-8 gap-x-4 text-sm">
              <div>
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-wider mb-1">From</p>
                <p className="font-bold text-slate-900 text-base sm:text-lg">{tx.sender.user.firstName} {tx.sender.user.lastName}</p>
                <p className="text-slate-500 font-mono text-[10px] sm:text-xs tracking-wider">{tx.sender.accountNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-wider mb-1">To</p>
                <p className="font-bold text-slate-900 text-base sm:text-lg">{tx.receiver.user.firstName} {tx.receiver.user.lastName}</p>
                <p className="text-slate-500 font-mono text-[10px] sm:text-xs tracking-wider">{tx.receiver.accountNumber}</p>
              </div>
              <div>
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-wider mb-1">Date</p>
                <p className="font-medium text-slate-900">{new Date(tx.createdAt).toLocaleDateString()}</p>
                <p className="text-slate-500 text-xs">{new Date(tx.createdAt).toLocaleTimeString()}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-wider mb-1">Status</p>
                <div className="inline-flex items-center gap-1.5 bg-green-50 px-2 sm:px-3 py-1 rounded-full print:bg-transparent print:p-0">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 print:hidden"></div>
                  <p className="font-bold text-green-700 text-[10px] sm:text-xs uppercase tracking-wide print:text-black">Completed</p>
                </div>
              </div>
            </div>

            <div className="pt-6 sm:pt-8 border-t border-slate-100 text-center">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                Generated via Kuvault Digital System.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { margin: 0; }
          body { background: white !important; -webkit-print-color-adjust: exact; }
          .no-print { display: none !important; }
        }
      `}} />
    </div>
  )
}