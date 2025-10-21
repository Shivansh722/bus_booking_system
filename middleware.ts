import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const TOKEN_NAME = "token"

function getJwtSecret() {
  const secret = process.env.JWT_SECRET
  return new TextEncoder().encode(secret || "dev-secret-do-not-use")
}

// Create a 403 Forbidden response
function createForbiddenResponse(message: string) {
  return new NextResponse(
    JSON.stringify({ 
      error: "Access Forbidden", 
      message,
      statusCode: 403 
    }),
    { 
      status: 403,
      headers: {
        "Content-Type": "application/json",
      }
    }
  )
}

// Create a 401 Unauthorized response
function createUnauthorizedResponse(message: string) {
  return new NextResponse(
    JSON.stringify({ 
      error: "Unauthorized", 
      message,
      statusCode: 401 
    }),
    { 
      status: 401,
      headers: {
        "Content-Type": "application/json",
      }
    }
  )
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Public paths (allow all)
  const publicPaths = [
    "/",
    "/buses",
    "/user/login",
    "/user/signup",
    "/admin/login", 
    "/admin/signup",
    "/api/auth/login",
    "/api/auth/signup", 
    "/api/auth/logout",
    "/api/health",
  ]
  
  // Check if path is public
  const isPublicPath = publicPaths.some((p) => pathname === p || pathname.startsWith(p + "/"))
  
  // Allow public GET requests to buses API
  if (pathname.startsWith("/api/buses") && req.method === "GET") {
    return NextResponse.next()
  }
  
  if (isPublicPath) {
    return NextResponse.next()
  }

  // Extract and verify JWT token
  const token = req.cookies.get(TOKEN_NAME)?.value
  let role: "admin" | "user" | null = null
  let userId: string | null = null
  
  if (token) {
    try {
      const { payload } = await jwtVerify(token, getJwtSecret())
      role = (payload as any).role || null
      userId = (payload as any).sub || null
    } catch (error) {
      // Invalid token - clear it and treat as unauthenticated
      const response = NextResponse.redirect(new URL("/", req.url))
      response.cookies.delete(TOKEN_NAME)
      return response
    }
  }

  // Admin section access control
  if (pathname.startsWith("/admin")) {
    if (!role) {
      // Not authenticated - redirect to admin login
      return NextResponse.redirect(new URL("/admin/login", req.url))
    }
    
    if (role === "user") {
      // User trying to access admin area - return 403
      return createForbiddenResponse("Access denied. Admin privileges required.")
    }
    
    if (role === "admin") {
      return NextResponse.next()
    }
  }

  // User section access control
  if (pathname.startsWith("/tickets") || pathname.startsWith("/user/")) {
    // Skip login/signup pages as they're public
    if (pathname.startsWith("/user/login") || pathname.startsWith("/user/signup")) {
      return NextResponse.next()
    }
    
    if (!role) {
      // Not authenticated - redirect to user login
      return NextResponse.redirect(new URL("/user/login", req.url))
    }
    
    if (role === "admin") {
      // Admin trying to access user area - return 403
      return createForbiddenResponse("Access denied. This area is for regular users only.")
    }
    
    if (role === "user") {
      return NextResponse.next()
    }
  }

  // API routes access control
  if (pathname.startsWith("/api/")) {
    // Skip public auth endpoints
    if (pathname.startsWith("/api/auth/") || pathname.startsWith("/api/health")) {
      return NextResponse.next()
    }
    
    // Admin API routes
    if (pathname.startsWith("/api/admin/")) {
      if (!role) {
        return createUnauthorizedResponse("Authentication required.")
      }
      if (role !== "admin") {
        return createForbiddenResponse("Admin privileges required.")
      }
      return NextResponse.next()
    }
    
    // User API routes  
    if (pathname.startsWith("/api/user/") || pathname.startsWith("/api/tickets/")) {
      if (!role) {
        return createUnauthorizedResponse("Authentication required.")
      }
      if (role !== "user") {
        return createForbiddenResponse("User privileges required.")
      }
      return NextResponse.next()
    }
    
    // General API routes - require authentication
    if (!role) {
      return createUnauthorizedResponse("Authentication required.")
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/tickets/:path*",
    "/api/:path*",
    "/buses/:path*",
    "/:path*",
  ],
}
