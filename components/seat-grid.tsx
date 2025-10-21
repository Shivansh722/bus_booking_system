"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function SeatGrid({
  totalSeats,
  bookedSeats,
  mySeat,
  onSelect,
}: {
  totalSeats: number
  bookedSeats: number[]
  mySeat?: number | null
  onSelect?: (seat: number) => void
}) {
  const cols = 4 // minimal 2x2 blocks visually
  const seats = Array.from({ length: totalSeats }, (_, i) => i + 1)
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {seats.map((s) => {
        const isBooked = bookedSeats.includes(s)
        const isMine = mySeat === s
        return (
          <Button
            key={s}
            type="button"
            variant={isMine ? "default" : isBooked ? "secondary" : "outline"}
            className={cn(
              "h-10",
              isBooked && !isMine && "opacity-60 cursor-not-allowed",
              isMine && "bg-primary text-primary-foreground",
            )}
            onClick={() => {
              if (!onSelect || isBooked) return
              onSelect(s)
            }}
          >
            {isMine ? `Seat ${s} (You)` : `Seat ${s}`}
          </Button>
        )
      })}
    </div>
  )
}
