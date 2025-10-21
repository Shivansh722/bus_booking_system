"use client"

import { ReactNode } from "react"
import { Shield, Settings, Users, Bus, BarChart3 } from "lucide-react"
import Link from "next/link"
import { LogoutButton } from "./logout-button"

interface AdminLayoutProps {
  children: ReactNode
  title?: string
}

export function AdminLayout({ children, title = "Admin Dashboard" }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      {/* Admin Header */}
      <header className="bg-red-600 text-white shadow-lg border-b-4 border-red-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8" />
              <div>
                <h1 className="text-2xl font-bold">Admin Panel</h1>
                <p className="text-red-100 text-sm">Bus Booking System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-red-100 text-sm">Administrator</span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

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