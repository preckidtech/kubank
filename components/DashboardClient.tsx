"use client"

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, ArrowDownLeft, ArrowUpRight, CreditCard, Copy, User, Eye, EyeOff } from "lucide-react";
import { TransferModal } from "@/components/TransferModal";
import { DepositModal } from "@/components/DepositModal";

export default function DashboardClient({ user, account, transactions = [] }: any) {
  const [showBalance, setShowBalance] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const incomingToday = (transactions || [])
    .filter((tx: any) => tx.direction === "INCOMING" && new Date(tx.createdAt) >= startOfToday)
    .reduce((acc: number, tx: any) => acc + Number(tx.amount), 0);

  const outgoingToday = (transactions || [])
    .filter((tx: any) => tx.direction === "OUTGOING" && new Date(tx.createdAt) >= startOfToday)
    .reduce((acc: number, tx: any) => acc + Number(tx.amount), 0);

  if (!mounted) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full overflow-hidden bg-slate-100 border-2 border-white shadow-lg ring-1 ring-slate-200">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-slate-300"><User size={24} /></div>
            )}
          </div>
          <div className="space-y-0.5">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight italic">Hi, {user.firstName}</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Nexus Premium Member</p>
          </div>
        </div>
        {/* FIXED: Removed duplicate 'uppercase' class here */}
        <div className="bg-white border px-4 py-1.5 rounded-full shadow-sm flex items-center gap-2 font-bold text-[10px] text-slate-700 uppercase tracking-widest">
          <ShieldCheck className="h-4 w-4 text-blue-600" /> Secured
        </div>
      </div>

      {/* ACCOUNT CARD */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-100 border border-blue-500 relative overflow-hidden">
        <div className="relative z-10 flex justify-between items-center">
          <div className="space-y-1">
            <p className="text-blue-100 text-[10px] uppercase font-bold tracking-[0.3em]">Account Number</p>
            <div className="flex items-center gap-4">
              <p className="text-3xl font-mono font-bold tracking-tighter">{account.accountNumber}</p>
              <button className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors active:scale-95"><Copy size={16} /></button>
            </div>
          </div>
          <div className="h-12 w-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-inner"><CreditCard size={24} /></div>
        </div>
      </div>

      {/* BALANCE SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="md:col-span-2 bg-slate-950 text-white rounded-[2.5rem] border-none shadow-2xl p-4 relative overflow-hidden group">
          <CardContent className="pt-8 px-8 pb-8 space-y-10">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <p className="text-slate-500 text-[11px] font-bold uppercase tracking-[0.2em]">Available Balance</p>
                <button onClick={() => setShowBalance(!showBalance)} className="text-slate-600 hover:text-white transition-all">
                  {showBalance ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <h1 className="text-6xl font-bold tracking-tighter tabular-nums text-white min-h-[60px]">
                {showBalance 
                  ? `₦${Number(account.balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                  : "₦ • • • • • •"}
              </h1>
            </div>
            <div className="flex items-center gap-4 pt-4">
              <TransferModal accountId={account.id} />
              <DepositModal accountId={account.id} />
            </div>
          </CardContent>
        </Card>

        {/* STATUS CARD */}
        <Card className="rounded-[2.5rem] border-slate-100 shadow-xl shadow-slate-50 bg-white flex flex-col items-center justify-center p-8 space-y-6">
           <div className="bg-green-50 w-16 h-16 rounded-3xl flex items-center justify-center border border-green-100 shadow-sm">
              <ShieldCheck className="h-8 w-8 text-green-600" />
           </div>
           <div className="text-center">
             <p className="font-bold text-slate-900 text-lg">Active Account</p>
             <div className="mt-4 px-3 py-1 bg-blue-50 rounded-lg">
                <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest text-center">Limit: ₦1M Daily</p>
             </div>
           </div>
        </Card>
      </div>

      {/* DYNAMIC TRENDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <div className="bg-white rounded-[2rem] p-7 border border-slate-100 shadow-lg shadow-slate-50 flex items-center justify-between group hover:border-blue-200 transition-all cursor-default">
          <div className="space-y-2">
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Incoming Today</p>
            <p className="text-2xl font-bold text-green-600 font-mono">
              ₦{incomingToday.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-2xl group-hover:bg-green-100 transition-colors">
            <ArrowDownLeft className="text-green-600 h-6 w-6" />
          </div>
        </div>
        <div className="bg-white rounded-[2rem] p-7 border border-slate-100 shadow-lg shadow-slate-50 flex items-center justify-between group hover:border-blue-200 transition-all cursor-default">
          <div className="space-y-2">
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Outgoing Today</p>
            <p className="text-2xl font-bold text-red-600 font-mono">
              ₦{outgoingToday.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-red-50 p-4 rounded-2xl group-hover:bg-red-100 transition-colors">
            <ArrowUpRight className="text-red-600 h-6 w-6" />
          </div>
        </div>
      </div>
    </div>
  );
}