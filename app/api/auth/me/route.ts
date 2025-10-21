import type { NextRequest } from "next/server"
import { verifyJwtFromRequest } from "@/lib/auth"
import { dbConnect } from "@/lib/db"
import { User } from "@/models/user"

export async function GET(req: NextRequest) {
  try {
    // Verify the JWT token from the request
    const payload = await verifyJwtFromRequest(req)
    
    if (!payload) {
      return new Response(
        JSON.stringify({ error: "Not authenticated" }), 
        { status: 401 }
      )
    }

    // Connect to database and get user details
    await dbConnect()
    const user = await User.findById(payload.sub).select("email role")
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: "User not found" }), 
        { status: 404 }
      )
    }

    // Return user information
    return new Response(
      JSON.stringify({ 
        email: user.email, 
        role: user.role,
        userId: payload.sub 
      }), 
      { 
        status: 200,
        headers: {
          "Content-Type": "application/json",
        }
      }
    )
  } catch (error) {
    console.error("Auth check error:", error)
    return new Response(
      JSON.stringify({ error: "Authentication verification failed" }), 
      { status: 401 }
    )
  }
}