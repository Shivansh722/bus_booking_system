"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { LogOut, CheckCircle } from "lucide-react"

interface LogoutButtonProps {
  userRole?: "admin" | "user"
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
  className?: string
}

export function LogoutButton({ 
  userRole = "user", 
  variant = "outline", 
  size = "default",
  className = "" 
}: LogoutButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [logoutSuccess, setLogoutSuccess] = useState(false)

  const handleLogout = async () => {
    setIsLoading(true)
    
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        setLogoutSuccess(true)
        
        // Clear any client-side storage
        if (typeof window !== "undefined") {
          localStorage.clear()
          sessionStorage.clear()
        }
        
        // Show success message briefly before redirect
        setTimeout(() => {
          // Redirect to appropriate login page based on user role
          const redirectPath = userRole === "admin" ? "/admin/login" : "/user/login"
          
          // Force a hard navigation to ensure session is completely cleared
          window.location.href = redirectPath
        }, 1500)
        
      } else {
        throw new Error("Logout failed")
      }
    } catch (error) {
      console.error("Logout error:", error)
      // Even if the API call fails, redirect to login as a fallback
      const redirectPath = userRole === "admin" ? "/admin/login" : "/user/login"
      window.location.href = redirectPath
    } finally {
      setIsLoading(false)
    }
  }

  if (logoutSuccess) {
    return (
      <Alert className="border-green-200 bg-green-50 max-w-md">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          Successfully logged out. Redirecting to login page...
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
      <DialogTrigger asChild>
        <Button 
          variant={variant} 
          size={size} 
          className={`${className} flex items-center gap-2`}
          disabled={isLoading}
        >
          <LogOut className="h-4 w-4" />
          {size !== "sm" && "Logout"}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LogOut className="h-5 w-5" />
            Confirm Logout
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to log out? This will end your current session and you'll need to log in again to access your account.
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Security Notice:</strong> Logging out will:
          </p>
          <ul className="text-sm text-gray-600 mt-2 list-disc list-inside space-y-1">
            <li>Clear your authentication session</li>
            <li>Remove all stored login tokens</li>
            <li>Prevent back-button access to protected pages</li>
            <li>Redirect you to the {userRole} login page</li>
          </ul>
        </div>
        
        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowConfirmation(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleLogout}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Logging out...
              </>
            ) : (
              <>
                <LogOut className="h-4 w-4" />
                Confirm Logout
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}