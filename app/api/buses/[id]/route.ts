import { NextRequest } from "next/server"
import { dbConnect } from "@/lib/db"
import { verifyJwtFromRequest } from "@/lib/auth"
import { Bus, IBus } from "@/models/bus"

export async function GET(req: NextRequest, context: { params: { id: string } }) {
  const { params } = context
  await dbConnect()
  const auth = await verifyJwtFromRequest(req)

  const bus = await Bus.findById(params.id).lean<IBus>()
  if (!bus) {
    return new Response(JSON.stringify({ error: "Not found" }), { status: 404 })
  }

  const bookedSeats = bus.bookings.map((b: any) => b.seat)
  let mySeat: number | null = null

  if (auth) {
    const mine = bus.bookings.find((b: any) => String(b.user) === auth.sub)
    mySeat = mine ? mine.seat : null
  }

  const base = {
    _id: String(bus._id),
    name: bus.name,
    origin: bus.origin,
    destination: bus.destination,
    departureTime: bus.departureTime,
    totalSeats: bus.totalSeats,
  }

  return new Response(
    JSON.stringify({
      ...base,
      bookedSeats,
      mySeat,
    }),
    { status: 200 }
  )
}
