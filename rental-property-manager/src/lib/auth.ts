import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { redirect } from "next/navigation"

export async function getSession() {
  return await getServerSession(authOptions)
}

export async function requireAuth() {
  const session = await getSession()
  if (!session) {
    redirect("/auth/signin")
  }
  return session
}

export async function requireRole(roles: ("SUPERADMIN" | "ADMIN" | "MANAGER" | "RENTER")[]) {
  const session = await requireAuth()
  if (!roles.includes(session.user.role)) {
    redirect("/unauthorized")
  }
  return session
}

export async function getCurrentUser() {
  const session = await getSession()
  return session?.user || null
}
