import type { NextRequest } from "next/server"
import { dbConnect } from "@/lib/db"
import { User } from "@/models/user"
import { comparePassword, hashPassword, signJwt, setAuthCookie } from "@/lib/auth"

export async function POST(req: NextRequest) {
  await dbConnect()
  const { email, password } = await req.json()
  // If ADMIN_EMAIL/PASSWORD are set, authenticate against env and ensure an admin user exists.
  const envEmail = process.env.ADMIN_EMAIL
  const envPassword = process.env.ADMIN_PASSWORD
  if (envEmail && envPassword) {
    if (email !== envEmail || password !== envPassword) {
      return new Response(JSON.stringify({ error: "Invalid credentials" }), { status: 401 })
    }
    let user = await User.findOne({ email: envEmail, role: "admin" })
    if (!user) {
      // Create an admin user record using a hashed env password
      const hashed = await hashPassword(envPassword)
      user = await User.create({ email: envEmail, password: hashed, role: "admin" })
    }
    const token = await signJwt({ sub: String(user._id), role: "admin" })
    const res = new Response(JSON.stringify({ email: envEmail, role: "admin" }), { status: 200 })
    setAuthCookie(res, token)
    return res
  }

  // Fallback to DB-stored admin users
  const user = await User.findOne({ email, role: "admin" })
  if (!user) return new Response(JSON.stringify({ error: "Invalid credentials" }), { status: 401 })
  const ok = await comparePassword(password, user.password)
  if (!ok) return new Response(JSON.stringify({ error: "Invalid credentials" }), { status: 401 })
  const token = await signJwt({ sub: String(user._id), role: "admin" })
  const res = new Response(JSON.stringify({ email: user.email, role: "admin" }), { status: 200 })
  setAuthCookie(res, token)
  return res
}
