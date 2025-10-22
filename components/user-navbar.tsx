"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LogoutButton } from "@/components/logout-button"
import { useEffect, useState } from "react"
import { User } from "lucide-react"

interface UserInfo {
  email: string
  role: "user"
}

export function UserNavbar() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.role === "user") {
            setUserInfo(data)
          }
        }
      } catch (error) {
        // User is not authenticated
        setUserInfo(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  return (
    <header className="w-full border-b bg-card shadow-sm">
      <div className="mx-auto max-w-5xl flex items-center justify-between px-4 py-3">
        <Link href="/" className="font-semibold text-lg flex items-center gap-2">
          <User className="h-5 w-5 text-green-600" />
          BusBook
        </Link>
        
        <nav className="flex items-center gap-3">
          {/* Public navigation */}
          <Link href="/buses">
            <Button variant="ghost">Buses</Button>
          </Link>
          
          {/* User navigation */}
          {userInfo && (
            <Link href="/tickets">
              <Button variant="ghost">My Tickets</Button>
            </Link>
          )}
          
          <div className="h-5 w-px bg-border" />
          
          {/* Authentication section */}
          {isLoading ? (
            <div className="animate-pulse bg-gray-200 h-9 w-20 rounded"></div>
          ) : userInfo ? (
            // Authenticated user
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4 text-green-600" />
                <span className="hidden sm:inline">
                  {userInfo.email}
                </span>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  user
                </span>
              </div>
              <LogoutButton 
                userRole="user" 
                variant="outline" 
                size="sm"
              />
            </div>
          ) : (
            // Not authenticated - only show user login
            <div className="flex items-center gap-2">
              <Link href="/user/login">
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  User Login
                </Button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}