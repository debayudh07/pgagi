import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Check if user is authenticated for protected routes
        if (req.nextUrl.pathname.startsWith('/dashboard') ||
            req.nextUrl.pathname.startsWith('/search') ||
            req.nextUrl.pathname.startsWith('/trending') ||
            req.nextUrl.pathname.startsWith('/favorites')) {
          return !!token
        }
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/search/:path*',
    '/trending/:path*',
    '/favorites/:path*'
  ]
}
