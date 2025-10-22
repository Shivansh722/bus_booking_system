import { NextRequest, NextResponse } from "next/server"
import { dbConnect } from "@/lib/db"
import { Bus } from "@/models/bus"
import { verifyJwtFromRequest, assertRole } from "@/lib/auth"

// GET /api/admin/buses - Get all buses for admin
export async function GET(request: NextRequest) {
  try {
    const payload = await verifyJwtFromRequest(request)
    assertRole(payload, 'admin')

    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'

    const skip = (page - 1) * limit

    // Build query
    const query: any = {}
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { busNumber: { $regex: search, $options: 'i' } },
        { operator: { $regex: search, $options: 'i' } },
        { origin: { $regex: search, $options: 'i' } },
        { destination: { $regex: search, $options: 'i' } }
      ]
    }

    if (status !== 'all') {
      query.isActive = status === 'active'
    }

    const [buses, total] = await Promise.all([
      Bus.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Bus.countDocuments(query)
    ])

    return NextResponse.json({
      buses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error: any) {
    console.error('Error fetching buses:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch buses' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    )
  }
}

// POST /api/admin/buses - Create new bus
export async function POST(request: NextRequest) {
  try {
    const payload = await verifyJwtFromRequest(request)
    assertRole(payload, 'admin')

    await dbConnect()
    
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
      totalSeats
    } = body

    // Validate required fields
    if (!name || !busNumber || !operator || !origin || !destination || 
        !departureTime || !arrivalTime || !duration || !price || 
        !busType || !totalSeats) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      )
    }

    // Check if bus number already exists
    const existingBus = await Bus.findOne({ busNumber })
    if (existingBus) {
      return NextResponse.json(
        { error: 'Bus number already exists' },
        { status: 400 }
      )
    }

    // Create new bus
    const bus = new Bus({
      name,
      busNumber,
      operator,
      origin,
      destination,
      departureTime: new Date(departureTime),
      arrivalTime: new Date(arrivalTime),
      duration,
      price: parseFloat(price),
      busType,
      amenities: amenities || [],
      totalSeats: parseInt(totalSeats),
      availableSeats: parseInt(totalSeats),
      bookings: [],
      isActive: true
    })

    await bus.save()

    return NextResponse.json({
      message: 'Bus created successfully',
      bus
    }, { status: 201 })

  } catch (error: any) {
    console.error('Error creating bus:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create bus' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    )
  }
}