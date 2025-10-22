"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LogoutButton } from "@/components/logout-button"
import { useEffect, useState } from "react"
import { Shield } from "lucide-react"

interface AdminInfo {
  email: string
  role: "admin"
}

export function AdminNavbar() {
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if admin is authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.role === "admin") {
            setAdminInfo(data)
          }
        }
      } catch (error) {
        // Admin is not authenticated
        setAdminInfo(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  return (
    <header className="w-full border-b bg-card shadow-sm">
      <div className="mx-auto max-w-5xl flex items-center justify-between px-4 py-3">
        <Link href="/admin" className="font-semibold text-lg flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          BusBook Admin
        </Link>
        
        <nav className="flex items-center gap-3">
          {/* Admin navigation */}
          {adminInfo && (
            <>
              <Link href="/admin">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Link href="/admin/buses">
                <Button variant="ghost">Manage Buses</Button>
              </Link>
            </>
          )}
          
          <div className="h-5 w-px bg-border" />
          
          {/* Authentication section */}
          {isLoading ? (
            <div className="animate-pulse bg-gray-200 h-9 w-20 rounded"></div>
          ) : adminInfo ? (
            // Authenticated admin
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="h-4 w-4 text-blue-600" />
                <span className="hidden sm:inline">
                  {adminInfo.email}
                </span>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  admin
                </span>
              </div>
              <LogoutButton 
                userRole="admin" 
                variant="outline" 
                size="sm"
              />
            </div>
          ) : (
            // Not authenticated - only show admin login
            <div className="flex items-center gap-2">
              <Link href="/admin/login">
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Shield className="h-4 w-4" />
                  Admin Login
                </Button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}