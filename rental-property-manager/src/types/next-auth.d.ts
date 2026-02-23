import "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      role: "SUPERADMIN" | "ADMIN" | "MANAGER" | "RENTER"
      ownerSlug?: string | null
      companyName?: string | null
    }
  }

  interface User {
    id: string
    email: string
    name?: string | null
    role: "SUPERADMIN" | "ADMIN" | "MANAGER" | "RENTER"
    ownerSlug?: string | null
    companyName?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: "SUPERADMIN" | "ADMIN" | "MANAGER" | "RENTER"
    ownerSlug?: string | null
    companyName?: string | null
  }
}
