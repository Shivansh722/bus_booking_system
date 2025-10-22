import type { NextRequest } from "next/server"
import { dbConnect } from "@/lib/db"
import { Booking } from "@/models/booking"
import { Bus } from "@/models/bus"
import { verifyJwtFromRequest } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    await dbConnect()
    const auth = await verifyJwtFromRequest(req)
    
    if (!auth) {
      return new Response(JSON.stringify({ error: "Authentication required" }), { status: 401 })
    }

    const {
      busId,
      seatNumber,
      passengerName,
      passengerPhone,
      passengerEmail,
      paymentMethod,
      totalAmount
    } = await req.json()

    // Validate required fields
    if (!busId || !seatNumber || !passengerName || !passengerPhone || !passengerEmail || !totalAmount) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 })
    }

    // Check if bus exists and is active
    const bus = await Bus.findById(busId)
    if (!bus || !bus.isActive) {
      return new Response(JSON.stringify({ error: "Bus not found or inactive" }), { status: 404 })
    }

    // Check if seat is already booked
    const existingBooking = bus.bookings.find((booking: any) => booking.seat === seatNumber)
    if (existingBooking) {
      return new Response(JSON.stringify({ error: "Seat already booked" }), { status: 400 })
    }

    // Check if seat number is valid
    if (seatNumber < 1 || seatNumber > bus.totalSeats) {
      return new Response(JSON.stringify({ error: "Invalid seat number" }), { status: 400 })
    }

    // Generate unique booking reference
    const bookingReference = `BK${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`

    // Create booking
    const booking = await Booking.create({
      user: auth.sub,
      bus: busId,
      seat: seatNumber,
      passengerName,
      passengerPhone,
      passengerEmail,
      bookingStatus: 'confirmed',
      paymentStatus: 'completed', // Simplified - in real app would integrate with payment gateway
      paymentMethod,
      totalAmount,
      bookingReference
    })

    // Add booking to bus
    bus.bookings.push({
      user: auth.sub,
      seat: seatNumber,
      passengerName,
      passengerPhone,
      bookingStatus: 'confirmed'
    })

    // Update available seats
    bus.availableSeats = bus.totalSeats - bus.bookings.length

    await bus.save()

    return new Response(JSON.stringify({
      _id: booking._id,
      bookingReference: booking.bookingReference,
      message: "Booking created successfully"
    }), { status: 201 })

  } catch (error) {
    console.error('Error creating booking:', error)
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect()
    const auth = await verifyJwtFromRequest(req)
    
    if (!auth) {
      return new Response(JSON.stringify({ error: "Authentication required" }), { status: 401 })
    }

    // Get user's bookings
    const bookings = await Booking.find({ user: auth.sub })
      .populate('bus', 'name busNumber operator origin destination departureTime arrivalTime')
      .sort({ createdAt: -1 })
      .lean()

    const formattedBookings = bookings.map(booking => ({
      _id: String(booking._id),
      bookingReference: booking.bookingReference,
      seat: booking.seat,
      passengerName: booking.passengerName,
      passengerPhone: booking.passengerPhone,
      passengerEmail: booking.passengerEmail,
      bookingStatus: booking.bookingStatus,
      paymentStatus: booking.paymentStatus,
      paymentMethod: booking.paymentMethod,
      totalAmount: booking.totalAmount,
      createdAt: booking.createdAt,
      bus: booking.bus
    }))

    return new Response(JSON.stringify(formattedBookings), { status: 200 })

  } catch (error) {
    console.error('Error fetching bookings:', error)
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 })
  }
}