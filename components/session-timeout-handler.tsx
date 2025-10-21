"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog"

interface SessionTimeoutHandlerProps {
  warningMinutes?: number // Show warning X minutes before expiration
  sessionDurationMinutes?: number // Total session duration
}

export function SessionTimeoutHandler({ 
  warningMinutes = 5, 
  sessionDurationMinutes = 120 
}: SessionTimeoutHandlerProps) {
  const [showWarning, setShowWarning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const router = useRouter()

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      // Clear any client-side storage
      localStorage.clear()
      sessionStorage.clear()
      
      // Redirect to home page
      router.push("/")
      router.refresh()
    }
  }, [router])

  const extendSession = useCallback(async () => {
    try {
      // Call the auth/me endpoint to refresh the session
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        setShowWarning(false)
        // Reset the timeout
        startSessionTimer()
      } else {
        // Session is invalid, logout
        await logout()
      }
    } catch (error) {
      console.error("Session extension error:", error)
      await logout()
    }
  }, [logout])

  const startSessionTimer = useCallback(() => {
    // Clear any existing timers
    const existingWarningTimer = window.sessionWarningTimer
    const existingLogoutTimer = window.sessionLogoutTimer
    
    if (existingWarningTimer) clearTimeout(existingWarningTimer)
    if (existingLogoutTimer) clearTimeout(existingLogoutTimer)

    const warningTime = (sessionDurationMinutes - warningMinutes) * 60 * 1000
    const logoutTime = sessionDurationMinutes * 60 * 1000

    // Set warning timer
    window.sessionWarningTimer = setTimeout(() => {
      setShowWarning(true)
      setTimeLeft(warningMinutes * 60)
      
      // Start countdown
      const countdownInterval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval)
            logout()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      
      window.sessionCountdownInterval = countdownInterval
    }, warningTime)

    // Set automatic logout timer
    window.sessionLogoutTimer = setTimeout(() => {
      logout()
    }, logoutTime)
  }, [sessionDurationMinutes, warningMinutes, logout])

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me")
        if (response.ok) {
          startSessionTimer()
        }
      } catch (error) {
        console.error("Auth check error:", error)
      }
    }

    checkAuth()

    // Cleanup on unmount
    return () => {
      if (window.sessionWarningTimer) clearTimeout(window.sessionWarningTimer)
      if (window.sessionLogoutTimer) clearTimeout(window.sessionLogoutTimer)
      if (window.sessionCountdownInterval) clearInterval(window.sessionCountdownInterval)
    }
  }, [startSessionTimer])

  // Reset timer on user activity
  useEffect(() => {
    const resetTimer = () => {
      if (!showWarning) {
        startSessionTimer()
      }
    }

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    
    events.forEach(event => {
      document.addEventListener(event, resetTimer, true)
    })

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetTimer, true)
      })
    }
  }, [startSessionTimer, showWarning])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Session Expiring Soon</AlertDialogTitle>
          <AlertDialogDescription>
            Your session will expire in {formatTime(timeLeft)}. Would you like to extend your session?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={logout}>
            Logout Now
          </AlertDialogCancel>
          <AlertDialogAction onClick={extendSession}>
            Extend Session
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Extend window interface for TypeScript
declare global {
  interface Window {
    sessionWarningTimer?: NodeJS.Timeout
    sessionLogoutTimer?: NodeJS.Timeout
    sessionCountdownInterval?: NodeJS.Timeout
  }
}