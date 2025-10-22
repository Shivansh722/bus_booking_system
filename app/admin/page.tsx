"use client"

import type React from "react"

import useSWR from "swr"
import { useState } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function AdminDashboard() {
  const { data, mutate } = useSWR("/api/buses?admin=1", fetcher)
  const [form, setForm] = useState({
    name: "",
    busNumber: "",
    operator: "",
    origin: "",
    destination: "",
    departureTime: "",
    arrivalTime: "",
    duration: "",
    price: "",
    busType: "AC" as "AC" | "Non-AC" | "Sleeper" | "Semi-Sleeper",
    amenities: [] as string[],
    totalSeats: 40,
  })
  async function createBus(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch("/api/admin/buses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setForm({ 
        name: "", 
        busNumber: "",
        operator: "",
        origin: "", 
        destination: "", 
        departureTime: "", 
        arrivalTime: "",
        duration: "",
        price: "",
        busType: "AC",
        amenities: [],
        totalSeats: 40 
      })
      mutate()
    }
  }
  async function reset(busId: string) {
    const res = await fetch(`/api/buses/${busId}/reset`, { method: "POST" })
    if (res.ok) mutate()
  }

  return (
    <AdminLayout title="Admin Dashboard">
      <section className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-pretty">Create New Bus</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={createBus} className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="name">Bus Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="busNumber">Bus Number</Label>
                <Input
                  id="busNumber"
                  value={form.busNumber}
                  onChange={(e) => setForm((f) => ({ ...f, busNumber: e.target.value }))}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="operator">Operator</Label>
                <Input
                  id="operator"
                  value={form.operator}
                  onChange={(e) => setForm((f) => ({ ...f, operator: e.target.value }))}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="busType">Bus Type</Label>
                <select
                  id="busType"
                  value={form.busType}
                  onChange={(e) => setForm((f) => ({ ...f, busType: e.target.value as any }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="AC">AC</option>
                  <option value="Non-AC">Non-AC</option>
                  <option value="Sleeper">Sleeper</option>
                  <option value="Semi-Sleeper">Semi-Sleeper</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="origin">Origin</Label>
                <Input
                  id="origin"
                  value={form.origin}
                  onChange={(e) => setForm((f) => ({ ...f, origin: e.target.value }))}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="destination">Destination</Label>
                <Input
                  id="destination"
                  value={form.destination}
                  onChange={(e) => setForm((f) => ({ ...f, destination: e.target.value }))}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="departureTime">Departure Time</Label>
                <Input
                  id="departureTime"
                  type="datetime-local"
                  value={form.departureTime}
                  onChange={(e) => setForm((f) => ({ ...f, departureTime: e.target.value }))}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="arrivalTime">Arrival Time</Label>
                <Input
                  id="arrivalTime"
                  type="datetime-local"
                  value={form.arrivalTime}
                  onChange={(e) => setForm((f) => ({ ...f, arrivalTime: e.target.value }))}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  placeholder="e.g., 5h 30m"
                  value={form.duration}
                  onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Price (₹)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="totalSeats">Total Seats</Label>
                <Input
                  id="totalSeats"
                  type="number"
                  min={1}
                  max={80}
                  value={form.totalSeats}
                  onChange={(e) => setForm((f) => ({ ...f, totalSeats: Number(e.target.value) }))}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <Button type="submit" className="bg-primary text-primary-foreground">
                  Create Bus
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <h2 className="text-lg font-semibold text-pretty">All Buses</h2>
          {!data ? (
            <p>Loading...</p>
          ) : data.error ? (
            <p className="text-sm text-muted-foreground">Please login as an admin.</p>
          ) : (
            data.map((b: any) => (
              <Card key={b._id}>
                <CardHeader>
                  <CardTitle className="text-pretty">
                    {b.name} — {b.origin} → {b.destination} ({b.bookedCount}/{b.totalSeats} booked)
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3">
                  {Array.isArray(b.bookings) && b.bookings.length > 0 ? (
                    <div className="text-sm text-muted-foreground">
                      {b.bookings
                        .sort((a: any, c: any) => a.seat - c.seat)
                        .map((bk: any) => (
                          <span key={bk.seat} className="mr-3">
                            Seat {bk.seat} — User {bk.user.slice(-6)}
                          </span>
                        ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No bookings yet.</p>
                  )}
                  <Button variant="outline" onClick={() => reset(b._id)}>
                    Reset Bus
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </section>
    </AdminLayout>
  )
}
