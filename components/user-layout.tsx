import { ReactNode } from "react"
import { UserNavbar } from "@/components/user-navbar"
import { User, Ticket, Bus, MapPin, Clock } from "lucide-react"
import Link from "next/link"

interface UserLayoutProps {
  children: ReactNode
  title?: string
}

export function UserLayout({ children, title = "Bus Booking" }: UserLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <UserNavbar />

      <div className="flex">
        {/* User Sidebar */}
        <aside className="w-64 bg-blue-700 text-white min-h-screen shadow-xl">
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/buses" 
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Bus className="h-5 w-5" />
                  <span>Browse Buses</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/tickets" 
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Ticket className="h-5 w-5" />
                  <span>My Tickets</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/user/profile" 
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <User className="h-5 w-5" />
                  <span>My Profile</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/user/bookings" 
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Clock className="h-5 w-5" />
                  <span>Booking History</span>
                </Link>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
              <div className="h-1 w-20 bg-blue-600 rounded"></div>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg border border-blue-100 p-6">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}