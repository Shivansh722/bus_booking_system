"use client"

import { useState, useEffect } from "react"
import { UserLayout } from "@/components/user-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, ClockIcon, MapPinIcon, UsersIcon, WifiIcon, AirVentIcon, CoffeeIcon } from "lucide-react"
import { format } from "date-fns"
import { useRouter } from "next/navigation"

interface Bus {
  _id: string
  name: string
  busNumber: string
  operator: string
  origin: string
  destination: string
  departureTime: string
  arrivalTime: string
  duration: string
  price: number
  busType: string
  amenities: string[]
  totalSeats: number
  availableSeats: number
  bookedSeats: number[]
}

const amenityIcons: { [key: string]: any } = {
  'WiFi': WifiIcon,
  'AC': AirVentIcon,
  'Refreshments': CoffeeIcon,
}

export default function BusesPage() {
  const [buses, setBuses] = useState<Bus[]>([])
  const [loading, setLoading] = useState(true)
  const [searchFilters, setSearchFilters] = useState({
    origin: '',
    destination: '',
    date: '',
    busType: 'all'
  })
  const router = useRouter()

  const fetchBuses = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (searchFilters.origin) params.append('origin', searchFilters.origin)
      if (searchFilters.destination) params.append('destination', searchFilters.destination)
      if (searchFilters.date) params.append('date', searchFilters.date)
      if (searchFilters.busType && searchFilters.busType !== 'all') params.append('busType', searchFilters.busType)

      const response = await fetch(`/api/buses?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setBuses(data)
      }
    } catch (error) {
      console.error('Error fetching buses:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBuses()
  }, [])

  const handleSearch = () => {
    fetchBuses()
  }

  const handleBookNow = (busId: string) => {
    router.push(`/buses/${busId}/book`)
  }

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm')
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy')
  }

  return (
    <UserLayout title="Find Your Bus">
      <div className="mb-8">
        <p className="text-muted-foreground">Search and book bus tickets for your journey</p>
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Find Your Bus</h1>
          <p className="text-muted-foreground">Search and book bus tickets for your journey</p>
        </div>

        {/* Search Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Search Buses</CardTitle>
            <CardDescription>Filter buses by your travel preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label htmlFor="origin">From</Label>
                <Input
                  id="origin"
                  placeholder="Origin city"
                  value={searchFilters.origin}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, origin: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destination">To</Label>
                <Input
                  id="destination"
                  placeholder="Destination city"
                  value={searchFilters.destination}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, destination: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={searchFilters.date}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="busType">Bus Type</Label>
                <Select value={searchFilters.busType} onValueChange={(value) => setSearchFilters(prev => ({ ...prev, busType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any type</SelectItem>
                    <SelectItem value="AC">AC</SelectItem>
                    <SelectItem value="Non-AC">Non-AC</SelectItem>
                    <SelectItem value="Sleeper">Sleeper</SelectItem>
                    <SelectItem value="Semi-Sleeper">Semi-Sleeper</SelectItem>
                    <SelectItem value="Luxury">Luxury</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={handleSearch} className="w-full">
                  Search Buses
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bus Results */}
        {loading ? (
          <div className="text-center py-8">
            <p>Loading buses...</p>
          </div>
        ) : buses.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No buses found for your search criteria.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold mb-4">Available Buses ({buses.length})</h2>
            {buses.map((bus) => (
              <Card key={bus._id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Bus Info */}
                    <div className="lg:col-span-2">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold">{bus.name}</h3>
                          <p className="text-sm text-muted-foreground">{bus.operator}</p>
                          <p className="text-sm text-muted-foreground">Bus #{bus.busNumber}</p>
                        </div>
                        <Badge variant="secondary">{bus.busType}</Badge>
                      </div>

                      {/* Route Info */}
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <MapPinIcon className="h-4 w-4 text-green-600" />
                          <span className="font-medium">{bus.origin}</span>
                        </div>
                        <div className="flex-1 border-t border-dashed"></div>
                        <div className="flex items-center space-x-2">
                          <MapPinIcon className="h-4 w-4 text-red-600" />
                          <span className="font-medium">{bus.destination}</span>
                        </div>
                      </div>

                      {/* Amenities */}
                      {bus.amenities && bus.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {bus.amenities.map((amenity, index) => {
                            const IconComponent = amenityIcons[amenity]
                            return (
                              <div key={index} className="flex items-center space-x-1 text-xs bg-gray-100 px-2 py-1 rounded">
                                {IconComponent && <IconComponent className="h-3 w-3" />}
                                <span>{amenity}</span>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    {/* Time Info */}
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-2 mb-2">
                          <ClockIcon className="h-4 w-4" />
                          <span className="text-sm text-muted-foreground">Departure</span>
                        </div>
                        <p className="text-2xl font-bold">{formatTime(bus.departureTime)}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(bus.departureTime)}</p>
                      </div>

                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-1">Duration</p>
                        <p className="font-medium">{bus.duration}</p>
                      </div>

                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-2 mb-2">
                          <ClockIcon className="h-4 w-4" />
                          <span className="text-sm text-muted-foreground">Arrival</span>
                        </div>
                        <p className="text-xl font-semibold">{formatTime(bus.arrivalTime)}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(bus.arrivalTime)}</p>
                      </div>
                    </div>

                    {/* Price and Booking */}
                    <div className="flex flex-col justify-between">
                      <div className="text-center mb-4">
                        <p className="text-3xl font-bold text-primary">${bus.price}</p>
                        <p className="text-sm text-muted-foreground">per seat</p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-center space-x-2 text-sm">
                          <UsersIcon className="h-4 w-4" />
                          <span>{bus.availableSeats} seats available</span>
                        </div>

                        <Button 
                          onClick={() => handleBookNow(bus._id)}
                          className="w-full"
                          disabled={bus.availableSeats === 0}
                        >
                          {bus.availableSeats === 0 ? 'Sold Out' : 'Book Now'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </UserLayout>
  )
}
