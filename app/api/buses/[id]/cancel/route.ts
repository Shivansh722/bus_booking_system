import type { NextRequest } from "next/server"
import { dbConnect } from "@/lib/db"
import { Bus, type IBus } from "@/models/bus"
import { verifyJwtFromRequest, assertRole } from "@/lib/auth"

interface IBooking {
  user: any
  seat: number
  passengerName: string
  passengerPhone: string
  bookingStatus: 'confirmed' | 'cancelled' | 'pending'
  createdAt: Date
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect()
  const auth = await verifyJwtFromRequest(req)
  if (!assertRole(auth, "user")) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
  const { id } = await params
  const bus = await Bus.findById(id)
  if (!bus) return new Response(JSON.stringify({ error: "Not found" }), { status: 404 })
  const before = bus.bookings.length
  bus.bookings = bus.bookings.filter((b: IBooking) => String(b.user) !== auth!.sub)
  if (bus.bookings.length === before) {
    return new Response(JSON.stringify({ error: "No booking to cancel" }), { status: 400 })
  }
  await bus.save()
  return new Response(JSON.stringify({ ok: true }), { status: 200 })
}
