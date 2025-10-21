import type { NextRequest } from "next/server"
import { dbConnect } from "@/lib/db"
import { Bus } from "@/models/bus"
import { verifyJwtFromRequest, assertRole } from "@/lib/auth"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect()
  const auth = await verifyJwtFromRequest(req)
  if (!assertRole(auth, "user")) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
  const { seat } = await req.json()
  const seatNum = Number(seat)
  const bus = await Bus.findById(params.id)
  if (!bus) return new Response(JSON.stringify({ error: "Not found" }), { status: 404 })
  if (seatNum < 1 || seatNum > bus.totalSeats) {
    return new Response(JSON.stringify({ error: "Invalid seat" }), { status: 400 })
  }
  // ensure user doesn't already have a booking
  if (bus.bookings.some((b) => String(b.user) === auth!.sub)) {
    return new Response(JSON.stringify({ error: "Already booked" }), { status: 400 })
  }
  // ensure seat is free
  if (bus.bookings.some((b) => b.seat === seatNum)) {
    return new Response(JSON.stringify({ error: "Seat taken" }), { status: 409 })
  }
  bus.bookings.push({ seat: seatNum, user: auth!.sub as any, createdAt: new Date() })
  await bus.save()
  return new Response(JSON.stringify({ ok: true, seat: seatNum }), { status: 200 })
}
