import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <section className="mx-auto max-w-5xl px-4 py-10">
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-pretty">Browse Buses</CardTitle>
            </CardHeader>
            <CardContent className="flex">
              <Link href="/buses" className="ml-auto">
                <Button className="bg-primary text-primary-foreground">View</Button>
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-pretty">My Tickets</CardTitle>
            </CardHeader>
            <CardContent className="flex">
              <Link href="/tickets" className="ml-auto">
                <Button className="bg-primary text-primary-foreground">Open</Button>
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-pretty">Admin Panel</CardTitle>
            </CardHeader>
            <CardContent className="flex">
              <Link href="/admin" className="ml-auto">
                <Button className="bg-primary text-primary-foreground">Manage</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  )
}
