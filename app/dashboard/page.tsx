import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import DashboardClient from "@/components/DashboardClient"; // Ensure this file exists in /components

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId as string },
    include: { 
      accounts: {
        include: {
          sentTransactions: true,
          receivedTransactions: true
        }
      } 
    }
  });

  if (!user || !user.accounts[0]) redirect("/login");
  const account = user.accounts[0];

  // Logic to calculate real-time totals
  const transactions = [
    ...(account.sentTransactions || []).map(t => ({ ...t, direction: 'OUTGOING' })),
    ...(account.receivedTransactions || []).map(t => ({ ...t, direction: 'INCOMING' }))
  ];

  return <DashboardClient user={user} account={account} transactions={transactions} />;
}