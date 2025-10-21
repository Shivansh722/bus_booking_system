import type { NextRequest } from "next/server"
import { dbConnect } from "@/lib/db"
import { User } from "@/models/user"
import { hashPassword, signJwt, setAuthCookie } from "@/lib/auth"

export async function POST(req: NextRequest) {
  await dbConnect()
  const { email, password } = await req.json()
  if (!email || !password) {
    return new Response(JSON.stringify({ error: "Email and password required" }), { status: 400 })
  }
  // If ADMIN_EMAIL is configured, disable open admin signup to enforce a single stored admin.
  if (process.env.ADMIN_EMAIL) {
    return new Response(
      JSON.stringify({ error: "Admin signup is disabled. Use the stored admin credentials." }),
      { status: 403 },
    )
  }
  const exists = await User.findOne({ email })
  if (exists) return new Response(JSON.stringify({ error: "User exists" }), { status: 409 })
  const hashed = await hashPassword(password)
  const user = await User.create({ email, password: hashed, role: "admin" })
  const token = await signJwt({ sub: String(user._id), role: "admin" })
  const res = new Response(JSON.stringify({ email: user.email, role: "admin" }), { status: 201 })
  setAuthCookie(res, token)
  return res
}
