import { Schema, type Types, model, models } from "mongoose"

interface IBooking {
  user: Types.ObjectId
  seat: number
  createdAt: Date
}

export interface IBus {
  _id: string
  name: string
  origin: string
  destination: string
  departureTime: Date
  totalSeats: number
  bookings: IBooking[]
  createdAt: Date
  updatedAt: Date
}

const BookingSchema = new Schema<IBooking>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    seat: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
)

const BusSchema = new Schema<IBus>(
  {
    name: { type: String, required: true },
    origin: { type: String, required: true },
    destination: { type: String, required: true },
    departureTime: { type: Date, required: true },
    totalSeats: { type: Number, required: true, min: 1, max: 80 },
    bookings: { type: [BookingSchema], default: [] },
  },
  { timestamps: true },
)

export const Bus = models.Bus || model<IBus>("Bus", BusSchema)
