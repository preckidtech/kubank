"use server"

import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function updateProfileImage(formData: FormData) {
  const session = await getSession()
  if (!session) return { error: "Not authorized" }

  const image = formData.get("image") as File
  if (!image) return { error: "No image provided" }

  try {
    // 1. In a real app, you'd upload 'image' to Supabase Storage here.
    // For now, we simulate a URL. If you have a real URL, put it here.
    const uploadedImageUrl = `/uploads/${image.name}` 

    // 2. Save the URL to the User record in the database
    await prisma.user.update({
      where: { id: session.userId as string },
      data: { avatarUrl: uploadedImageUrl }
    })

    // 3. Clear the cache so the Dashboard and Profile show the new image immediately
    revalidatePath("/dashboard")
    revalidatePath("/dashboard/profile")

    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Failed to save image to database" }
  }
}