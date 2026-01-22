"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"
import { encrypt } from "@/lib/auth"
import { cookies } from "next/headers"

export async function registerUser(formData: FormData) {
  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const pin = formData.get("pin") as string

  // 1. Server-side Strength Check
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    return { error: "Password does not meet security requirements." }
  }

  try {
    // 2. Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    if (existingUser) return { error: "An account with this email already exists." }

    const hashedPassword = await bcrypt.hash(password, 10)
    const hashedPin = await bcrypt.hash(pin, 10)

    // 3. GENERATE UNIQUE 10-DIGIT ACCOUNT NUMBER STARTING WITH 20
    let accountNumber = ""
    let isUnique = false

    while (!isUnique) {
      // "20" + 8 random digits
      accountNumber = "20" + Math.floor(10000000 + Math.random() * 90000000).toString()
      const check = await prisma.account.findUnique({ where: { accountNumber } })
      if (!check) isUnique = true
    }

    // 4. Create User & Account
    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email: email.toLowerCase(),
        password: hashedPassword,
        accounts: {
          create: {
            accountNumber,
            pin: hashedPin,
            balance: 50000.00,
          }
        }
      }
    })

    // 5. Create Session
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)
    const token = await encrypt({ userId: newUser.id, email: newUser.email })
    const cookieStore = await cookies()
    cookieStore.set("session", token, { expires, httpOnly: true, path: "/" })

  } catch (error) {
    console.error("Registration Error:", error)
    return { error: "Registration failed. Please try again." }
  }

  redirect("/dashboard")
}