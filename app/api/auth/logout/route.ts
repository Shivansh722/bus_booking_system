import type { NextRequest } from "next/server"
import { clearAuthCookie } from "@/lib/auth"

export async function POST(_req: NextRequest) {
  const res = new Response(JSON.stringify({ ok: true }), { status: 200 })
  clearAuthCookie(res)
  return res
}
