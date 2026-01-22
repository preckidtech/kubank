"use server"

import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function depositMoney(formData: FormData) {
  const session = await getSession()
  if (!session) return

  const amount = parseFloat(formData.get("amount") as string)
  
  // Update Balance
  await prisma.user.update({
    where: { id: session.userId as string },
    data: {
      accounts: {
        updateMany: {
          where: { accountNumber: { not: "" } }, // Select the user's account
          data: { balance: { increment: amount } }
        }
      }
    }
  })

  revalidatePath("/dashboard")
}