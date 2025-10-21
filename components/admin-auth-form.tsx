"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, AlertTriangle, CheckCircle, XCircle } from "lucide-react"

interface ValidationState {
  email: {
    isValid: boolean
    message: string
  }
  password: {
    isValid: boolean
    message: string
  }
}

export function AdminAuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validation, setValidation] = useState<ValidationState>({
    email: { isValid: false, message: "" },
    password: { isValid: false, message: "" }
  })

  // Admin-specific validation rules
  const validateAdminEmail = (email: string) => {
    if (!email) {
      return { isValid: false, message: "Admin email is required" }
    }
    
    // Admin email format validation
    const adminEmailPattern = /^admin@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!adminEmailPattern.test(email)) {
      return { 
        isValid: false, 
        message: "Admin email must start with 'admin@' and be a valid domain" 
      }
    }
    
    return { isValid: true, message: "Valid admin email format" }
  }

  const validateAdminPassword = (password: string) => {
    if (!password) {
      return { isValid: false, message: "Admin password is required" }
    }
    
    // Admin password requirements
    if (password.length < 8) {
      return { 
        isValid: false, 
        message: "Admin password must be at least 8 characters" 
      }
    }
    
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    
    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      return { 
        isValid: false, 
        message: "Password must contain uppercase, lowercase, and numbers" 
      }
    }
    
    return { isValid: true, message: "Strong admin password" }
  }

  // Real-time validation
  useEffect(() => {
    setValidation({
      email: validateAdminEmail(email),
      password: validateAdminPassword(password)
    })
  }, [email, password])

  const isFormValid = validation.email.isValid && validation.password.isValid

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!isFormValid) {
      setError("Please fix validation errors before submitting")
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const res = await fetch(`/api/auth/admin/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        
        // Specific error messages for admin authentication
        if (res.status === 401) {
          setError("Invalid admin credentials. Please check your admin email and password.")
        } else if (res.status === 403) {
          setError("Admin access denied. This area is restricted to administrators only.")
        } else if (res.status === 409) {
          setError("Admin account already exists with this email.")
        } else {
          setError(data.error || "Admin authentication failed. Please try again.")
        }
        return
      }
      
      // Success - redirect to admin dashboard
      router.push("/admin")
      router.refresh()
      
    } catch (err) {
      setError("Network error. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  const ValidationIcon = ({ isValid }: { isValid: boolean }) => {
    if (isValid) {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    }
    return <XCircle className="h-4 w-4 text-red-500" />
  }

  return (
    <Card className="max-w-md w-full border-2 border-blue-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
        <CardTitle className="text-center flex items-center justify-center gap-2">
          <Shield className="h-5 w-5" />
          Admin {mode === "login" ? "Login" : "Registration"}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        <Alert className="mb-4 border-blue-200 bg-blue-50">
          <AlertTriangle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Admin Access Only:</strong> This area is restricted to system administrators.
            {mode === "login" && " Use your admin credentials to continue."}
          </AlertDescription>
        </Alert>

        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="admin-email" className="flex items-center gap-2">
              Admin Email
              <ValidationIcon isValid={validation.email.isValid} />
            </Label>
            <Input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@company.com"
              className={`${
                email && !validation.email.isValid 
                  ? "border-red-500 focus:border-red-500" 
                  : email && validation.email.isValid 
                  ? "border-green-500 focus:border-green-500" 
                  : ""
              }`}
              required
            />
            {email && (
              <p className={`text-xs ${validation.email.isValid ? "text-green-600" : "text-red-600"}`}>
                {validation.email.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="admin-password" className="flex items-center gap-2">
              Admin Password
              <ValidationIcon isValid={validation.password.isValid} />
            </Label>
            <Input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter secure admin password"
              className={`${
                password && !validation.password.isValid 
                  ? "border-red-500 focus:border-red-500" 
                  : password && validation.password.isValid 
                  ? "border-green-500 focus:border-green-500" 
                  : ""
              }`}
              required
            />
            {password && (
              <p className={`text-xs ${validation.password.isValid ? "text-green-600" : "text-red-600"}`}>
                {validation.password.message}
              </p>
            )}
          </div>

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <Button 
            type="submit" 
            disabled={loading || !isFormValid} 
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Authenticating...
              </span>
            ) : (
              `${mode === "login" ? "Login" : "Create Admin Account"}`
            )}
          </Button>
        </form>
      </CardContent>
      
      <CardFooter className="text-xs text-gray-600 bg-gray-50 rounded-b-lg">
        <div className="w-full">
          <p className="font-medium mb-1">Admin Authentication Requirements:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Email must start with 'admin@'</li>
            <li>Password: 8+ characters with uppercase, lowercase, and numbers</li>
            <li>Only authorized administrators can access this area</li>
          </ul>
        </div>
      </CardFooter>
    </Card>
  )
}