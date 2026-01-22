"use server"

import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"
import { createSession } from "@/lib/auth"

export async function login(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Please fill in all fields", field: "both" }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return { error: "User with this email does not exist", field: "email" }
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password)
    if (!isPasswordCorrect) {
      return { error: "Incorrect password. Please try again.", field: "password" }
    }

    await createSession(user.id)

  } catch (error) {
    console.error("Login Error:", error)
    return { error: "Database connection error.", field: "none" }
  }

  redirect("/dashboard")
}