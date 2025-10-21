"use client"

import useSWR from "swr"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function TicketsPage() {
  const { data, mutate } = useSWR("/api/tickets/me", fetcher)
  async function cancel(busId: string) {
    const res = await fetch(`/api/buses/${busId}/cancel`, { method: "POST" })
    if (res.ok) mutate()
  }
  return (
    <main>
      <Navbar />
      <section className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-xl font-semibold mb-4 text-pretty">My Tickets</h1>
        <div className="grid gap-4">
          {!data ? (
            <p>Loading...</p>
          ) : data.error ? (
            <p className="text-sm text-muted-foreground">Please login as a user to view your tickets.</p>
          ) : data.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tickets yet.</p>
          ) : (
            data.map((t: any) => (
              <Card key={`${t.busId}-${t.seat}`}>
                <CardHeader>
                  <CardTitle className="text-pretty">
                    {t.busName} — Seat {t.seat}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {t.origin} → {t.destination}
                    <br />
                    {new Date(t.departureTime).toLocaleString()}
                  </div>
                  <Button variant="outline" onClick={() => cancel(t.busId)}>
                    Cancel
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </section>
    </main>
  )
}
