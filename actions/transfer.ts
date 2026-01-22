"use server"

import { prisma } from "@/lib/prisma" // This import will work now
import { getSession } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import { headers } from "next/headers"

export type TransferState = 
  | { success: true; transactionId: string; error: null }
  | { success: false; transactionId: null; error: string }
  | { success: false; transactionId: null; error: null };

// --- 1. GET RECIPIENT DETAILS ---
export async function getAccountOwner(accountNumber: string) {
  if (accountNumber.length !== 10) return { success: false, error: "Invalid format" };

  try {
    const account = await prisma.account.findUnique({
      where: { accountNumber },
      include: { user: { select: { firstName: true, lastName: true } } }
    });

    if (!account) return { success: false, error: "Account not found" };

    return { 
      success: true, 
      name: `${account.user.firstName} ${account.user.lastName}` 
    };
  } catch (error) {
    return { success: false, error: "System error" };
  }
}

// --- 2. TRANSFER TRANSACTION ---
export async function transferMoney(prevState: TransferState, formData: FormData): Promise<TransferState> {
  const session = await getSession();
  if (!session || !session.userId) {
    return { success: false, transactionId: null, error: "Session expired. Please log in again." };
  }

  const receiverAccountNumber = formData.get("accountNumber") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const pin = formData.get("pin") as string;
  const headersList = await headers(); 
  const ip = headersList.get("x-forwarded-for") || "unknown";

  try {
    const senderAccount = await prisma.account.findFirst({ where: { userId: session.userId } });
    if (!senderAccount) return { success: false, transactionId: null, error: "Sender account not found." };
    
    const isPinValid = await bcrypt.compare(pin, senderAccount.pin);
    if (!isPinValid) return { success: false, transactionId: null, error: "Invalid Security PIN." };
    
    if (senderAccount.balance < amount) return { success: false, transactionId: null, error: "Insufficient funds." };

    const receiverAccount = await prisma.account.findUnique({ where: { accountNumber: receiverAccountNumber } });
    if (!receiverAccount) return { success: false, transactionId: null, error: "Receiver account not found." };
    if (receiverAccount.id === senderAccount.id) return { success: false, transactionId: null, error: "Cannot transfer to self." };

    // 👇 FIXED: Added ': any' to silence the strict type error
    const transaction = await prisma.$transaction(async (tx: any) => {
      await tx.account.update({ 
        where: { id: senderAccount.id }, 
        data: { balance: { decrement: amount } } 
      });
      await tx.account.update({ 
        where: { id: receiverAccount.id }, 
        data: { balance: { increment: amount } } 
      });
      
      return await tx.transaction.create({
        data: { 
          amount, 
          type: "TRANSFER", 
          senderId: senderAccount.id, 
          receiverId: receiverAccount.id, 
          status: "COMPLETED",
          description: `Transfer via Web | IP: ${ip}`
        }
      });
    });

    revalidatePath("/dashboard");
    return { success: true, transactionId: transaction.id, error: null };
  } catch (e) {
    console.error("Transfer Error:", e);
    return { success: false, transactionId: null, error: "Transaction failed. Please try again." };
  }
}