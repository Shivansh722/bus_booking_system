'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CalendarIcon, ClockIcon, MapPinIcon, UserIcon, PhoneIcon, CreditCardIcon } from 'lucide-react'

interface Booking {
  _id: string
  bookingReference: string
  seat: number
  passengerName: string
  passengerPhone: string
  passengerEmail: string
  bookingStatus: string
  paymentStatus: string
  paymentMethod: string
  totalAmount: number
  createdAt: string
  bus: {
    _id: string
    name: string
    busNumber: string
    operator: string
    origin: string
    destination: string
    departureTime: string
    arrivalTime: string
    duration: number
    price: number
    busType: string
    amenities: string[]
  }
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/auth/login')
        return
      }

      const response = await fetch('/api/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setBookings(data)
      } else {
        setError('Failed to fetch bookings')
      }
    } catch (error) {
      setError('An error occurred while fetching bookings')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
        <p className="text-gray-600">View and manage your bus ticket bookings</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-600 mb-4">You haven't made any bus bookings yet.</p>
            <Button onClick={() => router.push('/buses')}>
              Browse Buses
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <Card key={booking._id} className="overflow-hidden">
              <CardHeader className="bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl font-semibold text-gray-900">
                      {booking.bus.name}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Booking Reference: <span className="font-mono font-medium">{booking.bookingReference}</span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getStatusColor(booking.bookingStatus)}>
                      {booking.bookingStatus}
                    </Badge>
                    <Badge className={getStatusColor(booking.paymentStatus)}>
                      {booking.paymentStatus}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Journey Details */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Journey Details</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <MapPinIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">
                          <span className="font-medium">{booking.bus.origin}</span> → <span className="font-medium">{booking.bus.destination}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CalendarIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{formatDate(booking.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <ClockIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">
                          {formatTime(booking.bus.departureTime)} - {formatTime(booking.bus.arrivalTime)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm">
                          <span className="font-medium">Bus:</span> {booking.bus.busNumber} ({booking.bus.operator})
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm">
                          <span className="font-medium">Seat:</span> {booking.seat}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Passenger & Payment Details */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Passenger & Payment</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <UserIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{booking.passengerName}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <PhoneIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{booking.passengerPhone}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CreditCardIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{booking.paymentMethod}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm">
                          <span className="font-medium">Total Amount:</span> ₹{booking.totalAmount}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Amenities */}
                {booking.bus.amenities && booking.bus.amenities.length > 0 && (
                  <div className="mt-6">
                    <Separator className="mb-4" />
                    <h4 className="font-semibold text-gray-900 mb-3">Amenities</h4>
                    <div className="flex flex-wrap gap-2">
                      {booking.bus.amenities.map((amenity, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6 pt-4 border-t">
                  <p className="text-xs text-gray-500">
                    Booked on {formatDate(booking.createdAt)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}