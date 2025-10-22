import type { NextRequest } from "next/server"
import { dbConnect } from "@/lib/db"
import { Booking } from "@/models/booking"
import { verifyJwtFromRequest } from "@/lib/auth"

export async function GET(req: NextRequest, { params }: { params: { reference: string } }) {
  try {
    await dbConnect()
    const auth = await verifyJwtFromRequest(req)
    
    if (!auth) {
      return new Response(JSON.stringify({ error: "Authentication required" }), { status: 401 })
    }

    const { reference } = params

    // Find booking by reference and user
    const booking = await Booking.findOne({ 
      bookingReference: reference,
      user: auth.sub 
    })
    .populate('bus', 'name busNumber operator origin destination departureTime arrivalTime duration price busType amenities')
    .lean()

    if (!booking) {
      return new Response(JSON.stringify({ error: "Booking not found" }), { status: 404 })
    }

    const formattedBooking = {
      _id: String((booking as any)._id),
      bookingReference: (booking as any).bookingReference,
      seat: (booking as any).seat,
      passengerName: (booking as any).passengerName,
      passengerPhone: (booking as any).passengerPhone,
      passengerEmail: (booking as any).passengerEmail,
      bookingStatus: (booking as any).bookingStatus,
      paymentStatus: (booking as any).paymentStatus,
      paymentMethod: (booking as any).paymentMethod,
      totalAmount: (booking as any).totalAmount,
      createdAt: (booking as any).createdAt,
      updatedAt: (booking as any).updatedAt,
      bus: (booking as any).bus
    }

    return new Response(JSON.stringify(formattedBooking), { status: 200 })

  } catch (error) {
    console.error('Error fetching booking:', error)
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 })
  }
}