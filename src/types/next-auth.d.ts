import "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      role: "ADMIN" | "MANAGER" | "RENTER"
    }
  }

  interface User {
    id: string
    email: string
    name?: string | null
    role: "ADMIN" | "MANAGER" | "RENTER"
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: "ADMIN" | "MANAGER" | "RENTER"
  }
}
