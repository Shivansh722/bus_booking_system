import type { NextRequest } from "next/server"
import { dbConnect } from "@/lib/db"
import { Bus } from "@/models/bus"
import { verifyJwtFromRequest, assertRole } from "@/lib/auth"

export async function GET(req: NextRequest) {
  await dbConnect()
  const auth = await verifyJwtFromRequest(req)
  const adminView = req.nextUrl.searchParams.get("admin") === "1" && assertRole(auth, "admin")

  const buses = await Bus.find().sort({ departureTime: 1 }).lean()
  if (adminView) {
    // include bookings for admin with user ids
    return Response.json(
      buses.map((b) => ({
        _id: String(b._id),
        name: b.name,
        origin: b.origin,
        destination: b.destination,
        departureTime: b.departureTime,
        totalSeats: b.totalSeats,
        bookedCount: b.bookings.length,
        bookings: b.bookings.map((bk) => ({ seat: bk.seat, user: String(bk.user), createdAt: bk.createdAt })),
      })),
    )
  }
  return Response.json(
    buses.map((b) => ({
      _id: String(b._id),
      name: b.name,
      origin: b.origin,
      destination: b.destination,
      departureTime: b.departureTime,
      totalSeats: b.totalSeats,
      available: b.totalSeats - b.bookings.length,
    })),
  )
}

export async function POST(req: NextRequest) {
  await dbConnect()
  const auth = await verifyJwtFromRequest(req)
  if (!assertRole(auth, "admin")) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
  const { name, origin, destination, departureTime, totalSeats } = await req.json()
  if (!name || !origin || !destination || !departureTime || !totalSeats) {
    return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 })
  }
  const bus = await Bus.create({
    name,
    origin,
    destination,
    departureTime: new Date(departureTime),
    totalSeats: Math.min(Math.max(Number(totalSeats), 1), 80),
  })
  return new Response(JSON.stringify({ _id: String(bus._id) }), { status: 201 })
}
