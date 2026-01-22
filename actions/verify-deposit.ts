"use server"

import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function verifyAndDeposit(reference: string) {
  const session = await getSession()
  if (!session) return { success: false, message: "Unauthorized" }

  // 1. Verify with Paystack
  try {
    const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
      }
    })
    
    const data = await res.json()
    
    if (!data.status || data.data.status !== "success") {
      return { success: false, message: "Payment verification failed" }
    }

    // Amount paid (Paystack returns Kobo, so divide by 100)
    const amountInNaira = data.data.amount / 100

    // 2. Find User's Account
    const user = await prisma.user.findUnique({
      where: { id: session.userId as string },
      include: { accounts: true }
    })

    if (!user || !user.accounts[0]) return { success: false, message: "Account not found" }
    const account = user.accounts[0]

    // 3. Credit the Account
    await prisma.$transaction([
      prisma.account.update({
        where: { id: account.id },
        data: { balance: { increment: amountInNaira } }
      }),
      prisma.transaction.create({
        data: {
          amount: amountInNaira,
          type: "DEPOSIT",
          status: "COMPLETED",
          senderId: account.id,   // Self-reference for deposit
          receiverId: account.id,
          description: "Card Deposit via Paystack"
        }
      })
    ])

    revalidatePath("/dashboard")
    return { success: true }

  } catch (error) {
    return { success: false, message: "Server error" }
  }
}