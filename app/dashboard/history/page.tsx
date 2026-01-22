import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; // ✅ Import restored
import { ReceiptText, Search, Filter, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import Image from "next/image"; 

export default async function HistoryPage() {
  const session = await getSession();
  
  if (!session || !session.userId) {
    redirect("/login");
  }

  // Fetch User & Transactions (Optimized)
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      accounts: {
        take: 1,
        include: {
          sentTransactions: {
            include: { receiver: { include: { user: true } } },
            orderBy: { createdAt: 'desc' },
            take: 50 // Limit to 50 for speed
          },
          receivedTransactions: {
            include: { sender: { include: { user: true } } },
            orderBy: { createdAt: 'desc' },
            take: 50 
          },
        },
      },
    },
  });

  if (!user || !user.accounts[0]) {
    redirect("/login");
  }
  
  const account = user.accounts[0];
  
  // Combine and Sort
  const allTransactions = [
    ...account.sentTransactions.map((t: any) => ({ 
      ...t, 
      direction: "OUTGOING", 
      partnerName: `${t.receiver.user.firstName} ${t.receiver.user.lastName}`,
      partnerAvatar: t.receiver.user.avatarUrl
    })),
    ...account.receivedTransactions.map((t: any) => ({ 
      ...t, 
      direction: "INCOMING", 
      partnerName: `${t.sender.user.firstName} ${t.sender.user.lastName}`,
      partnerAvatar: t.sender.user.avatarUrl
    })),
  ].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 p-4 pb-28 sm:pb-10 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Transaction History</h2>
          <p className="text-sm text-slate-500 font-medium">View and manage your recent activity</p>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
           <div className="relative flex-1 sm:w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
             <Input placeholder="Search..." className="pl-10 h-11 rounded-2xl border-slate-200 bg-white shadow-sm" />
           </div>
           <Button variant="outline" className="h-11 w-11 p-0 rounded-2xl border-slate-200 bg-white shrink-0">
             <Filter size={18} className="text-slate-500" />
           </Button>
        </div>
      </div>

      {/* LIST */}
      <Card className="rounded-[2.5rem] border-slate-100 shadow-xl bg-white overflow-hidden">
        <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <ReceiptText size={18} className="text-blue-600" /> All Transactions
          </h3>
        </div>

        <div className="divide-y divide-slate-50">
          {allTransactions.length > 0 ? (
            allTransactions.map((tx: any) => (
              <Link 
                href={`/dashboard/history/${tx.id}`} 
                key={tx.id} 
                className="p-4 sm:p-5 flex items-center justify-between group hover:bg-slate-50 transition-all active:bg-slate-100"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="h-12 w-12 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative">
                    {tx.partnerAvatar ? (
                      <Image 
                        src={tx.partnerAvatar} 
                        alt={tx.partnerName} 
                        fill 
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-slate-400 font-bold text-sm bg-slate-50">
                        {tx.partnerName.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate max-w-[140px] sm:max-w-none">
                      {tx.partnerName}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className={`text-sm sm:text-base font-bold tabular-nums ${tx.direction === "INCOMING" ? "text-green-600" : "text-slate-900"}`}>
                    {tx.direction === "INCOMING" ? "+" : "-"} ₦{Number(tx.amount).toLocaleString()}
                  </p>
                  <div className="flex items-center justify-end gap-1 text-[9px] font-bold text-slate-300 uppercase tracking-tighter mt-0.5 group-hover:text-blue-500 transition-colors">
                    View <ArrowRight size={8} />
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="p-12 text-center text-slate-400 text-sm">No transactions yet</div>
          )}
        </div>
      </Card>
    </div>
  );
}