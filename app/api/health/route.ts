import { dbConnect } from "@/lib/db"

export async function GET() {
  try {
    await dbConnect()
    return Response.json({ ok: true })
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: e?.message || String(e) }), { status: 500 })
  }
}
