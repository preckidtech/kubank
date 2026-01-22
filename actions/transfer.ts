"use server"

import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"

// Define a strict type for the state
export type TransferState = 
  | { success: true; transactionId: string; error: null }
  | { success: false; transactionId: null; error: string }
  | { success: false; transactionId: null; error: null }; // For initial state

export async function verifyRecipient(accountNumber: string) {
  if (accountNumber.length !== 10 || !accountNumber.startsWith("20")) return null;

  try {
    const account = await prisma.account.findUnique({
      where: { accountNumber },
      include: { user: { select: { firstName: true, lastName: true } } }
    });
    return account ? { name: `${account.user.firstName} ${account.user.lastName}` } : null;
  } catch (error) {
    return null;
  }
}

export async function transferMoney(prevState: TransferState, formData: FormData): Promise<TransferState> {
  const session = await getSession();
  if (!session) return { success: false, transactionId: null, error: "Session expired." };

  const receiverAccountNumber = formData.get("accountNumber") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const pin = formData.get("pin") as string;
  const senderAccountId = formData.get("senderAccountId") as string;

  try {
    const senderAccount = await prisma.account.findUnique({ where: { id: senderAccountId } });
    if (!senderAccount || !(await bcrypt.compare(pin, senderAccount.pin))) {
      return { success: false, transactionId: null, error: "Invalid PIN." };
    }
    
    if (Number(senderAccount.balance) < amount) {
      return { success: false, transactionId: null, error: "Insufficient funds." };
    }

    const receiverAccount = await prisma.account.findUnique({ 
      where: { accountNumber: receiverAccountNumber },
      include: { user: true }
    });

    if (!receiverAccount) return { success: false, transactionId: null, error: "Receiver not found." };
    if (receiverAccount.id === senderAccount.id) return { success: false, transactionId: null, error: "Cannot send to self." };

    const transaction = await prisma.$transaction(async (tx) => {
      await tx.account.update({ where: { id: senderAccount.id }, data: { balance: { decrement: amount } } });
      await tx.account.update({ where: { id: receiverAccount.id }, data: { balance: { increment: amount } } });
      return await tx.transaction.create({
        data: { amount, type: "TRANSFER", senderId: senderAccount.id, receiverId: receiverAccount.id, status: "COMPLETED" }
      });
    });

    revalidatePath("/dashboard");
    return { 
      success: true, 
      transactionId: transaction.id,
      error: null 
    };
  } catch (e) {
    return { success: false, transactionId: null, error: "Transaction failed." };
  }
}