import type { NextRequest } from "next/server"
import { dbConnect } from "@/lib/db"
import { Bus } from "@/models/bus"
import { verifyJwtFromRequest, assertRole } from "@/lib/auth"

export async function GET(req: NextRequest) {
  await dbConnect()
  const auth = await verifyJwtFromRequest(req)
  const adminView = req.nextUrl.searchParams.get("admin") === "1" && assertRole(auth, "admin")

  // Get query parameters for filtering
  const { searchParams } = new URL(req.url)
  const origin = searchParams.get('origin')
  const destination = searchParams.get('destination')
  const date = searchParams.get('date')
  const busType = searchParams.get('busType')

  // Build query
  const query: any = { isActive: true }
  
  if (origin) {
    query.origin = { $regex: origin, $options: 'i' }
  }
  
  if (destination) {
    query.destination = { $regex: destination, $options: 'i' }
  }
  
  if (date) {
    const startDate = new Date(date)
    const endDate = new Date(date)
    endDate.setDate(endDate.getDate() + 1)
    query.departureTime = {
      $gte: startDate,
      $lt: endDate
    }
  }
  
  if (busType) {
    query.busType = busType
  }

  const buses = await Bus.find(query).sort({ departureTime: 1 }).lean()
  
  if (adminView) {
    // include bookings for admin with user ids
    return Response.json(
      buses.map((b) => ({
        _id: String(b._id),
        name: b.name,
        busNumber: b.busNumber,
        operator: b.operator,
        origin: b.origin,
        destination: b.destination,
        departureTime: b.departureTime,
        arrivalTime: b.arrivalTime,
        duration: b.duration,
        price: b.price,
        busType: b.busType,
        amenities: b.amenities,
        totalSeats: b.totalSeats,
        availableSeats: b.availableSeats,
        bookedCount: b.bookings.length,
        bookings: b.bookings.map((bk: any) => ({ 
           seat: bk.seat, 
           user: String(bk.user), 
           passengerName: bk.passengerName,
           passengerPhone: bk.passengerPhone,
           bookingStatus: bk.bookingStatus,
           createdAt: bk.createdAt 
         })),
        isActive: b.isActive,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt
      })),
    )
  }
  
  return Response.json(
    buses.map((b) => ({
      _id: String(b._id),
      name: b.name,
      busNumber: b.busNumber,
      operator: b.operator,
      origin: b.origin,
      destination: b.destination,
      departureTime: b.departureTime,
      arrivalTime: b.arrivalTime,
      duration: b.duration,
      price: b.price,
      busType: b.busType,
      amenities: b.amenities,
      totalSeats: b.totalSeats,
      availableSeats: b.availableSeats,
      bookedSeats: b.bookings.map((bk: any) => bk.seat)
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
