"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Edit, Trash2, Search, Filter, Bus, Clock, MapPin, Users, DollarSign } from "lucide-react"

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
  busType: 'AC' | 'Non-AC' | 'Sleeper' | 'Semi-Sleeper'
  amenities: string[]
  totalSeats: number
  availableSeats: number
  bookings: any[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface BusFormData {
  name: string
  busNumber: string
  operator: string
  origin: string
  destination: string
  departureTime: string
  arrivalTime: string
  duration: string
  price: string
  busType: 'AC' | 'Non-AC' | 'Sleeper' | 'Semi-Sleeper'
  amenities: string[]
  totalSeats: string
}

const initialFormData: BusFormData = {
  name: '',
  busNumber: '',
  operator: '',
  origin: '',
  destination: '',
  departureTime: '',
  arrivalTime: '',
  duration: '',
  price: '',
  busType: 'AC',
  amenities: [],
  totalSeats: ''
}

const availableAmenities = [
  'WiFi', 'AC', 'Charging Point', 'Entertainment', 'Blanket', 
  'Pillow', 'Water Bottle', 'Snacks', 'Reading Light', 'GPS Tracking'
]

export default function AdminBusesPage() {
  const [buses, setBuses] = useState<Bus[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingBus, setEditingBus] = useState<Bus | null>(null)
  const [formData, setFormData] = useState<BusFormData>(initialFormData)
  const [formLoading, setFormLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchBuses()
  }, [searchTerm, statusFilter])

  const fetchBuses = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      
      const response = await fetch(`/api/admin/buses?${params}`)
      if (!response.ok) throw new Error('Failed to fetch buses')
      
      const data = await response.json()
      setBuses(data.buses || [])
    } catch (error) {
      console.error('Error fetching buses:', error)
      setError('Failed to fetch buses')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBus = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/admin/buses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create bus')
      }

      setSuccess('Bus created successfully!')
      setFormData(initialFormData)
      setIsCreateDialogOpen(false)
      fetchBuses()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setFormLoading(false)
    }
  }

  const handleEditBus = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingBus) return

    setFormLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/admin/buses/${editingBus._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update bus')
      }

      setSuccess('Bus updated successfully!')
      setIsEditDialogOpen(false)
      setEditingBus(null)
      fetchBuses()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteBus = async (busId: string) => {
    if (!confirm('Are you sure you want to delete this bus? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/buses/${busId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete bus')
      }

      setSuccess('Bus deleted successfully!')
      fetchBuses()
    } catch (error: any) {
      setError(error.message)
    }
  }

  const openEditDialog = (bus: Bus) => {
    setEditingBus(bus)
    setFormData({
      name: bus.name,
      busNumber: bus.busNumber,
      operator: bus.operator,
      origin: bus.origin,
      destination: bus.destination,
      departureTime: new Date(bus.departureTime).toISOString().slice(0, 16),
      arrivalTime: new Date(bus.arrivalTime).toISOString().slice(0, 16),
      duration: bus.duration,
      price: bus.price.toString(),
      busType: bus.busType,
      amenities: bus.amenities,
      totalSeats: bus.totalSeats.toString()
    })
    setIsEditDialogOpen(true)
  }

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }))
  }

  const filteredBuses = buses.filter(bus => {
    const matchesSearch = !searchTerm || 
      bus.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bus.busNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bus.operator.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bus.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bus.destination.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && bus.isActive) ||
      (statusFilter === 'inactive' && !bus.isActive)
    
    return matchesSearch && matchesStatus
  })

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bus Management</h1>
            <p className="text-gray-600">Manage your bus fleet and services</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-red-600 hover:bg-red-700">
                <Plus className="w-4 h-4 mr-2" />
                Add New Bus
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Bus Service</DialogTitle>
                <DialogDescription>
                  Add a new bus service to your fleet
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateBus} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Bus Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="busNumber">Bus Number</Label>
                    <Input
                      id="busNumber"
                      value={formData.busNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, busNumber: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="operator">Operator</Label>
                  <Input
                    id="operator"
                    value={formData.operator}
                    onChange={(e) => setFormData(prev => ({ ...prev, operator: e.target.value }))}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="origin">Origin</Label>
                    <Input
                      id="origin"
                      value={formData.origin}
                      onChange={(e) => setFormData(prev => ({ ...prev, origin: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="destination">Destination</Label>
                    <Input
                      id="destination"
                      value={formData.destination}
                      onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="departureTime">Departure Time</Label>
                    <Input
                      id="departureTime"
                      type="datetime-local"
                      value={formData.departureTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, departureTime: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="arrivalTime">Arrival Time</Label>
                    <Input
                      id="arrivalTime"
                      type="datetime-local"
                      value={formData.arrivalTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, arrivalTime: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      placeholder="e.g., 8h 30m"
                      value={formData.duration}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="price">Price (₹)</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="busType">Bus Type</Label>
                    <Select value={formData.busType} onValueChange={(value: any) => setFormData(prev => ({ ...prev, busType: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AC">AC</SelectItem>
                        <SelectItem value="Non-AC">Non-AC</SelectItem>
                        <SelectItem value="Sleeper">Sleeper</SelectItem>
                        <SelectItem value="Semi-Sleeper">Semi-Sleeper</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="totalSeats">Total Seats</Label>
                    <Input
                      id="totalSeats"
                      type="number"
                      min="1"
                      max="80"
                      value={formData.totalSeats}
                      onChange={(e) => setFormData(prev => ({ ...prev, totalSeats: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label>Amenities</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {availableAmenities.map(amenity => (
                      <label key={amenity} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.amenities.includes(amenity)}
                          onChange={() => toggleAmenity(amenity)}
                          className="rounded"
                        />
                        <span className="text-sm">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {error && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                  </Alert>
                )}

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={formLoading} className="bg-red-600 hover:bg-red-700">
                    {formLoading ? 'Creating...' : 'Create Bus'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search buses by name, number, operator, or route..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Bus List */}
        <div className="grid gap-4">
          {loading ? (
            <div className="text-center py-8">Loading buses...</div>
          ) : filteredBuses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No buses found. {searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters.' : 'Create your first bus service!'}
            </div>
          ) : (
            filteredBuses.map((bus) => (
              <Card key={bus._id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Bus className="w-5 h-5 text-red-600" />
                        {bus.name}
                        <Badge variant={bus.isActive ? "default" : "secondary"}>
                          {bus.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        {bus.operator} • {bus.busNumber} • {bus.busType}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(bus)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteBus(bus._id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{bus.origin} → {bus.destination}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>{new Date(bus.departureTime).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span>{bus.availableSeats}/{bus.totalSeats} available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span>₹{bus.price}</span>
                    </div>
                  </div>
                  {bus.amenities.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {bus.amenities.map(amenity => (
                        <Badge key={amenity} variant="outline" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Bus Service</DialogTitle>
              <DialogDescription>
                Update bus service details
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditBus} className="space-y-4">
              {/* Same form fields as create dialog */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Bus Name</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-busNumber">Bus Number</Label>
                  <Input
                    id="edit-busNumber"
                    value={formData.busNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, busNumber: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-operator">Operator</Label>
                <Input
                  id="edit-operator"
                  value={formData.operator}
                  onChange={(e) => setFormData(prev => ({ ...prev, operator: e.target.value }))}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-origin">Origin</Label>
                  <Input
                    id="edit-origin"
                    value={formData.origin}
                    onChange={(e) => setFormData(prev => ({ ...prev, origin: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-destination">Destination</Label>
                  <Input
                    id="edit-destination"
                    value={formData.destination}
                    onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-departureTime">Departure Time</Label>
                  <Input
                    id="edit-departureTime"
                    type="datetime-local"
                    value={formData.departureTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, departureTime: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-arrivalTime">Arrival Time</Label>
                  <Input
                    id="edit-arrivalTime"
                    type="datetime-local"
                    value={formData.arrivalTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, arrivalTime: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-duration">Duration</Label>
                  <Input
                    id="edit-duration"
                    placeholder="e.g., 8h 30m"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-price">Price (₹)</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-busType">Bus Type</Label>
                  <Select value={formData.busType} onValueChange={(value: any) => setFormData(prev => ({ ...prev, busType: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AC">AC</SelectItem>
                      <SelectItem value="Non-AC">Non-AC</SelectItem>
                      <SelectItem value="Sleeper">Sleeper</SelectItem>
                      <SelectItem value="Semi-Sleeper">Semi-Sleeper</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-totalSeats">Total Seats</Label>
                  <Input
                    id="edit-totalSeats"
                    type="number"
                    min="1"
                    max="80"
                    value={formData.totalSeats}
                    onChange={(e) => setFormData(prev => ({ ...prev, totalSeats: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Amenities</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {availableAmenities.map(amenity => (
                    <label key={amenity} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.amenities.includes(amenity)}
                        onChange={() => toggleAmenity(amenity)}
                        className="rounded"
                      />
                      <span className="text-sm">{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading} className="bg-red-600 hover:bg-red-700">
                  {formLoading ? 'Updating...' : 'Update Bus'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}