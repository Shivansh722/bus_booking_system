import { Schema, type Types, model, models } from "mongoose"

export interface IBooking {
  _id: string
  user: Types.ObjectId
  bus: Types.ObjectId
  seat: number
  passengerName: string
  passengerPhone: string
  passengerEmail: string
  bookingStatus: 'confirmed' | 'cancelled' | 'pending'
  paymentStatus: 'paid' | 'pending' | 'failed' | 'refunded'
  paymentMethod: 'card' | 'upi' | 'netbanking' | 'wallet'
  totalAmount: number
  bookingReference: string
  createdAt: Date
  updatedAt: Date
}

const BookingSchema = new Schema<IBooking>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    bus: { type: Schema.Types.ObjectId, ref: "Bus", required: true, index: true },
    seat: { type: Number, required: true },
    passengerName: { type: String, required: true },
    passengerPhone: { type: String, required: true },
    passengerEmail: { type: String, required: true },
    bookingStatus: { 
      type: String, 
      enum: ['confirmed', 'cancelled', 'pending'], 
      default: 'pending' 
    },
    paymentStatus: { 
      type: String, 
      enum: ['paid', 'pending', 'failed', 'refunded'], 
      default: 'pending' 
    },
    paymentMethod: { 
      type: String, 
      enum: ['card', 'upi', 'netbanking', 'wallet'], 
      required: true 
    },
    totalAmount: { type: Number, required: true, min: 0 },
    bookingReference: { 
      type: String, 
      required: true, 
      unique: true,
      default: () => `BK${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`
    },
  },
  { timestamps: true },
)

// Create compound index for efficient queries
BookingSchema.index({ user: 1, bus: 1 })
BookingSchema.index({ bookingReference: 1 })
BookingSchema.index({ createdAt: -1 })

export const Booking = models.Booking || model<IBooking>("Booking", BookingSchema)