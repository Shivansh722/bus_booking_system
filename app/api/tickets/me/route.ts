import type { NextRequest } from "next/server"
import { dbConnect } from "@/lib/db"
import { Bus } from "@/models/bus"
import { verifyJwtFromRequest, assertRole } from "@/lib/auth"

export async function GET(req: NextRequest) {
  await dbConnect()
  const auth = await verifyJwtFromRequest(req)
  if (!assertRole(auth, "user")) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
  const buses = await Bus.find({ "bookings.user": auth!.sub }).lean()
  const tickets = buses.flatMap((b) =>
    b.bookings
      .filter((bk) => String(bk.user) === auth!.sub)
      .map((bk) => ({
        busId: String(b._id),
        seat: bk.seat,
        busName: b.name,
        origin: b.origin,
        destination: b.destination,
        departureTime: b.departureTime,
      })),
  )
  return Response.json(tickets)
}
