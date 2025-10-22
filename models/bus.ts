import { Schema, type Types, model, models } from "mongoose"

interface IBooking {
  user: Types.ObjectId
  seat: number
  passengerName: string
  passengerPhone: string
  bookingStatus: 'confirmed' | 'cancelled' | 'pending'
  createdAt: Date
}

export interface IBus {
  _id: string
  name: string
  busNumber: string
  operator: string
  origin: string
  destination: string
  departureTime: Date
  arrivalTime: Date
  duration: string
  price: number
  busType: 'AC' | 'Non-AC' | 'Sleeper' | 'Semi-Sleeper'
  amenities: string[]
  totalSeats: number
  availableSeats: number
  bookings: IBooking[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const BookingSchema = new Schema<IBooking>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    seat: { type: Number, required: true },
    passengerName: { type: String, required: true },
    passengerPhone: { type: String, required: true },
    bookingStatus: { 
      type: String, 
      enum: ['confirmed', 'cancelled', 'pending'], 
      default: 'confirmed' 
    },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
)

const BusSchema = new Schema<IBus>(
  {
    name: { type: String, required: true },
    busNumber: { type: String, required: true, unique: true },
    operator: { type: String, required: true },
    origin: { type: String, required: true },
    destination: { type: String, required: true },
    departureTime: { type: Date, required: true },
    arrivalTime: { type: Date, required: true },
    duration: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    busType: { 
      type: String, 
      enum: ['AC', 'Non-AC', 'Sleeper', 'Semi-Sleeper'], 
      required: true 
    },
    amenities: { type: [String], default: [] },
    totalSeats: { type: Number, required: true, min: 1, max: 80 },
    availableSeats: { type: Number, required: true, min: 0 },
    bookings: { type: [BookingSchema], default: [] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
)

export const Bus = models.Bus || model<IBus>("Bus", BusSchema)
