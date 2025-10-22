import { NextRequest, NextResponse } from "next/server"
import { dbConnect } from "@/lib/db"
import { Bus } from "@/models/bus"
import { verifyJwtFromRequest, assertRole } from "@/lib/auth"

// GET /api/admin/buses/[id] - Get single bus details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await verifyJwtFromRequest(request)
    assertRole(payload, 'admin')

    await dbConnect()
    
    const { id } = await params
    const bus = await Bus.findById(id).lean()
    if (!bus) {
      return NextResponse.json(
        { error: 'Bus not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ bus })

  } catch (error: any) {
    console.error('Error fetching bus:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch bus' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    )
  }
}

// PUT /api/admin/buses/[id] - Update bus
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await verifyJwtFromRequest(request)
    assertRole(payload, 'admin')

    await dbConnect()
    
    const { id } = await params
    const body = await request.json()
    const {
      name,
      busNumber,
      operator,
      origin,
      destination,
      departureTime,
      arrivalTime,
      duration,
      price,
      busType,
      amenities,
      totalSeats,
      isActive
    } = body

    const bus = await Bus.findById(id)
    if (!bus) {
      return NextResponse.json(
        { error: 'Bus not found' },
        { status: 404 }
      )
    }

    // Check if bus number is being changed and if it conflicts
    if (busNumber && busNumber !== bus.busNumber) {
      const existingBus = await Bus.findOne({ 
        busNumber, 
        _id: { $ne: id } 
      })
      if (existingBus) {
        return NextResponse.json(
          { error: 'Bus number already exists' },
          { status: 400 }
        )
      }
    }

    // Update bus fields
    if (name) bus.name = name
    if (busNumber) bus.busNumber = busNumber
    if (operator) bus.operator = operator
    if (origin) bus.origin = origin
    if (destination) bus.destination = destination
    if (departureTime) bus.departureTime = new Date(departureTime)
    if (arrivalTime) bus.arrivalTime = new Date(arrivalTime)
    if (duration) bus.duration = duration
    if (price !== undefined) bus.price = parseFloat(price)
    if (busType) bus.busType = busType
    if (amenities !== undefined) bus.amenities = amenities
    if (totalSeats !== undefined) {
      const newTotalSeats = parseInt(totalSeats)
      bus.totalSeats = newTotalSeats
      // Update available seats based on current bookings
      bus.availableSeats = newTotalSeats - bus.bookings.length
    }
    if (isActive !== undefined) bus.isActive = isActive

    await bus.save()

    return NextResponse.json({
      message: 'Bus updated successfully',
      bus
    })

  } catch (error: any) {
    console.error('Error updating bus:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update bus' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    )
  }
}

// DELETE /api/admin/buses/[id] - Delete bus
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await verifyJwtFromRequest(request)
    assertRole(payload, 'admin')

    await dbConnect()
    
    const { id } = await params
    const bus = await Bus.findById(id)
    if (!bus) {
      return NextResponse.json(
        { error: 'Bus not found' },
        { status: 404 }
      )
    }

    // Check if bus has bookings
    if (bus.bookings.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete bus with existing bookings. Cancel all bookings first.' },
        { status: 400 }
      )
    }

    await Bus.findByIdAndDelete(id)

    return NextResponse.json({
      message: 'Bus deleted successfully'
    })

  } catch (error: any) {
    console.error('Error deleting bus:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete bus' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    )
  }
}