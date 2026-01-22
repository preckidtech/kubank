import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; // FIXED: Added missing import
import { ArrowUpRight, ArrowDownLeft, ReceiptText, PieChart as PieIcon, Search, Filter } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";

export default async function HistoryPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId as string },
    include: {
      accounts: {
        include: {
          sentTransactions: { include: { receiver: { include: { user: true } } } },
          receivedTransactions: { include: { sender: { include: { user: true } } } },
        },
      },
    },
  });

  if (!user || !user.accounts[0]) redirect("/login");
  const account = user.accounts[0];
  
  // Mapping with partnerName to ensure type safety
  const allTransactions = [
    ...account.sentTransactions.map((t) => ({ 
      ...t, 
      direction: "OUTGOING", 
      partnerName: `${t.receiver.user.firstName} ${t.receiver.user.lastName}`,
      partnerAvatar: t.receiver.user.avatarUrl
    })),
    ...account.receivedTransactions.map((t) => ({ 
      ...t, 
      direction: "INCOMING", 
      partnerName: `${t.sender.user.firstName} ${t.sender.user.lastName}`,
      partnerAvatar: t.sender.user.avatarUrl
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Accurate Chart Calculations
  const totalOut = allTransactions.filter(t => t.direction === "OUTGOING").reduce((acc, t) => acc + Number(t.amount), 0);
  const totalIn = allTransactions.filter(t => t.direction === "INCOMING").reduce((acc, t) => acc + Number(t.amount), 0);
  const expenseRatio = (totalIn + totalOut) > 0 ? Math.round((totalOut / (totalIn + totalOut)) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10 animate-in fade-in duration-700">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 italic">Financial Analysis</h2>
          <p className="text-sm text-slate-500 font-medium tracking-tight">Real-time spending and income breakdown</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
           <div className="relative flex-1 md:w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
             <Input placeholder="Search name or amount..." className="pl-10 h-11 rounded-2xl border-slate-200 bg-white shadow-sm" />
           </div>
           <Button variant="outline" className="h-11 w-11 p-0 rounded-2xl border-slate-200 bg-white">
             <Filter size={18} className="text-slate-500" />
           </Button>
        </div>
      </div>

      {/* ANALYTICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="rounded-[2.5rem] border-none shadow-2xl bg-slate-950 text-white p-8 relative overflow-hidden group">
          <div className="relative z-10 flex justify-between items-center">
            <div className="space-y-6">
              <div className="bg-white/10 p-3 rounded-2xl w-fit"><PieIcon size={24} className="text-blue-400" /></div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-[0.2em]">Expense Ratio</p>
                <p className="text-3xl font-bold tracking-tighter">₦{totalOut.toLocaleString()}</p>
              </div>
            </div>
            {/* SVG Progress Circle */}
            <div className="relative h-28 w-28 flex items-center justify-center">
              <svg className="h-full w-full transform -rotate-90">
                <circle cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-slate-800" />
                <circle cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="10" fill="transparent" 
                  strokeDasharray={301.6} strokeDashoffset={301.6 - (301.6 * expenseRatio) / 100}
                  className="text-blue-500 transition-all duration-1000" />
              </svg>
              <span className="absolute text-xl font-bold tabular-nums">{expenseRatio}%</span>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col justify-between hover:border-blue-200 transition-all">
            <div className="bg-green-50 p-3 rounded-2xl w-fit"><ArrowDownLeft className="text-green-600" size={20} /></div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total In</p>
              <p className="text-2xl font-bold text-slate-900 tracking-tighter tabular-nums">₦{totalIn.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col justify-between hover:border-blue-200 transition-all">
            <div className="bg-red-50 p-3 rounded-2xl w-fit"><ArrowUpRight className="text-red-600" size={20} /></div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Out</p>
              <p className="text-2xl font-bold text-slate-900 tracking-tighter tabular-nums">₦{totalOut.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ACTIVITY LIST */}
      <Card className="rounded-[2.5rem] border-slate-100 shadow-xl bg-white overflow-hidden">
        <div className="p-6 border-b border-slate-50 bg-slate-50/30">
          <h3 className="font-bold text-slate-900 flex items-center gap-2"><ReceiptText size={18} className="text-blue-600" /> Recent Activity</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {allTransactions.map((tx) => (
            <Link href={`/dashboard/history/${tx.id}`} key={tx.id} className="p-5 flex items-center justify-between group hover:bg-slate-50/50 transition-all">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                  {tx.partnerAvatar ? (
                    <img src={tx.partnerAvatar} alt="Partner" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-slate-300 font-bold text-xs">
                      {tx.partnerName.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {tx.direction === "INCOMING" ? "From " : "To "} {tx.partnerName}
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    {new Date(tx.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-base font-bold tabular-nums ${tx.direction === "INCOMING" ? "text-green-600" : "text-slate-900"}`}>
                  {tx.direction === "INCOMING" ? "+" : "-"} ₦{Number(tx.amount).toLocaleString()}
                </p>
                <p className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">View Receipt</p>
              </div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}