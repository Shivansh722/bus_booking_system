import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { verifyJwtFromRequest } from '@/lib/auth';
import { Bus } from '@/models/bus';
import { User } from '@/models/user';
import { Types } from 'mongoose';

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { params } = context;
    const { id: busId } = await params;

    // Validate busId as a valid ObjectId
    if (!Types.ObjectId.isValid(busId)) {
      return NextResponse.json({ error: 'Invalid bus ID' }, { status: 400 });
    }

    // Connect to the database
    await dbConnect();

    // Verify the user
    const auth = await verifyJwtFromRequest(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await User.findById(auth.sub);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parse the request body
    const body = await req.json();
    const { seatNumbers, passengers } = body; // Updated to use passengers array

    if (!seatNumbers || seatNumbers.length === 0 || !passengers || passengers.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find the bus
    const bus = await Bus.findById(busId);
    if (!bus) {
      return NextResponse.json({ error: 'Bus not found' }, { status: 404 });
    }

    // Check if any of the seats are already booked
    const alreadyBookedSeats = seatNumbers.filter((seat: number) =>
      bus.bookings.some((booking: { seat: number }) => booking.seat === seat)
    );

    if (alreadyBookedSeats.length > 0) {
      return NextResponse.json({
        error: `Seats already booked: ${alreadyBookedSeats.join(', ')}`,
      }, { status: 400 });
    }

    // Add the bookings
    passengers.forEach((passenger: { seat: number; name: string; phone: string }) => {
      bus.bookings.push({
        user: user._id,
        seat: passenger.seat,
        passengerName: passenger.name,
        passengerPhone: passenger.phone,
        bookingStatus: 'confirmed',
        createdAt: new Date(),
      });
    });

    await bus.save();

    return NextResponse.json({ message: 'Booking successful', seatNumbers });
  } catch (error) {
    console.error('Error in booking service:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
