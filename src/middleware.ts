export { default } from "next-auth/middleware"

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/properties/:path*",
    "/admin/:path*",
    "/manager/:path*",
    "/renter/:path*",
    "/api/properties/:path*",
    "/api/meter-readings/:path*",
    "/api/bills/:path*",
  ],
}
