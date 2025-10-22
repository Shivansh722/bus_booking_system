"use client"

import useSWR from "swr"
import { useState, use } from "react"
import { useRouter } from "next/navigation"
import { UserLayout } from "@/components/user-layout"
import { SeatGrid } from "@/components/seat-grid"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function BusDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  const { data, mutate } = useSWR(`/api/buses/${id}`, fetcher)
  const [selected, setSelected] = useState<number | null>(null)
  async function book() {
    if (!selected) return
    const res = await fetch(`/api/buses/${id}/book`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seat: selected }),
    })
    if (res.ok) mutate()
  }
  async function cancel() {
    const res = await fetch(`/api/buses/${id}/cancel`, { method: "POST" })
    if (res.ok) mutate()
  }

  const bus = data
  return (
    <UserLayout title={bus ? `${bus.name} — ${bus.origin} → ${bus.destination}` : "Bus Details"}>
      <section className="mx-auto max-w-5xl px-4 py-8">
        {!bus ? (
          <p>Loading...</p>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-pretty">
                {bus.name} — {bus.origin} → {bus.destination}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="text-sm text-muted-foreground">
                Departure: {new Date(bus.departureTime).toLocaleString()}
                <br />
                Seats: {bus.totalSeats}
              </div>
              <SeatGrid
                totalSeats={bus.totalSeats}
                bookedSeats={bus.bookedSeats}
                mySeat={bus.mySeat}
                onSelect={(s) => setSelected(s)}
              />
              <div className="flex items-center gap-3">
                <Button
                  onClick={book}
                  className="bg-primary text-primary-foreground"
                  disabled={!selected || !!bus.mySeat}
                >
                  Book Seat {selected ? `#${selected}` : ""}
                </Button>
                <Button onClick={cancel} variant="outline" disabled={!bus.mySeat}>
                  Cancel My Ticket
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </section>
    </UserLayout>
  )
}
