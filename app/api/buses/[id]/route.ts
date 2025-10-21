import type { NextRequest } from "next/server"
import { dbConnect } from "@/lib/db"
import { Bus } from "@/models/bus"
import { verifyJwtFromRequest, assertRole } from "@/lib/auth"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect()
  const auth = await verifyJwtFromRequest(req)
  const bus = await Bus.findById(params.id).lean()
  if (!bus) return new Response(JSON.stringify({ error: "Not found" }), { status: 404 })
  const bookedSeats = bus.bookings.map((b) => b.seat)
  let mySeat: number | null = null
  if (auth) {
    const mine = bus.bookings.find((b) => String(b.user) === auth.sub)
    mySeat = mine ? mine.seat : null
  }
  const base = {
    _id: String(bus._id),
    name: bus.name,
    origin: bus.origin,
    destination: bus.destination,
    departureTime: bus.departureTime,
    totalSeats: bus.totalSeats,
    bookedSeats,
    mySeat,
  }
  if (assertRole(auth, "admin")) {
    return Response.json({
      ...base,
      bookings: bus.bookings.map((bk) => ({ seat: bk.seat, user: String(bk.user), createdAt: bk.createdAt })),
    })
  }
  return Response.json(base)
}
