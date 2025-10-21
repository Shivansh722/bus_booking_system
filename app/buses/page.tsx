"use client"

import useSWR from "swr"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function BusesPage() {
  const { data, isLoading } = useSWR("/api/buses", fetcher)
  return (
    <main>
      <Navbar />
      <section className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-xl font-semibold mb-4 text-pretty">All Buses</h1>
        <div className="grid gap-4 md:grid-cols-2">
          {isLoading && <p>Loading...</p>}
          {Array.isArray(data) &&
            data.map((b: any) => (
              <Card key={b._id}>
                <CardHeader>
                  <CardTitle className="text-pretty">{b.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {b.origin} → {b.destination}
                    <br />
                    {new Date(b.departureTime).toLocaleString()}
                    <br />
                    {b.available} / {b.totalSeats} seats available
                  </div>
                  <Link href={`/buses/${b._id}`}>
                    <Button className="bg-primary text-primary-foreground">Details</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
        </div>
      </section>
    </main>
  )
}
