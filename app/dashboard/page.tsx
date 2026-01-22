import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, Eye, ArrowDownLeft, ArrowUpRight, ArrowRight } from "lucide-react";
import Link from "next/link";
import { TransferModal } from "@/components/TransferModal";
import { DepositModal } from "@/components/DepositModal"; 

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId as string },
    include: { 
      accounts: {
        include: {
          sentTransactions: { include: { receiver: { include: { user: true } } } },
          receivedTransactions: { include: { sender: { include: { user: true } } } }
        }
      } 
    }
  });

  if (!user || !user.accounts[0]) redirect("/login");
  const account = user.accounts[0];

  const transactions = [
    // 👇 FIXED: Added ': any'
    ...(account.sentTransactions || []).map((t: any) => ({ ...t, direction: 'OUTGOING', partner: t.receiver.user })),
    // 👇 FIXED: Added ': any'
    ...(account.receivedTransactions || []).map((t: any) => ({ ...t, direction: 'INCOMING', partner: t.sender.user }))
  ].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const totalIn = transactions.filter((t: any) => t.direction === 'INCOMING').reduce((acc: number, t: any) => acc + t.amount, 0);
  const totalOut = transactions.filter((t: any) => t.direction === 'OUTGOING').reduce((acc: number, t: any) => acc + t.amount, 0);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-28 sm:pb-10 p-4 animate-in fade-in duration-700">
      
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h2>
          <p className="text-sm text-slate-500">Welcome back, {user.firstName}</p>
        </div>
        <div className="hidden sm:block">
           <Button variant="outline" className="rounded-xl border-slate-200">Download Report</Button>
        </div>
      </div>

      {/* MAIN BALANCE CARD */}
      <Card className="border-none shadow-2xl bg-black text-white rounded-[2rem] relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-700"></div>
        
        <CardContent className="p-6 sm:p-10 relative z-10 space-y-6 sm:space-y-8">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                Available Balance <Eye size={14} className="cursor-pointer hover:text-white transition-colors" />
              </p>
              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tighter truncate">
                ₦{account.balance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
              </h1>
            </div>
            <div className="hidden sm:block p-3 bg-white/10 rounded-2xl backdrop-blur-md">
              <Wallet className="text-blue-400" size={24} />
            </div>
          </div>

          <div className="flex gap-4">
            <TransferModal accountId={account.id} />
            <DepositModal accountId={account.id} />
          </div>
        </CardContent>
      </Card>

      {/* QUICK STATS */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-green-50 p-2 rounded-lg"><ArrowDownLeft className="text-green-600" size={16} /></div>
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Income</span>
          </div>
          <p className="text-lg sm:text-xl font-bold text-slate-900 truncate">₦{totalIn.toLocaleString()}</p>
        </div>

        <div className="bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-red-50 p-2 rounded-lg"><ArrowUpRight className="text-red-600" size={16} /></div>
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Spent</span>
          </div>
          <p className="text-lg sm:text-xl font-bold text-slate-900 truncate">₦{totalOut.toLocaleString()}</p>
        </div>
      </div>

      {/* RECENT TRANSACTIONS */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <h3 className="font-bold text-slate-900">Recent Activity</h3>
          <Link href="/dashboard/history" className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline">
            View All <ArrowRight size={12} />
          </Link>
        </div>
        
        <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden">
          {transactions.length > 0 ? (
            <div className="divide-y divide-slate-50">
              {transactions.slice(0, 3).map((t: any) => (
                <div key={t.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0
                      ${t.direction === 'INCOMING' ? 'bg-green-500' : 'bg-slate-900'}`}>
                      {t.partner.firstName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 truncate max-w-[120px] sm:max-w-none">
                        {t.partner.firstName} {t.partner.lastName}
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium">{new Date(t.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <p className={`text-sm font-bold whitespace-nowrap ${t.direction === 'INCOMING' ? 'text-green-600' : 'text-slate-900'}`}>
                    {t.direction === 'INCOMING' ? '+' : '-'}₦{t.amount.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-sm">No transactions yet</div>
          )}
        </div>
      </div>

    </div>
  );
}