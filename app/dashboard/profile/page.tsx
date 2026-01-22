import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProfileClient from "@/components/ProfileClient";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId as string },
    include: { accounts: true },
  });

  if (!user) redirect("/login");

  // Pass the real database data to the Client Component
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 p-4 md:p-0">
      <h2 className="text-2xl font-bold text-slate-900 tracking-tight italic">My Profile</h2>
      <ProfileClient 
        user={{
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          avatarUrl: user.avatarUrl,
          accountNumber: user.accounts[0]?.accountNumber || "N/A"
        }} 
      />
    </div>
  );
}