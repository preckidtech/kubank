import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"

const secretKey = process.env.JWT_SECRET || "default-secret-key"
const key = new TextEncoder().encode(secretKey)

// 1. Encrypt Session Data
export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(key)
}

// 2. Decrypt Session Data
export async function decrypt(input: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ["HS256"],
    })
    return payload
  } catch (error) {
    return null
  }
}

// 3. Create Session (Used by Login/Register)
export async function createSession(userId: string) {
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  const session = await encrypt({ userId, expires })

  // FIX: Added 'await' here
  const cookieStore = await cookies()
  
  cookieStore.set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expires,
    sameSite: "lax",
    path: "/",
  })
}

// 4. Get Session (Used by Pages)
export async function getSession() {
  // FIX: Added 'await' here
  const cookieStore = await cookies()
  
  const session = cookieStore.get("session")?.value
  if (!session) return null
  return await decrypt(session)
}

// 5. Logout
export async function logout() {
  // FIX: Added 'await' here
  const cookieStore = await cookies()
  
  cookieStore.set("session", "", { expires: new Date(0) })
}