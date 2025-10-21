import type { NextRequest } from "next/server"
import { dbConnect } from "@/lib/db"
import { User } from "@/models/user"
import { comparePassword, signJwt, setAuthCookie } from "@/lib/auth"

export async function POST(req: NextRequest) {
  await dbConnect()
  const { email, password } = await req.json()
  const user = await User.findOne({ email, role: "user" })
  if (!user) return new Response(JSON.stringify({ error: "Invalid credentials" }), { status: 401 })
  const ok = await comparePassword(password, user.password)
  if (!ok) return new Response(JSON.stringify({ error: "Invalid credentials" }), { status: 401 })
  const token = await signJwt({ sub: String(user._id), role: "user" })
  const res = new Response(JSON.stringify({ email: user.email, role: "user" }), { status: 200 })
  setAuthCookie(res, token)
  return res
}
