"use server"

import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function depositMoney(formData: FormData) {
  const session = await getSession()
  if (!session) return { error: "Session expired" }

  const amount = parseFloat(formData.get("amount") as string)
  if (isNaN(amount) || amount <= 0) return { error: "Invalid amount" }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId as string },
      include: { accounts: true }
    })

    if (!user || !user.accounts[0]) return { error: "Account not found" }
    const accountId = user.accounts[0].id

    // Atomic update: Increase balance AND create history record
    await prisma.$transaction([
      prisma.account.update({
        where: { id: accountId },
        data: { balance: { increment: amount } }
      }),
      prisma.transaction.create({
        data: {
          amount,
          type: "DEPOSIT",
          status: "COMPLETED",
          senderId: accountId,   // For deposits, the sender and receiver is the same account
          receiverId: accountId,
          // Removed 'description' because it is not in your schema
        }
      })
    ])

    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Deposit Error:", error)
    return { error: "Failed to process deposit" }
  }
}