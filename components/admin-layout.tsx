import { ReactNode } from "react"
import { AdminNavbar } from "@/components/admin-navbar"
import { Settings, Users, Bus, BarChart3 } from "lucide-react"
import Link from "next/link"

interface AdminLayoutProps {
  children: ReactNode
  title?: string
}

export function AdminLayout({ children, title = "Admin Dashboard" }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar />

      <div className="flex">
        {/* Admin Sidebar */}
        <aside className="w-64 bg-red-700 text-white min-h-screen shadow-xl">
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/admin" 
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-red-600 transition-colors"
                >
                  <BarChart3 className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/admin/buses" 
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-red-600 transition-colors"
                >
                  <Bus className="h-5 w-5" />
                  <span>Manage Buses</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/admin/users" 
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-red-600 transition-colors"
                >
                  <Users className="h-5 w-5" />
                  <span>Manage Users</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/admin/settings" 
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-red-600 transition-colors"
                >
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
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
              <div className="h-1 w-20 bg-red-600 rounded"></div>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg border border-red-100 p-6">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}